import { Customer } from './types';

export const mockCustomers: Customer[] = [
  {
    id: 1,
    type: 'Bedrift',
    name: 'BIM AS',
    contactName: 'John Doe',
    contactEmail: 'john@bimas.no',
    contactPhone: '12345678',
    address: 'Ålesundvegen 1',
    city: 'Ålesund',
    postalCode: '6001',
    country: 'Norway',
  },
  {
    id: 2,
    type: 'Privat',
    name: 'Lada Lars',
    contactName: 'Lada Lars',
    contactEmail: 'lada@eksempelas.no',
    contactPhone: '87654321',
    address: 'Eksempelgate 1',
    city: 'Ålesund',
    postalCode: '6001',
    country: 'Norway',
  },
  {
    id: 3,
    type: 'Bedrift',
    name: 'Elkjøp Test',
    contactName: 'Harald Hårstygge',
    contactEmail: 'harald@elkjoptest.no',
    address: 'Elkjøp Gate 1',
    city: 'Ålesund',
    postalCode: '6001',
    country: 'Norway',
  },
];
