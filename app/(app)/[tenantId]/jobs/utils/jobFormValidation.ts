export const jobFormValidation = {
  name: (value: string) => (value ? null : 'Navn er påkrevd'),
  type: (value: string) => (value ? null : 'Type er påkrevd'),
  contactName: (value: string) => (value ? null : 'Kontaktnavn er påkrevd'),
  contactEmail: (value: string) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Ugyldig epost'),
  contactPhone: (value: string) => {
    const regex = /^\+?\d{0,15}$/;
    return regex.test(value) ? null : 'Ugyldig telefonnummer. Maks 15 tall.';
  },
  address: (value: string) => (value ? null : 'Adresse er påkrevd'),
  city: (value: string) => (value ? null : 'Sted er påkrevd'),
  postalCode: (value: string) => (value ? null : 'Postnr er påkrevd'),
  country: (value: string) => (value ? null : 'Land er påkrevd'),
};
