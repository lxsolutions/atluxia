// OpenAPI generation will be implemented later
// Currently facing compatibility issues with zod-to-openapi library

export const openApiDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Atluxia Marketplace API',
    version: '1.0.0',
    description: 'API for global arbitrage marketplace',
  },
  servers: [
    {
      url: 'http://localhost:3002',
      description: 'Development server',
    },
  ],
  paths: {},
  components: {
    schemas: {},
  },
};