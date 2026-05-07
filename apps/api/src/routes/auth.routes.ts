import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { config } from '../config';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(fastify: FastifyInstance) {
  // POST /auth/login
  fastify.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Email and password are required', code: 'VALIDATION_ERROR' });
    }

    const { email, password } = parsed.data;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const token = fastify.jwt.sign(
      { userId: user._id.toString() },
      { expiresIn: config.jwt.expiresIn }
    );

    return reply.send({
      data: {
        token,
        user: {
          _id: user._id,
          email: user.email,
          displayName: user.displayName,
        },
      },
    });
  });

  // GET /auth/me — returns current user from token
  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = await User.findById(request.user.userId).select('-passwordHash');
    if (!user) {
      return reply.status(404).send({ error: 'User not found', code: 'NOT_FOUND' });
    }
    return reply.send({
      data: {
        _id: user._id,
        email: user.email,
        displayName: user.displayName,
      },
    });
  });
}
