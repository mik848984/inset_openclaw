import { createContext } from 'react';

// Source returned by web-search (Perplexity-like cards under the answer).
// Optional field — does NOT have to be persisted to Mongo; reload-safe
// because the same data is also embedded in `content` as a hidden marker.
export interface IMessageSource {
  title: string;
  url: string;
  domain?: string;
  snippet?: string;
  index?: number;
}

export interface IMessage {
  role: string;
  content: string;
  // Optional metadata for web-search responses (live streaming only;
  // after reload, sources are re-parsed from content marker).
  sources?: IMessageSource[];
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
  // Whether the user wants to see model reasoning (<think> blocks) in a
  // collapsible section. Default false: raw <think> never reaches the UI.
  reasoningEnabled: boolean;
  setReasoningEnabled: (value: boolean) => void;
}

export const ChatAiContext = createContext<Partial<IChatState>>({});
