export type MessageRole = 'user' | 'assistant';
export type ResponseMode = 'online' | 'offline' | 'error';

export type ChatMessage = {
  id: string;
  role: MessageRole;
  text: string;
  mode?: ResponseMode;
};

export type ConnectionSettings = {
  apiUrl: string;
  familyKey: string;
};
