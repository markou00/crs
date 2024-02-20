export interface AddCustomerModalProps {
  opened: boolean;
  tenantId: string;
  onClose: () => void;
  onCustomerAdded: () => void;
}

export interface CustomerFormValues {
  name: string;
  type: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}