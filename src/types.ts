export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface UserInfo {
  firstName: string;
  email: string;
}

export type ChatState = 'onboarding' | 'chatting' | 'feedback' | 'completed';
