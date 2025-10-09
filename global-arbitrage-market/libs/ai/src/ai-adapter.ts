import OpenAI from 'openai';
import {
  AIProviderConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  EmbeddingRequest,
  EmbeddingResponse,
  ProductExtractionResult,
  ProductAttributes,
} from './types';

export class AIAdapter {
  private config: AIProviderConfig;
  private openai: OpenAI | null = null;

  constructor(config: AIProviderConfig) {
    this.config = config;
    this.initializeClient();
  }

  private initializeClient() {
    const { provider, apiKey, baseURL } = this.config;

    if (provider === 'openai' || provider === 'glm') {
      this.openai = new OpenAI({
        apiKey: apiKey || process.env.AI_API_KEY,
        baseURL: baseURL || this.getDefaultBaseURL(provider),
      });
    } else if (provider === 'local') {
      this.openai = new OpenAI({
        apiKey: 'local',
        baseURL: baseURL || 'http://localhost:8080/v1',
      });
    }
    // For qwen and other providers, we'd implement custom clients
  }

  private getDefaultBaseURL(provider: string): string {
    switch (provider) {
      case 'glm':
        return 'https://open.bigmodel.cn/api/paas/v4/';
      case 'openai':
        return 'https://api.openai.com/v1';
      default:
        return 'https://api.openai.com/v1';
    }
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.openai) {
      throw new Error('AI client not initialized');
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: request.messages,
        temperature: request.temperature || 0.1,
        max_tokens: request.max_tokens || 1000,
      });

      return {
        content: completion.choices[0]?.message?.content || '',
        usage: completion.usage ? {
          prompt_tokens: completion.usage.prompt_tokens,
          completion_tokens: completion.usage.completion_tokens,
          total_tokens: completion.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error('AI chat completion error:', error);
      throw new Error(`AI service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createEmbeddings(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    if (!this.openai) {
      throw new Error('AI client not initialized');
    }

    try {
      const embedding = await this.openai.embeddings.create({
        model: this.getEmbeddingModel(),
        input: request.input,
      });

      return {
        embeddings: embedding.data.map(item => item.embedding),
        usage: embedding.usage ? {
          prompt_tokens: embedding.usage.prompt_tokens,
          total_tokens: embedding.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error('AI embedding error:', error);
      // Fallback to simple embedding for development
      return this.fallbackEmbedding(request.input);
    }
  }

  private getEmbeddingModel(): string {
    switch (this.config.provider) {
      case 'openai':
        return 'text-embedding-3-small';
      case 'glm':
        return 'embedding-2';
      default:
        return 'text-embedding-3-small';
    }
  }

  private fallbackEmbedding(input: string | string[]): EmbeddingResponse {
    const inputs = Array.isArray(input) ? input : [input];
    const embeddings = inputs.map(text => {
      // Simple hash-based embedding for development
      const hash = this.simpleHash(text);
      const embedding = new Array(384).fill(0);
      for (let i = 0; i < 384; i++) {
        embedding[i] = Math.sin(hash + i) * 0.1;
      }
      return embedding;
    });

    return {
      embeddings,
    };
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  async extractProductAttributes(
    title: string,
    description?: string,
    specs?: string
  ): Promise<ProductExtractionResult> {
    const prompt = `
Extract product attributes from the following information:

Title: ${title}
${description ? `Description: ${description}` : ''}
${specs ? `Specifications: ${specs}` : ''}

Please extract the following attributes in JSON format:
- brand (string)
- category (string)
- color (string)
- size (string)
- material (string)
- weight (string)
- dimensions (string)
- warranty (string)
- features (array of strings)

Return only valid JSON, no additional text.
    `;

    const response = await this.chatCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are a product data extraction specialist. Extract structured attributes from product information and return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
    });

    try {
      const attributes = JSON.parse(response.content) as ProductAttributes;
      return {
        attributes,
        confidence: 0.9, // Simple confidence score
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return {
        attributes: {},
        confidence: 0.1,
      };
    }
  }

  async rewriteProductTitle(
    brand: string,
    attributes: ProductAttributes,
    tone: 'clear' | 'trustworthy' | 'professional' = 'clear'
  ): Promise<string> {
    const prompt = `
Rewrite the product title to be ${tone}, trustworthy, and not hype.

Brand: ${brand}
Attributes: ${JSON.stringify(attributes, null, 2)}

Guidelines:
- Be clear and descriptive
- Include key attributes like size, color, material
- Avoid superlatives like "best", "amazing", "guaranteed"
- Keep it under 80 characters
- Make it SEO-friendly

Return only the rewritten title, no additional text.
    `;

    const response = await this.chatCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are a professional product title writer. Create clear, trustworthy product titles that follow e-commerce best practices.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    return response.content.trim();
  }

  async generateProductDescription(
    title: string,
    attributes: ProductAttributes,
    tone: 'clear' | 'trustworthy' | 'professional' = 'clear'
  ): Promise<string> {
    const prompt = `
Generate a product description that is ${tone} and trustworthy.

Title: ${title}
Attributes: ${JSON.stringify(attributes, null, 2)}

Guidelines:
- Be factual and descriptive
- Highlight key features and benefits
- Avoid hype and superlatives
- Include relevant specifications
- Keep it between 100-200 words
- Use bullet points for features

Return the description in markdown format.
    `;

    const response = await this.chatCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are a professional product description writer. Create clear, factual product descriptions that build trust with customers.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.4,
    });

    return response.content.trim();
  }
}