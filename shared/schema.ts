import { pgTable, text, serial, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  googleId: text("google_id").unique(),
  avatar: text("avatar"),
  language: text("language").default("ru"),
  lastCheckinAt: timestamp("last_checkin_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  googleId: true,
  avatar: true,
  language: true,
});

// Thread categories
export const categories = [
  "family",
  "school",
  "loneliness",
  "relationships",
  "other",
] as const;

// Threads schema
export const threads = pgTable("threads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  mood: text("mood"),
  isRisky: boolean("is_risky").default(false),
  riskLevel: integer("risk_level").default(0),
  riskReason: text("risk_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertThreadSchema = createInsertSchema(threads).pick({
  userId: true,
  content: true,
  category: true,
  mood: true,
});

// Comments schema
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  isRisky: boolean("is_risky").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  threadId: true,
  userId: true,
  content: true,
});

// Reactions schema
export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReactionSchema = createInsertSchema(reactions).pick({
  threadId: true,
  userId: true,
  type: true,
});

// Messages schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  receiverId: true,
  content: true,
});

// Badge types
export const badgeTypes = [
  "empath",
  "protector",
  "good_listener",
  "helper",
  "regular",
] as const;

// User badges
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBadgeSchema = createInsertSchema(badges).pick({
  userId: true,
  type: true,
});

// Resources schema
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url"),
  category: text("category").notNull(),
  language: text("language").default("ru"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertResourceSchema = createInsertSchema(resources).pick({
  title: true,
  description: true,
  url: true,
  category: true,
  language: true,
});

// Crisis contacts schema
export const crisisContacts = pgTable("crisis_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  description: text("description"),
  type: text("type").notNull(),
  url: text("url"),
  language: text("language").default("ru"),
});

export const insertCrisisContactSchema = createInsertSchema(crisisContacts).pick({
  name: true,
  phone: true,
  description: true,
  type: true,
  url: true,
  language: true,
});

// AI Suggestions schema
export const aiSuggestions = pgTable("ai_suggestions", {
  id: serial("id").primaryKey(),
  context: text("context").notNull(),
  suggestions: json("suggestions").notNull(),
  language: text("language").default("ru"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).pick({
  context: true,
  suggestions: true,
  language: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Thread = typeof threads.$inferSelect;
export type InsertThread = z.infer<typeof insertThreadSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Reaction = typeof reactions.$inferSelect;
export type InsertReaction = z.infer<typeof insertReactionSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

export type CrisisContact = typeof crisisContacts.$inferSelect;
export type InsertCrisisContact = z.infer<typeof insertCrisisContactSchema>;

export type AiSuggestion = typeof aiSuggestions.$inferSelect;
export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;

// Category and reaction types
export const categorySchema = z.enum(categories);
export type Category = z.infer<typeof categorySchema>;

export const reactionTypes = [
  "understand",
  "not_alone",
  "will_overcome",
  "idea",
  "support",
] as const;
export const reactionTypeSchema = z.enum(reactionTypes);
export type ReactionType = z.infer<typeof reactionTypeSchema>;

export const badgeTypeSchema = z.enum(badgeTypes);
export type BadgeType = z.infer<typeof badgeTypeSchema>;

export const moods = [
  "sad",
  "anxious",
  "calm",
  "happy",
  "confused",
  "neutral",
] as const;
export const moodSchema = z.enum(moods);
export type Mood = z.infer<typeof moodSchema>;

// Emotional check-in questions and responses
export const emotionalCheckins = pgTable("emotional_checkins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmotionalCheckinSchema = createInsertSchema(emotionalCheckins).pick({
  userId: true,
  question: true,
  answer: true,
});

export type EmotionalCheckin = typeof emotionalCheckins.$inferSelect;
export type InsertEmotionalCheckin = z.infer<typeof insertEmotionalCheckinSchema>;

// Check-in questions
export const checkinQuestions = [
  "how_are_you_feeling",
  "sleep_quality",
  "social_connection",
  "stress_level",
  "motivation",
  "self_care",
  "mood_changes",
  "support_needed",
] as const;

export const checkinQuestionSchema = z.enum(checkinQuestions);
export type CheckinQuestion = z.infer<typeof checkinQuestionSchema>;
