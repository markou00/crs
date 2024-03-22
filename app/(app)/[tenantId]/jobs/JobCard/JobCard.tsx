import { Card, Text, Button, Group, Grid } from '@mantine/core';
import { Job, Agreement, Car, Customer } from '@prisma/client';
import { IconClock, IconRepeatOff, IconCalendarRepeat } from '@tabler/icons-react';
import styles from './JobCard.module.css';

type JobCardProps = {
  job: Job;
  agreement: Agreement;
  car: Car | null;
  customer: Customer;
  tenantId: string;
};

export function JobCard({ job, tenantId, agreement, car, customer }: JobCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'assigned':
        return 'yellow';
      case 'unassigned':
        return 'red';
      default:
        return 'gray';
    }
  };

  const statusColor = getStatusColor(job.status);

  return (
    <Card
      key={job.id}
      shadow="sm"
      padding="lg"
      component="a"
      href={`/${tenantId}/jobs/${job.id}`}
      style={{
        cursor: 'pointer',
        width: '900px',
        position: 'relative',
        '--status-color': getStatusColor(job.status),
      }}
      className={styles.cardWithStatusEdge}
    >
      <div style={{ position: 'relative', height: '100%', backgroundColor: statusColor }} />
      <Grid gutter="sm">
        <Grid.Col span={3}>
          <Text fw={700}>{job.type}</Text>
        </Grid.Col>
        <Grid.Col span={2}>
          <Button variant="light" size="xs" className={styles.compactButton}>
            <Text size="xs" className={styles.compactText}>
              {agreement.containerName}
            </Text>
          </Button>
        </Grid.Col>
        <Grid.Col span={2}>
          {car && (
            <Button variant="default" size="xs" className={styles.compactButton}>
              <Text size="xs" className={styles.compactText}>
                {car?.regnr}
              </Text>
            </Button>
          )}
        </Grid.Col>
        <Grid.Col span={3}>
          <Group gap="xs" justify="flex-end">
            {agreement.repetition === 'NONE' ? (
              <IconRepeatOff size={16} />
            ) : (
              <IconCalendarRepeat size={16} />
            )}
            <Text size="sm">
              {new Date(job.date).toLocaleDateString('no-NB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}
            </Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={1.5}>
          <Group gap="xs" justify="flex-end">
            <IconClock size={16} />
            <Text size="sm">
              {new Date(job.date).toLocaleTimeString('no-NB', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={3}>
          <Text size="sm">Jobb-id: {job.id}</Text>
        </Grid.Col>
        <Grid.Col span={3}>
          <Text size="sm">{customer.name}</Text>
        </Grid.Col>
        <Grid.Col span={6}>
          <Text size="sm">
            {customer.address}, {customer.city}
          </Text>
        </Grid.Col>
      </Grid>
    </Card>
  );
}
