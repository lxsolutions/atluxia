export interface AIProviderConfig {
  provider: 'openai' | 'glm' | 'qwen' | 'local';
  model: string;
  apiKey?: string;
  baseURL?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface EmbeddingRequest {
  input: string | string[];
}

export interface EmbeddingResponse {
  embeddings: number[][];
  usage?: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface ProductAttributes {
  brand?: string;
  category?: string;
  color?: string;
  size?: string;
  material?: string;
  weight?: string;
  dimensions?: string;
  warranty?: string;
  features?: string[];
}

export interface ProductExtractionResult {
  attributes: ProductAttributes;
  confidence: number;
}