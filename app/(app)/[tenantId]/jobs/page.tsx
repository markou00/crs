'use client';

import { Title, Text, TextInput, rem } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { JobCard } from './JobCard/JobCard';
import { getJobs } from '@/lib/server/actions/job-actions';

export default function JobsPage() {
  const [search, setSearch] = useState('');

  const getJobsQuery = useQuery({
    queryKey: ['jobs'],
    queryFn: () => getJobs(),
  });

  const filteredJobs = getJobsQuery.data?.jobs?.filter((job) =>
    job.type.toLowerCase().includes(search.toLowerCase())
  );

  if (getJobsQuery.error) return <Text>Error...</Text>;
  if (getJobsQuery.isLoading) return <Text>Loading...</Text>;

  return (
    <>
      <Title mb="lg">Oppdrag</Title>
      <Text mb="md">Trykk på et oppdrag for detaljer</Text>
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
              tenantId={job.tenantId}
            />
          </div>
        ))}
      </div>
    </>
  );
}
