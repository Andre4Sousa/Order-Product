import Fastify from 'fastify';
import axios from 'axios';

const app = Fastify({
  logger: true,
});

const PORT = 3001;
const HOST = '0.0.0.0';
const PRODUCT_SERVICE_URL = 'http://localhost:3000';

// HTTP client instance
const client = axios.create({
  baseURL: PRODUCT_SERVICE_URL,
  timeout: 5000,
});

// Mock orders database
const orders: Array<{
  id: number;
  customerId: number;
  items: Array<{ productId: number; quantity: number; price?: number }>;
  total: number;
  status: string;
  products?: any;
}> = [
  {
    id: 1,
    customerId: 101,
    items: [{ productId: 1, quantity: 1, price: 999.99 }],
    total: 999.99,
    status: 'completed',
  },
  {
    id: 2,
    customerId: 102,
    items: [
      { productId: 2, quantity: 2, price: 29.99 },
      { productId: 3, quantity: 1, price: 79.99 },
    ],
    total: 139.97,
    status: 'pending',
  },
];

// Routes
app.get('/health', async (request, reply) => {
  return { status: 'ok', service: 'order-service' };
});

app.get('/orders', async (request, reply) => {
  return {
    orders,
  };
});

app.get<{ Params: { id: string } }>('/orders/:id', async (request, reply) => {
  const { id } = request.params;
  const order = orders.find((o) => o.id === parseInt(id));

  if (!order) {
    reply.status(404);
    return { error: 'Order not found' };
  }

  return order;
});

// Synchronous HTTP call to product service
app.get<{ Params: { id: string } }>('/orders/:id/details', async (request, reply) => {
  const { id } = request.params;
  const order = orders.find((o) => o.id === parseInt(id));

  if (!order) {
    reply.status(404);
    return { error: 'Order not found' };
  }

  try {
    // Synchronous call to product service to get full product details
    const productIds = order.items.map((item) => item.productId);
    const { data: productsData } = await client.post('/products/validate', {
      productIds,
    });

    return {
      order,
      productDetails: productsData.validated,
      allProductsAvailable: productsData.allValid,
    };
  } catch (error: any) {
    reply.status(503);
    return {
      error: 'Cannot reach product service',
      details: error.message,
    };
  }
});

app.post<{
  Body: { customerId: number; items: Array<{ productId: number; quantity: number }> };
}>('/orders', async (request, reply) => {
  const { customerId, items } = request.body;

  try {
    // Validate products exist in product service (synchronous HTTP call)
    const productIds = items.map((item) => item.productId);
    const { data: validationData } = await client.post('/products/validate', {
      productIds,
    });

    if (!validationData.allValid) {
      reply.status(400);
      return {
        error: 'Some products are invalid',
        products: validationData.validated,
      };
    }

    // Calculate total price from product service
    let total = 0;
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const { data: productData } = await client.get(`/products/${item.productId}`);
        const itemTotal = productData.price * item.quantity;
        total += itemTotal;
        return {
          ...item,
          price: productData.price,
          subtotal: itemTotal,
          productName: productData.name,
        };
      })
    );

    const newOrder = {
      id: orders.length + 1,
      customerId,
      items: enrichedItems,
      total: parseFloat(total.toFixed(2)),
      status: 'pending',
    };

    orders.push(newOrder);

    reply.status(201);
    return {
      message: 'Order created successfully',
      order: newOrder,
    };
  } catch (error: any) {
    reply.status(503);
    return {
      error: 'Error creating order',
      details: error.message,
    };
  }
});

app.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) throw err;
  console.log(`Order Service running at ${address}`);
});
