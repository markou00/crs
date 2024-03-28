import { RepetitionFrequency } from '@prisma/client';

export const RepetitionFrequencyDisplay: { [key in RepetitionFrequency]: string } = {
  NONE: 'Ingen',
  DAILY: 'Daglig',
  WEEKLY: 'Ukentlig',
};
