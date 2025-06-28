
const API_BASE_URL = 'http://10.127.1.23/phdtimeoff-api';

const AUTH_TOKEN_KEY = 'auth_token';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class ApiService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AUTH_TOKEN_KEY}`,
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Leave operations
  async getLeaves(studentId?: string, status?: string) {
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', studentId);
    if (status) params.append('status', status);

    return this.makeRequest(`/leaves/?${params.toString()}`);
  }

  async createLeave(leaveData: any) {
    return this.makeRequest('/leaves/', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
  }

  async updateLeave(leaveData: any) {
    return this.makeRequest('/leaves/', {
      method: 'PUT',
      body: JSON.stringify(leaveData),
    });
  }

  // User operations
  async getUsers() {
    return this.makeRequest('/users/');
  }

  async createUser(userData: any) {
    return this.makeRequest('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userData: any) {
    return this.makeRequest('/users/', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.makeRequest(`/users/?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Holiday operations
  async getHolidays() {
    return this.makeRequest('/holidays/');
  }

  async createHoliday(holidayData: any) {
    return this.makeRequest('/holidays/', {
      method: 'POST',
      body: JSON.stringify(holidayData),
    });
  }

  async updateHoliday(holidayData: any) {
    return this.makeRequest('/holidays/', {
      method: 'PUT',
      body: JSON.stringify(holidayData),
    });
  }

  async deleteHoliday(id: string) {
    return this.makeRequest(`/holidays/?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Authentication
  async login(email: string, password: string) {
    return this.makeRequest('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }
}

export const apiService = new ApiService();
