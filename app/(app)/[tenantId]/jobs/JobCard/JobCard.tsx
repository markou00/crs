import { Card, Text, Button, Group, Grid } from '@mantine/core';
import {
  IconBox,
  IconTruck,
  IconClock,
  IconRepeatOff,
  IconCalendarRepeat,
} from '@tabler/icons-react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

import styles from './JobCard.module.css';
import { AgreementTypeDisplay } from '../../agreements/utils/agreementTypeDisplay';
import { JobCardProps } from '../types';

function getAgreementTypeDisplayValue(type: string): string {
  if (type in AgreementTypeDisplay) {
    return AgreementTypeDisplay[type as keyof typeof AgreementTypeDisplay];
  }
  return type;
}

export function JobCard({ job, onEdit }: JobCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'green';
      case 'unassigned':
        return 'orange';
      case 'completed':
        return 'grey';
      default:
        return 'white';
    }
  };

  const statusColor = getStatusColor(job.status);

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(job);
    }
  };

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: job.id,
    data: {
      type: 'Task',
      job,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return <div ref={setNodeRef} style={style} className={`${styles.card} ${styles.isDragging}`} />;
  }

  return (
    <Card
      key={job.id}
      shadow="sm"
      padding="lg"
      component="a"
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        width: '700px',
        position: 'relative',
        '--status-color': getStatusColor(job.status),
        transition,
        transform: CSS.Transform.toString(transform),
      }}
      className={styles.cardWithStatusEdge}
    >
      <div style={{ position: 'relative', height: '100%', backgroundColor: statusColor }} />
      <Grid gutter="sm">
        <Grid.Col span={3}>
          <Text fw={700}>{getAgreementTypeDisplayValue(job.agreement.type)}</Text>
        </Grid.Col>
        <Grid.Col span={2.5}>
          <Group gap="xs">
            <IconBox size={16} />
            <Button variant="light" size="xs" className={styles.compactButton}>
              <Text size="xs" className={styles.compactText}>
                {job.agreement.containerName}
              </Text>
            </Button>
          </Group>
        </Grid.Col>
        <Grid.Col span={2}>
          {job.car && (
            <Group gap="xs">
              <IconTruck size={16} />
              <Button variant="default" size="xs" className={styles.compactButton}>
                <Text size="xs" className={styles.compactText}>
                  {job.car?.regnr}
                </Text>
              </Button>
            </Group>
          )}
        </Grid.Col>
        <Grid.Col span={2.5}>
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
        <Grid.Col span={6}>
          <Text size="sm">
            {job.agreement.customer.name} - {job.agreement.customer.address},{' '}
            {job.agreement.customer.city}
          </Text>
        </Grid.Col>
        <Grid.Col span={3}>
          <Group justify="flex-end">
            {onEdit && <Button onClick={handleEditClick}>Rediger</Button>}
          </Group>
        </Grid.Col>
      </Grid>
    </Card>
  );
}
