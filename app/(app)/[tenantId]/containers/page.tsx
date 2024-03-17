/* eslint-disable radix */

'use client';

import {
  ActionIcon,
  Box,
  Button,
  Center,
  Drawer,
  Flex,
  Group,
  Modal,
  MultiSelect,
  ScrollArea,
  Select,
  Text,
  TextInput,
  Title,
  Tabs,
  rem,
} from '@mantine/core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { DataTable } from 'mantine-datatable';
import { useEffect, useMemo, useState } from 'react';
import {
  IconEdit,
  IconSearch,
  IconTrash,
  IconX,
  IconClick,
  IconMessageCircle,
  IconSettings,
} from '@tabler/icons-react';
import { Container, ContainerStatus } from '@prisma/client';
import { DateInput } from '@mantine/dates';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';

import classes from './page.module.css';
import {
  addContainer,
  deleteContainer,
  editContainer,
  getContainers,
} from '@/lib/server/actions/containers-actions';

export default function ContainersPage() {
  const getContainersQuery = useQuery({
    queryKey: ['containers'],
    queryFn: () => getContainers(),
  });

  const [opened, { open, close }] = useDisclosure(false);
  const [openedModal, { open: openModal, close: closeModal }] = useDisclosure(false);

  const [records, setRecords] = useState(getContainersQuery.data?.containers);
  const [currentRecord, setCurrentRecord] = useState<Container>();

  const [currentRecordStatus, setCurrentRecordStatus] = useState(currentRecord?.status);

  const [currentRecordAvailableAt, setCurrentRecordAvailableAt] = useState(
    currentRecord?.availableAt
  );

  const [idQuery, setIdQuery] = useState('');
  const [debouncedIdQuery] = useDebouncedValue(idQuery, 200);

  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const statuses = useMemo(() => Array.from(new Set(records?.map((e) => e.status))), [records]);

  const [newRfid, setNewRfid] = useState('');
  const [newCapacity, setNewCapacity] = useState('');
  const [newType, setNewType] = useState('');
  const [newStatus, setNewStatus] = useState<ContainerStatus | null>();
  const [newAvailableAt, setNewAvailableAt] = useState<Date>();

  const createContainerMutation = useMutation({
    mutationFn: async () => {
      const { newContainer, error } = await addContainer({
        rfid: newRfid,
        capacity: parseInt(newCapacity),
        type: newType,
        status: newStatus!,
        availableAt: newAvailableAt,
      });

      if (error) throw new Error("Couldn't create the container!");

      return newContainer;
    },
    retry: false,
    onSuccess: async () => {
      const { data } = await getContainersQuery.refetch();
      setRecords(data?.containers);
      closeModal();
      setNewRfid('');
      setNewCapacity('');
      setNewType('');
      setNewStatus(null);
      setNewAvailableAt(undefined);
    },
  });

  useEffect(() => {
    setRecords(
      getContainersQuery.data?.containers?.filter(({ rfid, status }) => {
        if (
          debouncedIdQuery !== '' &&
          !`${rfid}`.toLowerCase().includes(debouncedIdQuery.trim().toLowerCase())
        ) {
          return false;
        }

        if (selectedStatus.length && !selectedStatus.some((s) => s === status)) return false;

        return true;
      })
    );
  }, [debouncedIdQuery, selectedStatus]);

  const editContainerMutation = useMutation({
    mutationFn: async () => {
      const { modifiedContainer, error } = await editContainer({
        id: currentRecord?.id,
        status: currentRecordStatus,
        availableAt: currentRecordAvailableAt,
      });

      if (error) throw new Error("Couldn't modify the container");

      return modifiedContainer;
    },
    retry: false,

    onSuccess: async () => {
      const { data } = await getContainersQuery.refetch();
      setRecords(data?.containers);
      close();
    },
    onError: (error: any) => console.log(error.message),
  });

  const deleteContainerMutation = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const { deletedContainer, error } = await deleteContainer(id);

      if (error) throw new Error("Couldn't delete the agreement");

      return deletedContainer;
    },
    retry: false,

    onSuccess: async () => {
      const { data } = await getContainersQuery.refetch();
      setRecords(data?.containers);
      close();
    },
    onError: (error: any) => console.log(error.message),
  });

  if (getContainersQuery.error) return <Text>ERROR....</Text>;
  if (getContainersQuery.isLoading) return <Text>LOADING...</Text>;

  return (
    <>
      <Tabs variant="unstyled" defaultValue="availability" classNames={classes}>
        <Tabs.List grow>
          <Tabs.Tab
            value="availability"
            leftSection={<IconSettings style={{ width: rem(16), height: rem(16) }} />}
          >
            Availability
          </Tabs.Tab>
          <Tabs.Tab
            value="overview"
            leftSection={<IconMessageCircle style={{ width: rem(16), height: rem(16) }} />}
          >
            Overview
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="availability" pt="xs">
          Gallery tab content
        </Tabs.Panel>

        <Tabs.Panel value="overview" pt="xs">
          <Group justify="space-between" mt="md" mb="md">
            <Title>Beholdere</Title>
            <Button onClick={openModal}>Ny beholder</Button>
          </Group>

          <Modal
            opened={openedModal}
            onClose={() => {
              closeModal();
              setNewType('');
              setNewStatus(null);
              setNewAvailableAt(undefined);
            }}
            title="Opprett ny container"
          >
            <Flex direction="column" gap="md">
              <TextInput
                label="RFID"
                value={newRfid}
                onChange={(event) => setNewRfid(event.currentTarget.value)}
              />
              <TextInput
                label="Kapasitet"
                value={newCapacity}
                onChange={(event) => setNewCapacity(event.currentTarget.value)}
              />
              <TextInput
                label="Avfallstype"
                value={newType}
                onChange={(event) => setNewType(event.currentTarget.value)}
              />
              <Select
                comboboxProps={{ withinPortal: true }}
                data={[ContainerStatus.available, ContainerStatus.unavailable]}
                value={newStatus}
                onChange={(_value, option) =>
                  Object.values(ContainerStatus).includes(option.label as ContainerStatus) &&
                  setNewStatus(option.label as ContainerStatus)
                }
                label="Status"
              />
              <DateInput
                value={newAvailableAt}
                // @ts-ignore
                onChange={setNewAvailableAt}
                valueFormat="DD.MM.YYYY"
                label="Ledig fra"
              />
              <Flex justify="end">
                <Button
                  onClick={() => createContainerMutation.mutate()}
                  loading={createContainerMutation.isPending}
                >
                  Opprett
                </Button>
              </Flex>
            </Flex>
          </Modal>
          <Drawer.Root
            radius="md"
            position="right"
            opened={opened}
            onClose={close}
            scrollAreaComponent={ScrollArea.Autosize}
          >
            <Drawer.Overlay />
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>Beholder detaljer</Drawer.Title>
                <Drawer.CloseButton />
              </Drawer.Header>
              <Drawer.Body>
                <Flex direction="column" gap="md">
                  <TextInput label="Avfallstype" value={currentRecord?.type} disabled />
                  <Select
                    comboboxProps={{ withinPortal: true }}
                    data={[ContainerStatus.available, ContainerStatus.unavailable]}
                    value={currentRecordStatus}
                    onChange={(_value, option) =>
                      setCurrentRecordStatus(option.label as ContainerStatus)
                    }
                    label="Status"
                  />

                  <DateInput
                    value={currentRecordAvailableAt}
                    // @ts-ignore
                    onChange={setCurrentRecordAvailableAt}
                    valueFormat="DD.MM.YYYY"
                    label="Ledig fra"
                  />
                  <Flex justify="end">
                    <Button
                      onClick={() => editContainerMutation.mutate()}
                      loading={editContainerMutation.isPending}
                    >
                      Bekreft
                    </Button>
                  </Flex>
                </Flex>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Root>

          <DataTable
            withTableBorder
            borderRadius="sm"
            withColumnBorders
            striped
            highlightOnHover
            records={records}
            columns={[
              {
                accessor: 'rfid',
                filter: (
                  <TextInput
                    label="Id"
                    description="Show agreements whose id include the specified id"
                    placeholder="Search agreements..."
                    leftSection={<IconSearch size={16} />}
                    rightSection={
                      <ActionIcon
                        size="sm"
                        variant="transparent"
                        c="dimmed"
                        onClick={() => setIdQuery('')}
                      >
                        <IconX size={14} />
                      </ActionIcon>
                    }
                    value={idQuery}
                    onChange={(e) => setIdQuery(e.currentTarget.value)}
                  />
                ),
                filtering: idQuery !== '',
              },
              {
                accessor: 'name',
                title: 'Beskrivelse',
              },
              {
                accessor: 'status',
                filter: (
                  <MultiSelect
                    label="Status"
                    description="Vis alle status"
                    data={statuses}
                    value={selectedStatus}
                    placeholder="Søk etter status…"
                    onChange={setSelectedStatus}
                    leftSection={<IconSearch size={16} />}
                    clearable
                  />
                ),
                filtering: selectedStatus.length > 0,
              },
              {
                accessor: 'jobId',
                title: 'Oppdrag nr.',
              },
              {
                accessor: 'availableAt',
                title: 'Ledig fra',
                render: ({ availableAt }) => (
                  <Box fw={700}>{availableAt.toLocaleDateString('NO')}</Box>
                ),
              },
              {
                accessor: 'actions',
                title: (
                  <Center>
                    <IconClick size={16} />
                  </Center>
                ),
                width: '0%', // 👈 use minimal width
                render: (record) => (
                  <Group gap={4} justify="right" wrap="nowrap">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="blue"
                      onClick={() => {
                        setCurrentRecord(record);
                        setCurrentRecordStatus(record.status);
                        setCurrentRecordAvailableAt(record.availableAt);

                        open();
                      }}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="red"
                      loading={deleteContainerMutation.isPending}
                      onClick={() => deleteContainerMutation.mutate({ id: record.id })}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                ),
              },
            ]}
          />
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
