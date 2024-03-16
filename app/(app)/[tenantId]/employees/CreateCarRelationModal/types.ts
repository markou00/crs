export type CarType = {
  id: string;
  regnr: string;
  model: string;
  status: string;
};

export interface CreateCarRelationModalProps {
  opened: boolean;
  onClose: () => void;
  onCarSelect: (carId: string) => void;
  tenantId: string;
}
