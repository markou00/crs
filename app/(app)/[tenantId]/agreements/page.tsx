'use client';

import {
  ActionIcon,
  Box,
  Center,
  Drawer,
  Group,
  MultiSelect,
  ScrollArea,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from 'mantine-datatable';
import { useEffect, useMemo, useState } from 'react';
import { IconEdit, IconSearch, IconTrash, IconX, IconClick } from '@tabler/icons-react';
import { Agreement } from '@prisma/client';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';

import { getAgreements } from '@/lib/server/actions/agreements-actions';

export default function AgreementsPage() {
  const getAgreementsQuery = useQuery({
    queryKey: ['agreements'],
    queryFn: () => getAgreements(),
  });

  const [opened, { open, close }] = useDisclosure(false);
  const content = Array(100)
    .fill(0)
    .map((_, index) => <p key={index}>Drawer with scroll</p>);

  const initialRecords = getAgreementsQuery.data?.agreements;

  const [records, setRecords] = useState(initialRecords);
  const [currentRecord, setCurrentRecord] = useState<Agreement>();

  const [idQuery, setIdQuery] = useState('');
  const [debouncedIdQuery] = useDebouncedValue(idQuery, 200);

  const [customerQuery, setCustomerQuery] = useState('');
  const [debouncedCustomerQuery] = useDebouncedValue(customerQuery, 200);

  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const statuses = useMemo(() => Array.from(new Set(records?.map((e) => e.status))), [records]);

  useEffect(() => {
    setRecords(
      initialRecords?.filter(({ id, customer, status }) => {
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
            <Drawer.Title>Avtale #{currentRecord?.id}</Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body>{content}</Drawer.Body>
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
            title: 'Slutt dato',
            render: ({ endDate }) => (
              <Box fw={700}>{endDate ? endDate.toLocaleDateString('NO') : 'Løpende'}</Box>
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
