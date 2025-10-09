

export interface Bundle {
  id: string;
  name: string;
  description: string;
  version: string;
  allowLists: {
    authors?: string[];
    domains?: string[];
    keywords?: string[];
  };
  blockLists: {
    authors?: string[];
    domains?: string[];
    keywords?: string[];
    regexPatterns?: string[];
  };
  filters: {
    minAuthorReputation?: number;
    maxContentLength?: number;
    requireVerified?: boolean;
  };
  metadata: {
    maintainer: string;
    lastUpdated: string;
    transparencyUrl?: string;
  };
}

export interface BundleRegistry {
  bundles: Bundle[];
  defaultBundle: string;
}

// Default moderation bundles
export const defaultBundles: BundleRegistry = {
  bundles: [
    {
      id: "default-strict",
      name: "Default Strict Moderation",
      description: "Balanced moderation with basic spam and hate speech filtering",
      version: "1.0.0",
      allowLists: {
        keywords: ["opensource", "decentralized", "privacy"]
      },
      blockLists: {
        keywords: [
          "spam", "scam", "phishing", "malware",
          "hate speech", "racism", "bigotry",
          "nsfw", "explicit", "pornography"
        ],
        regexPatterns: [
          "buy now|limited time|special offer",
          "free.*gift|free.*download",
          "click.*here|subscribe.*now"
        ]
      },
      filters: {
        minAuthorReputation: 0.3,
        maxContentLength: 1000,
        requireVerified: false
      },
      metadata: {
        maintainer: "PolyVerse Team",
        lastUpdated: new Date().toISOString(),
        transparencyUrl: "https://github.com/lxsolutions/polyverse/bundles/default-strict"
      }
    },
    {
      id: "family-friendly",
      name: "Family Friendly",
      description: "Extra strict filtering for family-friendly content",
      version: "1.0.0",
      allowLists: {
        keywords: ["education", "learning", "family", "kids"]
      },
      blockLists: {
        keywords: [
          "nsfw", "explicit", "adult", "porn",
          "violence", "gore", "drugs", "alcohol",
          "gambling", "cursing", "profanity"
        ],
        regexPatterns: [
          "fuck|shit|asshole|bitch",
          "drug.*use|alcohol.*abuse",
          "gambling.*site|casino.*online"
        ]
      },
      filters: {
        minAuthorReputation: 0.5,
        maxContentLength: 500,
        requireVerified: true
      },
      metadata: {
        maintainer: "PolyVerse Team",
        lastUpdated: new Date().toISOString(),
        transparencyUrl: "https://github.com/lxsolutions/polyverse/bundles/family-friendly"
      }
    },
    {
      id: "developer-community",
      name: "Developer Community",
      description: "Focused on technical content with relaxed moderation",
      version: "1.0.0",
      allowLists: {
        keywords: [
          "programming", "development", "code",
          "opensource", "github", "gitlab",
          "javascript", "python", "go", "rust"
        ]
      },
      blockLists: {
        keywords: [
          "spam", "scam", "phishing",
          "hate speech", "harassment"
        ],
        regexPatterns: [
          "buy.*followers|instagram.*growth",
          "youtube.*views|tiktok.*famous"
        ]
      },
      filters: {
        minAuthorReputation: 0.1,
        maxContentLength: 2000,
        requireVerified: false
      },
      metadata: {
        maintainer: "PolyVerse Team",
        lastUpdated: new Date().toISOString(),
        transparencyUrl: "https://github.com/lxsolutions/polyverse/bundles/developer-community"
      }
    }
  ],
  defaultBundle: "default-strict"
};

export function getBundle(bundleId: string): Bundle | undefined {
  return defaultBundles.bundles.find(bundle => bundle.id === bundleId);
}

export function getAllBundles(): Bundle[] {
  return defaultBundles.bundles;
}

export function getDefaultBundle(): Bundle {
  return defaultBundles.bundles.find(bundle => bundle.id === defaultBundles.defaultBundle) || defaultBundles.bundles[0];
}

export function validateBundle(bundle: Partial<Bundle>): string[] {
  const errors: string[] = [];
  
  if (!bundle.id) errors.push("Bundle ID is required");
  if (!bundle.name) errors.push("Bundle name is required");
  if (!bundle.description) errors.push("Bundle description is required");
  if (!bundle.version) errors.push("Bundle version is required");
  if (!bundle.metadata?.maintainer) errors.push("Bundle maintainer is required");
  if (!bundle.metadata?.lastUpdated) errors.push("Bundle lastUpdated is required");
  
  return errors;
}

export function applyBundleFilters(content: string, author: string, bundle: Bundle): boolean {
  // Check block lists first
  if (bundle.blockLists.keywords) {
    for (const keyword of bundle.blockLists.keywords) {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        return false;
      }
    }
  }
  
  if (bundle.blockLists.regexPatterns) {
    for (const pattern of bundle.blockLists.regexPatterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(content)) {
        return false;
      }
    }
  }
  
  if (bundle.blockLists.authors && bundle.blockLists.authors.includes(author)) {
    return false;
  }
  
  // Check allow lists (if any allow lists are defined, content must match at least one)
  const hasAllowLists = 
    (bundle.allowLists.keywords && bundle.allowLists.keywords.length > 0) ||
    (bundle.allowLists.authors && bundle.allowLists.authors.length > 0);
  
  if (hasAllowLists) {
    let allowed = false;
    
    if (bundle.allowLists.keywords) {
      for (const keyword of bundle.allowLists.keywords) {
        if (content.toLowerCase().includes(keyword.toLowerCase())) {
          allowed = true;
          break;
        }
      }
    }
    
    if (!allowed && bundle.allowLists.authors && bundle.allowLists.authors.includes(author)) {
      allowed = true;
    }
    
    if (!allowed) {
      return false;
    }
  }
  
  // If no allow lists are defined, allow all content that passes block lists
  return true;
}

