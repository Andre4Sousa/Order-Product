#!/bin/bash
# Demo script for HTTP Communication between microservices

echo "=== Starting Microservices ==="
echo ""

echo "Starting Product Service (port 3000)..."
npm run product &
PRODUCT_PID=$!

sleep 3

echo "Starting Order Service (port 3001)..."
npm run order &
ORDER_PID=$!

sleep 3

echo ""
echo "=== Both services are running ==="
echo "Product Service: http://localhost:3000"
echo "Order Service: http://localhost:3001"
echo ""

# Keep processes alive
wait
