import { pgTable, text, serial, integer, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export type LotteryCategory = "GH18" | "CIV10" | "CIV13" | "CIV16";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const lotteryDraws = pgTable("lottery_draws", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  drawDate: date("draw_date").notNull(),
  ball1: integer("ball1").notNull(),
  ball2: integer("ball2").notNull(),
  ball3: integer("ball3").notNull(),
  ball4: integer("ball4").notNull(),
  ball5: integer("ball5").notNull(),
  createdAt: date("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLotteryDrawSchema = createInsertSchema(lotteryDraws).pick({
  category: true,
  drawDate: true,
  ball1: true,
  ball2: true,
  ball3: true,
  ball4: true,
  ball5: true,
});

export const validateLotteryDrawSchema = insertLotteryDrawSchema.extend({
  category: z.enum(["GH18", "CIV10", "CIV13", "CIV16"]),
  drawDate: z.coerce.date(),
  ball1: z.number().int().min(1).max(90),
  ball2: z.number().int().min(1).max(90),
  ball3: z.number().int().min(1).max(90),
  ball4: z.number().int().min(1).max(90),
  ball5: z.number().int().min(1).max(90),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LotteryDraw = typeof lotteryDraws.$inferSelect;
export type InsertLotteryDraw = z.infer<typeof insertLotteryDrawSchema>;
