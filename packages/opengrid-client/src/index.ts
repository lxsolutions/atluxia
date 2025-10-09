

export interface OpenGridClientOptions {
  baseUrl: string;
  apiKey?: string;
}

export class OpenGridClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(options: OpenGridClientOptions) {
    this.baseUrl = options.baseUrl;
    this.apiKey = options.apiKey;
  }

  async getHealth(): Promise<any> {
    return this.request('/health');
  }

  async getStatus(): Promise<any> {
    return this.request('/status');
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`OpenGrid API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

export default OpenGridClient;

