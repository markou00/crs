import { AreaChart, BarChart, DonutChart } from '@mantine/charts';
import { Card, Divider, Flex, SimpleGrid, Title } from '@mantine/core';

import { carData, containerData, containerStatusData, jobsStatusData } from './data';

export default function DashboardPage() {
  return (
    <>
      <Title>Dashboard</Title>

      <Divider mt="lg" mb="xl" />

      <Flex direction="column" gap="lg">
        <Card withBorder shadow="sm" radius="md">
          <Title order={2} mb="lg" ta="center">
            Beholdning av containere
          </Title>
          <AreaChart
            h={300}
            data={containerData}
            dataKey="date"
            series={[
              { name: 'Matavfall', color: 'indigo.6' },
              { name: 'Restavfall', color: 'blue.6' },
              { name: 'Glassavfall', color: 'teal.6' },
            ]}
            curveType="linear"
            xAxisLabel="Dato"
            yAxisLabel="Antall"
          />
        </Card>

        <Card withBorder shadow="sm" radius="md">
          <Title order={2} mb="lg" ta="center">
            Inntekt per bil
          </Title>
          <BarChart
            h={300}
            data={carData}
            dataKey="month"
            series={[
              { name: 'BT54321', color: 'violet.6' },
              { name: 'CV98765', color: 'blue.6' },
              { name: 'EK67890', color: 'teal.6' },
            ]}
            tickLine="y"
            xAxisLabel="Dato"
            yAxisLabel="Kroner"
          />
        </Card>
      </Flex>
      <SimpleGrid mt="lg" cols={{ base: 1, md: 2 }} spacing="md">
        <Card withBorder shadow="sm" radius="md">
          <Title order={2} mb="lg" ta="center">
            Container status
          </Title>
          <Flex justify="center">
            <DonutChart withLabelsLine withLabels data={containerStatusData} />
          </Flex>
        </Card>
        <Card withBorder shadow="sm" radius="md">
          <Title order={2} mb="lg" ta="center">
            Oppdrag status
          </Title>
          <Flex justify="center">
            <DonutChart withLabelsLine withLabels data={jobsStatusData} />
          </Flex>
        </Card>
      </SimpleGrid>
    </>
  );
}
