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

  const poll = await prisma.poll.create({
    data: {
      title: 'My first poll',
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
      date: '2022-11-03T12:00:00.201Z',
      firstTeamCountryCode: 'BR',
      secondTeamCountryCode: 'AR',

      guesses: {
        create: {
          firstTeamPoints: 2,
          secondTeamPoints: 1,

          participant: {
            connect: {
              userId_pollId: {
                userId: user.id,
                pollId: poll.id,
              }
            }
          }
        }
      }
    },
  })
}

main();