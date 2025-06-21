import { config } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CreateTestWithReplacementData {
  itemType: 'photo' | 'prompt';
  originalItemId: number;
  replacementQuestion?: string;
  replacementAnswer?: string;
  customQuestion?: string;
  replacementPhoto?: any; // File object for photo upload
}

export interface CreateTestData {
  type: 'full_profile' | 'single_photo' | 'single_prompt';
  photoId?: number; // Required for single_photo
  promptId?: number; // Required for single_prompt
}

export interface TestResponse {
  id: number;
  type: string;
  status: string;
  cost: number;
  started_at: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

class TestService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async createTest(data: CreateTestData): Promise<TestResponse> {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${config.api.baseUrl}/api/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create test');
    }

    return response.json();
  }

  async createTestWithReplacement(data: CreateTestWithReplacementData): Promise<TestResponse> {
    const formData = new FormData();
    
    formData.append('itemType', data.itemType);
    formData.append('originalItemId', data.originalItemId.toString());
    
    if (data.replacementQuestion) {
      formData.append('replacementQuestion', data.replacementQuestion);
    }
    
    if (data.replacementAnswer) {
      formData.append('replacementAnswer', data.replacementAnswer);
    }
    
    if (data.customQuestion) {
      formData.append('customQuestion', data.customQuestion);
    }
    
    if (data.replacementPhoto) {
      formData.append('replacementPhoto', data.replacementPhoto);
    }

    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${config.api.baseUrl}/api/test/with-replacement`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create test');
    }

    return response.json();
  }

  async getTest(testId: number): Promise<any> {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${config.api.baseUrl}/api/test/${testId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get test');
    }

    return response.json();
  }

  async submitRating(testId: number, data: {
    itemType: 'photo' | 'prompt' | 'bio';
    itemId: number;
    rating: number;
    feedback?: string;
    isAnonymous?: boolean;
  }): Promise<any> {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${config.api.baseUrl}/api/test/${testId}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit rating');
    }

    return response.json();
  }

  async completeTest(testId: number): Promise<any> {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${config.api.baseUrl}/api/test/${testId}/complete`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to complete test');
    }

    return response.json();
  }
}

export const testService = new TestService(); 