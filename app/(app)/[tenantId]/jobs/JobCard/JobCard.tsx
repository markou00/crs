import { Card, Text, Button, Group, Grid } from '@mantine/core';
import {
  IconBox,
  IconTruck,
  IconTruckOff,
  IconClock,
  IconRepeatOff,
  IconCalendarRepeat,
  IconArrowsExchange,
  IconArrowLeft,
  IconArrowRight,
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
        width: '100%',
        position: 'relative',
        '--status-color': getStatusColor(job.status),
        transition,
        transform: CSS.Transform.toString(transform),
      }}
      className={styles.cardWithStatusEdge}
    >
      <div style={{ position: 'relative', height: '100%', backgroundColor: statusColor }} />
      <Grid gutter="sm">
        <Grid.Col span={2}>
          <Group gap="xs" justify="flex-end">
            <Text fw={700} size="xs">
              {getAgreementTypeDisplayValue(job.agreement.type)}
            </Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={2}>
          <Group gap="xs" justify="flex-end">
            <Text size="xs">{job.agreement.containerName}</Text>
            <IconBox size={16} />
          </Group>
        </Grid.Col>
        <Grid.Col span={2}>
          <Group gap="xs" justify="flex-end">
            <Text size="xs">{job.agreement.customer.name}</Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={2}>
          <Group gap="xs" justify="flex-end">
            <Text size="xs">{job.agreement.customer.address}</Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={2}>
          <Group gap="xs" justify="flex-end">
            <Text size="xs">
              {new Date(job.date).toLocaleDateString('no-NB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}
            </Text>
            {job.repetition === 'NONE' ? (
              <IconRepeatOff size={16} />
            ) : (
              <IconCalendarRepeat size={16} />
            )}
          </Group>
        </Grid.Col>
        <Grid.Col span={2}>
          <Group justify="flex-end">
            <Text size="xs">Oppdragsnr.: {job.id}</Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={2}>
          <Group justify="flex-end">
            <Text size="xs">Type: {job.type}</Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={2}>
          <Group gap="xs" justify="flex-end">
            {job.car?.regnr ? (
              <>
                <Text size="xs">{job.car.regnr}</Text>
                <IconTruck size={16} />
              </>
            ) : (
              <IconTruckOff size={16} color="red" />
            )}
          </Group>
        </Grid.Col>
        <Grid.Col span={2}>
          <Group gap="xs" justify="flex-end">
            <Text size="xs">{job.servicetype}</Text>
            {job.servicetype === 'Ut&Inn' ? (
              <IconArrowsExchange size={16} />
            ) : job.servicetype === 'Inngående' ? (
              <IconArrowLeft size={16} />
            ) : job.servicetype === 'Utgående' ? (
              <IconArrowRight size={16} />
            ) : null}
          </Group>
        </Grid.Col>
        <Grid.Col span={2}>
          <Group gap="xs" justify="flex-end">
            <Text size="xs">{job.agreement.customer.city}</Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={2}>
          <Group gap="xs" justify="flex-end">
            <Text size="xs">
              {new Date(job.date).toLocaleTimeString('no-NB', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            <IconClock size={16} />
          </Group>
        </Grid.Col>
        <Grid.Col span={2}>
          <Group justify="flex-end">
            {onEdit && (
              <Button size="xs" onClick={handleEditClick}>
                Rediger
              </Button>
            )}
          </Group>
        </Grid.Col>
      </Grid>
    </Card>
  );
}
