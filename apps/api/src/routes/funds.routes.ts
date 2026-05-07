import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Fund } from '../models/Fund';

const updateSchema = z.object({
  name: z.string().optional(),
  target: z.number().int().positive().optional(),
  color: z.string().optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'At least one field is required' });

export async function fundsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  // GET /funds — all 4 funds sorted by order
  fastify.get('/', async (_request, reply) => {
    const funds = await Fund.find().sort({ order: 1 });
    return reply.send({ data: funds });
  });

  // GET /funds/:id — single fund detail
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const fund = await Fund.findById(request.params.id);
    if (!fund) {
      return reply.status(404).send({ error: 'Fund not found', code: 'NOT_FOUND' });
    }
    return reply.send({ data: fund });
  });

  // PATCH /funds/:id — update name, target, or color
  fastify.patch<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.message, code: 'VALIDATION_ERROR' });
    }

    const fund = await Fund.findByIdAndUpdate(request.params.id, parsed.data, { new: true });
    if (!fund) {
      return reply.status(404).send({ error: 'Fund not found', code: 'NOT_FOUND' });
    }
    return reply.send({ data: fund });
  });
}
