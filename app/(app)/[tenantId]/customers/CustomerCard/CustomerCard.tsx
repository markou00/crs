import Link from 'next/link';
import { Card, Text, Button, Group } from '@mantine/core';
import { Customer } from '@prisma/client';

type CustomerCardProps = {
  customer: Customer;
  tenantId: string;
};

export function CustomerCard({ customer, tenantId }: CustomerCardProps) {
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
        <Link href={`/${tenantId}/customers/${customer.id}`}>
          <Button variant="subtle">Mer info</Button>
        </Link>
      </Group>
    </Card>
  );
}
