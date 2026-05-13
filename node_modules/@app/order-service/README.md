# Order Service - Step 03

O **Order Service** é o segundo microserviço independente configurado para rodar em sua própria porta (3001).

##  Estrutura

```
apps/order-service/
├── src/
│   └── server.ts          # Servidor Fastify com rotas de pedidos
├── package.json           # Dependências do serviço
└── tsconfig.json          # Configuração TypeScript
```

##  Como Executar

### Desenvolvimento (porta 3001)
```bash
npm run order
```

### Apenas este serviço
```bash
npm run dev --workspace=@app/order-service
```

##  Endpoints Disponíveis

### Health Check
```
GET http://localhost:3001/health
```
Resposta:
```json
{
  "status": "ok",
  "service": "order-service"
}
```

### Listar Pedidos
```
GET http://localhost:3001/orders
```
Resposta:
```json
{
  "orders": [
    {
      "id": 1,
      "customerId": 101,
      "total": 150.00,
      "status": "pending"
    },
    {
      "id": 2,
      "customerId": 102,
      "total": 250.50,
      "status": "completed"
    }
  ]
}
```

### Criar Novo Pedido
```
POST http://localhost:3001/orders
Content-Type: application/json

{
  "customerId": 103,
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 2, "quantity": 1 }
  ]
}
```

##  Arquitetura

- **Framework**: Fastify (microframework rápido e eficiente)
- **Porta**: 3001 (independente do Product Service na porta 3000)
- **Logger**: Integrado via Fastify
- **TypeScript**: Suporte completo com tipos

##  Dependências

- **fastify**: Framework HTTP de alta performance
- **ts-node**: Execução direta de TypeScript

##  Integração

Para usar este serviço em conjunto com outros:
- **Product Service**: http://localhost:3000
- **Order Service**: http://localhost:3001
- **API Gateway**: (próximo passo)
