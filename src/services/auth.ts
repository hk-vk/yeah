import { User, LoginCredentials, SignupCredentials } from '../types/auth';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class AuthService {
  private static readonly STORAGE_KEY = 'auth_user';

  static async login({ email, password }: LoginCredentials): Promise<User> {
    // Simulate API call
    await delay(1000);
    
    // Basic validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // In a real app, this would be an API call
    const user: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      createdAt: new Date().toISOString()
    };

    // Store user in localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    
    return user;
  }

  static async signup({ email, password, name }: SignupCredentials): Promise<User> {
    // Simulate API call
    await delay(1000);
    
    // Basic validation
    if (!email || !password || !name) {
      throw new Error('All fields are required');
    }

    // In a real app, this would be an API call
    const user: User = {
      id: '1',
      email,
      name,
      createdAt: new Date().toISOString()
    };

    // Store user in localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    
    return user;
  }

  static logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  }
}
