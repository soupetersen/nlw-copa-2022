import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import * as dotenv from 'dotenv';
dotenv.config();

import { pollRoutes } from "./routes/poll";
import { userRoutes } from "./routes/user";
import { guessRoutes } from "./routes/guess";
import { gameRoutes } from "./routes/game";
import { authRoutes } from "./routes/auth";



async function bootstrap() {
    const fastify = Fastify({
        logger: true
    })

    fastify.register(cors, {
        origin: true
    });

    fastify.register(jwt, {
        secret: process.env.JWT_SECRET
    });
    
    await fastify.register(pollRoutes)
    await fastify.register(authRoutes)
    await fastify.register(gameRoutes)
    await fastify.register(guessRoutes)
    await fastify.register(userRoutes)

  await fastify.listen({ port: 3333, host: '0.0.0.0' })
}

bootstrap();