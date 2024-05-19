# Containerhåndtering - Bachelorprosjekt

## Om prosjektet

Dette bachelorprosjektet har som mål å utvikle en prototype av et system for containerhåndtering. Se hovedrapporten for mer informasjon.

### Oppdragsgiver og Kontaktinformasjon

- **Oppdragsgiver:** Reknes AS
- **Kontaktperson:** Frank Grytting

### Veiledning og Utdanning

- **Institusjon:** NTNU Ålesund
- **Veileder:** Arne Styve
- **Studie:** Dataingeniørutdanning, 3. år

### Tidsramme

- **Frist:** Tirsdag 21. mai 2024

## Teknologi som benyttes

- **Next.js:** Et full-stack rammeverk for React, utviklet av Vercel.
- **Mantine:** Et React komponent-bibliotek som brukes for å style front-end.
- **Supabase:** En open-source Backend as a Service (BaaS) plattform som inkluderer en PostgresSQL database.

## Hvordan kjører man applikasjonen for første gang?

Dette er en guide som hjelper deg med å sette opp databasen og seede informasjon når du kloner applikasjonen og kjører den for første gang.

### Steg-for-Steg Guide

#### 1. Opprett en konto i Supabase

- Gå til [Supabase](https://supabase.io) og opprett en konto.

#### 2. Opprett en organisasjon og prosjekt i Supabase

- Opprett en ny organisasjon og prosjekt.
- Hent følgende informasjon:
  - **Url'en til databasen din**
  - **Url'en til din Supabase API**
  - **Supabase anonym access key**
  - **Supabase service role token**

#### 3. Klon prosjektet fra GitHub

- Klon prosjektet ved å kjøre kommandoen:
  ```bash
  git clone <URL_TIL_PROSJEKT>
  cd <PROSJEKT_MAPPE>
  yarn
  ```

#### 4. Opprett en `.env` fil

- Opprett en `.env` fil i root-mappen av prosjektet og legg til følgende variabler:
  ```env
  DATABASE_URL=<LIM INN DET DU HENTET I PUNKT 2.a OVENFOR>
  NEXT_PUBLIC_SUPABASE_URL=<LIM INN DET DU HENTET I PUNKT 2.b OVENFOR>
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<LIM INN DET DU HENTET I PUNKT 2.c OVENFOR>
  SUPABASE_SECRET=<LIM INN DET DU HENTET I PUNKT 2.d OVENFOR>
  ```

#### 5. Sett opp Gmail for Nodemailer

- Du trenger en Gmail-konto. Opprett en konto eller logg inn med en eksisterende konto.
- Gå til sikkerhetsdelen og skru på 2FA.
- Gå til **AppPasswords**, opprett en app og generer et passord.
- I `.env`-filen, legg til følgende:
  ```env
  NODEMAILER_PW=<LIM INN GENERERT PASSORD>
  NODEMAILER_EMAIL=<LIM INN GMAIL ADRESSE>
  ```

#### 6. Migrer database med Prisma

- Kjør kommandoen:
  ```bash
  npx prisma migrate dev
  ```

#### 7. Start applikasjonen

- Kjør kommandoen:
  ```bash
  yarn dev
  ```
