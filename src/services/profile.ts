import { config } from '../config';

export interface Photo {
  id: string;
  uri: string;
}

export interface Prompt {
  id: string;
  question: string;
  answer: string;
}

export interface ProfileData {
  photos: Photo[];
  bio: string;
  prompts: Prompt[];
}

export interface DiscoverProfile {
  id: string;
  userId: string;
  name: string;
  age?: string;
  location?: string;
  bio: string;
  photos: Photo[];
  prompts: Prompt[];
  job?: string;
  school?: string;
  height?: string;
  gender?: string;
  languages?: string;
  religion?: string;
  reviewerQuestion?: string;
}

export const getRandomProfile = async (token: string): Promise<DiscoverProfile> => {
  try {
    const response = await fetch(`${config.api.baseUrl}/api/profile/random`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch random profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching random profile:', error);
    throw error;
  }
};

export const createProfile = async (data: ProfileData, token: string): Promise<any> => {
  try {
    const formData = new FormData();
    
    // Add bio
    formData.append('bio', data.bio);
    
    // Add prompts as JSON string
    formData.append('prompts', JSON.stringify(data.prompts));
    
    // Add photos
    data.photos.forEach((photo, index) => {
      // Convert uri to file object
      const photoFile = {
        uri: photo.uri,
        type: 'image/jpeg', // You might want to detect this dynamically
        name: `photo-${index}.jpg`
      } as any;
      
      formData.append('photos', photoFile);
    });

    const response = await fetch(`${config.api.baseUrl}/api/profile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};

export const getProfile = async (userId: string, token: string): Promise<any> => {
  try {
    const response = await fetch(`${config.api.baseUrl}/api/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const updateProfile = async (data: ProfileData, token: string): Promise<any> => {
  try {
    const formData = new FormData();
    
    // Add bio
    formData.append('bio', data.bio);
    
    // Add prompts as JSON string
    formData.append('prompts', JSON.stringify(data.prompts));
    
    // Add photos
    data.photos.forEach((photo, index) => {
      // Convert uri to file object
      const photoFile = {
        uri: photo.uri,
        type: 'image/jpeg', // You might want to detect this dynamically
        name: `photo-${index}.jpg`
      } as any;
      
      formData.append('photos', photoFile);
    });

    const response = await fetch(`${config.api.baseUrl}/api/profile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}; 