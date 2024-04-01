import { Card, Text, Button, Group } from '@mantine/core';
import { Customer } from '@prisma/client';

type CustomerCardProps = {
  customer: Customer;
  onEdit?: (customer: Customer) => void;
};

export function CustomerCard({ customer, onEdit }: CustomerCardProps) {
  const handleEditClick = () => {
    if (onEdit) {
      onEdit(customer);
    }
  };

  return (
    <Card key={customer.id} withBorder style={{ marginBottom: 20, padding: '20px' }}>
      <Group justify="space-between" style={{ marginBottom: 5, marginTop: 5 }}>
        <div>
          <Text size="sm">{customer.type}</Text>
          <Text fw={700}>{customer.name}</Text>
          <Text c="dimmed" size="xs">
            {customer.address}
          </Text>
        </div>
        <Group justify="flex-end">
          {onEdit && <Button onClick={handleEditClick}>Rediger</Button>}
        </Group>
      </Group>
    </Card>
  );
}
