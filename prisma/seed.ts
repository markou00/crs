import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

async function main() {
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
