import { config } from '../config';

export interface PhotoFeedback {
  id: string;
  uri: string;
  ratings: {
    keep: number;
    neutral: number;
    remove: number;
  };
  totalRatings: number;
  score: number; // keep - remove
}

export interface PromptFeedback {
  id: string;
  question: string;
  answer: string;
  ratings: {
    keep: number;
    neutral: number;
    remove: number;
  };
  totalRatings: number;
  score: number; // keep - remove
}

export interface QuestionResponse {
  id: string;
  question: string;
  type: 'mc' | 'open';
  options?: string[];
  responses: { user: string; answer: string }[];
  totalResponses: number;
}

export interface FeedbackData {
  totalRatings: number;
  photos: PhotoFeedback[];
  prompts: PromptFeedback[];
  questions: QuestionResponse[];
}

class FeedbackService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.api.baseUrl;
  }

  async getFeedbackData(token: string): Promise<FeedbackData> {
    try {
      console.log('=== FEEDBACK SERVICE: Making API call ===');
      console.log('Base URL:', this.baseUrl);
      console.log('Full URL:', `${this.baseUrl}/api/feedback`);
      
      const response = await fetch(`${this.baseUrl}/api/feedback`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('=== FEEDBACK SERVICE: Response received ===');
      console.log('Status:', response.status);
      console.log('OK:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('=== FEEDBACK SERVICE: Data parsed ===');
      console.log('Data structure:', {
        totalRatings: data.totalRatings,
        photosCount: data.photos?.length || 0,
        promptsCount: data.prompts?.length || 0,
        questionsCount: data.questions?.length || 0
      });
      return data;
    } catch (error) {
      console.error('=== FEEDBACK SERVICE: Error ===', error);
      throw error;
    }
  }

  async getPhotoFeedback(token: string, photoId: string): Promise<PhotoFeedback> {
    try {
      const response = await fetch(`${this.baseUrl}/api/feedback/photos/${photoId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching photo feedback:', error);
      throw error;
    }
  }

  async getPromptFeedback(token: string, promptId: string): Promise<PromptFeedback> {
    try {
      const response = await fetch(`${this.baseUrl}/api/feedback/prompts/${promptId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching prompt feedback:', error);
      throw error;
    }
  }
}

export const feedbackService = new FeedbackService(); 