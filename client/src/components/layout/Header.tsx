import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  currentUser: {
    id: number;
    username: string;
  };
  notifications: number;
}

const Header = ({ currentUser, notifications }: HeaderProps) => {
  const [location] = useLocation();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-primary-500 text-2xl mr-2 ri-heart-pulse-fill"></span>
              <span className="font-heading font-bold text-primary-500 text-xl">{t('header.support')}</span>
            </Link>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/" 
                className={`${location === '/' ? 'border-primary-500 text-neutral-700' : 'border-transparent hover:border-neutral-300 text-neutral-500 hover:text-neutral-700'} border-b-2 inline-flex items-center px-1 pt-1 text-sm font-medium`}
              >
                {t('header.feed')}
              </Link>
              <Link 
                href="/my-threads" 
                className={`${location === '/my-threads' ? 'border-primary-500 text-neutral-700' : 'border-transparent hover:border-neutral-300 text-neutral-500 hover:text-neutral-700'} border-b-2 inline-flex items-center px-1 pt-1 text-sm font-medium`}
              >
                {t('header.myThreads')}
              </Link>
              <Link 
                href="/messages" 
                className={`${location === '/messages' ? 'border-primary-500 text-neutral-700' : 'border-transparent hover:border-neutral-300 text-neutral-500 hover:text-neutral-700'} border-b-2 inline-flex items-center px-1 pt-1 text-sm font-medium`}
              >
                {t('header.messages')}
              </Link>
              <Link 
                href="/resources" 
                className={`${location === '/resources' ? 'border-primary-500 text-neutral-700' : 'border-transparent hover:border-neutral-300 text-neutral-500 hover:text-neutral-700'} border-b-2 inline-flex items-center px-1 pt-1 text-sm font-medium`}
              >
                {t('header.resources')}
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <div className="hidden sm:flex items-center">
              <button className="p-2 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <span className="ri-search-line text-xl"></span>
              </button>
              <div className="relative ml-3">
                <button className="p-2 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <span className="ri-notification-3-line text-xl"></span>
                  {notifications > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-status-error ring-2 ring-white"></span>
                  )}
                </button>
              </div>
            </div>
            <div className="relative ml-3">
              <div>
                <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <div className="h-8 w-8 rounded-full bg-accent-200 flex items-center justify-center">
                    <span className="font-medium text-accent-700">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>
              </div>
            </div>
            <div className="ml-3 md:hidden">
              <button 
                className="p-2 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={toggleMobileMenu}
              >
                <span className="ri-menu-line text-xl"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/" className={location === '/' ? "bg-primary-50 text-primary-700 block px-3 py-2 rounded-md text-base font-medium" : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 block px-3 py-2 rounded-md text-base font-medium"}>
              {t('header.feed')}
            </Link>
            <Link href="/my-threads" className={location === '/my-threads' ? "bg-primary-50 text-primary-700 block px-3 py-2 rounded-md text-base font-medium" : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 block px-3 py-2 rounded-md text-base font-medium"}>
              {t('header.myThreads')}
            </Link>
            <Link href="/messages" className={location === '/messages' ? "bg-primary-50 text-primary-700 block px-3 py-2 rounded-md text-base font-medium" : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 block px-3 py-2 rounded-md text-base font-medium"}>
              {t('header.messages')}
            </Link>
            <Link href="/resources" className={location === '/resources' ? "bg-primary-50 text-primary-700 block px-3 py-2 rounded-md text-base font-medium" : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 block px-3 py-2 rounded-md text-base font-medium"}>
              {t('header.resources')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
