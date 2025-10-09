


const express = require('express');
const cors = require('cors');
const { getLearningMetricsForUser, getUserById } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Test analytics route
app.get('/api/analytics/:id', async (req, res) => {
  try {
    const user = getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const metrics = getLearningMetricsForUser(req.params.id);

    // Calculate overall performance
    let totalTopics = 0;
    let averageScore = 0;

    if (metrics.length > 0) {
      metrics.forEach(metric => {
        totalTopics++;
        averageScore += metric.average_score || 0;
      });
      averageScore /= metrics.length;
    }

    res.json({
      userId: req.params.id,
      username: user.username,
      grade: user.grade,
      learningMetrics: metrics,
      overallPerformance: {
        totalTopics,
        averageScore: parseFloat(averageScore.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = 56457;
app.listen(PORT, () => {
  console.log(`Test analytics server running on port ${PORT}`);
});


