import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function guessRoutes(fastify: FastifyInstance) {
  fastify.get('/guess/count', async (request, reply) => {
      const count = await prisma.guess.count();
      return {count};
  });

  fastify.post('/polls/:pollId/games/:gameId/guesses', 
  {
    onRequest: [authenticate],
  },
  async (request, reply) => {
    const createGuessParams = z.object({
      pollId: z.string(),
      gameId: z.string(),
    });

    const createGuessBody = z.object({
      firstTeamPoints: z.number(),
      secondTeamPoints: z.number(),
    });

    const { pollId, gameId } = createGuessParams.parse(request.params);
    const { firstTeamPoints, secondTeamPoints } = createGuessBody.parse(request.body);

    const participant = await prisma.participant.findUnique({
      where: {
        userId_pollId: {
          pollId: pollId,
          userId: request.user.sub,
        }
      }
    })

    if (!participant) {
      return reply.code(400).send({error: 'Participant not found'});
    }

    const guess = await prisma.guess.findUnique({
      where: {
        participantId_gameId: {
          gameId: gameId,
          participantId: participant.id,
        },
      },
    });

    if (guess) {
      return reply.code(400).send({error: 'Guess already exists'});
    }

    const game = await prisma.game.findUnique({
      where: {
        id: gameId,
      },
    });

    if (!game) {
      return reply.code(400).send({error: 'Game not found'});
    }

    if (game.date < new Date()) {
      return reply.code(400).send({error: 'Game already started'});
    }

    await prisma.guess.create({
      data: {
        gameId,
        participantId: participant.id,
        firstTeamPoints,
        secondTeamPoints,
      }
    })

    console.log("SEM ERROS 6");

    return reply.status(201).send()
  });
}