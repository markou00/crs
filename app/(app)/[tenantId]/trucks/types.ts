import { Car, Employee } from '@prisma/client';

export type CarType = Car & {
  Employee: Employee | null;
};
