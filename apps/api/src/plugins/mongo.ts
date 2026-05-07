import fp from 'fastify-plugin';
import mongoose from 'mongoose';
import type { FastifyInstance } from 'fastify';
import { config } from '../config';

export default fp(async (fastify: FastifyInstance) => {
  try {
    await mongoose.connect(config.mongodbUri);
    fastify.log.info('Connected to MongoDB');
  } catch (err) {
    fastify.log.error(String(err));
    throw err;
  }

  fastify.addHook('onClose', async () => {
    await mongoose.disconnect();
  });
});
