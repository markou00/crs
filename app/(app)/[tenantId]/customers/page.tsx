'use client';

import {
  Title,
  Text,
  Button,
  Group,
  TextInput,
  rem,
  Drawer,
  Flex,
  ScrollArea,
} from '@mantine/core';
import { IconSearch, IconUserPlus } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { Customer } from '@prisma/client';
import { useDisclosure } from '@mantine/hooks';
import { CustomerCard } from './CustomerCard/CustomerCard';
import { AddCustomerModal } from './AddCustomerModal/AddCustomerModal';
import { getCustomers, deleteCustomer, editCustomer } from '@/lib/server/actions/customer-actions';

export default function CustomersPage() {
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [search, setSearch] = useState('');
  const [tenantId, setTenantId] = useState('');
  const supabase = createClientComponentClient();

  const getCustomersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: () => getCustomers(),
  });

  useEffect(() => {
    async function fetchTenantId() {
      const user = await supabase.auth.getUser();
      if (user.data.user?.user_metadata.tenantId) {
        setTenantId(user.data.user.user_metadata.tenantId);
      }
    }

    fetchTenantId();
  }, [supabase]);

  const openCreateModal = () => {
    setAddModalOpened(true);
  };

  const [records, setRecords] = useState(getCustomersQuery.data?.customers);
  const [opened, { open, close }] = useDisclosure(false);
  const [currentRecord, setCurrentRecord] = useState<Customer>();
  const [currentRecordName, setCurrentRecordName] = useState(currentRecord?.name);
  const [currentRecordContactName, setCurrentRecordContactName] = useState(
    currentRecord?.contactName
  );
  const [currentRecordContactEmail, setCurrentRecordContactEmail] = useState(
    currentRecord?.contactEmail
  );
  const [currentRecordContactPhone, setCurrentRecordContactPhone] = useState(
    currentRecord?.contactPhone
  );
  const [currentRecordAddress, setCurrentRecordAddress] = useState(currentRecord?.address);
  const [currentRecordCity, setCurrentRecordCity] = useState(currentRecord?.city);
  const [currentRecordPostalCode, setCurrentRecordPostalCode] = useState(currentRecord?.postalCode);
  const [currentRecordCountry, setCurrentRecordCountry] = useState(currentRecord?.country);

  const filteredCustomers = records?.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase())
  );

  const openDrawer = (record: Customer) => {
    setCurrentRecord(record);
    setCurrentRecordName(record.name);
    setCurrentRecordContactName(record.contactName);
    setCurrentRecordContactEmail(record.contactEmail);
    setCurrentRecordContactPhone(record.contactPhone);
    setCurrentRecordAddress(record.address);
    setCurrentRecordCity(record.city);
    setCurrentRecordPostalCode(record.postalCode);
    setCurrentRecordCountry(record.country);
    open();
  };

  const editCustomerMutation = useMutation({
    mutationFn: async () => {
      const { modifiedCustomer, error } = await editCustomer({
        id: currentRecord?.id,
        name: currentRecordName,
        contactName: currentRecordContactName,
        contactEmail: currentRecordContactEmail,
        contactPhone: currentRecordContactPhone,
        address: currentRecordAddress,
        city: currentRecordCity,
        postalCode: currentRecordPostalCode,
        country: currentRecordCountry,
      });

      if (error) throw new Error("Couldn't edit the customer");

      return modifiedCustomer;
    },
    retry: false,
    onSuccess: async () => {
      const { data } = await getCustomersQuery.refetch();
      setRecords(data?.customers);
      close();
    },
    onError: (error: any) => console.log(error.message),
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const { deletedCustomer, error } = await deleteCustomer(id);
      if (error) throw new Error("Couldn't delete the job");
      return deletedCustomer;
    },
    retry: false,
    onSuccess: async () => {
      console.log('Customer edited');
      const { data } = await getCustomersQuery.refetch();
      setRecords(data?.customers);
      close();
    },
    onError: (error: any) => console.log(error.message),
  });

  useEffect(() => {
    if (getCustomersQuery.data?.customers) {
      const sortedCustomers = [...getCustomersQuery.data.customers].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setRecords(sortedCustomers);
    }
  }, [getCustomersQuery.data?.customers]);

  if (getCustomersQuery.error) return <Text>Error...</Text>;
  if (getCustomersQuery.isLoading) return <Text>Loading...</Text>;

  return (
    <>
      <Group justify="space-between" style={{ marginBottom: '20px', marginRight: '50px' }}>
        <Title>Kunder</Title>
        <TextInput
          radius="xl"
          size="md"
          placeholder="Søk etter kunde"
          rightSectionWidth={42}
          leftSection={<IconSearch style={{ width: rem(18), height: rem(18) }} stroke={1.5} />}
          onChange={(event) => setSearch(event.currentTarget.value)}
        />
        <Button onClick={openCreateModal} leftSection={<IconUserPlus size={16} />}>
          Ny kunde
        </Button>
      </Group>
      <div style={{ maxWidth: 800, margin: 'auto' }}>
        {filteredCustomers?.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} onEdit={openDrawer} />
        ))}
      </div>

      <Drawer.Root
        radius="md"
        position="right"
        opened={opened}
        onClose={close}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <Drawer.Overlay />
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Kundedetaljer</Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body>
            <Flex direction="column" gap="md">
              <TextInput label="Kundenr." value={currentRecord?.id} disabled />
              <TextInput label="Type" value={currentRecord?.type} disabled />
              <TextInput
                label="Navn"
                value={currentRecordName || ''}
                onChange={(event) => setCurrentRecordName(event.currentTarget.value)}
              />
              <TextInput
                label="Kontaktnavn"
                value={currentRecordContactName || ''}
                onChange={(event) => setCurrentRecordContactName(event.currentTarget.value)}
              />
              <TextInput
                label="E-post"
                value={currentRecordContactEmail || ''}
                onChange={(event) => setCurrentRecordContactEmail(event.currentTarget.value)}
              />
              <TextInput
                label="Kontaktnavn"
                value={currentRecordContactPhone || ''}
                onChange={(event) => setCurrentRecordContactPhone(event.currentTarget.value)}
              />
              <TextInput
                label="Adresse"
                value={currentRecordAddress || ''}
                onChange={(event) => setCurrentRecordAddress(event.currentTarget.value)}
              />
              <TextInput
                label="Sted"
                value={currentRecordCity || ''}
                onChange={(event) => setCurrentRecordCity(event.currentTarget.value)}
              />
              <TextInput
                label="Postnr."
                value={currentRecordPostalCode || ''}
                onChange={(event) => setCurrentRecordPostalCode(event.currentTarget.value)}
              />
              <TextInput
                label="Land"
                value={currentRecordCountry || ''}
                onChange={(event) => setCurrentRecordCountry(event.currentTarget.value)}
              />
              <Flex justify="end">
                <Group>
                  <Button
                    color="red"
                    onClick={() => {
                      if (!currentRecord) {
                        console.log('Ingen oppdrag er valgt.');
                        return;
                      }
                      // eslint-disable-next-line no-alert
                      const isConfirmed = window.confirm(
                        'Er du sikker på at du vil slette dette oppdraget?'
                      );

                      if (isConfirmed) {
                        deleteCustomerMutation.mutate({ id: currentRecord.id });
                      }
                    }}
                    loading={deleteCustomerMutation.isPending}
                  >
                    Slett
                  </Button>
                  <Button
                    onClick={() => editCustomerMutation.mutate()}
                    loading={editCustomerMutation.isPending}
                  >
                    Bekreft
                  </Button>
                </Group>
              </Flex>
            </Flex>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>

      <AddCustomerModal
        opened={addModalOpened}
        tenantId={tenantId}
        onClose={() => setAddModalOpened(false)}
        getCustomersQuery={getCustomersQuery}
        setRecords={setRecords}
      />
    </>
  );
}
