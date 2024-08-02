import { Car, Employee } from '@prisma/client';

export type CarType = Car & {
  employee: Employee | null;
};
