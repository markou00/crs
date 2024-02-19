// Define your Customer type here
export type Customer = {
  id: number;
  name: string;
  type: 'Privat' | 'Bedrift';
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};
