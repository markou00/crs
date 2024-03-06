'use client';

import {
  ActionIcon,
  Box,
  Button,
  Center,
  ComboboxItem,
  Drawer,
  Flex,
  Group,
  MultiSelect,
  ScrollArea,
  Select,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { DataTable } from 'mantine-datatable';
import { useEffect, useMemo, useState } from 'react';
import { IconEdit, IconSearch, IconTrash, IconX, IconClick } from '@tabler/icons-react';
import { Agreement, Container, Customer } from '@prisma/client';
import { DateInput } from '@mantine/dates';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';

import { editAgreement, getAgreements } from '@/lib/server/actions/agreements-actions';

type AgreementDetails = Agreement & {
  customer: Customer;
  container: Container | null;
};

export default function AgreementsPage() {
  const getAgreementsQuery = useQuery({
    queryKey: ['agreements'],
    queryFn: () => getAgreements(),
  });
  const [opened, { open, close }] = useDisclosure(false);

  const [records, setRecords] = useState(getAgreementsQuery.data?.agreements);
  const [currentRecord, setCurrentRecord] = useState<AgreementDetails>();

  const [currentRecordStatus, setCurrentRecordStatus] = useState(currentRecord?.status);
  const [currentRecordContainer, setCurrentRecordContainer] = useState<ComboboxItem | null>({
    value: currentRecord?.container?.id.toString() || '',
    label: currentRecord?.container?.name || '',
  });
  const [currentRecordValidFrom, setCurrentRecordValidFrom] = useState(currentRecord?.validFrom);
  const [currentRecordValidTo, setCurrentRecordValidTo] = useState(currentRecord?.validTo);
  const [currentRecordComment, setCurrentRecordComment] = useState(currentRecord?.comment);

  const [idQuery, setIdQuery] = useState('');
  const [debouncedIdQuery] = useDebouncedValue(idQuery, 200);

  const [customerQuery, setCustomerQuery] = useState('');
  const [debouncedCustomerQuery] = useDebouncedValue(customerQuery, 200);

  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const statuses = useMemo(() => Array.from(new Set(records?.map((e) => e.status))), [records]);

  useEffect(() => {
    setRecords(
      getAgreementsQuery.data?.agreements?.filter(({ id, customer, status }) => {
        if (
          debouncedIdQuery !== '' &&
          !`${id}`.toLowerCase().includes(debouncedIdQuery.trim().toLowerCase())
        ) {
          return false;
        }

        if (
          debouncedCustomerQuery !== '' &&
          !`${customer.name}`.toLowerCase().includes(debouncedCustomerQuery.trim().toLowerCase())
        ) {
          return false;
        }

        if (selectedStatus.length && !selectedStatus.some((s) => s === status)) return false;

        return true;
      })
    );
  }, [debouncedIdQuery, debouncedCustomerQuery, selectedStatus]);

  const editAgreementMutation = useMutation({
    mutationFn: async () => {
      const { modifiedAgreement, error } = await editAgreement({
        id: currentRecord?.id,
        status: currentRecordStatus,
        // eslint-disable-next-line radix
        containerId: currentRecordContainer?.value ? parseInt(currentRecordContainer?.value) : null,
        validFrom: currentRecordValidFrom,
        validTo: currentRecordValidTo,
        comment: currentRecordComment,
      });

      if (error) throw new Error("Couldn't modify the agreement");

      return modifiedAgreement;
    },
    retry: false,

    onSuccess: async () => {
      const { data } = await getAgreementsQuery.refetch();
      setRecords(data?.agreements);
      close();
    },
    onError: (error: any) => console.log(error.message),
  });

  if (getAgreementsQuery.error) return <Text>ERROR....</Text>;
  if (getAgreementsQuery.isLoading) return <Text>LOADING...</Text>;

  return (
    <>
      <Title mb="md">Avtaler</Title>

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
            <Drawer.Title>Avtale detaljer</Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body>
            <Flex direction="column" gap="md">
              <TextInput label="Avtale nr." value={currentRecord?.id} disabled />
              <TextInput label="Type" value={currentRecord?.type} disabled />
              <TextInput label="Kunde" value={currentRecord?.customer?.name} disabled />
              <Select
                comboboxProps={{ withinPortal: true }}
                data={['Opprettet', 'Tildelt', 'Utført', 'Godkjent']}
                value={currentRecordStatus}
                onChange={(_value, option) => setCurrentRecordStatus(option.label)}
                label="Status"
              />
              <Select
                comboboxProps={{ withinPortal: true }}
                data={[
                  { value: '2', label: 'M100 Matavfall' },
                  { value: '3', label: 'R120 Restavfall' },
                  { value: '4', label: 'G160 Glassavfall' },
                ]}
                value={currentRecordContainer ? currentRecordContainer.value : null}
                onChange={(_value, option) => {
                  setCurrentRecordContainer({ value: option.value, label: option.label });
                }}
                label="Container"
              />
              <DateInput
                value={currentRecordValidFrom}
                // @ts-ignore
                onChange={setCurrentRecordValidFrom}
                valueFormat="DD.MM.YYYY"
                label="Gyldig fra"
              />
              <DateInput
                value={currentRecordValidTo}
                onChange={setCurrentRecordValidTo}
                valueFormat="DD.MM.YYYY"
                label="Gyldig til"
              />
              <Textarea
                label="Kommentar"
                value={currentRecordComment || ''}
                autosize
                minRows={4}
                onChange={(event) => setCurrentRecordComment(event.currentTarget.value)}
              />
              {/* //TODO: Display oppdrag here */}
              <Flex justify="end">
                <Button
                  onClick={() => editAgreementMutation.mutate()}
                  loading={editAgreementMutation.isPending}
                >
                  Bekreft
                </Button>
              </Flex>
            </Flex>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>

      <DataTable
        withTableBorder
        borderRadius="sm"
        withColumnBorders
        striped
        highlightOnHover
        records={records}
        columns={[
          {
            accessor: 'id',
            filter: (
              <TextInput
                label="Id"
                description="Show agreements whose id include the specified id"
                placeholder="Search agreements..."
                leftSection={<IconSearch size={16} />}
                rightSection={
                  <ActionIcon
                    size="sm"
                    variant="transparent"
                    c="dimmed"
                    onClick={() => setIdQuery('')}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                }
                value={idQuery}
                onChange={(e) => setIdQuery(e.currentTarget.value)}
              />
            ),
            filtering: idQuery !== '',
          },
          { accessor: 'type' },
          {
            accessor: 'Container',
            title: 'Container',
            render: ({ container }) => <Box>{container?.name}</Box>,
          },
          {
            accessor: 'customerId',
            title: 'Kunde',
            render: ({ customer }) => <Box>{customer.name}</Box>,
            filter: (
              <TextInput
                label="Id"
                description="Show agreements whose id include the specified id"
                placeholder="Search agreements..."
                leftSection={<IconSearch size={16} />}
                rightSection={
                  <ActionIcon
                    size="sm"
                    variant="transparent"
                    c="dimmed"
                    onClick={() => setIdQuery('')}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                }
                value={customerQuery}
                onChange={(e) => setCustomerQuery(e.currentTarget.value)}
              />
            ),
            filtering: customerQuery !== '',
          },
          {
            accessor: 'status',
            filter: (
              <MultiSelect
                label="Status"
                description="Vis alle status"
                data={statuses}
                value={selectedStatus}
                placeholder="Søk etter status…"
                onChange={setSelectedStatus}
                leftSection={<IconSearch size={16} />}
                clearable
              />
            ),
            filtering: selectedStatus.length > 0,
          },
          {
            accessor: 'endDate',
            title: 'Gyldig til',
            render: ({ validTo }) => (
              <Box fw={700}>{validTo ? validTo.toLocaleDateString('NO') : 'Løpende'}</Box>
            ),
          },
          {
            accessor: 'actions',
            title: (
              <Center>
                <IconClick size={16} />
              </Center>
            ),
            width: '0%', // 👈 use minimal width
            render: (record) => (
              <Group gap={4} justify="right" wrap="nowrap">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="blue"
                  onClick={() => {
                    setCurrentRecord(record);
                    setCurrentRecordStatus(record.status);

                    setCurrentRecordContainer({
                      value: record.container?.id.toString() || '',
                      label: record.container?.name || '',
                    });
                    setCurrentRecordValidFrom(record.validFrom);
                    setCurrentRecordValidTo(record.validTo);
                    setCurrentRecordComment(record.comment);

                    open();
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>
                <ActionIcon size="sm" variant="subtle" color="red">
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
      />
    </>
  );
}
