import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LogOut,
  User,
  Menu,
  MessageSquare,
  Home,
  BookOpen,
  Heart,
  Bell,
  Plus,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  currentUser?: {
    id: number;
    username: string;
    avatar?: string | null;
  } | null;
  notifications?: number;
}

export default function Header({ currentUser, notifications = 0 }: HeaderProps) {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { path: "/", label: t('nav.home'), icon: <Home className="h-4 w-4" /> },
    { path: "/threads", label: t('nav.threads'), icon: <MessageSquare className="h-4 w-4" /> },
    { path: "/resources", label: t('nav.resources'), icon: <BookOpen className="h-4 w-4" /> },
  ];

  const isActiveRoute = (path: string) => {
    if (path === "/") return location === path;
    return location.startsWith(path);
  };

  return (
    <header className="bg-white border-b border-border/40 sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo and desktop navigation */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-primary-foreground">{t('app.name')}</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActiveRoute(item.path) ? "secondary" : "ghost"}
                size="sm"
                asChild
                className={`gap-2 ${isActiveRoute(item.path) ? "bg-secondary/20" : ""}`}
              >
                <Link to={item.path}>
                  {item.icon}
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
        </div>

        {/* Desktop user section */}
        <div className="hidden md:flex items-center gap-2">
          {currentUser ? (
            <>
              {notifications > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <Badge 
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive"
                          variant="destructive"
                        >
                          {notifications}
                        </Badge>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('notifications.tooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              <Button variant="outline" size="sm" asChild className="gap-2">
                <Link to="/threads/new">
                  <Plus className="h-4 w-4" />
                  {t('threads.create')}
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser.avatar || undefined} alt={currentUser.username} />
                      <AvatarFallback className="bg-primary-100 text-primary-700">
                        {currentUser.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        ID: {currentUser.id}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${currentUser.id}`} className="cursor-pointer flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t('profile.view')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages" className="cursor-pointer flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>{t('messages.title')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('auth.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth">
                  {t('auth.login')}
                </Link>
              </Button>
              <Button asChild>
                <Link to="/auth">
                  {t('auth.register')}
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-96">
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  {t('app.name')}
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col gap-2">
                {currentUser && (
                  <div className="flex items-center gap-4 p-4 mb-4 bg-muted/30 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentUser.avatar || undefined} alt={currentUser.username} />
                      <AvatarFallback className="bg-primary-100 text-primary-700">
                        {currentUser.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{currentUser.username}</p>
                      <Link to={`/profile/${currentUser.id}`} className="text-sm text-muted-foreground hover:text-primary">
                        {t('profile.view')}
                      </Link>
                    </div>
                  </div>
                )}
                
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    variant={isActiveRoute(item.path) ? "secondary" : "ghost"}
                    className={`justify-start gap-2 ${isActiveRoute(item.path) ? "bg-secondary/20" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                    asChild
                  >
                    <Link to={item.path}>
                      {item.icon}
                      {item.label}
                    </Link>
                  </Button>
                ))}
                
                {currentUser && (
                  <>
                    <Button variant="ghost" className="justify-start gap-2" asChild>
                      <Link to="/messages" onClick={() => setMobileMenuOpen(false)}>
                        <MessageSquare className="h-4 w-4" />
                        {t('messages.title')}
                        {notifications > 0 && (
                          <Badge className="ml-2" variant="destructive">
                            {notifications}
                          </Badge>
                        )}
                      </Link>
                    </Button>
                    <Button variant="outline" className="justify-start gap-2 mt-2" asChild>
                      <Link to="/threads/new" onClick={() => setMobileMenuOpen(false)}>
                        <Plus className="h-4 w-4" />
                        {t('threads.create')}
                      </Link>
                    </Button>
                  </>
                )}
                
                <div className="mt-auto pt-6">
                  {currentUser ? (
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('auth.logout')}
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/auth">
                          {t('auth.login')}
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/auth">
                          {t('auth.register')}
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}