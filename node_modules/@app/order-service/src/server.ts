import Fastify from 'fastify';

const app = Fastify({
  logger: true,
});

const PORT = 3001;
const HOST = '0.0.0.0';

// Routes
app.get('/health', async (request, reply) => {
  return { status: 'ok', service: 'order-service' };
});

app.get('/orders', async (request, reply) => {
  return {
    orders: [
      { id: 1, customerId: 101, total: 150.00, status: 'pending' },
      { id: 2, customerId: 102, total: 250.50, status: 'completed' },
    ],
  };
});

app.post<{ Body: { customerId: number; items: Array<{ productId: number; quantity: number }> } }>(
  '/orders',
  async (request, reply) => {
    const { customerId, items } = request.body;
    return {
      id: 3,
      customerId,
      items,
      total: 0,
      status: 'pending',
      message: 'Order created successfully',
    };
  }
);

app.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) throw err;
  console.log(`Order Service running at ${address}`);
});
