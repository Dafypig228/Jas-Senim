import { useState, useEffect, useRef } from "react";
import { 
  Button
} from "@/components/ui/button";
import { 
  Bot, 
  MessagesSquare, 
  Minimize2, 
  X, 
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import OpenAI from "openai";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export function LocalChat() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Привет! Я здесь, чтобы помочь тебе. Как я могу поддержать тебя сегодня?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Настройки для API запроса
  const systemMessage = `
    Ты - эмпатичный помощник для подростков в сложных эмоциональных ситуациях.
    Твоя цель - поддержать, выслушать и дать совет. Ты не психотерапевт, но можешь 
    предложить простые стратегии для справления с эмоциями.
    
    В случае серьезных проблем (суицидальные мысли, самоповреждение, насилие),
    мягко рекомендуй обратиться к профессионалам и предлагай номера доверия.
    
    Твой стиль: 
    - Теплый и понимающий
    - Краткие ответы (максимум 3-4 предложения)
    - Избегай клише и банальностей
    - Используй простой язык, понятный подросткам
    
    ОЧЕНЬ ВАЖНО: Ты всегда отвечаешь НА РУССКОМ языке, даже если к тебе обращаются на другом языке.
  `;

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Добавляем сообщение пользователя
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    
    try {
      // Получаем ответ от API
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemMessage },
          ...messages.map(msg => ({ 
            role: msg.role === "user" ? "user" as const : "assistant" as const, 
            content: msg.content 
          })),
          { role: "user", content: input }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });
      
      // Добавляем ответ ассистента
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: response.choices[0].message.content || "Извини, я не смог обработать твое сообщение.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Ошибка при запросе к модели:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить ответ. Пожалуйста, попробуй позже.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 rounded-full p-3 shadow-lg"
        size="icon"
      >
        <MessagesSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div
      className={`fixed ${
        minimized ? "bottom-24 right-6 h-auto w-auto" : "bottom-24 right-6 h-[70vh] w-[350px] md:w-[400px]"
      } rounded-lg bg-white shadow-2xl transition-all duration-200 z-50`}
    >
      {minimized ? (
        <Button
          onClick={() => setMinimized(false)}
          className="rounded-full p-3"
          size="icon"
        >
          <MessagesSquare className="h-6 w-6" />
        </Button>
      ) : (
        <div className="flex h-full flex-col overflow-hidden">
          {/* Заголовок */}
          <div className="flex items-center justify-between border-b p-3">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Чат поддержки</h3>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMinimized(true)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Сообщения */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="mt-1 text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%] items-center gap-2 rounded-lg bg-muted p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm">Печатает...</p>
                  </div>
                </div>
              )}
              <div ref={messageEndRef} />
            </div>
          </div>

          {/* Форма ввода */}
          <form onSubmit={handleSubmit} className="border-t p-3">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Напиши свое сообщение..."
                className="min-h-[60px] resize-none"
                disabled={loading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}