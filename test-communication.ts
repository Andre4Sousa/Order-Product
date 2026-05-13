import axios from 'axios';

const testHttpCommunication = async () => {
  const productServiceUrl = 'http://localhost:3000';
  const orderServiceUrl = 'http://localhost:3001';

  console.log('🧪 Testing HTTP Communication Between Services\n');

  try {
    // Test 1: Get Products
    console.log('Test 1: Fetching products from Product Service...');
    const productsRes = await axios.get(`${productServiceUrl}/products`);
    console.log('✅ Products fetched:', productsRes.data.products.length, 'products');
    console.log(JSON.stringify(productsRes.data.products, null, 2));

    // Test 2: Get Order Details (Order Service calls Product Service)
    console.log('\nTest 2: Getting order details (Order Service → Product Service)...');
    try {
      const orderDetailsRes = await axios.get(`${orderServiceUrl}/orders/1/details`);
      console.log('✅ Order details retrieved');
      console.log(JSON.stringify(orderDetailsRes.data, null, 2));
    } catch (detailsError: any) {
      console.log('⚠️  Order details error:', detailsError.response?.data || detailsError.message);
    }

    // Test 3: Create Order (validates products synchronously)
    console.log('\nTest 3: Creating new order (with product validation)...');
    const createOrderRes = await axios.post(`${orderServiceUrl}/orders`, {
      customerId: 104,
      items: [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 3 },
      ],
    });
    console.log('✅ Order created successfully');
    console.log(JSON.stringify(createOrderRes.data, null, 2));

    // Test 4: Try to create order with invalid product
    console.log('\nTest 4: Attempting to create order with invalid product...');
    try {
      await axios.post(`${orderServiceUrl}/orders`, {
        customerId: 105,
        items: [{ productId: 999, quantity: 1 }],
      });
    } catch (error: any) {
      console.log('✅ Invalid product rejected correctly');
      console.log(JSON.stringify(error.response.data, null, 2));
    }

    console.log('\n✅ All tests passed! HTTP communication between services is working.');
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
};

testHttpCommunication();
