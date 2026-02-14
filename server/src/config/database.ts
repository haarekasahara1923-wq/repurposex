import { PrismaClient } from '@prisma/client';

console.log('[PRISMA] Initializing client...');

const prismaClientSingleton = () => {
    try {
        return new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        });
    } catch (err) {
        console.error('[PRISMA] Failed to create client:', err);
        throw err;
    }
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
