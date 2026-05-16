import { createContext } from 'react';

export interface IMessage {
  role: string;
  content: string;
}

export interface IChatState {
  abortRequest: () => void;
  loading: boolean;
  model: string;
  messages: IMessage[];
  mode: string;
  sendMessage: (message: string) => Promise<void>;
  setModel: (model: string) => void;
  setMode: (mode: string) => void;
  webSearch: boolean;
  setWebSearch: (value: boolean) => void;
  setMessages: (message: IMessage[]) => void;
  regenerateLastMessage: () => Promise<void>;
}

export const ChatAiContext = createContext<Partial<IChatState>>({});
