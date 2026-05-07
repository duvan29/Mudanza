import Fastify from 'fastify';
import { config } from './config';
import mongoPlugin from './plugins/mongo';
import authPlugin from './plugins/auth';
import corsPlugin from './plugins/cors';
import { authRoutes } from './routes/auth.routes';
import { fundsRoutes } from './routes/funds.routes';
import { movementsRoutes } from './routes/movements.routes';
import { productsRoutes } from './routes/products.routes';
import { metricsRoutes } from './routes/metrics.routes';
import { roadmapRoutes } from './routes/roadmap.routes';

async function main() {
  const fastify = Fastify({
    logger: {
      level: config.nodeEnv === 'development' ? 'info' : 'warn',
    },
  });

  // Plugins
  await fastify.register(corsPlugin);
  await fastify.register(mongoPlugin);
  await fastify.register(authPlugin);

  // Health check
  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // Routes
  await fastify.register(authRoutes, { prefix: '/auth' });
  await fastify.register(fundsRoutes, { prefix: '/funds' });
  await fastify.register(movementsRoutes, { prefix: '/movements' });
  await fastify.register(productsRoutes, { prefix: '/products' });
  await fastify.register(metricsRoutes, { prefix: '/metrics' });
  await fastify.register(roadmapRoutes, { prefix: '/roadmap' });

  // Start server
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    fastify.log.info(`Server running on port ${config.port}`);
  } catch (err) {
    fastify.log.error(String(err));
    process.exit(1);
  }
}

main();
