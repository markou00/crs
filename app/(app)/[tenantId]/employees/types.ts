import { Employee, Car } from '@prisma/client';

export type EmployeeType = Employee & {
  Car: Car | null;
};
