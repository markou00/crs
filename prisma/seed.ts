import { PrismaClient } from '@prisma/client';
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
      { regnr: 'EL12345', status: 'Available' },
      { regnr: 'EK67890', status: 'Available' },
      { regnr: 'BT54321', status: 'In Use' },
      { regnr: 'CV98765', status: 'Maintenance' },
    ],
  });
  console.log('Created cars:', cars.count);

  // Create employees and associate them with cars
  // Note: This assumes that each car is associated with one employee
  const employees = await prisma.employee.createMany({
    data: [
      {
        name: 'John Doe',
        status: 'Active',
        email: 'john.doe@example.com',
        picture: 'https://effigy.im/a/brantly.eth.svg',
        carId: 1,
      },
      {
        name: 'Jane Smith',
        status: 'Active',
        email: 'jane.smith@example.com',
        picture: 'https://effigy.im/a/huh.eth.png	',
        carId: 2,
      },
      {
        name: 'William Johnson',
        status: 'Inactive',
        email: 'william.johnson@example.com',
        picture: 'https://effigy.im/a/galligan.eth.png',
        carId: 3,
      },
      {
        name: 'Emma Williams',
        status: 'Active',
        email: 'emma.williams@example.com',
        picture: 'https://effigy.im/a/harper.eth.png',
        carId: 4,
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
