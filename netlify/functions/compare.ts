import { Handler, type HandlerEvent, type HandlerResponse } from '@netlify/functions';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const handler: Handler = async (event: HandlerEvent) => {
    const prismaClient = new PrismaClient();

    try {
        return await main(event, prismaClient);
    } catch (err) {
        return {
            statusCode: 500,
            body: err.message,
        };
    } finally {
        prismaClient.$disconnect();
    }
};

async function main(event: HandlerEvent, prismaClient: PrismaClient) : Promise<HandlerResponse> {

}

export { handler };
