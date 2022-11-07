import { FastifyInstance } from "fastify";
import ShortUniqueId from "short-unique-id";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function pollRoutes(fastify: FastifyInstance) {
    fastify.get('/poll/count', async (request, reply) => {
        const count = await prisma.poll.count();
        return {count};
    });

    fastify.post('/polls', async (request, reply) => {
        const createpollBody = z.object({
            title: z.string(),
        });
        
        const { title } = createpollBody.parse(request.body);
        
        const generate = new ShortUniqueId({ length: 6 });
        const code = String(generate()).toUpperCase();

        let ownerId = null;

        try {
            await request.jwtVerify();
            await prisma.poll.create({
                data: {
                    title,
                    code: code,
                    ownerId: request.user.sub,
                    participants: {
                        create: {
                            userId: request.user.sub,
                        },
                    },
                }
            });
        } catch (error) {
            console.log(error);
            await prisma.poll.create({
                data: {
                    title,
                    code: code,
                }
            });
        }
        
        return reply.code(201).send({ code });
    }); 

    fastify.post('/polls/join', 
    {
        onRequest: [authenticate],
    },
    async (request, reply) => {
        const joinPollBody = z.object({
            code: z.string(),
        });

        const { code } = joinPollBody.parse(request.body);

        const poll = await prisma.poll.findUnique({
            where: {
                code: code,
            },
            include: {
                participants: {
                    where: {
                        userId: request.user.sub
                    }
                },
            },
        });

        if (!poll) {
            return reply.code(404).send({ error: 'Poll not found' });
        };

        if (poll.participants.length > 0) {
            return reply.code(400).send({ error: 'You are already a participant' });
        }

        if (!poll.ownerId) {
            await prisma.poll.update({
                where: {
                    id: poll.id,
                },
                data: {
                    ownerId: request.user.sub,
                },
            });
        }

        await prisma.participant.create({
            data: {
                userId: request.user.sub,
                pollId: poll.id,
            },
        });

        return reply.code(201).send({ message: 'You have joined the poll' });
    });

    fastify.get('/polls', 
    {
        onRequest: [authenticate],
    },
    async (request, reply) => {
        const polls = await prisma.poll.findMany({
            where: {
                participants: {
                    some: {
                        userId: request.user.sub,
                    },
                },
            },
            include: {
                _count: {
                    select: {
                        participants: true,
                    },
                },
                participants: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                avatarUrl: true,
                            },
                        },
                    },
                    take: 4,
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return { polls };
    });

    fastify.get('/polls/:id',
    {
        onRequest: [authenticate],
    },
    async (request, reply) => {
        const getPollParams = z.object({
            id: z.string(),
        });

        const { id } = getPollParams.parse(request.params);
    
        const poll = await prisma.poll.findUnique({
            where: {
                id,
            },
            include: {
                _count: {
                    select: {
                        participants: true,
                    },
                },
                participants: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                avatarUrl: true,
                            },
                        },
                    },
                    take: 4,
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return { poll };
    });
}

