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
  Stack,
  Tabs,
  HoverCard,
  rem,
} from '@mantine/core';
import { IconSquare, IconCheckbox } from '@tabler/icons-react';
import { DateTimePicker } from '@mantine/dates';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { Container, Car, Agreement, Job, RepetitionFrequency } from '@prisma/client';
import { getJobs, editJob, deleteJob, addJob } from '@/lib/server/actions/job-actions';
import { getCars } from '@/lib/server/actions/car-actions';
import { getAgreements } from '@/lib/server/actions/agreements-actions';
import { JobCard } from './JobCard/JobCard';
import classes from './page.module.css';
import { AgreementTypeDisplay } from '../agreements/utils/agreementTypeDisplay';
import { RepetitionFrequencyDisplay } from '../agreements/utils/repetitionFrequencyDisplay';

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
  repetition: RepetitionFrequency;
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
  const [newRepetition, setNewRepetition] = useState<RepetitionFrequency | undefined>(
    RepetitionFrequency.NONE
  );

  useEffect(() => {
    if (newRepetition !== RepetitionFrequency.NONE) {
      setNewCar(null);
    }
  }, [newRepetition]);

  function getAgreementTypeDisplayValue(type: string): string {
    if (type in AgreementTypeDisplay) {
      return AgreementTypeDisplay[type as keyof typeof AgreementTypeDisplay];
    }
    return type;
  }

  function getRepetitionFrequencyDisplayValue(type: string): string {
    if (type in RepetitionFrequencyDisplay) {
      return RepetitionFrequencyDisplay[type as keyof typeof RepetitionFrequencyDisplay];
    }
    return type;
  }

  const initialRepetitionOptions = [
    { value: RepetitionFrequency.NONE, label: 'Ingen gjentagelse', disabled: false },
    { value: RepetitionFrequency.DAILY, label: 'Daglig', disabled: true },
    { value: RepetitionFrequency.WEEKLY, label: 'Ukentlig', disabled: true },
  ];

  const [repetitionOptions, setRepetitionOptions] = useState(initialRepetitionOptions);

  useEffect(() => {
    if (newAgreement) {
      const updatedOptions = initialRepetitionOptions.map((option) => ({
        ...option,
        disabled: newAgreement.repetition !== option.value && option.value !== 'NONE',
      }));

      setRepetitionOptions(updatedOptions);

      if (updatedOptions.find((option) => option.value === newRepetition)?.disabled) {
        setNewRepetition('NONE');
      }
    } else {
      setRepetitionOptions(initialRepetitionOptions);
      setNewRepetition('NONE');
    }
  }, [newAgreement, newRepetition]);

  const createJobMutation = useMutation({
    mutationFn: async (job: Partial<Job>) => {
      const { newJob, error } = await addJob({
        comment: job.comment,
        agreementId: job.agreementId,
        type: job.type,
        carId: job.carId,
        status: job.status,
        date: job.date,
        repetition: job.repetition,
      });

      if (error) {
        throw new Error(`Couldn't create the job for date ${job.date}`);
      }

      return newJob;
    },
    retry: false,
    onSuccess: async () => {
      const { data } = await getJobsQuery.refetch();
      setRecords(data?.jobs);
    },
  });

  const handleCreateJobs = async () => {
    if (!newAgreement || !newDate) return;

    const validUntil = newAgreement.validTo ? new Date(newAgreement.validTo) : null;
    if (!validUntil) {
      console.error('Avtalen mangler en gyldig til dato.');
      return;
    }

    const jobs: Partial<Job>[] = [];
    const chosenDate = newDate;

    while (chosenDate <= validUntil) {
      jobs.push({
        comment: newComment,
        agreementId: newAgreement.id,
        type: newAgreement.type || '',
        carId: newCar ? parseInt(newCar.value, 10) : null,
        status: newCar ? 'assigned' : 'unassigned',
        repetition: newRepetition,
        date: new Date(chosenDate),
      });

      if (newRepetition === RepetitionFrequency.DAILY) {
        chosenDate.setDate(chosenDate.getDate() + 1);
      } else if (newRepetition === RepetitionFrequency.WEEKLY) {
        chosenDate.setDate(chosenDate.getDate() + 7);
      } else {
        break;
      }
    }

    await Promise.all(jobs.map((job) => createJobMutation.mutateAsync(job)))
      .then(() => {
        setNewAgreement(null);
        setNewCar(null);
        setNewDate(undefined);
        setNewRepetition(RepetitionFrequency.NONE);
        setNewComment('');
        closeModal();
      })
      .catch((error) => {
        console.error('Feil under opprettelse av jobber:', error);
      });
  };

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
      <Tabs variant="unstyled" defaultValue="incompleteTasks" classNames={classes}>
        <Tabs.List grow>
          <Tabs.Tab
            value="incompleteTasks"
            leftSection={<IconSquare style={{ width: rem(16), height: rem(16) }} />}
          >
            Aktive
          </Tabs.Tab>
          <Tabs.Tab
            value="completedTasks"
            leftSection={<IconCheckbox style={{ width: rem(16), height: rem(16) }} />}
          >
            Fullførte
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="incompleteTasks" pt="xs">
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
                    label: `${agreement.id} - ${getAgreementTypeDisplayValue(agreement.type || '')} - ${agreement.customer.name} - ${getRepetitionFrequencyDisplayValue(agreement.repetition)}`,
                  }))}
                  value={newAgreement ? newAgreement.id.toString() : ''}
                  onChange={(value) => {
                    const selectedAgreement = agreements?.find(
                      (agreement) => agreement.id.toString() === value
                    );
                    setNewAgreement(selectedAgreement || null);
                  }}
                  label="Avtale"
                  placeholder="AvtaleID - avfallstype - kunde - gjentagelse"
                />
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    Bil
                  </Text>
                  {newRepetition === RepetitionFrequency.NONE ? (
                    <HoverCard width={280} shadow="md">
                      <HoverCard.Target>
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
                          placeholder="Regnr - sjåfør/mangler sjåfør"
                        />
                      </HoverCard.Target>
                      <HoverCard.Dropdown>
                        <Text size="sm">
                          Dette er valgfritt, og vil kun være tilgjengelig for oppdrag uten
                          gjentagelse.
                        </Text>
                      </HoverCard.Dropdown>
                    </HoverCard>
                  ) : (
                    <Text size="sm" c="dimmed">
                      Utilgjengelig for gjentagende oppdrag
                    </Text>
                  )}
                </Stack>
                <DateTimePicker
                  value={newDate}
                  // @ts-ignore
                  onChange={setNewDate}
                  label="Velg dato og tid"
                  placeholder="Velg dato og tid"
                />
                <HoverCard width={280} shadow="md">
                  <HoverCard.Target>
                    <Select
                      label="Gjentagelse"
                      value={newRepetition}
                      onChange={(value) =>
                        setNewRepetition(value as RepetitionFrequency | undefined)
                      }
                      data={repetitionOptions}
                    />
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <Text size="sm">
                      Du kan velge ingen gjentagelsesfrekvens, eller det som er oppgitt i avtalen.
                      Oppdraget gjentas da frem til avtalen utløper. Hvis du velger en frekvens vil
                      du ikke kunne tildele en bil til oppdraget.
                    </Text>
                  </HoverCard.Dropdown>
                </HoverCard>
                <Textarea
                  label="Kommentar"
                  value={newComment || ''}
                  autosize
                  minRows={4}
                  onChange={(event) => setNewComment(event.currentTarget.value)}
                />
                <Flex justify="end">
                  <Button onClick={handleCreateJobs} loading={createJobMutation.isPending}>
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
            onClose={close}
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
                  <TextInput
                    label="Gjentagelse"
                    value={getRepetitionFrequencyDisplayValue(currentRecord?.repetition || '')}
                    disabled
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
                      const newValue =
                        value !== 'none' && value !== null ? parseInt(value, 10) : null;
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
        </Tabs.Panel>

        <Tabs.Panel value="completedTasks" pt="xs">
          Gallery tab content
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
