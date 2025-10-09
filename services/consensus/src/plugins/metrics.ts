import FastifyPlugin from 'fastify-plugin';
import client from 'prom-client';

// Enable default metrics collection
client.collectDefaultMetrics({
  prefix: 'polyverse_consensus_',
  timeout: 5000,
});

// Custom metrics for consensus service
const consensusDuration = new client.Histogram({
  name: 'polyverse_consensus_duration_seconds',
  help: 'Duration of consensus calculations in seconds',
  labelNames: ['lens', 'claim_id'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
});

const consensusErrors = new client.Counter({
  name: 'polyverse_consensus_errors_total',
  help: 'Total number of consensus calculation errors',
  labelNames: ['lens', 'error_type'],
});

const jurySelectionDuration = new client.Histogram({
  name: 'polyverse_jury_selection_duration_seconds',
  help: 'Duration of jury selection in seconds',
  labelNames: ['claim_id'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

const confidenceReportDuration = new client.Histogram({
  name: 'polyverse_confidence_report_duration_seconds',
  help: 'Duration of confidence report generation in seconds',
  labelNames: ['claim_id'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const metricsPlugin = FastifyPlugin(async (fastify) => {
  // Metrics endpoint
  fastify.get('/metrics', async (request, reply) => {
    reply.header('Content-Type', client.register.contentType);
    return client.register.metrics();
  });

  // Add metrics to fastify instance for use in routes
  fastify.decorate('metrics', {
    consensusDuration,
    consensusErrors,
    jurySelectionDuration,
    confidenceReportDuration,
  });
});

export default metricsPlugin;
export {
  consensusDuration,
  consensusErrors,
  jurySelectionDuration,
  confidenceReportDuration,
};