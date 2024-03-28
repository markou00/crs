import { ContainerStatus, PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';

import 'dotenv/config';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("Couldn't find db url");
}

const sql = postgres(dbUrl);

const prisma = new PrismaClient();

async function main() {
  await sql`
        create or replace function public.handle_new_user()
        returns trigger as $$
        begin
            insert into public."User" (id, email)
            values (new.id, new.email);
            return new;
        end;
        $$ language plpgsql security definer;
        `;
  await sql`
        create or replace trigger on_auth_user_created
            after insert on auth.users
            for each row execute procedure public.handle_new_user();
      `;

  await sql`
        create or replace function public.handle_user_delete()
        returns trigger as $$
        begin
          delete from auth.users where id = old.id;
          return old;
        end;
        $$ language plpgsql security definer;
      `;

  await sql`
        create or replace trigger on_user_deleted 
          after delete on public."User"
          for each row execute procedure public.handle_user_delete();
      `;

  const tenant = await prisma.tenant.create({
    data: { id: 'CRS', name: 'Container Rental System' },
  });
  const tenantId = tenant.id;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET!
  );

  const user = await supabase.auth.admin.createUser({
    email: 'hello@crs.com',
    password: 'Group02@2024',
    user_metadata: {
      tenantId,
    },
    email_confirm: true,
  });

  await prisma.user.update({
    where: { email: user.data.user?.email! },
    data: {
      id: user.data.user?.id!,
      firstName: 'Admin',
      lastName: 'User',
      email: user.data.user?.email!,
      tenantId: tenant.id,
    },
  });

  const customers = await prisma.customer.createMany({
    data: [
      {
        name: 'Gjennvinning AS',
        type: 'Bedrift',
        contactName: 'Olger Olsen',
        contactEmail: 'olger@forny.no',
        contactPhone: '88221123',
        address: 'Ostegaten 23',
        city: 'Ålesund',
        postalCode: '6001',
        country: 'Norge',
        tenantId: tenant.id,
      },
      {
        name: 'Søppelselskapet',
        type: 'Bedrift',
        contactName: 'Lise Klavenes',
        contactEmail: 'lise@soppel.no',
        contactPhone: '88338877',
        address: 'Borrevegen 12',
        city: 'Bergen',
        postalCode: '5020',
        country: 'Norge',
        tenantId: tenant.id,
      },
      {
        name: 'Ida Petrine Larsen',
        type: 'Privat',
        contactName: 'Ida Petrine Larsen',
        contactEmail: 'ida@outlook.com',
        contactPhone: '99333111',
        address: 'Hansavegen 12',
        city: 'Molde',
        postalCode: '6410',
        country: 'Norge',
        tenantId: tenant.id,
      },
      {
        name: 'Bjørn Goodigood',
        type: 'Privat',
        contactName: 'Bjørn Goodigood',
        contactEmail: 'bjorn@gmail.com',
        contactPhone: '99221122',
        address: 'Hestevegen 43',
        city: 'Volda',
        postalCode: '6100',
        country: 'Norge',
        tenantId: tenant.id,
      },
      {
        name: 'Matsøppel AS',
        type: 'Bedrift',
        contactName: 'Oliver Hatting',
        contactEmail: 'oliver@mats.no',
        contactPhone: '99212421',
        address: 'Sygna 12',
        city: 'Sygna',
        postalCode: '4050',
        country: 'Norge',
        tenantId: tenant.id,
      },
    ],
  });
  console.log('Created customers:', customers.count);

  const cars = await prisma.car.createMany({
    data: [
      {
        regnr: 'EL12345',
        model: 'Freightliner Cascadia',
        status: 'Skadet',
        tenantId: tenant.id,
      },
      { regnr: 'EK67890', model: 'Volvo FH', status: 'Operativ', tenantId: tenant.id },
      { regnr: 'BT54321', model: 'Volvo FH', status: 'Operativ', tenantId: tenant.id },
      { regnr: 'CV98765', model: 'Kenworth T680', status: 'Operativ', tenantId: tenant.id },
    ],
  });
  console.log('Created cars:', cars.count);

  const customerRecords = await prisma.customer.findMany();

  const agreements = await prisma.agreement.createMany({
    data: [
      {
        status: 'Gjeldende',
        type: 'ORGANIC_WASTE',
        containerName: '100 Matavfall',
        validFrom: new Date(Date.now()),
        customerId: customerRecords.at(0)?.id!,
        comment: 'Mye slakteavfall',
        tenantId: tenant.id,
        repetition: 'NONE',
      },
      {
        status: 'Gjeldende',
        type: 'ORGANIC_WASTE',
        containerName: '100 Matavfall',
        validFrom: new Date(Date.now()),
        customerId: customerRecords.at(1)?.id!,
        comment: 'En del involler',
        tenantId: tenant.id,
        repetition: 'WEEKLY',
      },
      {
        status: 'Avsluttet',
        type: 'RESIDUAL_WASTE',
        containerName: '120 Matavfall',
        validFrom: new Date(Date.now()),
        customerId: customerRecords.at(2)?.id!,
        comment: 'Var ikke fornøyd med tjenesten',
        tenantId: tenant.id,
        repetition: 'DAILY',
      },
      {
        status: 'Gjeldende',
        type: 'RESIDUAL_WASTE',
        containerName: '120 Restavfall',
        validFrom: new Date(Date.now()),
        customerId: customerRecords.at(3)?.id!,
        validTo: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        tenantId: tenant.id,
        repetition: 'WEEKLY',
      },
    ],
  });
  console.log('Created agreements:', agreements.count);

  const jobs = await prisma.job.createMany({
    data: [
      {
        type: 'ORGANIC_WASTE',
        status: 'assigned',
        date: new Date(2023, 3, 14, 10, 0),
        comment: 'Engangsjobb med matavfall',
        tenantId: tenant.id,
        agreementId: 1,
        carId: 1,
      },
      {
        type: 'ORGANIC_WASTE',
        status: 'assigned',
        date: new Date(2023, 3, 13, 14, 30),
        comment: 'Det lukter vondt!',
        tenantId: tenant.id,
        agreementId: 2,
        carId: 2,
      },
      {
        type: 'RESIDUAL_WASTE',
        status: 'unassigned',
        date: new Date(2023, 3, 15, 9, 0),
        comment: 'Ingen vil ha denne jobben',
        tenantId: tenant.id,
        agreementId: 4,
      },
    ],
  });
  console.log('Created jobs:', jobs.count);

  const containers = await prisma.container.createMany({
    data: [
      {
        rfid: Math.random().toString(16),
        capacity: 100,
        type: 'Matavfall',
        name: '100 Matavfall',
        tenantId: tenant.id,
      },
      {
        rfid: Math.random().toString(16),
        capacity: 120,
        type: 'Restavfall',
        name: '120 Restavfall',
        status: ContainerStatus.unavailable,
        availableAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        tenantId: tenant.id,
      },
    ],
  });
  console.log('Created containers:', containers.count);

  const job = await prisma.job.findFirst();
  const containerRecord = await prisma.container.findFirst({
    where: { status: ContainerStatus.unavailable },
  });

  await prisma.container.update({
    where: { id: containerRecord?.id! },
    data: { jobId: job?.id! },
  });

  await prisma.job.update({
    where: { id: job?.id! },
    data: { containerId: containerRecord?.id! },
  });

  const employees = await prisma.employee.createMany({
    data: [
      {
        name: 'James McDonald',
        status: 'Utilgjengelig',
        email: 'james.mcd@example.com',
        phone: '99000011',
        picture:
          'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=2598&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        carId: 1,
        tenantId: tenant.id,
      },
      {
        name: 'Jane Smith',
        status: 'Tilgjengelig',
        email: 'jane.smith@example.com',
        phone: '99433111',
        picture:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        carId: 2,
        tenantId: tenant.id,
      },
      {
        name: 'William Johnson',
        status: 'Sykemeldt',
        email: 'william.johnson@example.com',
        phone: '99434321',
        picture:
          'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        tenantId: tenant.id,
      },
      {
        name: 'Emma Williams',
        status: 'Permitert',
        email: 'emma.williams@example.com',
        phone: '91183111',
        picture:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        carId: 4,
        tenantId: tenant.id,
      },
    ],
  });
  console.log('Created employees:', employees.count);

  process.exit();
}

main()
  .then(() => {
    prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
