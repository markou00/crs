export interface AddEmployeeModalProps {
  opened: boolean;
  tenantId: string;
  onClose: () => void;
  onEmployeeAdded: () => void;
}

export interface EmployeeFormValues {
  name: string;
  email: string;
  phone: string;
  status: string;
  picture: string;
}
