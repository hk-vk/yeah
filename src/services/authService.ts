const API_URL = 'http://localhost:8000';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  name?: string;
}

export const authService = {
  async login(data: LoginData) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    return response.json();
  },

  async register(data: RegisterData) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    return response.json();
  },

  async logout() {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Logout failed');
    }
    
    return response.json();
  }
};
