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

// Visual reference returned by web-search (Perplexity-like image strip).
export interface IMessageImage {
  title?: string;
  imageUrl: string;
  sourceUrl?: string;
  domain?: string;
}

// Sub-types for advanced search widgets (v3/v4 metadata).
// Все поля опциональны и не сохраняются в Mongo — они re-parsed из marker
// при перезагрузке. UI gracefully скрывает виджеты, если данных нет.
export type IMessageSearchIntent =
  | 'general'
  | 'news'
  | 'comparison'
  | 'code'
  | 'weather'
  | 'places'
  | 'shopping'
  | 'image'
  | 'video'
  | 'scholar';

export interface IMessageSearchSummary {
  totalSources: number;
  readSources: number;
  domains: string[];
  intent: IMessageSearchIntent;
  generatedAt: string;
}

export interface IMessageComparison {
  query: string;
  criteria: string[];
  note: string;
}

export interface IMessageCodeFix {
  query: string;
  detectedStack: string[];
  safetyNote: string;
}

export interface IMessageNewsItem {
  title: string;
  url: string;
  domain: string;
  date?: string;
  snippet?: string;
}

export interface IMessageKnowledgeGraph {
  title: string;
  type?: string;
  description?: string;
  imageUrl?: string;
  website?: string;
  attributes?: Array<{ label: string; value: string }>;
}

export interface IMessagePeopleAlsoAsk {
  question: string;
  snippet?: string;
  url?: string;
  domain?: string;
}

export interface IMessagePlace {
  title: string;
  address?: string;
  rating?: number;
  ratingCount?: number;
  category?: string;
  url?: string;
  domain?: string;
  latitude?: number;
  longitude?: number;
  mapsUrl?: string;
}

export interface IMessageProduct {
  title: string;
  source?: string;
  url: string;
  price?: string;
  rating?: number;
  ratingCount?: number;
  imageUrl?: string;
  domain?: string;
}

export interface IMessageScholar {
  title: string;
  url: string;
  domain?: string;
  snippet?: string;
  authors?: string;
  year?: string;
  citedBy?: number;
}

export interface IMessageVideo {
  title: string;
  url: string;
  source?: string;
  domain?: string;
  date?: string;
  imageUrl?: string;
  channel?: string;
  duration?: string;
}

export interface IMessage {
  role: string;
  content: string;
  // Optional metadata for web-search responses (live streaming only;
  // after reload, sources/images/followUps are re-parsed from content marker).
  sources?: IMessageSource[];
  images?: IMessageImage[];
  followUps?: string[];
  // v3 widgets — заполняются для web-search ответов.
  intent?: IMessageSearchIntent | null;
  summary?: IMessageSearchSummary | null;
  comparison?: IMessageComparison | null;
  codeFix?: IMessageCodeFix | null;
  newsTimeline?: IMessageNewsItem[];
  // v4 widgets — knowledge graph, PAA, specialized endpoints.
  knowledgeGraph?: IMessageKnowledgeGraph | null;
  peopleAlsoAsk?: IMessagePeopleAlsoAsk[];
  news?: IMessageNewsItem[];
  places?: IMessagePlace[];
  shopping?: IMessageProduct[];
  scholar?: IMessageScholar[];
  videos?: IMessageVideo[];
}

export interface IProjectChip {
  _id: string;
  title: string;
  nextStep?: string;
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
  // ─── Project workspace state ────────────────────────────────────
  // Активный проект, в контексте которого идёт чат. `null` — обычный чат.
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  // Лёгкая «шапка» проекта для отображения в чате (название + следующий
  // шаг). Хранится отдельно от полной модели, чтобы не дергать /api/projects
  // на каждом рендере.
  activeProjectChip: IProjectChip | null;
  setActiveProjectChip: (chip: IProjectChip | null) => void;
  // Whether the user wants to see model reasoning (<think> blocks) in a
  // collapsible section. Default false: raw <think> never reaches the UI.
  reasoningEnabled: boolean;
  setReasoningEnabled: (value: boolean) => void;
}

export const ChatAiContext = createContext<Partial<IChatState>>({});
