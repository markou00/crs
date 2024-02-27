'use client';

import { Box, Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from 'mantine-datatable';

import { getAgreements } from '@/lib/server/actions/agreements-actions';

export default function AgreementsPage() {
  const getAgreementsQuery = useQuery({
    queryKey: ['agreements'],
    queryFn: () => getAgreements(),
  });

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
        records={getAgreementsQuery.data?.agreements}
        columns={[
          {
            accessor: 'id',
          },
          { accessor: 'type' },
          {
            accessor: 'customerId',
            title: 'Kunde',
          },
          {
            accessor: 'recurrent',
            title: 'løpende',
            render: ({ recurrent }) => <Box fw={700}>{recurrent ? 'Ja' : 'Nei'}</Box>,
          },
          {
            accessor: 'endDate',
            title: 'Slutt dato',
            render: ({ endDate }) => <Box fw={700}>{endDate.toISOString()}</Box>,
          },
        ]}
      />
    </>
  );
}
