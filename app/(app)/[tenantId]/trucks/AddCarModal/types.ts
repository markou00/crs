export interface AddCarModalProps {
  opened: boolean;
  tenantId: string;
  onClose: () => void;
  getCarsQuery: any;
  setRecords: any;
}

export interface CarFormValues {
  regnr: string;
  model: string;
  status: string;
}
