import { Card, Text, Button, Group } from '@mantine/core';
import { Customer } from '../types';

type CustomerCardProps = {
  customer: Customer;
  onOpenModal: (customer: Customer) => void;
};

export function CustomerCard({ customer, onOpenModal }: CustomerCardProps) {
  return (
    <Card key={customer.id} withBorder style={{ marginBottom: 20, padding: '20px' }}>
      <Group justify="space-between" style={{ marginBottom: 5, marginTop: 5 }}>
        <div>
          <Text size="sm" c="#85BC24">
            {customer.type}
          </Text>
          <Text fw={700}>{customer.name}</Text>
          <Text c="dimmed" size="xs">
            {customer.address}
          </Text>
        </div>
        <Button onClick={() => onOpenModal(customer)} variant="subtle">
          Mer info
        </Button>
      </Group>
    </Card>
  );
}
