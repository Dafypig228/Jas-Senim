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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

// Создаем более простую, имитационную реализацию чата без обращения к API
// так как OPENAI_API_KEY доступен только на сервере, а не в браузере
// В полной реализации нужно использовать серверное API для отправки запросов к OpenAI

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
      // Имитация задержки для реалистичности
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Простая имитация ответов бота вместо использования OpenAI API
      let botResponse = "";
      const userInput = input.toLowerCase();
      
      if (userInput.includes("привет") || userInput.includes("здравствуй")) {
        botResponse = "Привет! Как я могу помочь тебе сегодня?";
      } else if (userInput.includes("как дела") || userInput.includes("как ты")) {
        botResponse = "Я всегда готов помочь тебе. Расскажи, что тебя беспокоит?";
      } else if (userInput.includes("плохо") || userInput.includes("грустно") || userInput.includes("депрессия")) {
        botResponse = "Мне жаль, что ты чувствуешь себя так. Помни, что эти чувства временны. Хочешь поговорить о том, что именно тебя беспокоит?";
      } else if (userInput.includes("устал") || userInput.includes("не могу")) {
        botResponse = "Усталость - это нормально. Иногда нам всем нужен перерыв. Может быть, стоит найти время для отдыха и заботы о себе?";
      } else if (userInput.includes("помоги") || userInput.includes("совет")) {
        botResponse = "Я постараюсь помочь. Расскажи подробнее о ситуации, и мы вместе подумаем, как её решить.";
      } else if (userInput.includes("спасибо")) {
        botResponse = "Всегда рад помочь! Если у тебя возникнут другие вопросы, я здесь.";
      } else {
        botResponse = "Я понимаю твои чувства. Иногда важно просто выговориться. Хочешь рассказать больше о том, что происходит?";
      }
      
      // Добавляем ответ ассистента
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: botResponse,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Ошибка при обработке сообщения:", error);
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