export const employeeFormValidation = {
  name: (value: string) => (value ? null : 'Navn er påkrevd'),
  email: (value: string) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Ugyldig epost'),
  phone: (value: string) => {
    const regex = /^\+?\d{0,15}$/;
    return regex.test(value) ? null : 'Ugyldig telefonnummer. Maks 15 tall.';
  },
  status: (value: string) => (value ? null : 'Status er påkrevd'),
};
