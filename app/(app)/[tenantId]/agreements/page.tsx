'use client';

import { Box, Title } from '@mantine/core';
import { DataTable } from 'mantine-datatable';

export default function AgreementsPage() {
  return (
    <>
      <Title mb="md">Avtaler</Title>
      <DataTable
        withTableBorder
        borderRadius="sm"
        withColumnBorders
        striped
        highlightOnHover
        records={[
          { id: 1, type: 'utleie', customer: 'Joe Biden', recurrent: true, endDate: '01.01.2024' },
          { id: 1, type: 'utleie', customer: 'Joe Biden', recurrent: true, endDate: '01.01.2024' },
          { id: 1, type: 'utleie', customer: 'Joe Biden', recurrent: true, endDate: '01.01.2024' },
          { id: 1, type: 'utleie', customer: 'Joe Biden', recurrent: true, endDate: '01.01.2024' },
          { id: 1, type: 'utleie', customer: 'Joe Biden', recurrent: true, endDate: '01.01.2024' },
          { id: 1, type: 'utleie', customer: 'Joe Biden', recurrent: true, endDate: '01.01.2024' },
          { id: 1, type: 'utleie', customer: 'Joe Biden', recurrent: true, endDate: '01.01.2024' },
        ]}
        columns={[
          {
            accessor: 'id',
          },
          { accessor: 'type' },
          {
            accessor: 'customer',
            title: 'Kunde',
            // this column has custom cell data rendering
            // render: ({ party }) => (
            //   <Box fw={700} c={party === 'Democratic' ? 'blue' : 'red'}>
            //     {party.slice(0, 3).toUpperCase()}
            //   </Box>
            // ),
          },
          {
            accessor: 'recurrent',
            title: 'løpende',
            render: ({ recurrent }) => <Box fw={700}>{recurrent ? 'Ja' : 'Nei'}</Box>,
          },
          {
            accessor: 'endDate',
            title: 'Slutt dato',
          },
        ]}
        // onRowClick={({ record: { name, party, bornIn } }) =>
        //   console.log({
        //     title: `Clicked on ${name}`,
        //     message: `You clicked on ${name}, a ${party.toLowerCase()} president born in ${bornIn}`,
        //     withBorder: true,
        //   })
        // }
      />
    </>
  );
}
