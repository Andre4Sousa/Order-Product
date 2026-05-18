import Fastify from 'fastify';

const app = Fastify({
  logger: true,
});

// Ajustado para a porta correta do docker-compose e do Passo 4
const PORT = 3002; 
const HOST = '0.0.0.0';

// Dinâmico: Lê a rede interna do Docker ou cai no localhost em dev
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

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
  return { orders };
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

// Chamada HTTP usando FETCH nativo para o Product Service
app.get<{ Params: { id: string } }>('/orders/:id/details', async (request, reply) => {
  const { id } = request.params;
  const order = orders.find((o) => o.id === parseInt(id));

  if (!order) {
    reply.status(404);
    return { error: 'Order not found' };
  }

  try {
    const productIds = order.items.map((item) => item.productId);
    
    // Substituído client.post por fetch nativo (POST)
    const response = await fetch(`${PRODUCT_SERVICE_URL}/products/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds }),
    });

    if (!response.ok) throw new Error(`Product service respondeu com status ${response.status}`);
    const productsData = await response.json();

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

// Criação de pedido validando itens via FETCH nativo
app.post<{
  Body: { customerId: number; items: Array<{ productId: number; quantity: number }> };
}>('/orders', async (request, reply) => {
  const { customerId, items } = request.body;

  try {
    const productIds = items.map((item) => item.productId);
    
    // Validação usando fetch nativo
    const responseValidate = await fetch(`${PRODUCT_SERVICE_URL}/products/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds }),
    });

    if (!responseValidate.ok) throw new Error('Falha na comunicação de validação');
    const validationData = await responseValidate.json();

    if (!validationData.allValid) {
      reply.status(400);
      return {
        error: 'Some products are invalid',
        products: validationData.validated,
      };
    }

    // Calcula o valor total buscando os dados de cada produto via fetch nativo
    let total = 0;
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const resProduct = await fetch(`${PRODUCT_SERVICE_URL}/products/${item.productId}`);
        if (!resProduct.ok) throw new Error(`Produto ${item.productId} não encontrado`);
        const productData = await resProduct.json();
        
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