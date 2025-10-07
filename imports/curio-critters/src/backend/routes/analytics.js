





const express = require('express');
const router = express.Router();
const { getLearningMetricsForUser, getUserById } = require('../db');

// Get summary statistics for all users
router.get('/summary', async (req, res) => {
  try {
    if (!req.query.user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    // This would be more complex in a real implementation with proper user listing
    // For now, we'll just return a simple success message
    res.json({
      message: 'Analytics summary endpoint working',
      note: 'In a full implementation, this would provide aggregate statistics across all users'
    });
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get learning analytics for a specific user by ID
router.get('/user/:id', async (req, res) => {
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

    // Group by subject for better reporting
    const subjects = {};
    metrics.forEach(metric => {
      if (!subjects[metric.subject]) {
        subjects[metric.subject] = [];
      }
      subjects[metric.subject].push(metric);
    });

    res.json({
      userId: req.params.id,
      username: user.username,
      grade: user.grade,
      learningMetrics: metrics,
      overallPerformance: {
        totalTopics,
        averageScore: parseFloat(averageScore.toFixed(2))
      },
      subjectBreakdown: subjects
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get learning gains metrics for a specific user by ID
router.get('/metrics/gains/:id', async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all learning metrics for this user
    let metrics = await db.query('SELECT * FROM learning_metrics WHERE user_id = $1 ORDER BY timestamp', [req.params.id]);

    if (metrics.rows.length === 0) {
      return res.status(404).json({ error: 'No learning data available' });
    }

    // Calculate gains between consecutive metrics
    const gainsAnalysis = [];
    let previousMetric = null;

    for (const metric of metrics.rows) {
      if (previousMetric && metric.subject === previousMetric.subject && metric.topic === previousMetric.topic) {
        const gain = metric.average_score - previousMetric.average_score;
        gainsAnalysis.push({
          subject: metric.subject,
          topic: metric.topic,
          score_gain: gain,
          timestamp: metric.timestamp,
          from_date: previousMetric.timestamp,
          to_date: metric.timestamp
        });
      }
      previousMetric = metric;
    }

    // Calculate overall progress trends
    const subjects = [...new Set(metrics.rows.map(m => m.subject))];
    const subjectGains = {};

    subjects.forEach(subject => {
      const subjectMetrics = metrics.rows.filter(m => m.subject === subject);
      let totalGain = 0;

      for (let i = 1; i < subjectMetrics.length; i++) {
        totalGain += subjectMetrics[i].average_score - subjectMetrics[i-1].average_score;
      }

      subjectGains[subject] = {
        average_gain: subjectMetrics.length > 1 ? totalGain / (subjectMetrics.length - 1) : 0,
        total_topics_covered: new Set(subjectMetrics.map(m => m.topic)).size
      };
    });

    res.json({
      user_id: req.params.id,
      gains_by_topic: gainsAnalysis,
      subject_trends: subjectGains,
      message: 'Learning gains analysis completed successfully'
    });
  } catch (error) {
    console.error('Error calculating learning gains:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;





