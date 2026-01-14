import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getProducts, getProductById, getCategories, getSizes, getColors, getCartItems, getUserOrders, getAllOrders } from "./db";
import { getDb } from "./db";
import { cartItems, orders, orderItems } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  products: router({
    list: publicProcedure.query(async () => {
      return getProducts();
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return getProductById(input.id);
    }),
    categories: publicProcedure.query(async () => {
      return getCategories();
    }),
    sizes: publicProcedure.query(async () => {
      return getSizes();
    }),
    colors: publicProcedure.query(async () => {
      return getColors();
    }),
  }),

  cart: router({
    getItems: protectedProcedure.query(async ({ ctx }) => {
      return getCartItems(ctx.user.id);
    }),
    addItem: protectedProcedure
      .input(z.object({ productId: z.number(), variationId: z.number().optional(), quantity: z.number().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const existing = await db.select().from(cartItems)
          .where(eq(cartItems.userId, ctx.user.id))
          .execute();
        
        if (existing.length > 0) {
          await db.update(cartItems)
            .set({ quantity: existing[0].quantity + input.quantity })
            .where(eq(cartItems.id, existing[0].id))
            .execute();
        } else {
          await db.insert(cartItems).values({
            userId: ctx.user.id,
            productId: input.productId,
            variationId: input.variationId,
            quantity: input.quantity,
          }).execute();
        }
        return { success: true };
      }),
    removeItem: protectedProcedure
      .input(z.object({ itemId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(cartItems).where(eq(cartItems.id, input.itemId)).execute();
        return { success: true };
      }),
    clearCart: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(cartItems).where(eq(cartItems.userId, ctx.user.id)).execute();
      return { success: true };
    }),
  }),

  orders: router({
    getUserOrders: protectedProcedure.query(async ({ ctx }) => {
      return getUserOrders(ctx.user.id);
    }),
    getAllOrders: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return getAllOrders();
    }),
    createOrder: protectedProcedure
      .input(z.object({
        customerName: z.string(),
        customerEmail: z.string().email(),
        customerPhone: z.string().optional(),
        shippingAddress: z.string(),
        items: z.array(z.object({ productId: z.number(), quantity: z.number(), price: z.string() })),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const totalPrice = input.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0).toFixed(2);
        
        const [orderResult] = await db.insert(orders).values({
          userId: ctx.user.id,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          shippingAddress: input.shippingAddress,
          totalPrice: totalPrice,
          status: "pending",
        }).execute();
        
        const orderId = orderResult.insertId;
        
        for (const item of input.items) {
          await db.insert(orderItems).values({
            orderId: orderId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          }).execute();
        }
        
        return { orderId, totalPrice };
      }),
    updateStatus: protectedProcedure
      .input(z.object({ orderId: z.number(), status: z.enum(["pending", "paid", "shipped", "completed", "cancelled"]) }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.orderId)).execute();
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
