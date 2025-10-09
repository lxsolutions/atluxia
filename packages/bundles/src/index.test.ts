


import { 
  defaultBundles, 
  getBundle, 
  getAllBundles, 
  getDefaultBundle, 
  validateBundle, 
  applyBundleFilters,
  type Bundle 
} from './index';

describe('Bundles Package', () => {
  test('should have default bundles', () => {
    expect(defaultBundles.bundles.length).toBeGreaterThan(0);
    expect(defaultBundles.defaultBundle).toBeDefined();
  });

  test('should get bundle by ID', () => {
    const bundle = getBundle('default-strict');
    expect(bundle).toBeDefined();
    expect(bundle?.name).toBe('Default Strict Moderation');
  });

  test('should return undefined for non-existent bundle', () => {
    const bundle = getBundle('non-existent');
    expect(bundle).toBeUndefined();
  });

  test('should get all bundles', () => {
    const bundles = getAllBundles();
    expect(bundles.length).toBe(3);
    expect(bundles[0].id).toBe('default-strict');
    expect(bundles[1].id).toBe('family-friendly');
    expect(bundles[2].id).toBe('developer-community');
  });

  test('should get default bundle', () => {
    const bundle = getDefaultBundle();
    expect(bundle.id).toBe('default-strict');
  });

  test('should validate bundle correctly', () => {
    const validBundle: Partial<Bundle> = {
      id: 'test',
      name: 'Test Bundle',
      description: 'Test description',
      version: '1.0.0',
      metadata: {
        maintainer: 'Test Maintainer',
        lastUpdated: new Date().toISOString()
      }
    };

    const errors = validateBundle(validBundle);
    expect(errors).toHaveLength(0);

    const invalidBundle: Partial<Bundle> = {
      id: '',
      name: '',
      description: '',
      version: '',
      metadata: {
        maintainer: '',
        lastUpdated: ''
      }
    };

    const invalidErrors = validateBundle(invalidBundle);
    expect(invalidErrors).toHaveLength(6);
  });

  test('should apply bundle filters correctly', () => {
    const bundle = getBundle('default-strict')!;
    
    // Test blocked content
    expect(applyBundleFilters('Buy now limited time offer!', 'test-author', bundle)).toBe(false);
    expect(applyBundleFilters('This is hate speech content', 'test-author', bundle)).toBe(false);
    
    // Test allowed content (must match allow list keywords)
    expect(applyBundleFilters('Discussion about decentralized systems', 'test-author', bundle)).toBe(true);
    expect(applyBundleFilters('Open source software is great', 'test-author', bundle)).toBe(false); // Doesn't match "opensource" exactly
    expect(applyBundleFilters('Privacy is important', 'test-author', bundle)).toBe(true);
  });

  test('should handle family-friendly bundle filters', () => {
    const bundle = getBundle('family-friendly')!;
    
    // Test blocked content
    expect(applyBundleFilters('Explicit adult content here', 'test-author', bundle)).toBe(false);
    expect(applyBundleFilters('This shit is bad', 'test-author', bundle)).toBe(false);
    
    // Test allowed content
    expect(applyBundleFilters('Educational content for kids', 'test-author', bundle)).toBe(true);
  });

  test('should handle developer community bundle filters', () => {
    const bundle = getBundle('developer-community')!;
    
    // Test blocked content
    expect(applyBundleFilters('Buy Instagram followers now!', 'test-author', bundle)).toBe(false);
    
    // Test allowed content
    expect(applyBundleFilters('JavaScript programming discussion', 'test-author', bundle)).toBe(true);
    expect(applyBundleFilters('Python code examples', 'test-author', bundle)).toBe(true);
  });

  test('should handle author allow/block lists', () => {
    const bundle: Bundle = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      version: '1.0.0',
      allowLists: {
        authors: ['allowed-author']
      },
      blockLists: {
        authors: ['blocked-author']
      },
      filters: {},
      metadata: {
        maintainer: 'Test',
        lastUpdated: new Date().toISOString()
      }
    };

    expect(applyBundleFilters('Any content', 'blocked-author', bundle)).toBe(false);
    expect(applyBundleFilters('Any content', 'allowed-author', bundle)).toBe(true);
    expect(applyBundleFilters('Any content', 'other-author', bundle)).toBe(false); // Not in allow list
  });
});


