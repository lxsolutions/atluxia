import React from 'react';
import Layout from '../../components/Layout';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  LinearProgress
} from '@mui/material';
import {
  FactCheck as FactCheckIcon,
  ThumbUp as ThumbUpIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const TruthReview = () => {
  const reviewQueue = [
    {
      id: 'claim-001',
      title: 'Climate change primarily caused by human activities',
      status: 'needs_review',
      topics: ['climate', 'science'],
      createdAt: '2024-01-15',
      evidenceCount: 0
    },
    {
      id: 'claim-002', 
      title: 'Vaccines are safe and effective for preventing diseases',
      status: 'in_progress',
      topics: ['health', 'medicine'],
      createdAt: '2024-01-14',
      evidenceCount: 3
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'needs_review': return 'warning';
      case 'in_progress': return 'info';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'needs_review': return <ScheduleIcon />;
      case 'in_progress': return <LinearProgress />;
      case 'resolved': return <ThumbUpIcon />;
      default: return null;
    }
  };

  return (
    <Layout title="Review Queue">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <FactCheckIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Review Queue
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
          <Box sx={{ gridColumn: 'span 2' }}>
            <Typography variant="h6" gutterBottom>
              Claims Needing Review ({reviewQueue.length})
            </Typography>
            
            {reviewQueue.length === 0 ? (
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" align="center">
                    No claims in review queue. Great job!
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              reviewQueue.map((claim) => (
                <Card key={claim.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {claim.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip
                            label={claim.status.replace('_', ' ')}
                            color={getStatusColor(claim.status)}
                            size="small"
                          />
                          {claim.topics.map(topic => (
                            <Chip
                              key={topic}
                              label={topic}
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                          Created: {claim.createdAt} • Evidence: {claim.evidenceCount}
                        </Typography>
                      </Box>
                      
                      <Button
                        variant="outlined"
                        href={`/truth/${claim.id}`}
                        sx={{ ml: 2 }}
                      >
                        Review
                      </Button>
                    </Box>
                    
                    {claim.status === 'in_progress' && (
                      <Box sx={{ mt: 2 }}>
                        <LinearProgress />
                        <Typography variant="caption" color="text.secondary">
                          Consensus lenses processing...
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </Box>

          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Review Guidelines
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Focus on evidence:</strong> Evaluate the quality and relevance of supporting evidence
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Consider multiple perspectives:</strong> Look for counterarguments and dissenting views
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Check sources:</strong> Verify the credibility and recency of evidence sources
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Be objective:</strong> Base your assessment on facts rather than personal beliefs
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Stats
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Awaiting Review:</Typography>
                    <Chip label={reviewQueue.filter(c => c.status === 'needs_review').length} size="small" color="warning" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">In Progress:</Typography>
                    <Chip label={reviewQueue.filter(c => c.status === 'in_progress').length} size="small" color="info" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total Resolved:</Typography>
                    <Chip label="0" size="small" color="success" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default TruthReview;