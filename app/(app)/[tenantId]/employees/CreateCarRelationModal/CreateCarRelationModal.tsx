import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal, Select, Text } from '@mantine/core';
import { CarType, CreateCarRelationModalProps } from './types';

export function CreateCarRelationModal({
  opened,
  onClose,
  onCarSelect,
  tenantId,
}: CreateCarRelationModalProps) {
  const {
    data: cars,
    isLoading,
    error,
  } = useQuery<CarType[]>({
    queryKey: ['availableCars', tenantId],
    queryFn: async () => {
      const response = await fetch(`/api/${tenantId}/trucks/available`);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
    enabled: opened,
  });

  const handleSelect = (value: string | null) => {
    if (value) {
      onCarSelect(value);
      onClose();
    }
  };

  const selectData =
    cars?.map((car) => ({
      value: car.id.toString(),
      label: `${car.regnr} - ${car.model} - ${car.status}`,
    })) || [];

  return (
    <Modal opened={opened} onClose={onClose} title="Velg en tilgjengelig bil:">
      {isLoading && <Text>Laster tilgjengelige biler...</Text>}
      {error && <Text>Noe gikk galt: {error.message}</Text>}
      {selectData.length > 0 ? (
        <Select
          label="Tilgjengelige biler"
          placeholder="Velg en bil"
          data={selectData}
          onChange={handleSelect}
        />
      ) : (
        <Text>Ingen tilgjengelige biler</Text>
      )}
    </Modal>
  );
}
