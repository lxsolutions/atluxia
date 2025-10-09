export const PRODUCT_ATTRIBUTE_EXTRACTION_PROMPT = `
Extract product attributes from the provided information. Return only valid JSON with the following structure:
{
  "brand": "string",
  "category": "string", 
  "color": "string",
  "size": "string",
  "material": "string",
  "weight": "string",
  "dimensions": "string",
  "warranty": "string",
  "features": ["string"]
}

If an attribute cannot be determined, use null. Be precise and factual.
`;

export const TITLE_REWRITE_PROMPT = `
Rewrite the product title to be clear, trustworthy, and SEO-friendly.

Guidelines:
- Include brand, key attributes (size, color, material)
- Avoid hype words: "best", "amazing", "guaranteed", "#1"
- Keep under 80 characters
- Be descriptive but concise
- Use proper capitalization
`;

export const DESCRIPTION_GENERATION_PROMPT = `
Generate a professional product description.

Guidelines:
- Start with an engaging but factual overview
- Highlight key features and benefits
- Include specifications in bullet points
- Mention warranty and support if available
- Avoid marketing hype and superlatives
- Keep between 100-200 words
- Use markdown formatting
`;

export const CONTENT_GUARDRAILS_PROMPT = `
Review content for compliance with marketplace policies.

Prohibited terms:
- "best", "#1", "top", "leading"
- "guaranteed", "promised", "assured"
- Medical claims without evidence
- Unsubstantiated performance claims
- Time-sensitive offers ("limited time")

Flag any content that violates these guidelines.
`;