import { pgTable, text, integer, timestamp, decimal, varchar, boolean, serial } from "drizzle-orm/pg-core";

export const agents = pgTable("agents", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  agentId: text("agent_id").references(() => agents.id).notNull(),
  sessionId: text("session_id").notNull(),
  label: text("label"),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  inputTokens: integer("input_tokens").default(0).notNull(),
  outputTokens: integer("output_tokens").default(0).notNull(),
  totalTokens: integer("total_tokens").default(0).notNull(),
  cost: decimal("cost", { precision: 10, scale: 4 }).default("0").notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  model: text("model"),
});

export const costEvents = pgTable("cost_events", {
  id: serial("id").primaryKey(),
  agentId: text("agent_id").references(() => agents.id).notNull(),
  sessionId: integer("session_id").references(() => sessions.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  inputTokens: integer("input_tokens").default(0).notNull(),
  outputTokens: integer("output_tokens").default(0).notNull(),
  cost: decimal("cost", { precision: 10, scale: 4 }).notNull(),
  model: text("model"),
});

export const dailyCosts = pgTable("daily_costs", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  agentId: text("agent_id").references(() => agents.id).notNull(),
  totalInputTokens: integer("total_input_tokens").default(0).notNull(),
  totalOutputTokens: integer("total_output_tokens").default(0).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 4 }).default("0").notNull(),
  taskCount: integer("task_count").default(0).notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type CostEvent = typeof costEvents.$inferSelect;
export type DailyCost = typeof dailyCosts.$inferSelect;
