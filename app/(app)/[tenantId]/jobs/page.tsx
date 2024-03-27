/* eslint-disable radix */

'use client';

import {
  Title,
  Text,
  TextInput,
  Group,
  Badge,
  Flex,
  Button,
  Drawer,
  Textarea,
  ScrollArea,
  Select,
  Modal,
  ComboboxItem,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { Container, Car, Agreement } from '@prisma/client';
import { getJobs, editJob, deleteJob, addJob } from '@/lib/server/actions/job-actions';
import { getCars } from '@/lib/server/actions/car-actions';
import { getAgreements } from '@/lib/server/actions/agreements-actions';
import { JobCard } from './JobCard/JobCard';
import { AgreementTypeDisplay } from '../agreements/utils/agreementTypeDisplay';

type JobDetails = {
  id: number;
  type: string;
  status: string;
  date: Date;
  comment: string | null;
  containerId: number | null;
  agreementId: number;
  carId: number | null;
  container: Container | null;
  car: Car | null;
};

export default function JobsPage() {
  const getJobsQuery = useQuery({
    queryKey: ['jobs'],
    queryFn: () => getJobs(),
  });

  const getCarsQuery = useQuery({
    queryKey: ['cars'],
    queryFn: () => getCars(),
  });

  const getAgreementsQuery = useQuery({
    queryKey: ['agreements'],
    queryFn: () => getAgreements(),
  });

  const cars = getCarsQuery.data?.cars;
  const agreements = getAgreementsQuery.data?.agreements;

  const [opened, { open, close }] = useDisclosure(false);
  const [openedModal, { open: openModal, close: closeModal }] = useDisclosure(false);

  const [records, setRecords] = useState(getJobsQuery.data?.jobs);

  const [currentRecord, setCurrentRecord] = useState<JobDetails>();

  const [currentRecordComment, setCurrentRecordComment] = useState(currentRecord?.comment);
  const [currentRecordDate, setCurrentRecordDate] = useState(currentRecord?.date);
  const [currentRecordCarId, setCurrentRecordCarId] = useState(currentRecord?.carId);

  const [newAgreement, setNewAgreement] = useState<Agreement | null>();
  const [newCar, setNewCar] = useState<ComboboxItem | null>();
  const [newDate, setNewDate] = useState<Date>();
  const [newComment, setNewComment] = useState('');

  function getAgreementTypeDisplayValue(type: string): string {
    if (type in AgreementTypeDisplay) {
      return AgreementTypeDisplay[type as keyof typeof AgreementTypeDisplay];
    }
    return type;
  }

  const createJobMutation = useMutation({
    mutationFn: async () => {
      const determinedStatus = newCar?.value ? 'assigned' : 'unassigned';

      const { newJob, error } = await addJob({
        comment: newComment,
        agreementId: newAgreement?.id,
        type: newAgreement?.type || '',
        carId: newCar?.value ? parseInt(newCar?.value) : undefined,
        status: determinedStatus,
        date: newDate,
      });

      if (error) throw new Error("Couldn't create the job!");

      return newJob;
    },
    retry: false,
    onSuccess: async () => {
      const { data } = await getJobsQuery.refetch();
      setRecords(data?.jobs);
      setNewAgreement(null);
      setNewCar(null);
      setNewDate(undefined);
      setNewComment('');
      closeModal();
    },
  });

  const editJobMutation = useMutation({
    mutationFn: async () => {
      const determinedStatus = currentRecordCarId ? 'assigned' : 'unassigned';

      const { modifiedJob, error } = await editJob({
        id: currentRecord?.id,
        status: determinedStatus,
        comment: currentRecordComment,
        date: currentRecordDate,
        carId: currentRecordCarId,
      });

      if (error) throw new Error("Couldn't modify the job");

      return modifiedJob;
    },
    retry: false,

    onSuccess: async () => {
      const { data } = await getJobsQuery.refetch();
      setRecords(data?.jobs);
      close();
    },
    onError: (error: any) => console.log(error.message),
  });

  const openDrawer = (record: JobDetails) => {
    setCurrentRecord(record);
    setCurrentRecordDate(record.date);
    setCurrentRecordComment(record.comment);
    setCurrentRecordCarId(record.carId);
    open();
  };

  const deleteJobMutation = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const { deletedJob, error } = await deleteJob(id);

      if (error) throw new Error("Couldn't delete the job");

      return deletedJob;
    },
    retry: false,

    onSuccess: async () => {
      const { data } = await getJobsQuery.refetch();
      setRecords(data?.jobs);
      close();
    },
    onError: (error: any) => console.log(error.message),
  });

  if (getJobsQuery.error) return <Text>Error...</Text>;
  if (getJobsQuery.isLoading) return <Text>Loading...</Text>;

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title>Oppdrag</Title>
        <Button onClick={openModal}>Nytt oppdrag</Button>
        <Modal
          opened={openedModal}
          onClose={() => {
            closeModal();
            setNewAgreement(null);
            setNewCar(null);
            setNewDate(undefined);
            setNewComment('');
          }}
          title="Opprett nytt oppdrag"
        >
          <Flex direction="column" gap="md">
            <Select
              comboboxProps={{ withinPortal: true }}
              data={agreements?.map((agreement) => ({
                value: agreement.id.toString(),
                label: `${agreement.id} - ${getAgreementTypeDisplayValue(agreement.type || '')} (${agreement.customer.name})`,
              }))}
              value={newAgreement ? newAgreement.id.toString() : ''}
              onChange={(value) => {
                const selectedAgreement = agreements?.find(
                  (agreement) => agreement.id.toString() === value
                );
                setNewAgreement(selectedAgreement || null);
              }}
              label="Avtale"
              placeholder="Avtale-ID - avfallstype (kunde)"
            />
            <Select
              comboboxProps={{ withinPortal: true }}
              data={cars?.map((car) => ({
                value: car.id.toString(),
                label: `${car.regnr} - ${car.Employee?.name || 'mangler sjåfør'}`,
              }))}
              value={newCar?.value ? newCar.value : null}
              onChange={(_value, option) => {
                setNewCar({ value: option.value, label: option.label });
              }}
              label="Bil (valgfritt)"
              placeholder="Regnr - sjåfør/mangler sjåfør"
            />
            <DateTimePicker
              value={newDate}
              // @ts-ignore
              onChange={setNewDate}
              label="Velg dato og tid"
              placeholder="Velg dato og tid"
            />
            <Textarea
              label="Kommentar"
              value={newComment || ''}
              autosize
              minRows={4}
              onChange={(event) => setNewComment(event.currentTarget.value)}
            />
            <Flex justify="end">
              <Button
                onClick={() => createJobMutation.mutate()}
                loading={createJobMutation.isPending}
              >
                Opprett
              </Button>
            </Flex>
          </Flex>
        </Modal>
      </Group>
      <Group mb="md">
        <Badge color="green" variant="filled">
          Tildelt
        </Badge>
        <Badge color="orange" variant="filled">
          Ikke tildelt
        </Badge>
      </Group>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {records?.map((job) => (
          <div key={job.id} style={{ marginBottom: '5px' }}>
            <JobCard
              key={job.id}
              job={job}
              agreement={job.agreement}
              car={job.car}
              customer={job.agreement.customer}
              // @ts-ignore
              onEdit={openDrawer}
            />
          </div>
        ))}
      </div>
      <Drawer.Root
        radius="md"
        position="right"
        opened={opened}
        onClose={() => {
          setCurrentRecord(undefined);
          close();
        }}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <Drawer.Overlay />
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Oppdrag detaljer</Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body>
            <Flex direction="column" gap="md">
              <TextInput label="Oppdrag nr." value={currentRecord?.id} disabled />
              <TextInput
                label="Avfallstype"
                value={getAgreementTypeDisplayValue(currentRecord?.type || '')}
                disabled
              />
              <DateTimePicker
                defaultValue={currentRecordDate}
                // @ts-ignore
                onChange={setCurrentRecordDate}
                label="Velg dato og tid"
                placeholder="Velg dato og tid"
              />
              <Textarea
                label="Kommentar"
                value={currentRecordComment || ''}
                autosize
                minRows={4}
                onChange={(event) => setCurrentRecordComment(event.currentTarget.value)}
              />
              <TextInput label="Rfid" value={currentRecord?.container?.rfid} disabled />
              <TextInput label="Agreement Id" value={currentRecord?.agreementId} disabled />
              <Select
                comboboxProps={{ withinPortal: true }}
                data={[
                  { value: 'none', label: 'Ingen bil' },
                  ...(cars || []).map((car) => ({
                    value: car.id.toString(),
                    label: `${car.regnr} - ${car.Employee?.name || 'mangler sjåfør'}`,
                  })),
                ]}
                value={currentRecordCarId?.toString() || 'none'}
                onChange={(value) => {
                  const newValue = value !== 'none' && value !== null ? parseInt(value, 10) : null;
                  setCurrentRecordCarId(newValue);
                }}
                label="Bil"
              />

              <Flex justify="end">
                <Group>
                  <Button
                    color="red"
                    onClick={() => {
                      if (!currentRecord) {
                        console.log('Ingen oppdrag er valgt.');
                        return;
                      }

                      const isConfirmed = window.confirm(
                        'Er du sikker på at du vil slette dette oppdraget?'
                      );

                      if (isConfirmed) {
                        deleteJobMutation.mutate({ id: currentRecord.id });
                      }
                    }}
                    loading={deleteJobMutation.isPending}
                  >
                    Slett
                  </Button>
                  <Button
                    onClick={() => editJobMutation.mutate()}
                    loading={editJobMutation.isPending}
                  >
                    Bekreft
                  </Button>
                </Group>
              </Flex>
            </Flex>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}
