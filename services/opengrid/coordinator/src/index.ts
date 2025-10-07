



import express from 'express';
import { JobController } from './controllers/jobController';

const app = express();
app.use(express.json());

// Initialize controllers
const jobController = new JobController();

// Set up routes
app.post('/api/v1/jobs', (req, res) => jobController.submitJob(req, res));
app.get('/api/v1/jobs/:jobId/status', (req, res) => jobController.getJobStatus(req, res));

// Start the server
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`Coordinator running on port ${PORT}`);
});

export default app;


