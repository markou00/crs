import { AgreementType } from '@prisma/client';

export const AgreementTypeDisplay: { [key in AgreementType]: string } = {
  RESIDUAL_WASTE: 'Restavfall',
  GLASS_WASTE: 'Glassavfall',
  GLASS_AND_METAL: 'Glass og Metall',
  METAL_WASTE: 'Metallavfall',
  HOUSEHOLD_WASTE: 'Husholdningsavfall',
  COMMERCIAL_WASTE: 'Næringsavfall',
  HAZARDOUS_WASTE: 'Farlig Avfall',
  CONSTRUCTION_AND_DEMOLITION_WASTE: 'Bygg- og Rivningsavfall',
  RECYCLING: 'Gjenvinning',
  SPECIAL_WASTE: 'Spesialavfall',
  ORGANIC_WASTE: 'Organisk Avfall',
  ELECTRONIC_WASTE: 'Elektronisk Avfall',
};
