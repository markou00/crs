'use client';

import { ActionIcon, Box, Text, TextInput, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';

import { getAgreements } from '@/lib/server/actions/agreements-actions';

export default function AgreementsPage() {
  const getAgreementsQuery = useQuery({
    queryKey: ['agreements'],
    queryFn: () => getAgreements(),
  });

  const initialRecords = getAgreementsQuery.data?.agreements;

  const [records, setRecords] = useState(initialRecords);

  const [idQuery, setIdQuery] = useState('');
  const [debouncedIdQuery] = useDebouncedValue(idQuery, 200);

  useEffect(() => {
    setRecords(
      initialRecords?.filter(({ id }) => {
        if (
          debouncedIdQuery !== '' &&
          !`${id}`.toLowerCase().includes(debouncedIdQuery.trim().toLowerCase())
        ) {
          return false;
        }

        return true;
      })
    );
  }, [debouncedIdQuery]);

  if (getAgreementsQuery.error) return <Text>ERROR....</Text>;
  if (getAgreementsQuery.isLoading) return <Text>LOADING...</Text>;

  return (
    <>
      <Title mb="md">Avtaler</Title>
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
          },
          {
            accessor: 'status',
          },
          {
            accessor: 'endDate',
            title: 'Slutt dato',
            render: ({ endDate }) => (
              <Box fw={700}>{endDate ? endDate.toLocaleDateString('NO') : 'Løpende'}</Box>
            ),
          },
        ]}
      />
    </>
  );
}
