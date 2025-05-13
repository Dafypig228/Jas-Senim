import { 
  User, 
  InsertUser, 
  Thread, 
  InsertThread, 
  Comment, 
  InsertComment, 
  Reaction, 
  InsertReaction,
  Message,
  InsertMessage,
  Badge,
  InsertBadge,
  Resource,
  InsertResource,
  CrisisContact,
  InsertCrisisContact,
  AiSuggestion,
  InsertAiSuggestion
} from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Thread operations
  createThread(thread: InsertThread): Promise<Thread>;
  getThread(id: number): Promise<Thread | undefined>;
  getThreads(limit?: number, offset?: number): Promise<Thread[]>;
  getThreadsByCategory(category: string, limit?: number, offset?: number): Promise<Thread[]>;
  getThreadsByUserId(userId: number): Promise<Thread[]>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByThreadId(threadId: number): Promise<Comment[]>;
  
  // Reaction operations
  createReaction(reaction: InsertReaction): Promise<Reaction>;
  getReactionsByThreadId(threadId: number): Promise<Reaction[]>;
  getReactionCountByThreadIdAndType(threadId: number, type: string): Promise<number>;
  deleteReaction(userId: number, threadId: number, type: string): Promise<boolean>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]>;
  
  // Badge operations
  createBadge(badge: InsertBadge): Promise<Badge>;
  getBadgesByUserId(userId: number): Promise<Badge[]>;
  
  // Resource operations
  createResource(resource: InsertResource): Promise<Resource>;
  getResources(language?: string): Promise<Resource[]>;
  getResourcesByCategory(category: string, language?: string): Promise<Resource[]>;
  
  // Crisis contact operations
  createCrisisContact(contact: InsertCrisisContact): Promise<CrisisContact>;
  getCrisisContacts(language?: string): Promise<CrisisContact[]>;
  
  // AI suggestions operations
  createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion>;
  getAiSuggestionsByContext(context: string, language?: string): Promise<AiSuggestion[]>;
  
  // Analytics
  getSupportedPeopleCount(userId: number): Promise<number>;
  getUserDaysInCommunity(userId: number): Promise<number>;
  getTrendingTopics(limit?: number): Promise<{category: string, count: number}[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private threads: Map<number, Thread>;
  private comments: Map<number, Comment>;
  private reactions: Map<number, Reaction>;
  private messages: Map<number, Message>;
  private badges: Map<number, Badge>;
  private resources: Map<number, Resource>;
  private crisisContacts: Map<number, CrisisContact>;
  private aiSuggestions: Map<number, AiSuggestion>;
  
  private userIdCounter: number;
  private threadIdCounter: number;
  private commentIdCounter: number;
  private reactionIdCounter: number;
  private messageIdCounter: number;
  private badgeIdCounter: number;
  private resourceIdCounter: number;
  private crisisContactIdCounter: number;
  private aiSuggestionIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.threads = new Map();
    this.comments = new Map();
    this.reactions = new Map();
    this.messages = new Map();
    this.badges = new Map();
    this.resources = new Map();
    this.crisisContacts = new Map();
    this.aiSuggestions = new Map();
    
    this.userIdCounter = 1;
    this.threadIdCounter = 1;
    this.commentIdCounter = 1;
    this.reactionIdCounter = 1;
    this.messageIdCounter = 1;
    this.badgeIdCounter = 1;
    this.resourceIdCounter = 1;
    this.crisisContactIdCounter = 1;
    this.aiSuggestionIdCounter = 1;
    
    // Initialize with some starter data
    this.initializeData();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const newUser: User = { 
      ...user, 
      id,
      createdAt
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Thread operations
  async createThread(thread: InsertThread): Promise<Thread> {
    const id = this.threadIdCounter++;
    const createdAt = new Date();
    const newThread: Thread = { 
      ...thread, 
      id, 
      isRisky: false, 
      riskLevel: 0, 
      riskReason: null,
      createdAt
    };
    this.threads.set(id, newThread);
    return newThread;
  }
  
  async getThread(id: number): Promise<Thread | undefined> {
    return this.threads.get(id);
  }
  
  async getThreads(limit: number = 20, offset: number = 0): Promise<Thread[]> {
    return Array.from(this.threads.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }
  
  async getThreadsByCategory(category: string, limit: number = 20, offset: number = 0): Promise<Thread[]> {
    return Array.from(this.threads.values())
      .filter(thread => thread.category === category)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }
  
  async getThreadsByUserId(userId: number): Promise<Thread[]> {
    return Array.from(this.threads.values())
      .filter(thread => thread.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // Comment operations
  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const createdAt = new Date();
    const newComment: Comment = {
      ...comment,
      id,
      isRisky: false,
      createdAt
    };
    this.comments.set(id, newComment);
    return newComment;
  }
  
  async getCommentsByThreadId(threadId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.threadId === threadId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  // Reaction operations
  async createReaction(reaction: InsertReaction): Promise<Reaction> {
    // Check if reaction already exists
    const existing = Array.from(this.reactions.values()).find(
      r => r.userId === reaction.userId && r.threadId === reaction.threadId && r.type === reaction.type
    );
    
    if (existing) {
      return existing;
    }
    
    const id = this.reactionIdCounter++;
    const createdAt = new Date();
    const newReaction: Reaction = {
      ...reaction,
      id,
      createdAt
    };
    this.reactions.set(id, newReaction);
    return newReaction;
  }
  
  async getReactionsByThreadId(threadId: number): Promise<Reaction[]> {
    return Array.from(this.reactions.values())
      .filter(reaction => reaction.threadId === threadId);
  }
  
  async getReactionCountByThreadIdAndType(threadId: number, type: string): Promise<number> {
    return Array.from(this.reactions.values())
      .filter(reaction => reaction.threadId === threadId && reaction.type === type)
      .length;
  }
  
  async deleteReaction(userId: number, threadId: number, type: string): Promise<boolean> {
    const reactionToDelete = Array.from(this.reactions.values()).find(
      r => r.userId === userId && r.threadId === threadId && r.type === type
    );
    
    if (reactionToDelete) {
      this.reactions.delete(reactionToDelete.id);
      return true;
    }
    
    return false;
  }
  
  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const createdAt = new Date();
    const newMessage: Message = {
      ...message,
      id,
      isRead: false,
      createdAt
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }
  
  async getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.senderId === user1Id && message.receiverId === user2Id) || 
        (message.senderId === user2Id && message.receiverId === user1Id)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  // Badge operations
  async createBadge(badge: InsertBadge): Promise<Badge> {
    const id = this.badgeIdCounter++;
    const createdAt = new Date();
    const newBadge: Badge = {
      ...badge,
      id,
      createdAt
    };
    this.badges.set(id, newBadge);
    return newBadge;
  }
  
  async getBadgesByUserId(userId: number): Promise<Badge[]> {
    return Array.from(this.badges.values())
      .filter(badge => badge.userId === userId);
  }
  
  // Resource operations
  async createResource(resource: InsertResource): Promise<Resource> {
    const id = this.resourceIdCounter++;
    const createdAt = new Date();
    const newResource: Resource = {
      ...resource,
      id,
      createdAt
    };
    this.resources.set(id, newResource);
    return newResource;
  }
  
  async getResources(language: string = 'ru'): Promise<Resource[]> {
    return Array.from(this.resources.values())
      .filter(resource => resource.language === language);
  }
  
  async getResourcesByCategory(category: string, language: string = 'ru'): Promise<Resource[]> {
    return Array.from(this.resources.values())
      .filter(resource => resource.category === category && resource.language === language);
  }
  
  // Crisis contact operations
  async createCrisisContact(contact: InsertCrisisContact): Promise<CrisisContact> {
    const id = this.crisisContactIdCounter++;
    const newContact: CrisisContact = {
      ...contact,
      id
    };
    this.crisisContacts.set(id, newContact);
    return newContact;
  }
  
  async getCrisisContacts(language: string = 'ru'): Promise<CrisisContact[]> {
    return Array.from(this.crisisContacts.values())
      .filter(contact => contact.language === language);
  }
  
  // AI suggestions operations
  async createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const id = this.aiSuggestionIdCounter++;
    const createdAt = new Date();
    const newSuggestion: AiSuggestion = {
      ...suggestion,
      id,
      createdAt
    };
    this.aiSuggestions.set(id, newSuggestion);
    return newSuggestion;
  }
  
  async getAiSuggestionsByContext(context: string, language: string = 'ru'): Promise<AiSuggestion[]> {
    return Array.from(this.aiSuggestions.values())
      .filter(suggestion => suggestion.context === context && suggestion.language === language);
  }
  
  // Analytics
  async getSupportedPeopleCount(userId: number): Promise<number> {
    // Count unique threads the user has commented on or reacted to
    const commentedThreadIds = new Set(
      Array.from(this.comments.values())
        .filter(comment => comment.userId === userId)
        .map(comment => comment.threadId)
    );
    
    const reactedThreadIds = new Set(
      Array.from(this.reactions.values())
        .filter(reaction => reaction.userId === userId)
        .map(reaction => reaction.threadId)
    );
    
    // Combine both sets
    const supportedThreadIds = new Set([...commentedThreadIds, ...reactedThreadIds]);
    
    return supportedThreadIds.size;
  }
  
  async getUserDaysInCommunity(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user || !user.createdAt) return 0;
    
    const createdAt = new Date(user.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
  
  async getTrendingTopics(limit: number = 5): Promise<{category: string, count: number}[]> {
    const categories = new Map<string, number>();
    
    // Count threads by category
    Array.from(this.threads.values()).forEach(thread => {
      const count = categories.get(thread.category) || 0;
      categories.set(thread.category, count + 1);
    });
    
    // Convert to array and sort
    return Array.from(categories.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
  
  // Initial data setup for the application
  private initializeData() {
    // Create a demo user
    const demoUser: InsertUser = {
      username: 'anonymous',
      password: 'password',
      language: 'ru'
    };
    this.createUser(demoUser).then(user => {
      // Create resources
      const resources: InsertResource[] = [
        {
          title: 'Техники управления тревогой',
          description: 'Полезные советы по борьбе с тревожностью',
          url: '/resources/anxiety',
          category: 'mental_health',
          language: 'ru'
        },
        {
          title: 'Номера телефонов доверия',
          description: 'Список горячих линий для экстренной помощи',
          url: '/resources/hotlines',
          category: 'crisis',
          language: 'ru'
        },
        {
          title: 'Литература о подростковой психологии',
          description: 'Полезные книги для понимания себя',
          url: '/resources/books',
          category: 'education',
          language: 'ru'
        },
        {
          title: 'Как начать разговор о своих чувствах',
          description: 'Советы по выражению эмоций',
          url: '/resources/emotions',
          category: 'communication',
          language: 'ru'
        }
      ];
      
      resources.forEach(resource => this.createResource(resource));
      
      // Create crisis contacts
      const crisisContacts: InsertCrisisContact[] = [
        {
          name: 'Общая линия доверия',
          phone: '8-800-2000-122',
          description: 'Круглосуточно, бесплатно',
          type: 'hotline',
          language: 'ru'
        },
        {
          name: 'Телеграм-бот поддержки',
          description: 'Мгновенная анонимная помощь',
          type: 'chat',
          url: 'https://t.me/support_bot',
          language: 'ru'
        },
        {
          name: 'Скорая помощь',
          phone: '103',
          type: 'emergency',
          language: 'ru'
        },
        {
          name: 'Экстренные службы',
          phone: '112',
          type: 'emergency',
          language: 'ru'
        }
      ];
      
      crisisContacts.forEach(contact => this.createCrisisContact(contact));
      
      // Create AI suggestions
      const aiSuggestions: InsertAiSuggestion[] = [
        {
          context: 'family',
          suggestions: [
            "Я сочувствую тебе, это сложная ситуация",
            "Это не твоя вина, так бывает у многих семей",
            "Расскажи, как ты с этим справляешься?"
          ],
          language: 'ru'
        },
        {
          context: 'school',
          suggestions: [
            "Многие сталкиваются с трудностями в учебе, ты не один",
            "Что именно кажется самым сложным для тебя?",
            "Есть ли кто-то, кто может помочь тебе с учебой?"
          ],
          language: 'ru'
        },
        {
          context: 'loneliness',
          suggestions: [
            "Я понимаю, как тяжело бывает чувствовать себя одиноким",
            "Что помогает тебе почувствовать себя лучше, когда ты один?",
            "Хочешь поделиться, как давно ты чувствуешь себя так?"
          ],
          language: 'ru'
        }
      ];
      
      aiSuggestions.forEach(suggestion => this.createAiSuggestion(suggestion));
      
      // Create some example threads
      const threads: InsertThread[] = [
        {
          userId: user.id,
          content: 'Завалил экзамен, на который готовился целый месяц. Родители будут в ярости. Я так старался, но всё равно не смог. Уже не первый раз я их подвожу, не знаю как об этом говорить. Чувствую себя таким бесполезным...',
          category: 'school',
          mood: 'sad'
        },
        {
          userId: user.id,
          content: 'Родители постоянно ругаются из-за денег. Мама плачет по ночам, а папа иногда не приходит домой. Я боюсь, что они разведутся. Младшая сестра все время спрашивает у меня, что происходит, а я не знаю, что ей ответить. Иногда кажется, что это все из-за меня...',
          category: 'family',
          mood: 'anxious'
        },
        {
          userId: user.id,
          content: 'Не могу найти общий язык с одноклассниками. Они все обсуждают какие-то сериалы, вечеринки и одежду, а мне это не интересно. Пытаюсь общаться, но в итоге просто сижу и слушаю, не зная что сказать. В школе всегда в одиночестве, и дома тоже. Как найти друзей, с которыми будут общие интересы?',
          category: 'loneliness',
          mood: 'calm'
        }
      ];
      
      // Create the threads and add some reactions and comments
      Promise.all(threads.map(thread => this.createThread(thread)))
        .then(createdThreads => {
          // Add reactions to the first thread
          const reactions1: InsertReaction[] = [
            { userId: user.id, threadId: createdThreads[0].id, type: 'understand' },
            { userId: user.id, threadId: createdThreads[0].id, type: 'not_alone' },
            { userId: user.id, threadId: createdThreads[0].id, type: 'will_overcome' }
          ];
          
          reactions1.forEach(reaction => this.createReaction(reaction));
          
          // Add reactions to the second thread
          const reactions2: InsertReaction[] = [
            { userId: user.id, threadId: createdThreads[1].id, type: 'understand' },
            { userId: user.id, threadId: createdThreads[1].id, type: 'not_alone' },
            { userId: user.id, threadId: createdThreads[1].id, type: 'support' }
          ];
          
          reactions2.forEach(reaction => this.createReaction(reaction));
          
          // Add reactions to the third thread
          const reactions3: InsertReaction[] = [
            { userId: user.id, threadId: createdThreads[2].id, type: 'understand' },
            { userId: user.id, threadId: createdThreads[2].id, type: 'not_alone' },
            { userId: user.id, threadId: createdThreads[2].id, type: 'idea' }
          ];
          
          reactions3.forEach(reaction => this.createReaction(reaction));
          
          // Add comments to the second thread
          const comments: InsertComment[] = [
            {
              userId: user.id,
              threadId: createdThreads[1].id,
              content: 'Я прошел через похожую ситуацию когда был подростком. Это правда очень тяжело, но хочу тебе сказать - ты точно не виноват в их проблемах. Взрослые иногда не понимают, как их конфликты влияют на детей. Не держи всё в себе, может стоит поговорить с кем-то из взрослых, кому ты доверяешь?'
            },
            {
              userId: user.id,
              threadId: createdThreads[1].id,
              content: 'Спасибо за поддержку... У меня правда никого нет из взрослых, кому я могу это рассказать. Думал поговорить с школьным психологом, но боюсь, что они расскажут родителям.'
            },
            {
              userId: user.id,
              threadId: createdThreads[1].id,
              content: 'Школьные психологи обычно соблюдают конфиденциальность, если нет угрозы твоей безопасности. Можешь сначала просто спросить его о правилах конфиденциальности, прежде чем рассказывать о своей ситуации. А пока, может помочь вести дневник или найти способы отвлечься, когда дома тяжело.'
            }
          ];
          
          comments.forEach(comment => this.createComment(comment));
          
          // Create badges for the user
          const badges: InsertBadge[] = [
            { userId: user.id, type: 'empath' },
            { userId: user.id, type: 'protector' },
            { userId: user.id, type: 'good_listener' }
          ];
          
          badges.forEach(badge => this.createBadge(badge));
        });
    });
  }
}

export const storage = new MemStorage();
