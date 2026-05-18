import fastify from 'fastify';
import httpProxy from '@fastify/http-proxy';

const app = fastify();

// Roteamento para o Product Service
app.register(httpProxy, {
  upstream: 'http://localhost:3001',
  prefix: '/products',
});

// Roteamento para o Order Service
app.register(httpProxy, {
  upstream: 'http://localhost:3002',
  prefix: '/orders',
});

// Endpoint de Health Check do Gateway
app.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
}));

// Porta única de entrada: 3000
app.listen({ port: 3000, host: '0.0.0.0' }, () => {
  console.log('🌐 API Gateway rodando em http://localhost:3000');
});