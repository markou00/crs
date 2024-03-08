export interface AddCarModalProps {
  opened: boolean;
  tenantId: string;
  onClose: () => void;
  onCarAdded: () => void;
}

export interface CarFormValues {
  regnr: string;
  status: string;
}
