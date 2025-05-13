import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { moderateContent, assessSuicideRisk, generateResponseSuggestions } from "./moderation";
import { setupAuth } from "./auth";
import { 
  insertUserSchema, 
  insertThreadSchema, 
  insertCommentSchema, 
  insertReactionSchema,
  insertMessageSchema,
  insertEmotionalCheckinSchema,
  checkinQuestions
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

  // Setup authentication with passport
  setupAuth(app);
  
  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Authentication required" });
  };
  
  // Emotional Check-in routes
  app.get("/api/checkin/needed", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const isNeeded = await storage.isCheckinNeeded(userId);
      res.json({ isNeeded });
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.get("/api/checkin/questions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Return list of check-in questions with translations
      // @ts-ignore
      const language = req.user?.language || "ru";
      const questionsObj = checkinQuestions.reduce((acc, question) => {
        acc[question] = question; // In a real app, this would be translated
        return acc;
      }, {} as Record<string, string>);
      
      res.json(questionsObj);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.post("/api/checkin", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const checkinData = insertEmotionalCheckinSchema.parse({
        ...req.body,
        userId
      });
      
      const newCheckin = await storage.createEmotionalCheckin(checkinData);
      res.status(201).json(newCheckin);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.get("/api/checkin/history", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const checkins = await storage.getEmotionalCheckinsByUserId(userId, limit);
      res.json(checkins);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.get("/api/checkin/latest", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const latest = await storage.getLatestEmotionalCheckins(userId);
      res.json(latest);
    } catch (error) {
      handleError(res, error);
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

  app.post("/api/threads", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const threadData = insertThreadSchema.parse({
        ...req.body,
        userId
      });
      
      try {
        // Moderate content before saving
        const moderationResult = await moderateContent(threadData.content);
        
        // Create thread with moderation results
        const thread = await storage.createThread({
          ...threadData,
          // @ts-ignore
          isRisky: moderationResult.isRisky,
          // @ts-ignore
          riskLevel: moderationResult.riskLevel,
          // @ts-ignore
          riskReason: moderationResult.riskReason
        });
        
        // If high risk, perform additional suicide risk assessment
        if (moderationResult.riskLevel >= 7) {
          try {
            const riskAssessment = await assessSuicideRisk(threadData.content);
            
            // Update thread with risk assessment info
            // In a real implementation, this would trigger alerts and other actions
            console.log("High risk thread detected:", riskAssessment);
          } catch (assessError) {
            console.error("Error in suicide risk assessment:", assessError);
          }
        }
        
        return res.status(201).json(thread);
      } catch (modError) {
        console.error("Moderation error, creating thread without moderation:", modError);
        
        // Если модерация недоступна, все равно создаем тред
        const thread = await storage.createThread({
          ...threadData,
          isRisky: false,
          riskLevel: 0,
          riskReason: null
        });
        
        return res.status(201).json(thread);
      }
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

  app.post("/api/threads/:threadId/comments", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const threadId = parseInt(req.params.threadId);
      const thread = await storage.getThread(threadId);
      
      if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
      }
      
      const commentData = insertCommentSchema.parse({
        ...req.body,
        threadId,
        userId
      });
      
      try {
        // Moderate comment content
        const moderationResult = await moderateContent(commentData.content);
        
        const comment = await storage.createComment({
          ...commentData,
          // @ts-ignore
          isRisky: moderationResult.isRisky
        });
        
        return res.status(201).json(comment);
      } catch (modError) {
        console.error("Moderation error, creating comment without moderation:", modError);
        
        // Если модерация недоступна, все равно создаем комментарий
        const comment = await storage.createComment({
          ...commentData,
          isRisky: false
        });
        
        return res.status(201).json(comment);
      }
    } catch (error) {
      return handleError(res, error);
    }
  });

  // Reaction routes
  app.post("/api/threads/:threadId/reactions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const threadId = parseInt(req.params.threadId);
      const thread = await storage.getThread(threadId);
      
      if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
      }
      
      const reactionData = insertReactionSchema.parse({
        ...req.body,
        threadId,
        userId
      });
      
      const reaction = await storage.createReaction(reactionData);
      return res.status(201).json(reaction);
    } catch (error) {
      return handleError(res, error);
    }
  });

  app.delete("/api/threads/:threadId/reactions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const threadId = parseInt(req.params.threadId);
      const { type } = req.body;
      
      if (!type) {
        return res.status(400).json({ message: "Reaction type is required" });
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
  app.get("/api/messages/:conversationId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const conversationId = req.params.conversationId;
      let userId1, userId2;
      
      if (conversationId.includes('-')) {
        // Формат "user1-user2"
        [userId1, userId2] = conversationId.split('-').map(id => parseInt(id));
      } else {
        // Обратная совместимость: параметр - идентификатор пользователя
        userId1 = parseInt(conversationId);
        userId2 = parseInt(req.query.otherId as string);
        
        if (!userId2) {
          return res.status(400).json({ message: "otherId query parameter is required" });
        }
      }
      
      // Проверяем, что текущий пользователь является участником беседы
      if (currentUserId !== userId1 && currentUserId !== userId2) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const messages = await storage.getMessagesBetweenUsers(userId1, userId2);
      return res.json(messages);
    } catch (error) {
      return handleError(res, error);
    }
  });

  app.post("/api/messages", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const senderId = req.user?.id;
      if (!senderId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId
      });
      
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
  app.get("/api/users/:userId/stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const currentUserId = req.user?.id;
      const userId = parseInt(req.params.userId);
      
      // Если пользователь запрашивает свои данные или данные другого пользователя
      // В публичном сервисе можно открыть доступ к базовой статистике других пользователей
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const supportedCount = await storage.getSupportedPeopleCount(userId);
      const daysInCommunity = await storage.getUserDaysInCommunity(userId);
      const badges = await storage.getBadgesByUserId(userId);
      
      // Дополнительная информация, доступная только самому пользователю
      if (currentUserId === userId) {
        // Check if a weekly check-in is needed
        const needsCheckin = await storage.isCheckinNeeded(userId);
        return res.json({
          supportedCount,
          daysInCommunity,
          badges,
          needsCheckin,
          isCurrentUser: true
        });
      } else {
        // Публичная статистика другого пользователя
        return res.json({
          supportedCount,
          daysInCommunity,
          badges,
          isCurrentUser: false
        });
      }
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
