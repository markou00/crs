export const carFormValidation = {
  regnr: (value: string) => (value ? null : 'Regnr er påkrevd'),
  model: (value: string) => (value ? null : 'Modell er påkrevd'),
  status: (value: string) => (value ? null : 'Status er påkrevd'),
};
