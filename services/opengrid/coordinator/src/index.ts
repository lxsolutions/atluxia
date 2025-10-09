



import express from 'express';
import { JobController } from './controllers/jobController';
import { ProviderController } from './controllers/providerController';

const app = express();
app.use(express.json());

// Initialize controllers
const jobController = new JobController();
const providerController = new ProviderController();

// Set up routes
app.post('/api/v1/jobs', (req, res) => jobController.submitJob(req, res));
app.get('/api/v1/jobs/:jobId/status', (req, res) => jobController.getJobStatus(req, res));

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Coordinator running on port ${PORT}`);
});

export default app;


