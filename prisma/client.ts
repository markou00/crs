/* eslint-disable no-var */
/* eslint-disable vars-on-top */

import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => new PrismaClient();

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
