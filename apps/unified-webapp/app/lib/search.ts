// Cross-module search functionality

export interface SearchResult {
  id: string;
  type: 'user' | 'course' | 'booking' | 'post' | 'critter' | 'quest';
  title: string;
  description: string;
  module: 'nomad' | 'polyverse' | 'everpath' | 'critters';
  url: string;
  relevance: number;
}

// Mock search data for development
export const mockSearchData: SearchResult[] = [
  // Nomad Life results
  {
    id: 'nomad-1',
    type: 'booking',
    title: 'Bali Villa Booking',
    description: 'Accommodation in Bali from Nov 15-30',
    module: 'nomad',
    url: '/nomad/bookings/1',
    relevance: 0.95
  },
  {
    id: 'nomad-2',
    type: 'booking',
    title: 'Tokyo Apartment',
    description: 'Pending visa application for Tokyo trip',
    module: 'nomad',
    url: '/nomad/bookings/2',
    relevance: 0.85
  },
  
  // Polyverse results
  {
    id: 'polyverse-1',
    type: 'user',
    title: 'Alex Chen',
    description: 'Tech Innovators group member',
    module: 'polyverse',
    url: '/polyverse/profile/alex-chen',
    relevance: 0.90
  },
  {
    id: 'polyverse-2',
    type: 'post',
    title: 'Sustainable Technology Discussion',
    description: 'Recent post about sustainable tech trends',
    module: 'polyverse',
    url: '/polyverse/posts/123',
    relevance: 0.75
  },
  
  // Everpath results
  {
    id: 'everpath-1',
    type: 'course',
    title: 'Advanced React Patterns',
    description: 'Completed course on React patterns',
    module: 'everpath',
    url: '/everpath/courses/react-patterns',
    relevance: 0.88
  },
  {
    id: 'everpath-2',
    type: 'course',
    title: 'Cloud Architecture Fundamentals',
    description: 'In-progress course on cloud architecture',
    module: 'everpath',
    url: '/everpath/courses/cloud-architecture',
    relevance: 0.80
  },
  
  // Curio Critters results
  {
    id: 'critters-1',
    type: 'critter',
    title: 'Code Wiz',
    description: 'Rare critter collected in Programming Forest',
    module: 'critters',
    url: '/critters/critters/code-wiz',
    relevance: 0.92
  },
  {
    id: 'critters-2',
    type: 'quest',
    title: 'Geometry Guardian',
    description: 'Active quest to solve geometry puzzles',
    module: 'critters',
    url: '/critters/quests/geometry-guardian',
    relevance: 0.78
  }
];

export class SearchManager {
  private searchIndex: SearchResult[] = [];

  constructor() {
    // Load search index from localStorage or API
    this.loadSearchIndex();
  }

  private loadSearchIndex() {
    // In development, use mock data
    if (process.env.NODE_ENV === 'development') {
      this.searchIndex = mockSearchData;
    }
    // TODO: Load from API in production
  }

  search(query: string, filters?: { modules?: string[], types?: string[] }): SearchResult[] {
    if (!query.trim()) {
      return [];
    }

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    
    if (searchTerms.length === 0) {
      return [];
    }

    const results = this.searchIndex.map(item => {
      const searchableText = `${item.title} ${item.description}`.toLowerCase();
      let relevance = 0;

      // Calculate relevance based on search terms
      searchTerms.forEach(term => {
        if (item.title.toLowerCase().includes(term)) {
          relevance += 0.5;
        }
        if (item.description.toLowerCase().includes(term)) {
          relevance += 0.3;
        }
        if (searchableText.includes(term)) {
          relevance += 0.2;
        }
      });

      // Apply filters
      if (filters?.modules && !filters.modules.includes(item.module)) {
        relevance = 0;
      }
      if (filters?.types && !filters.types.includes(item.type)) {
        relevance = 0;
      }

      return { ...item, relevance };
    });

    // Filter and sort by relevance
    return results
      .filter(item => item.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10); // Limit to top 10 results
  }

  addToIndex(item: SearchResult): void {
    this.searchIndex.push(item);
  }

  removeFromIndex(id: string): void {
    this.searchIndex = this.searchIndex.filter(item => item.id !== id);
  }

  clearIndex(): void {
    this.searchIndex = [];
  }
}

// Global search manager instance
export const searchManager = new SearchManager();