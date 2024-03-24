/* eslint-disable radix */

'use client';

import {
  Title,
  Text,
  TextInput,
  rem,
  Flex,
  Button,
  Drawer,
  Textarea,
  ScrollArea,
  Select,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconSearch } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { Job, Customer, Agreement, Container, Car } from '@prisma/client';
import { getJobs, editJob } from '@/lib/server/actions/job-actions';
import { getCars } from '@/lib/server/actions/car-actions';
import { JobCard } from './JobCard/JobCard';

type JobDetails = Job & {
  customer: Customer;
  container: Container;
  agreement: Agreement;
  car: Car;
};

export default function JobsPage() {
  const [search, setSearch] = useState('');

  const getJobsQuery = useQuery({
    queryKey: ['jobs'],
    queryFn: () => getJobs(),
  });

  const getCarsQuery = useQuery({
    queryKey: ['cars'],
    queryFn: () => getCars(),
  });

  const filteredJobs = getJobsQuery.data?.jobs?.filter((job) =>
    job.type.toLowerCase().includes(search.toLowerCase())
  );

  const cars = getCarsQuery.data?.cars;

  const [opened, { open, close }] = useDisclosure(false);

  const [records, setRecords] = useState(getJobsQuery.data?.jobs);
  const [currentRecord, setCurrentRecord] = useState<JobDetails>();

  const [currentRecordType, setCurrentRecordType] = useState(currentRecord?.type);
  const [currentRecordStatus, setCurrentRecordStatus] = useState(currentRecord?.status);
  const [currentRecordComment, setCurrentRecordComment] = useState(currentRecord?.comment);
  const [currentRecordDate, setCurrentRecordDate] = useState(currentRecord?.date);
  const [currentRecordCarId, setCurrentRecordCarId] = useState(currentRecord?.carId);

  const editJobMutation = useMutation({
    mutationFn: async () => {
      const { modifiedJob, error } = await editJob({
        id: currentRecord?.id,
        type: currentRecordType,
        status: currentRecordStatus,
        comment: currentRecordComment,
        // eslint-disable-next-line radix
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
    setCurrentRecordStatus(record.status);
    setCurrentRecordType(record.type);
    setCurrentRecordDate(record.date);
    setCurrentRecordComment(record.comment);
    setCurrentRecordCarId(record.carId);
    open();
  };

  if (getJobsQuery.error) return <Text>Error...</Text>;
  if (getJobsQuery.isLoading) return <Text>Loading...</Text>;

  return (
    <>
      <Title mb="lg">Oppdrag</Title>
      <TextInput
        mb="sm"
        radius="lg"
        size="md"
        style={{ width: '200px' }}
        placeholder="Søk etter jobbtype"
        rightSectionWidth={42}
        leftSection={<IconSearch style={{ width: rem(18), height: rem(18) }} stroke={1.5} />}
        onChange={(event) => setSearch(event.currentTarget.value)}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {filteredJobs?.map((job) => (
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
              <Select
                comboboxProps={{ withinPortal: true }}
                // Definer en data-struktur som inkluderer både verdiene og de norske oversettelsene
                data={[
                  { value: 'unassigned', label: 'Ikke tildelt' },
                  { value: 'assigned', label: 'Tildelt' },
                  { value: 'overdue', label: 'Forfalt' },
                ]}
                value={currentRecordStatus}
                // Oppdaterer staten basert på valgt verdi
                onChange={(value) => setCurrentRecordStatus(value ?? '')}
                label="Status"
              />
              <TextInput label="Type" value={currentRecord?.type} disabled />
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
                data={cars?.map((car) => ({
                  value: car.id.toString(),
                  label: `${car.regnr} (ID: ${car?.Employee?.name})`,
                }))}
                value={currentRecordCarId?.toString() || ''}
                onChange={(value) => {
                  const newValue = value ? parseInt(value, 10) : null;
                  setCurrentRecordCarId(newValue);
                }}
                label="Car"
                placeholder="Select a car"
              />
              <Flex justify="end">
                <Button
                  onClick={() => editJobMutation.mutate()}
                  loading={editJobMutation.isPending}
                >
                  Bekreft
                </Button>
              </Flex>
            </Flex>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}
