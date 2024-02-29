export type EmployeeType = {
  id: number;
  name: string;
  status: string;
  email: string;
  phone: string;
  picture: string;
  Car: { regnr: string } | null;
};

export type ShowModalParams = {
  employee: EmployeeType;
  action: 'view' | 'edit' | 'delete';
};
