










// Enhanced moderation system with keyword and ML-based detection
const keywordFilters = [
  { pattern: /(spam|buy now|free gift)/i, category: 'promotional' },
  { pattern: /(nsfw|explicit|18\+)/i, category: 'adult_content' },
  { pattern: /(hate|racist|bigot)/i, category: 'hate_speech' }
];

function getLabels(event) {
  const labels = [];

  // Check for spam keywords
  if (event.body && event.body.text) {
    keywordFilters.forEach(filter => {
      if (filter.pattern.test(event.body.text)) {
        labels.push({
          label: filter.category,
          confidence: 0.8, // Mock confidence score
          evidence: `Keyword match: ${filter.pattern.source}`
        });
      }
    });

    // Additional ML-based analysis simulation
    const text = event.body.text.toLowerCase();
    if (text.includes('subscribe')) {
      labels.push({
        label: 'promotional',
        confidence: 0.95,
        evidence: 'Subscription language detected'
      });
    }

    // Example of false positive handling
    if (text.includes('nsfw') && text.includes('warning')) {
      return []; // Don't flag content that's warning about NSFW content
    }
  }

  return labels;
}

module.exports = { getLabels };



