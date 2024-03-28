import { Card, Text, Button, Group, Grid } from '@mantine/core';
import { Job, Agreement, Car, Customer } from '@prisma/client';
import {
  IconBox,
  IconTruck,
  IconClock,
  IconRepeatOff,
  IconCalendarRepeat,
} from '@tabler/icons-react';
import styles from './JobCard.module.css';
import { AgreementTypeDisplay } from '../../agreements/utils/agreementTypeDisplay';

type JobCardProps = {
  job: Job;
  agreement: Agreement;
  car: Car | null;
  customer: Customer;
  onEdit: (job: Job) => void;
};

function getAgreementTypeDisplayValue(type: string): string {
  if (type in AgreementTypeDisplay) {
    return AgreementTypeDisplay[type as keyof typeof AgreementTypeDisplay];
  }
  return type;
}

export function JobCard({ job, agreement, car, customer, onEdit }: JobCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'green';
      case 'unassigned':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const statusColor = getStatusColor(job.status);

  const handleEditClick = () => {
    onEdit(job);
  };

  return (
    <Card
      key={job.id}
      shadow="sm"
      padding="lg"
      component="a"
      style={{
        width: '900px',
        position: 'relative',
        '--status-color': getStatusColor(job.status),
      }}
      className={styles.cardWithStatusEdge}
    >
      <div style={{ position: 'relative', height: '100%', backgroundColor: statusColor }} />
      <Grid gutter="sm">
        <Grid.Col span={3}>
          <Text fw={700}>{getAgreementTypeDisplayValue(job.type)}</Text>
        </Grid.Col>
        <Grid.Col span={2}>
          <Group gap="xs">
            <IconBox size={16} />
            <Button variant="light" size="xs" className={styles.compactButton}>
              <Text size="xs" className={styles.compactText}>
                {agreement.containerName}
              </Text>
            </Button>
          </Group>
        </Grid.Col>
        <Grid.Col span={2}>
          {car && (
            <Group gap="xs">
              <IconTruck size={16} />
              <Button variant="default" size="xs" className={styles.compactButton}>
                <Text size="xs" className={styles.compactText}>
                  {car?.regnr}
                </Text>
              </Button>
            </Group>
          )}
        </Grid.Col>
        <Grid.Col span={3}>
          <Group gap="xs" justify="flex-end">
            {job.repetition === 'NONE' ? (
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
        <Grid.Col span={3}>
          <Text size="sm">
            {customer.address}, {customer.city}
          </Text>
        </Grid.Col>
        <Grid.Col span={3}>
          <Button onClick={handleEditClick}>Rediger</Button>
        </Grid.Col>
      </Grid>
    </Card>
  );
}
