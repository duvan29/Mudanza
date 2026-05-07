import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Movement } from '../models/Movement';

const createSchema = z.object({
  fundId: z.string(),
  amount: z.number().int().positive(),
  type: z.enum(['deposit', 'adjustment']),
  note: z.string().optional(),
});

export async function movementsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  // GET /movements — list with optional filters
  fastify.get<{
    Querystring: { fundId?: string; userId?: string; limit?: string; skip?: string };
  }>('/', async (request, reply) => {
    const { fundId, userId, limit = '20', skip = '0' } = request.query;

    const filter: Record<string, unknown> = { deleted: false };
    if (fundId) filter['fundId'] = fundId;
    if (userId) filter['userId'] = userId;

    const movements = await Movement.find(filter)
      .populate('userId', 'displayName email')
      .sort({ date: -1 })
      .limit(parseInt(limit, 10))
      .skip(parseInt(skip, 10));

    const total = await Movement.countDocuments(filter);

    return reply.send({ data: movements, total });
  });

  // POST /movements — create a new deposit or adjustment
  fastify.post('/', async (request, reply) => {
    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.message, code: 'VALIDATION_ERROR' });
    }

    const movement = await Movement.create({
      ...parsed.data,
      userId: request.user.userId,
      date: new Date(),
    });

    return reply.status(201).send({ data: movement });
  });

  // DELETE /movements/:id — soft-delete, updates fund total via hook
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const movement = await Movement.findOneAndUpdate(
      { _id: request.params.id, deleted: false },
      { deleted: true },
      { new: true }
    );

    if (!movement) {
      return reply.status(404).send({ error: 'Movement not found', code: 'NOT_FOUND' });
    }

    return reply.send({ data: movement });
  });
}
