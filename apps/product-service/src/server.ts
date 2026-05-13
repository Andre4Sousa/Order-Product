import fastify from 'fastify';

const app = fastify();

// 1. Tipagem com TypeScript para garantir consistência
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

// 2. Dados em memória para foco na estrutura
const products: Product[] = [
  { id: 1, name: 'Notebook Pro', price: 3500, stock: 10 },
  { id: 2, name: 'Mouse Gamer', price: 150, stock: 50 },
  { id: 3, name: 'Monitor 4K', price: 2200, stock: 5 }
];

// 3. Rotas REST
// Retorna todos os produtos
app.get('/products', async () => {
  return products;
});

// Retorna um produto pelo ID ou 404
app.get<{ Params: { id: string } }>('/products/:id', async (req, reply) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) {
    return reply.status(404).send({ error: 'Produto não encontrado' });
  }

  return product;
});

// 4. Porta dedicada 3001
// O host '0.0.0.0' facilita a futura containerização com Docker
app.listen({ port: 3001, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(` Product Service rodando em ${address}`);
});