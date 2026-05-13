import Fastify from 'fastify';

const app = Fastify({
  logger: true,
});

const PORT = 3000;
const HOST = '0.0.0.0';

// Mock database
const products = [
  { id: 1, name: 'Laptop', price: 999.99, stock: 10 },
  { id: 2, name: 'Mouse', price: 29.99, stock: 50 },
  { id: 3, name: 'Keyboard', price: 79.99, stock: 30 },
];

// Routes
app.get('/health', async (request, reply) => {
  return { status: 'ok', service: 'product-service' };
});

app.get('/products', async (request, reply) => {
  return {
    products,
    total: products.length,
  };
});

app.get<{ Params: { id: string } }>('/products/:id', async (request, reply) => {
  const { id } = request.params;
  const product = products.find((p) => p.id === parseInt(id));

  if (!product) {
    reply.status(404);
    return { error: 'Product not found' };
  }

  return product;
});

app.post<{ Body: { productIds: number[] } }>(
  '/products/validate',
  async (request, reply) => {
    const { productIds } = request.body;

    const validatedProducts = productIds.map((productId) => {
      const product = products.find((p) => p.id === productId);
      return {
        productId,
        found: !!product,
        product: product || null,
      };
    });

    return {
      validated: validatedProducts,
      allValid: validatedProducts.every((p) => p.found),
    };
  }
);

app.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) throw err;
  console.log(`Product Service running at ${address}`);
});
