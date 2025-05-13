import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, { message: "Имя пользователя должно содержать не менее 3 символов" }),
  password: z.string().min(6, { message: "Пароль должен содержать не менее 6 символов" }),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: "Имя пользователя должно содержать не менее 3 символов" }),
  password: z.string().min(6, { message: "Пароль должен содержать не менее 6 символов" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  
  // Эффект для перенаправления после авторизации
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    const { confirmPassword, ...registerData } = values;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-center font-bold">
              Добро пожаловать
            </CardTitle>
            <CardDescription className="text-center">
              Платформа поддержки для подростков
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="login"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Имя пользователя</FormLabel>
                          <FormControl>
                            <Input placeholder="Введите имя пользователя" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Пароль</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Введите пароль" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Вход...
                        </>
                      ) : "Войти"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Имя пользователя</FormLabel>
                          <FormControl>
                            <Input placeholder="Придумайте имя пользователя" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Пароль</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Создайте пароль" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Подтверждение пароля</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Повторите пароль" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Регистрация...
                        </>
                      ) : "Зарегистрироваться"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">или</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <svg
                className="mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#FFC107"
                  d="M43.6,20H24v8h11.3c-1.2,5-5.3,8.1-11.3,8.1c-6.9,0-12.5-5.6-12.5-12.5S17.1,11.1,24,11.1c2.8,0,5.5,1,7.5,2.7l6.1-6.1C33.9,4.7,29.1,3,24,3C12.4,3,3,12.4,3,24s9.4,21,21,21c12.1,0,20-8.5,20-20C44,22.9,43.9,21.4,43.6,20z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.3,14.7l7.1,5.3c1.9-4.2,6.1-7,11.1-7c2.8,0,5.5,1,7.5,2.7l6.1-6.1C33.9,4.7,29.1,3,24,3C15.6,3,8.3,7.8,6.3,14.7z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,45c5,0,9.6-1.6,13.4-4.5l-6.6-5.2c-1.9,1.2-4.6,2-6.8,2c-6,0-11.1-4.1-12.1-9.5L4.5,31C7.5,39.3,15.1,45,24,45z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6,20H24v8h11.3c-0.6,2.5-2.1,4.6-4.3,6l6.6,5.2c4.6-4.1,7.1-10.3,7.1-17.2C44,22.9,43.9,21.4,43.6,20z"
                />
              </svg>
              Войти через Google
            </Button>
          </CardFooter>
        </Card>
      </div>
      <div className="hidden md:flex md:flex-1 bg-primary/10 flex-col justify-center p-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-4">Оставайтесь сильными вместе</h1>
          <p className="mb-6">
            Наша платформа создана, чтобы помочь подросткам найти поддержку, понимание и ответы на сложные вопросы. 
            Анонимно, безопасно и с поддержкой сообщества.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Анонимное общение
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Поддержка сообщества
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Профессиональные ресурсы
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Безопасная среда
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}