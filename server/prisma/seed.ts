import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      email: 'alice@gmail.com',
      name: 'Alice',
      avatarUrl: 'https://github.com/soupetersen.png',
    },
  });

  const pool = await prisma.pool.create({
    data: {
      title: 'My first pool',
      code: 'ABC123',
      ownerId: user.id,
      participants: {
        create: {
          userId: user.id,  
        }
      }
    },
  });

  await prisma.game.create({
    data: {
      date: '2022-11-02T22:26:50.931Z',
      firstTeamCountryCode: 'DE',
      secondTeamCountryCode: 'FR',
    },
  });

  await prisma.game.create({
    data: {
      date: '2022-11-02T22:26:50.931Z',
      firstTeamCountryCode: 'BR',
      secondTeamCountryCode: 'AR',
      guesses: {
        create: {
          firstTeamPoints: 1,
          secondTeamPoints: 2,
          participant: {
            connect: {
              userId_poolId: {
                userId: user.id,
                poolId: pool.id,
              },
            }
          }
        },
      },
    },
  });
}

main();