/* eslint-disable radix */

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
  Modal,
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
import { Agreement, AgreementType, Customer, RepetitionFrequency } from '@prisma/client';
import { DateInput } from '@mantine/dates';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';

import {
  addAgreement,
  deleteAgreement,
  editAgreement,
  getAgreements,
} from '@/lib/server/actions/agreements-actions';
import { getCustomers } from '@/lib/server/actions/customer-actions';
import { getContainers } from '@/lib/server/actions/containers-actions';
import { AgreementTypeDisplay } from './utils/agreementTypeDisplay';
import { RepetitionFrequencyDisplay } from './utils/repetitionFrequencyDisplay';

type AgreementDetails = Agreement & {
  customer: Customer;
};

export default function AgreementsPage() {
  const getAgreementsQuery = useQuery({
    queryKey: ['agreements'],
    queryFn: () => getAgreements(),
  });

  const getCustomersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: () => getCustomers(),
  });

  const getContainersQuery = useQuery({
    queryKey: ['containers'],
    queryFn: () => getContainers(),
  });

  const customers = getCustomersQuery.data?.customers;
  const containers = getContainersQuery.data?.containers;

  const [opened, { open, close }] = useDisclosure(false);
  const [openedModal, { open: openModal, close: closeModal }] = useDisclosure(false);

  const [records, setRecords] = useState(getAgreementsQuery.data?.agreements);
  const [currentRecord, setCurrentRecord] = useState<AgreementDetails>();

  const [currentRecordStatus, setCurrentRecordStatus] = useState(currentRecord?.status);
  const [currentRecordContainer, setCurrentRecordContainer] = useState(
    currentRecord?.containerName
  );
  const [currentRecordValidFrom, setCurrentRecordValidFrom] = useState(currentRecord?.validFrom);
  const [currentRecordValidTo, setCurrentRecordValidTo] = useState(currentRecord?.validTo);
  const [currentRecordComment, setCurrentRecordComment] = useState(currentRecord?.comment);

  const [idQuery, setIdQuery] = useState('');
  const [debouncedIdQuery] = useDebouncedValue(idQuery, 200);

  const [customerQuery, setCustomerQuery] = useState('');
  const [debouncedCustomerQuery] = useDebouncedValue(customerQuery, 200);

  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const statuses = useMemo(() => Array.from(new Set(records?.map((e) => e.status))), [records]);

  const [newType, setNewType] = useState<AgreementType | undefined>(AgreementType.RESIDUAL_WASTE);
  const [newRepetitionFrequency, setNewRepetitionFrequency] = useState<
    RepetitionFrequency | undefined
  >(RepetitionFrequency.NONE);
  const [newStatus, setNewStatus] = useState('');
  const [newCustomer, setNewCustomer] = useState<ComboboxItem | null>();
  const [newContainer, setNewContainer] = useState('');
  const [newValidFrom, setNewValidFrom] = useState<Date>();
  const [newValidTo, setNewValidTo] = useState<Date>();
  const [newComment, setNewComment] = useState('');

  const createAgreementMutation = useMutation({
    mutationFn: async () => {
      const { newAgreement, error } = await addAgreement({
        type: newType,
        repetition: newRepetitionFrequency,
        status: newStatus,
        customerId: newCustomer?.value ? parseInt(newCustomer?.value) : undefined,
        containerName: newContainer,
        validFrom: newValidFrom,
        validTo: newValidTo,
        comment: newComment,
      });

      if (error) throw new Error("Couldn't create the agreement!");

      return newAgreement;
    },
    retry: false,
    onSuccess: async () => {
      const { data } = await getAgreementsQuery.refetch();
      setRecords(data?.agreements);
      closeModal();
      setNewType(undefined);
      setNewRepetitionFrequency(undefined);
      setNewStatus('');
      setNewCustomer(null);
      setNewContainer('');
      setNewValidFrom(undefined);
      setNewValidTo(undefined);
      setNewComment('');
    },
  });

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
        containerName: currentRecordContainer || undefined,
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

  const deleteAgreementMutation = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const { deletedAgreement, error } = await deleteAgreement(id);

      if (error) throw new Error("Couldn't delete the agreement");

      return deletedAgreement;
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
      <Group justify="space-between" mb="md">
        <Title>Avtaler</Title>
        <Button onClick={openModal}>Ny avtale</Button>
      </Group>

      <Modal
        opened={openedModal}
        onClose={() => {
          closeModal();
          setNewType(AgreementType.RESIDUAL_WASTE);
          setNewRepetitionFrequency(RepetitionFrequency.NONE);
          setNewStatus('');
          setNewCustomer(null);
          setNewContainer('');
          setNewValidFrom(undefined);
          setNewValidTo(undefined);
          setNewComment('');
        }}
        title="Opprett ny avtale"
      >
        <Flex direction="column" gap="md">
          <Select
            comboboxProps={{ withinPortal: true }}
            data={customers?.map((customer) => ({
              value: customer.id.toString(),
              label: customer.name,
            }))}
            value={newCustomer?.value ? newCustomer.value : null}
            onChange={(_value, option) => {
              setNewCustomer({ value: option.value, label: option.label });
            }}
            label="Kunde"
          />
          <Select
            comboboxProps={{ withinPortal: true }}
            data={Object.entries(AgreementTypeDisplay).map(([value, label]) => ({
              value,
              label,
            }))}
            value={newType}
            onChange={(value) => setNewType(value as AgreementType)}
            label="Avfallstype"
          />
          <Select
            comboboxProps={{ withinPortal: true }}
            data={Object.entries(RepetitionFrequencyDisplay).map(([value, label]) => ({
              value,
              label,
            }))}
            value={newRepetitionFrequency}
            onChange={(value) => setNewRepetitionFrequency(value as RepetitionFrequency)}
            label="Repetisjon"
          />
          <Select
            comboboxProps={{ withinPortal: true }}
            data={['Opprettet', 'Tildelt', 'Utført', 'Godkjent']}
            value={newStatus}
            onChange={(_value, option) => setNewStatus(option.label)}
            label="Status"
          />
          <Select
            comboboxProps={{ withinPortal: true }}
            data={containers?.map((container) => container.name)}
            value={newContainer || null}
            onChange={(_value, option) => setNewContainer(option.label)}
            label="Container"
          />
          <DateInput
            value={newValidFrom}
            // @ts-ignore
            onChange={setNewValidFrom}
            valueFormat="DD.MM.YYYY"
            label="Gyldig fra"
          />
          <DateInput
            value={newValidTo}
            // @ts-ignore
            onChange={setNewValidTo}
            valueFormat="DD.MM.YYYY"
            label="Gyldig til"
          />
          <Textarea
            label="Kommentar"
            value={newComment || ''}
            autosize
            minRows={4}
            onChange={(event) => setNewComment(event.currentTarget.value)}
          />
          <Flex justify="end">
            <Button
              onClick={() => createAgreementMutation.mutate()}
              loading={createAgreementMutation.isPending}
            >
              Opprett
            </Button>
          </Flex>
        </Flex>
      </Modal>
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
              <TextInput
                label="Avfallstype"
                value={currentRecord ? AgreementTypeDisplay[currentRecord.type] : ''}
                disabled
              />
              <TextInput
                label="Repetisjon"
                value={currentRecord ? RepetitionFrequencyDisplay[currentRecord.repetition] : ''}
                disabled
              />
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
                data={containers?.map((container) => container.name)}
                value={currentRecordContainer || null}
                onChange={(_value, option) => {
                  setCurrentRecordContainer(option.label);
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
          {
            accessor: 'type',
            title: 'Avfallstype',
            render: ({ type }) => <Box>{AgreementTypeDisplay[type]}</Box>,
          },
          {
            accessor: 'repetition',
            title: 'Repetisjon',
            render: ({ repetition }) => <Box>{RepetitionFrequencyDisplay[repetition]}</Box>,
          },
          {
            accessor: 'containerName',
            title: 'Container',
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
            width: '0%',
            render: (record) => (
              <Group gap={4} justify="right" wrap="nowrap">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="blue"
                  onClick={() => {
                    setCurrentRecord(record);
                    setCurrentRecordStatus(record.status);

                    setCurrentRecordContainer(record.containerName);
                    setCurrentRecordValidFrom(record.validFrom);
                    setCurrentRecordValidTo(record.validTo);
                    setCurrentRecordComment(record.comment);

                    open();
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  loading={deleteAgreementMutation.isPending}
                >
                  <IconTrash
                    size={16}
                    onClick={() => deleteAgreementMutation.mutate({ id: record.id })}
                  />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
      />
    </>
  );
}
