import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

export async function userRoutes(fastify: FastifyInstance) {
    fastify.get('/user/count', async (request, reply) => {
        const count = await prisma.user.count();
        return {count};
    });
}

