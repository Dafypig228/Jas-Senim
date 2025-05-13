import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { moderateContent, assessSuicideRisk, generateResponseSuggestions } from "./moderation";
import { 
  insertUserSchema, 
  insertThreadSchema, 
  insertCommentSchema, 
  insertReactionSchema,
  insertMessageSchema
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handler helper function
  const handleError = (res: Response, error: unknown) => {
    console.error("API Error:", error);
    
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : "Unknown error occurred" 
    });
  };

  // Authentication routes (simplified for demo)
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      // Remove sensitive data
      const { password, ...userWithoutPassword } = user;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      return handleError(res, error);
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Remove sensitive data
      const { password: _, ...userWithoutPassword } = user;
      
      return res.json(userWithoutPassword);
    } catch (error) {
      return handleError(res, error);
    }
  });

  // Thread routes
  app.get("/api/threads", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const category = req.query.category as string;
      
      let threads;
      if (category) {
        threads = await storage.getThreadsByCategory(category, limit, offset);
      } else {
        threads = await storage.getThreads(limit, offset);
      }
      
      // For each thread, get the reaction counts
      const threadsWithReactions = await Promise.all(threads.map(async (thread) => {
        const reactionCounts = {
          understand: await storage.getReactionCountByThreadIdAndType(thread.id, 'understand'),
          not_alone: await storage.getReactionCountByThreadIdAndType(thread.id, 'not_alone'),
          will_overcome: await storage.getReactionCountByThreadIdAndType(thread.id, 'will_overcome'),
          idea: await storage.getReactionCountByThreadIdAndType(thread.id, 'idea'),
          support: await storage.getReactionCountByThreadIdAndType(thread.id, 'support')
        };
        
        const commentCount = (await storage.getCommentsByThreadId(thread.id)).length;
        
        return {
          ...thread,
          reactionCounts,
          commentCount
        };
      }));
      
      return res.json(threadsWithReactions);
    } catch (error) {
      return handleError(res, error);
    }
  });

  app.get("/api/threads/:id", async (req: Request, res: Response) => {
    try {
      const threadId = parseInt(req.params.id);
      const thread = await storage.getThread(threadId);
      
      if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
      }
      
      const comments = await storage.getCommentsByThreadId(threadId);
      
      const reactionCounts = {
        understand: await storage.getReactionCountByThreadIdAndType(threadId, 'understand'),
        not_alone: await storage.getReactionCountByThreadIdAndType(threadId, 'not_alone'),
        will_overcome: await storage.getReactionCountByThreadIdAndType(threadId, 'will_overcome'),
        idea: await storage.getReactionCountByThreadIdAndType(threadId, 'idea'),
        support: await storage.getReactionCountByThreadIdAndType(threadId, 'support')
      };
      
      return res.json({
        thread,
        comments,
        reactionCounts
      });
    } catch (error) {
      return handleError(res, error);
    }
  });

  app.post("/api/threads", async (req: Request, res: Response) => {
    try {
      const threadData = insertThreadSchema.parse(req.body);
      
      // Moderate content before saving
      const moderationResult = await moderateContent(threadData.content);
      
      // Create thread with moderation results
      const thread = await storage.createThread({
        ...threadData,
        isRisky: moderationResult.isRisky,
        riskLevel: moderationResult.riskLevel,
        riskReason: moderationResult.riskReason
      });
      
      // If high risk, perform additional suicide risk assessment
      if (moderationResult.riskLevel >= 7) {
        const riskAssessment = await assessSuicideRisk(threadData.content);
        
        // Update thread with risk assessment info
        // In a real implementation, this would trigger alerts and other actions
        console.log("High risk thread detected:", riskAssessment);
      }
      
      return res.status(201).json(thread);
    } catch (error) {
      return handleError(res, error);
    }
  });

  // Comment routes
  app.get("/api/threads/:threadId/comments", async (req: Request, res: Response) => {
    try {
      const threadId = parseInt(req.params.threadId);
      const comments = await storage.getCommentsByThreadId(threadId);
      return res.json(comments);
    } catch (error) {
      return handleError(res, error);
    }
  });

  app.post("/api/threads/:threadId/comments", async (req: Request, res: Response) => {
    try {
      const threadId = parseInt(req.params.threadId);
      const thread = await storage.getThread(threadId);
      
      if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
      }
      
      const commentData = insertCommentSchema.parse({
        ...req.body,
        threadId
      });
      
      // Moderate comment content
      const moderationResult = await moderateContent(commentData.content);
      
      const comment = await storage.createComment({
        ...commentData,
        isRisky: moderationResult.isRisky
      });
      
      return res.status(201).json(comment);
    } catch (error) {
      return handleError(res, error);
    }
  });

  // Reaction routes
  app.post("/api/threads/:threadId/reactions", async (req: Request, res: Response) => {
    try {
      const threadId = parseInt(req.params.threadId);
      const thread = await storage.getThread(threadId);
      
      if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
      }
      
      const reactionData = insertReactionSchema.parse({
        ...req.body,
        threadId
      });
      
      const reaction = await storage.createReaction(reactionData);
      return res.status(201).json(reaction);
    } catch (error) {
      return handleError(res, error);
    }
  });

  app.delete("/api/threads/:threadId/reactions", async (req: Request, res: Response) => {
    try {
      const threadId = parseInt(req.params.threadId);
      const { userId, type } = req.body;
      
      if (!userId || !type) {
        return res.status(400).json({ message: "userId and type are required" });
      }
      
      const deleted = await storage.deleteReaction(userId, threadId, type);
      
      if (!deleted) {
        return res.status(404).json({ message: "Reaction not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error);
    }
  });

  // Message routes
  app.get("/api/messages/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const otherId = parseInt(req.query.otherId as string);
      
      if (!otherId) {
        return res.status(400).json({ message: "otherId query parameter is required" });
      }
      
      const messages = await storage.getMessagesBetweenUsers(userId, otherId);
      return res.json(messages);
    } catch (error) {
      return handleError(res, error);
    }
  });

  app.post("/api/messages", async (req: Request, res: Response) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      
      // Moderate message content
      const moderationResult = await moderateContent(messageData.content);
      
      // If content is risky, don't send the message
      if (moderationResult.isRisky && moderationResult.riskLevel > 5) {
        return res.status(403).json({ 
          message: "Message contains inappropriate content",
          reason: moderationResult.riskReason
        });
      }
      
      const message = await storage.createMessage(messageData);
      return res.status(201).json(message);
    } catch (error) {
      return handleError(res, error);
    }
  });

  // Resources routes
  app.get("/api/resources", async (req: Request, res: Response) => {
    try {
      const language = req.query.language as string || 'ru';
      const category = req.query.category as string;
      
      let resources;
      if (category) {
        resources = await storage.getResourcesByCategory(category, language);
      } else {
        resources = await storage.getResources(language);
      }
      
      return res.json(resources);
    } catch (error) {
      return handleError(res, error);
    }
  });

  // Crisis contacts routes
  app.get("/api/crisis-contacts", async (req: Request, res: Response) => {
    try {
      const language = req.query.language as string || 'ru';
      const contacts = await storage.getCrisisContacts(language);
      return res.json(contacts);
    } catch (error) {
      return handleError(res, error);
    }
  });

  // AI assistance routes
  app.post("/api/ai/suggest-responses", async (req: Request, res: Response) => {
    try {
      const { content, language = 'ru' } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      const suggestions = await generateResponseSuggestions(content, language);
      return res.json({ suggestions });
    } catch (error) {
      return handleError(res, error);
    }
  });

  // User stats routes
  app.get("/api/users/:userId/stats", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const supportedCount = await storage.getSupportedPeopleCount(userId);
      const daysInCommunity = await storage.getUserDaysInCommunity(userId);
      const badges = await storage.getBadgesByUserId(userId);
      
      return res.json({
        supportedCount,
        daysInCommunity,
        badges
      });
    } catch (error) {
      return handleError(res, error);
    }
  });

  // Trending topics route
  app.get("/api/trending-topics", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const topics = await storage.getTrendingTopics(limit);
      return res.json(topics);
    } catch (error) {
      return handleError(res, error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
