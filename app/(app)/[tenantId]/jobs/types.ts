import { Container, Customer, Car, Agreement, Job } from '@prisma/client';

export type JobDetails = Job & {
  car: Car | null;
  container: Container | null;
  agreement: Agreement & {
    customer: Customer;
  };
};

export type JobCardProps = {
  job: JobDetails;
  onEdit?: (job: JobDetails) => void;
};
