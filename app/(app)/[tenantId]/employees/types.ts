export type EmployeeType = {
  id: string;
  name: string;
  status: string;
  email: string;
  phone: string;
  picture: string;
  Car: { regnr: string } | null;
};
