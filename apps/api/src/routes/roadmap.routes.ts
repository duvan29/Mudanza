import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { RoadmapMonth } from '../models/RoadmapMonth';

const updateSchema = z.object({
  status: z.enum(['pending', 'active', 'done']).optional(),
  note: z.string().nullable().optional(),
});

export async function roadmapRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  // GET /roadmap — all 10 months ordered
  fastify.get('/', async (_request, reply) => {
    const months = await RoadmapMonth.find().sort({ order: 1 });
    return reply.send({ data: months });
  });

  // PATCH /roadmap/:id — update status or note
  fastify.patch<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.message, code: 'VALIDATION_ERROR' });
    }

    const month = await RoadmapMonth.findByIdAndUpdate(request.params.id, parsed.data, { new: true });
    if (!month) {
      return reply.status(404).send({ error: 'Roadmap month not found', code: 'NOT_FOUND' });
    }
    return reply.send({ data: month });
  });
}
