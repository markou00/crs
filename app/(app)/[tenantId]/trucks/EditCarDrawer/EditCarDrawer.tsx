'use client';

import { useMutation } from '@tanstack/react-query';
import { Car } from '@prisma/client';
import { Drawer, Button, TextInput, Group, Flex, Select, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { editCar } from '@/lib/server/actions/car-actions';
import { carFormValidation } from '../utils/carFormValidation';

export interface EditCarDrawerProps {
  car: Car;
  opened: boolean;
  onClose: () => void;
  getCarsQuery: any;
  setRecords: any;
}

export function EditCarDrawer({
  car,
  opened,
  onClose,
  getCarsQuery,
  setRecords,
}: EditCarDrawerProps) {
  const form = useForm({
    initialValues: {
      regnr: car.regnr,
      model: car.model,
      status: car.status,
    },
    validate: carFormValidation,
  });

  const updateCarMutation = useMutation({
    mutationFn: async () => {
      const { modifiedCar, error } = await editCar({
        id: car.id,
        ...form.values,
      });

      if (error) throw new Error("Couldn't modify the car");

      return modifiedCar;
    },
    retry: false,

    onSuccess: async () => {
      const { data } = await getCarsQuery.refetch();
      setRecords(data?.cars);
      onClose();
    },
    onError: (error: any) => console.log(error.message),
  });

  if (getCarsQuery.error) return <Text>Error...</Text>;
  if (getCarsQuery.isLoading) return <Text>Loading...</Text>;

  return (
    <>
      <Drawer
        opened={opened}
        onClose={onClose}
        title="Rediger bil"
        position="right"
        padding="xl"
        size="lg"
      >
        <Drawer.Body>
          <Flex direction="column" gap="md">
            <TextInput label="Regnr" {...form.getInputProps('regnr')} />
            <TextInput label="Modell" {...form.getInputProps('model')} />
            <Select
              label="Status"
              {...form.getInputProps('status')}
              data={[
                { value: 'Operativ', label: 'Operativ' },
                { value: 'Skadet', label: 'Skadet' },
                { value: 'Til reparasjon', label: 'Til reparasjon' },
                { value: 'Vedlikehold', label: 'Vedlikehold' },
              ]}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => updateCarMutation.mutate()}
                loading={updateCarMutation.isPending}
              >
                Lagre
              </Button>
            </Group>
          </Flex>
        </Drawer.Body>
      </Drawer>
    </>
  );
}
