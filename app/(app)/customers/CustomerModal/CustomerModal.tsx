import { Modal, Text } from '@mantine/core';
import { Customer } from '../types';

type CustomerModalProps = {
  customer: Customer | null;
  opened: boolean;
  onClose: () => void;
};

export function CustomerModal({ customer, opened, onClose }: CustomerModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={customer ? `${customer.type}: ${customer.name}` : 'Customer Details'}
    >
      {customer && (
        <div>
          <Text>Kontaktnavn: {customer.contactName}</Text>
          <Text>Epost: {customer.contactEmail}</Text>
          <Text>Tlf: {customer.contactPhone || 'N/A'}</Text>
          <Text>Addresse: {customer.address}</Text>
          <Text>Sted: {customer.city}</Text>
          <Text>Postnr: {customer.postalCode}</Text>
          <Text>Land: {customer.country}</Text>
        </div>
      )}
    </Modal>
  );
}
