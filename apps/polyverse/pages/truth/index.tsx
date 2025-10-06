import React from 'react';
import { GetServerSideProps } from 'next';
import Layout from '../../components/Layout';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import {
  FactCheck as FactCheckIcon,
  Add as AddIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { truthApi, Claim } from '../../lib/api';

interface TruthIndexProps {
  claims: Claim[];
  error?: string;
}

const TruthIndex = ({ claims, error }: TruthIndexProps) => {
  return (
    <Layout title="Truth Archive">
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            <FactCheckIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            Truth Archive
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            href="/truth/create"
          >
            New Claim
          </Button>
        </Box>

        {error && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography variant="body2" color="error.contrastText">
              Error loading claims: {error}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
          <Box sx={{ gridColumn: 'span 2' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Claims
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Explore verified claims with multiple consensus lenses
                </Typography>
                
                {claims.length === 0 ? (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      No claims yet. Create the first claim to get started.
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ mt: 2 }}>
                    {claims.map((claim) => (
                      <ListItem 
                        key={claim.id} 
                        component="a" 
                        href={`/truth/${claim.id}`}
                        sx={{ 
                          border: 1, 
                          borderColor: 'divider', 
                          borderRadius: 1, 
                          mb: 1,
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <ListItemIcon>
                          {claim.status === 'resolved' && <CheckCircleIcon color="success" />}
                          {claim.status === 'under_review' && <WarningIcon color="warning" />}
                          {claim.status === 'draft' && <ScheduleIcon color="disabled" />}
                          {claim.status === 'disputed' && <WarningIcon color="error" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={claim.statement}
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" component="div">
                                ID: {claim.id}
                              </Typography>
                              <Typography variant="caption" component="div">
                                Created: {new Date(claim.createdAt).toLocaleDateString()}
                              </Typography>
                              {claim.confidence && (
                                <Chip 
                                  label={`${Math.round(claim.confidence * 100)}% confidence`} 
                                  size="small" 
                                  color={claim.confidence > 0.7 ? 'success' : claim.confidence > 0.4 ? 'warning' : 'error'}
                                  sx={{ mt: 0.5 }}
                                />
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<SearchIcon />}
                  href="/truth/search"
                  sx={{ mb: 1 }}
                >
                  Search Claims
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<FactCheckIcon />}
                  href="/truth/review"
                >
                  Review Queue
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Stats
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total Claims:</Typography>
                    <Chip label={claims.length} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Under Review:</Typography>
                    <Chip 
                      label={claims.filter(c => c.status === 'under_review').length} 
                      size="small" 
                      color="warning" 
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Resolved:</Typography>
                    <Chip 
                      label={claims.filter(c => c.status === 'resolved').length} 
                      size="small" 
                      color="success" 
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Disputed:</Typography>
                    <Chip 
                      label={claims.filter(c => c.status === 'disputed').length} 
                      size="small" 
                      color="error" 
                    />
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

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const claims = await truthApi.getClaims();
    return {
      props: {
        claims,
      },
    };
  } catch (error) {
    console.error('Error fetching claims:', error);
    return {
      props: {
        claims: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    };
  }
};

export default TruthIndex;