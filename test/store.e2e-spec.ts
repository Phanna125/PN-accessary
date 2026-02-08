import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Store API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let adminToken = '';
  let customerToken = '';
  let adminUserId = '';
  let customerUserId = '';
  let categoryId = '';
  let productId = '';
  let orderId = '';

  const suffix = Date.now().toString();
  const password = 'Pass1234!';
  const adminEmail = `admin_${suffix}@test.local`;
  const customerEmail = `customer_${suffix}@test.local`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);

    const adminRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: adminEmail, password, role: 'ADMIN' })
      .expect(201);
    adminUserId = adminRegister.body.id;

    const customerRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: customerEmail, password, role: 'CUSTOMER' })
      .expect(201);
    customerUserId = customerRegister.body.id;

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password })
      .expect(201);
    adminToken = adminLogin.body.accessToken;

    const customerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: customerEmail, password })
      .expect(201);
    customerToken = customerLogin.body.accessToken;
  });

  afterAll(async () => {
    if (orderId) {
      await prisma.order.delete({ where: { id: orderId } }).catch(() => undefined);
    }
    if (customerUserId) {
      await prisma.cartItem
        .deleteMany({ where: { userId: customerUserId } })
        .catch(() => undefined);
    }
    if (productId) {
      await prisma.product.delete({ where: { id: productId } }).catch(() => undefined);
    }
    if (categoryId) {
      await prisma.category.delete({ where: { id: categoryId } }).catch(() => undefined);
    }
    if (adminUserId || customerUserId) {
      await prisma.user
        .deleteMany({ where: { id: { in: [adminUserId, customerUserId] } } })
        .catch(() => undefined);
    }

    if (app) await app.close();
    if (prisma) await prisma.$disconnect();
  });

  it('public product list should be accessible', () => {
    return request(app.getHttpServer()).get('/products').expect(200);
  });

  it('admin can create category and product', async () => {
    const categoryRes = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Test Category ${suffix}` })
      .expect(201);
    categoryId = categoryRes.body.id;

    const productRes = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Test Product',
        description: 'E2E product',
        priceCents: 1234,
        sku: `SKU-${suffix}`,
        stock: 5,
        isActive: true,
        imageUrl: 'https://example.com/test.png',
        categoryId,
      })
      .expect(201);
    productId = productRes.body.id;

    expect(productId).toBeTruthy();
  });

  it('customer can add to cart and create order', async () => {
    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId, quantity: 2 })
      .expect(201);

    const cartRes = await request(app.getHttpServer())
      .get('/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(cartRes.body.items.length).toBeGreaterThan(0);

    const orderRes = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        shippingName: 'Test Customer',
        shippingPhone: '+1 555-000-1111',
        shippingStreet: '123 Test St',
        shippingHouse: 'Suite 2',
        shippingCityProvince: 'Testville',
        shippingDistrict: 'District 9',
      })
      .expect(201);

    orderId = orderRes.body.id;
    expect(orderId).toBeTruthy();
  });

  it('admin can list and update orders', async () => {
    const listRes = await request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(listRes.body)).toBe(true);

    await request(app.getHttpServer())
      .patch(`/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PAID' })
      .expect(200);
  });
});
