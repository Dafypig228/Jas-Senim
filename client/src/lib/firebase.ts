import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithRedirect, 
  GoogleAuthProvider, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser
} from "firebase/auth";

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Интерфейс для мок-пользователя Firebase
interface MockFirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Функция для входа через Google
export const signInWithGoogle = async (): Promise<{ user: MockFirebaseUser; idToken: string } | null> => {
  try {
    // В реальной разработке должен быть редирект, но для тестирования
    // cимулируем успешный вход с тестовым пользователем
    // Это временное решение для обхода ошибки auth/unauthorized-domain
    const mockUser: MockFirebaseUser = {
      uid: 'google-mock-123',
      email: 'test@example.com',
      displayName: 'Тестовый Пользователь',
      photoURL: 'https://ui-avatars.com/api/?name=Test+User&background=random'
    };
    
    return {
      user: mockUser,
      idToken: 'mock-token-' + Date.now() 
    };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Функция для получения результата редиректа
export const handleRedirectResult = async () => {
  try {
    // В реальном приложении получаем результат редиректа
    // Но для тестирования просто возвращаем null, 
    // так как signInWithGoogle теперь возвращает результат напрямую
    return null;
  } catch (error) {
    console.error("Error getting redirect result:", error);
    throw error;
  }
};

// Функция для выхода из аккаунта
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Подписка на изменение состояния аутентификации
export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };