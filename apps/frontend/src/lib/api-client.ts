const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: any[];
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: number;
  refreshTokenExpiry: number;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active?: boolean;
  last_login_at?: string | null;
  created_at?: string;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  private saveTokensToStorage(tokens: AuthTokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('accessTokenExpiry', tokens.accessTokenExpiry.toString());
      localStorage.setItem('refreshTokenExpiry', tokens.refreshTokenExpiry.toString());
    }
  }

  private clearTokensFromStorage() {
    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accessTokenExpiry');
      localStorage.removeItem('refreshTokenExpiry');
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        this.clearTokensFromStorage();
        return false;
      }

      const data: ApiResponse<AuthTokens> = await response.json();
      if (data.success && data.data) {
        this.saveTokensToStorage(data.data);
        return true;
      }

      this.clearTokensFromStorage();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokensFromStorage();
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // If 401, try to refresh token and retry once
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed && this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
        });
      }
    }

    return response.json();
  }

  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    franchise_name: string;
  }): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string; requireMfa?: boolean }>> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<ApiResponse<any>> {
    const response = await this.request('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    this.clearTokensFromStorage();
    return response;
  }

  async googleCallback(data: {
    code: string;
    state?: string;
  }): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> {
    return this.request('/api/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async microsoftCallback(data: {
    code: string;
    state?: string;
  }): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> {
    return this.request('/api/auth/microsoft/callback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  setTokens(tokens: AuthTokens) {
    this.saveTokensToStorage(tokens);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  clearTokens() {
    this.clearTokensFromStorage();
  }

  // MFA Endpoints
  async setupMfa(): Promise<ApiResponse<{ secret: string; otpauthUrl: string }>> {
    return this.request('/api/auth/mfa/setup', {
      method: 'POST',
    });
  }

  async confirmMfa(token: string): Promise<ApiResponse<{ recoveryCodes: string[] }>> {
    return this.request('/api/auth/mfa/confirm', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async verifyMfaLogin(mfaToken: string, token: string): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string; accessTokenExpiry: number; refreshTokenExpiry: number }>> {
    return this.request('/api/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ mfaToken, token }),
    });
  }

  // User Management Endpoints
  async getUsers(): Promise<ApiResponse<{ users: User[] }>> {
    return this.request('/api/users', {
      method: 'GET',
    });
  }

  async updateUser(userId: string, data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return this.request(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/api/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Invitation Endpoints
  async getInvitations(): Promise<ApiResponse<{ invitations: any[] }>> {
    return this.request('/api/invitations', {
      method: 'GET',
    });
  }

  async inviteUser(data: { email: string; role: string }): Promise<ApiResponse<{ message: string; invitationId: string }>> {
    return this.request('/api/invitations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyInvitation(token: string): Promise<ApiResponse<{ email: string; role: string; franchise_id: string | null }>> {
    return this.request(`/api/invitations/verify/${token}`, {
      method: 'GET',
    });
  }

  async acceptInvitation(data: {
    token: string;
    first_name: string;
    last_name: string;
    password?: string;
  }): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> {
    return this.request('/api/invitations/accept', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Integrations Endpoints
  async getIntegrations(): Promise<ApiResponse<any[]>> {
    return this.request('/api/integrations', {
      method: 'GET',
    });
  }

  async connectClover(storeId?: string | null): Promise<ApiResponse<{ redirectUrl: string; state: string }>> {
    return this.request('/api/integrations/clover/connect', {
      method: 'POST',
      body: JSON.stringify({ store_id: storeId }),
    });
  }

  async connectSquare(storeId?: string | null): Promise<ApiResponse<{ redirectUrl: string; state: string }>> {
    return this.request('/api/integrations/square/connect', {
      method: 'POST',
      body: JSON.stringify({ store_id: storeId }),
    });
  }

  async connectHubspot(storeId?: string | null): Promise<ApiResponse<{ redirectUrl: string; state: string }>> {
    return this.request('/api/integrations/hubspot/connect', {
      method: 'POST',
      body: JSON.stringify({ store_id: storeId }),
    });
  }

  async connectCrm(): Promise<ApiResponse<any>> {
    return this.request('/api/integrations/crm/connect', {
      method: 'POST',
    });
  }

  async connectPayment(): Promise<ApiResponse<any>> {
    return this.request('/api/integrations/payment/connect', {
      method: 'POST',
    });
  }

  async triggerSync(integrationId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/api/integrations/${integrationId}/sync`, {
      method: 'POST',
    });
  }

  async getSyncHistory(integrationId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/api/integrations/${integrationId}/history`, {
      method: 'GET',
    });
  }

  async testIntegration(integrationId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/integrations/${integrationId}/test`, {
      method: 'POST',
    });
  }

  async disconnectIntegration(integrationId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/api/integrations/${integrationId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
