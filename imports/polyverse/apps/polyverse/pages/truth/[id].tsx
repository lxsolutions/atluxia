import React from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Layout from '../../components/Layout';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  FactCheck as FactCheckIcon,
  Description as DescriptionIcon,
  Balance as BalanceIcon,
  Forum as ForumIcon,
  History as HistoryIcon,
  SportsEsports as ArenaIcon
} from '@mui/icons-material';
import { truthApi, Claim, Evidence, ConsensusReport } from '../../lib/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ClaimDetailProps {
  claim: Claim | null;
  evidence: Evidence[];
  consensusReports: ConsensusReport[];
  error?: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`claim-tabpanel-${index}`}
      aria-labelledby={`claim-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ClaimDetail = ({ claim, evidence, consensusReports, error }: ClaimDetailProps) => {
  const router = useRouter();
  const { id } = router.query;
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!id) {
    return (
      <Layout title="Loading...">
        <Box sx={{ p: 3 }}>
          <Typography>Loading claim...</Typography>
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Error">
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            Error loading claim: {error}
          </Alert>
        </Box>
      </Layout>
    );
  }

  if (!claim) {
    return (
      <Layout title="Claim Not Found">
        <Box sx={{ p: 3 }}>
          <Alert severity="warning">
            Claim with ID {id} not found.
          </Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title={`Claim: ${id}`}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              <FactCheckIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
              Claim Analysis
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              ID: {claim.id}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={claim.status.replace('_', ' ').toUpperCase()} 
                color={
                  claim.status === 'resolved' ? 'success' :
                  claim.status === 'under_review' ? 'warning' :
                  claim.status === 'disputed' ? 'error' : 'default'
                } 
                size="small" 
              />
              {claim.tags?.map((tag) => (
                <Chip key={tag} label={tag} variant="outlined" size="small" />
              ))}
              {claim.confidence && (
                <Chip 
                  label={`${Math.round(claim.confidence * 100)}% confidence`}
                  color={claim.confidence > 0.7 ? 'success' : claim.confidence > 0.4 ? 'warning' : 'error'}
                  size="small"
                />
              )}
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArenaIcon />}
            href={`/arena?challenge=${claim.id}`}
          >
            Challenge in Arena
          </Button>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {claim.statement}
            </Typography>
            {claim.description && (
              <Typography variant="body1" paragraph>
                {claim.description}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              Created by {claim.creator} • {new Date(claim.createdAt).toLocaleDateString()}
              {claim.updatedAt !== claim.createdAt && (
                <> • Updated {new Date(claim.updatedAt).toLocaleDateString()}</>
              )}
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="claim tabs">
            <Tab icon={<DescriptionIcon />} iconPosition="start" label="Summary" />
            <Tab icon={<BalanceIcon />} iconPosition="start" label="Lenses" />
            <Tab icon={<FactCheckIcon />} iconPosition="start" label="Evidence" />
            <Tab icon={<ForumIcon />} iconPosition="start" label="Counterclaims" />
            <Tab icon={<HistoryIcon />} iconPosition="start" label="History" />
            <Tab icon={<ArenaIcon />} iconPosition="start" label="Arena" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            <Box sx={{ gridColumn: 'span 2' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Claim Statement
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {claim.statement}
                  </Typography>
                  {claim.description && (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Description
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {claim.description}
                      </Typography>
                    </>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Created by: {claim.creator} • {new Date(claim.createdAt).toLocaleDateString()}
                    {claim.updatedAt !== claim.createdAt && (
                      <> • Updated {new Date(claim.updatedAt).toLocaleDateString()}</>
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Current Consensus
                  </Typography>
                  {consensusReports.length > 0 ? (
                    <Box>
                      {consensusReports.map((report) => (
                        <Box key={report.id} sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {report.lensId}
                          </Typography>
                          <Typography variant="body2">
                            Confidence: {Math.round(report.confidence * 100)}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Computed: {new Date(report.computedAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No consensus reports available yet. Run analysis to get started.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Consensus Lenses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lenses analysis will appear here once computed
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Supporting Evidence
          </Typography>
          {evidence.length > 0 ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
              {evidence.map((item) => (
                <Card key={item.id} variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Type: {item.type}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {item.description || 'No description provided'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Submitted by {item.submittedBy} • {new Date(item.submittedAt).toLocaleDateString()}
                    </Typography>
                    {item.qualityScore && (
                      <Chip 
                        label={`Quality: ${Math.round(item.qualityScore * 100)}%`} 
                        size="small" 
                        color={item.qualityScore > 0.7 ? 'success' : item.qualityScore > 0.4 ? 'warning' : 'error'}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No evidence has been added yet
            </Typography>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Counterclaims
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No counterclaims have been submitted yet
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Version History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No revisions yet
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" gutterBottom>
            Arena Challenges
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No arena disputes linked to this claim yet
          </Typography>
        </TabPanel>
      </Box>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;

  if (!id || Array.isArray(id)) {
    return {
      props: {
        claim: null,
        evidence: [],
        consensusReports: [],
        error: 'Invalid claim ID',
      },
    };
  }

  try {
    const [claim, evidence, consensusReports] = await Promise.all([
      truthApi.getClaim(id).catch(() => null),
      truthApi.getEvidence(id).catch(() => []),
      truthApi.getConsensusReports(id).catch(() => []),
    ]);

    return {
      props: {
        claim,
        evidence,
        consensusReports,
      },
    };
  } catch (error) {
    console.error('Error fetching claim data:', error);
    return {
      props: {
        claim: null,
        evidence: [],
        consensusReports: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    };
  }
};

export default ClaimDetail;