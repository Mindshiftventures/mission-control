import { pgTable, text, integer, timestamp, decimal, varchar, boolean, serial, uuid } from "drizzle-orm/pg-core";

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

// Problems Tracker Tables
export const problems = pgTable("problems", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("backlog").notNull(),
  owner: text("owner"),
  assignee: text("assignee"),
  priority: integer("priority").default(0).notNull(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  dueDate: timestamp("due_date"),
  blockedReason: text("blocked_reason"),
  createdFromTelegram: boolean("created_from_telegram").default(false),
  telegramThreadId: text("telegram_thread_id"),
});

export const problemComments = pgTable("problem_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  problemId: uuid("problem_id").references(() => problems.id, { onDelete: "cascade" }).notNull(),
  author: text("author").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  source: text("source").default("ui"),
  telegramMessageId: text("telegram_message_id"),
});

export const problemAttachments = pgTable("problem_attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  problemId: uuid("problem_id").references(() => problems.id, { onDelete: "cascade" }).notNull(),
  type: text("type"),
  url: text("url"),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const problemActivity = pgTable("problem_activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  problemId: uuid("problem_id").references(() => problems.id, { onDelete: "cascade" }).notNull(),
  action: text("action").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type CostEvent = typeof costEvents.$inferSelect;
export type DailyCost = typeof dailyCosts.$inferSelect;
export type Problem = typeof problems.$inferSelect;
export type ProblemComment = typeof problemComments.$inferSelect;
export type ProblemAttachment = typeof problemAttachments.$inferSelect;
export type ProblemActivity = typeof problemActivity.$inferSelect;
