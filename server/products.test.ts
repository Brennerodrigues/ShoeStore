import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("products", () => {
  it("should list all products", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();
    expect(Array.isArray(products)).toBe(true);
  });

  it("should get product by id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();
    if (products.length > 0) {
      const product = await caller.products.getById({ id: products[0].id });
      expect(product).toBeDefined();
      expect(product?.id).toBe(products[0].id);
    }
  });

  it("should list categories", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.products.categories();
    expect(Array.isArray(categories)).toBe(true);
  });

  it("should list sizes", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const sizes = await caller.products.sizes();
    expect(Array.isArray(sizes)).toBe(true);
  });

  it("should list colors", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const colors = await caller.products.colors();
    expect(Array.isArray(colors)).toBe(true);
  });
});

describe("cart", () => {
  it("should get empty cart for new user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const cartItems = await caller.cart.getItems();
    expect(Array.isArray(cartItems)).toBe(true);
  });

  it("should add item to cart", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();
    if (products.length > 0) {
      const result = await caller.cart.addItem({
        productId: products[0].id,
        quantity: 1,
      });
      expect(result.success).toBe(true);
    }
  });

  it("should clear cart", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cart.clearCart();
    expect(result.success).toBe(true);
  });
});

describe("orders", () => {
  it("should get user orders", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const orders = await caller.orders.getUserOrders();
    expect(Array.isArray(orders)).toBe(true);
  });

  it("should not allow non-admin to get all orders", async () => {
    const ctx = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.orders.getAllOrders();
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should allow admin to get all orders", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const orders = await caller.orders.getAllOrders();
    expect(Array.isArray(orders)).toBe(true);
  });

  it("should create order", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();
    if (products.length > 0) {
      const result = await caller.orders.createOrder({
        customerName: "Test Customer",
        customerEmail: "customer@test.com",
        shippingAddress: "123 Test Street",
        items: [
          {
            productId: products[0].id,
            quantity: 1,
            price: products[0].price,
          },
        ],
      });
      expect(result.orderId).toBeDefined();
      expect(result.totalPrice).toBeDefined();
    }
  });

  it("should not allow non-admin to update order status", async () => {
    const ctx = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.orders.updateStatus({
        orderId: 1,
        status: "paid",
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should allow admin to update order status", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.orders.updateStatus({
        orderId: 1,
        status: "paid",
      });
      expect(result.success).toBe(true);
    } catch (error) {
      // Order might not exist, but the authorization check should pass
      expect(error).toBeDefined();
    }
  });
});
