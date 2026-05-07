import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ProductGoal } from '../models/ProductGoal';
import { ProductVersion } from '../models/ProductVersion';

const createGoalSchema = z.object({
  name: z.string().min(1),
  fundId: z.string(),
  budget: z.number().int().positive(),
});

const createVersionSchema = z.object({
  name: z.string().min(1),
  price: z.number().int().positive(),
  store: z.string().min(1),
  link: z.string().url().optional(),
  notes: z.string().optional(),
});

const updateVersionSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().int().positive().optional(),
  store: z.string().min(1).optional(),
  link: z.string().url().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function productsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  // GET /products — all product goals
  fastify.get('/', async (_request, reply) => {
    const goals = await ProductGoal.find().populate('fundId', 'name color');
    return reply.send({ data: goals });
  });

  // POST /products — create a new product goal
  fastify.post('/', async (request, reply) => {
    const parsed = createGoalSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.message, code: 'VALIDATION_ERROR' });
    }
    const goal = await ProductGoal.create(parsed.data);
    return reply.status(201).send({ data: goal });
  });

  // PATCH /products/:id — update goal fields (e.g. mark as purchased)
  fastify.patch<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const goal = await ProductGoal.findByIdAndUpdate(
      request.params.id,
      request.body as Record<string, unknown>,
      { new: true }
    );
    if (!goal) {
      return reply.status(404).send({ error: 'Product goal not found', code: 'NOT_FOUND' });
    }
    return reply.send({ data: goal });
  });

  // GET /products/:id/versions — all versions for comparison
  fastify.get<{ Params: { id: string } }>('/:id/versions', async (request, reply) => {
    const versions = await ProductVersion.find({ goalId: request.params.id })
      .populate('createdBy', 'displayName')
      .sort({ price: 1 });
    return reply.send({ data: versions });
  });

  // POST /products/:id/versions — add a version to compare
  fastify.post<{ Params: { id: string } }>('/:id/versions', async (request, reply) => {
    const goal = await ProductGoal.findById(request.params.id);
    if (!goal) {
      return reply.status(404).send({ error: 'Product goal not found', code: 'NOT_FOUND' });
    }
    if (goal.purchased) {
      return reply.status(400).send({ error: 'This product has already been purchased', code: 'ALREADY_PURCHASED' });
    }

    const parsed = createVersionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.message, code: 'VALIDATION_ERROR' });
    }

    const version = await ProductVersion.create({
      ...parsed.data,
      goalId: request.params.id,
      createdBy: request.user.userId,
    });

    return reply.status(201).send({ data: version });
  });

  // PATCH /versions/:id — update version fields
  fastify.patch<{ Params: { id: string } }>('/versions/:id', async (request, reply) => {
    const parsed = updateVersionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.message, code: 'VALIDATION_ERROR' });
    }

    const version = await ProductVersion.findByIdAndUpdate(request.params.id, parsed.data, { new: true });
    if (!version) {
      return reply.status(404).send({ error: 'Version not found', code: 'NOT_FOUND' });
    }
    return reply.send({ data: version });
  });

  // PATCH /versions/:id/choose — mark as the chosen winner
  fastify.patch<{ Params: { id: string } }>('/versions/:id/choose', async (request, reply) => {
    const version = await ProductVersion.findById(request.params.id);
    if (!version) {
      return reply.status(404).send({ error: 'Version not found', code: 'NOT_FOUND' });
    }

    version.chosen = true;
    await version.save(); // pre-save hook clears others
    return reply.send({ data: version });
  });

  // DELETE /versions/:id — hard delete (cannot delete chosen version)
  fastify.delete<{ Params: { id: string } }>('/versions/:id', async (request, reply) => {
    const version = await ProductVersion.findById(request.params.id);
    if (!version) {
      return reply.status(404).send({ error: 'Version not found', code: 'NOT_FOUND' });
    }
    if (version.chosen) {
      return reply.status(400).send({ error: 'Cannot delete the chosen version', code: 'CANNOT_DELETE_CHOSEN' });
    }

    await ProductVersion.findByIdAndDelete(request.params.id);
    return reply.send({ data: { deleted: true } });
  });
}
