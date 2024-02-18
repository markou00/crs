import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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
