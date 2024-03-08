export const carFormValidation = {
  regnr: (value: string) => (value ? null : 'Regnr er påkrevd'),
  status: (value: string) => (value ? null : 'Status er påkrevd'),
};
