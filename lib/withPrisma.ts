import {
    type Handler,
    type HandlerEvent,
    type HandlerResponse,
} from '@netlify/functions';
import { PrismaClient } from '@prisma/client';

export default function withPrisma(
    handler: (prismaClient: PrismaClient, event: HandlerEvent) => Promise<HandlerResponse>,
) : Handler
{
    return async(event: HandlerEvent) => {
        const prismaClient = new PrismaClient();
        return handler(prismaClient, event)
            .catch(err => {
                console.error(err);
                return {
                    statusCode: 500,
                    body: err.message,
                };
            })
            .finally(() => prismaClient.$disconnect());
    };
}
