import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Question = {
  id: string;
  text: string;
  options: { value: string; label: string }[];
};

// Вопросы для еженедельного чек-ина
const questions: Record<string, Question> = {
  "how_are_you_feeling": {
    id: "how_are_you_feeling",
    text: "Как вы себя чувствуете сегодня?",
    options: [
      { value: "very_bad", label: "Очень плохо" },
      { value: "bad", label: "Плохо" },
      { value: "neutral", label: "Нормально" },
      { value: "good", label: "Хорошо" },
      { value: "very_good", label: "Очень хорошо" },
    ]
  },
  "sleep_quality": {
    id: "sleep_quality",
    text: "Как вы оцениваете качество своего сна за последнюю неделю?",
    options: [
      { value: "very_bad", label: "Очень плохо" },
      { value: "bad", label: "Плохо" },
      { value: "neutral", label: "Средне" },
      { value: "good", label: "Хорошо" },
      { value: "very_good", label: "Очень хорошо" },
    ]
  },
  "social_connection": {
    id: "social_connection",
    text: "Чувствовали ли вы связь с другими людьми на этой неделе?",
    options: [
      { value: "not_at_all", label: "Совсем нет" },
      { value: "a_little", label: "Немного" },
      { value: "somewhat", label: "В некоторой степени" },
      { value: "quite_a_bit", label: "Довольно сильно" },
      { value: "very_much", label: "Очень сильно" },
    ]
  },
  "stress_level": {
    id: "stress_level",
    text: "Каким был ваш уровень стресса на этой неделе?",
    options: [
      { value: "very_high", label: "Очень высокий" },
      { value: "high", label: "Высокий" },
      { value: "moderate", label: "Умеренный" },
      { value: "low", label: "Низкий" },
      { value: "very_low", label: "Очень низкий" },
    ]
  },
  "support_needed": {
    id: "support_needed",
    text: "Нуждаетесь ли вы в дополнительной поддержке?",
    options: [
      { value: "urgently", label: "Срочно" },
      { value: "yes", label: "Да" },
      { value: "maybe", label: "Возможно" },
      { value: "not_now", label: "Пока нет" },
      { value: "doing_fine", label: "Справляюсь сам(а)" },
    ]
  }
};

export function EmotionalCheckin() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Проверить, нужен ли чек-ин
  const { data: checkinStatus } = useQuery({
    queryKey: ["/api/checkin/needed"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/checkin/needed");
      return res.json();
    },
    enabled: !!user,
  });
  
  useEffect(() => {
    if (checkinStatus?.isNeeded) {
      setOpen(true);
    }
  }, [checkinStatus]);
  
  const submitMutation = useMutation({
    mutationFn: async (data: { question: string; answer: string }) => {
      const res = await apiRequest("POST", "/api/checkin", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkin/needed"] });
    },
  });
  
  const questionIds = Object.keys(questions);
  const currentQuestion = questions[questionIds[currentQuestionIndex]];
  
  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
    
    // Отправляем ответ на сервер
    submitMutation.mutate({
      question: currentQuestion.id,
      answer: value
    });
    
    if (currentQuestionIndex < questionIds.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setOpen(false);
      setCurrentQuestionIndex(0);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Еженедельный чек-ин</DialogTitle>
          <DialogDescription>
            Пожалуйста, ответьте на несколько вопросов о вашем самочувствии.
            Это поможет нам лучше поддерживать вас.
          </DialogDescription>
        </DialogHeader>
        {currentQuestion && (
          <div className="py-4">
            <h3 className="font-medium mb-4">{currentQuestion.text}</h3>
            <RadioGroup
              onValueChange={handleAnswer}
              value={answers[currentQuestion.id]}
              className="gap-3"
            >
              {currentQuestion.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
        <DialogFooter>
          <Button
            onClick={() => handleAnswer(answers[currentQuestion.id] || currentQuestion.options[2].value)}
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              `Далее (${currentQuestionIndex + 1}/${questionIds.length})`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}