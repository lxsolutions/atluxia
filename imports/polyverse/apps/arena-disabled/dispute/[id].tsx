import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Card,
  Container,
  Typography,
  Grid,
  Chip,
  Divider,
  Stack,
  Alert,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import {
  SportsEsports,
  EmojiEvents,
  Payment,
  Link as LinkIcon,
  Videocam,
  History
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dispute-tabpanel-${index}`}
      aria-labelledby={`dispute-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const DisputeDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [tabValue, setTabValue] = React.useState(0);

  // Mock data for demonstration
  const dispute = {
    id: id,
    title: 'Catholics vs Muslims',
    description: 'A debate about religious tolerance and historical coexistence',
    game: 'StarCraft II',
    status: 'in_progress',
    challenger: { name: 'john_doe', side: 'Catholics' },
    opponent: { name: 'jane_smith', side: 'Muslims' },
    entryFee: 25,
    currency: 'USD',
    paymentMethod: 'stripe',
    truthClaimId: 'claim_abc123',
    streamUrl: 'https://twitch.tv/example',
    createdAt: '2024-01-15T10:30:00Z',
    scheduledAt: '2024-01-16T14:00:00Z'
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderStatusChip = (status: string) => {
    const statusConfig = {
      pending: { color: 'default', label: 'Pending' },
      confirmed: { color: 'info', label: 'Confirmed' },
      in_progress: { color: 'warning', label: 'In Progress' },
      completed: { color: 'success', label: 'Completed' },
      cancelled: { color: 'error', label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Chip 
        label={config.label} 
        color={config.color as any}
        variant="outlined"
      />
    );
  };

  if (!dispute) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Dispute not found</Typography>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>{dispute.title} | Arena | PolyVerse</title>
        <meta name="description" content={`Dispute: ${dispute.title}`} />
      </Head>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h3" component="h1" gutterBottom>
                {dispute.title}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {dispute.description}
              </Typography>
            </Box>
            {renderStatusChip(dispute.status)}
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Game</Typography>
              <Typography variant="body1">{dispute.game}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Entry Fee</Typography>
              <Typography variant="body1">${dispute.entryFee} {dispute.currency}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Created</Typography>
              <Typography variant="body1">
                {new Date(dispute.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Scheduled</Typography>
              <Typography variant="body1">
                {dispute.scheduledAt ? new Date(dispute.scheduledAt).toLocaleDateString() : 'Not scheduled'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Overview" />
              <Tab label="Stream" />
              <Tab label="Truth Link" />
              <Tab label="History" />
            </Tabs>
          </Box>

          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Challenger</Typography>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" color="primary">
                    {dispute.challenger.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Side: {dispute.challenger.side}
                  </Typography>
                  {dispute.status === 'pending' && (
                    <Button variant="outlined" sx={{ mt: 2 }} fullWidth>
                      Accept Challenge
                    </Button>
                  )}
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Opponent</Typography>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" color="secondary">
                    {dispute.opponent.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Side: {dispute.opponent.side}
                  </Typography>
                  {dispute.status === 'pending' && (
                    <Button variant="outlined" sx={{ mt: 2 }} fullWidth disabled>
                      Waiting for acceptance
                    </Button>
                  )}
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Match Details</Typography>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                      <Typography variant="body1">
                        {dispute.paymentMethod === 'stripe' ? 'Credit Card' : 'Crypto'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Total Prize</Typography>
                      <Typography variant="body1">
                        ${dispute.entryFee * 2} {dispute.currency}
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Stream Tab */}
          <TabPanel value={tabValue} index={1}>
            {dispute.streamUrl ? (
              <Box>
                <Typography variant="h6" gutterBottom>Live Stream</Typography>
                <Box
                  component="iframe"
                  src={dispute.streamUrl.replace('twitch.tv', 'player.twitch.tv') + '&parent=localhost'}
                  width="100%"
                  height="400"
                  sx={{ border: 'none', borderRadius: 1 }}
                  allowFullScreen
                />
                <Button
                  variant="contained"
                  startIcon={<Videocam />}
                  href={dispute.streamUrl}
                  target="_blank"
                  sx={{ mt: 2 }}
                >
                  Watch on Twitch
                </Button>
              </Box>
            ) : (
              <Alert severity="info">
                No stream available yet. Check back when the match starts.
              </Alert>
            )}
          </TabPanel>

          {/* Truth Link Tab */}
          <TabPanel value={tabValue} index={2}>
            {dispute.truthClaimId ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Linked to Truth Archive
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  This dispute is linked to a claim in the Truth Archive. The outcome will 
                  contribute a PlayfulSignal with maximum 2% influence on the claim's confidence.
                </Alert>
                
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LinkIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      Claim ID: {dispute.truthClaimId}
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="outlined"
                    href={`/truth/claim/${dispute.truthClaimId}`}
                    target="_blank"
                  >
                    View Claim in Truth Archive
                  </Button>
                </Card>
              </Box>
            ) : (
              <Alert severity="warning">
                This dispute is not linked to any Truth Archive claim. 
                <Button 
                  variant="text" 
                  size="small" 
                  sx={{ ml: 1 }}
                  onClick={() => setTabValue(0)}
                >
                  Link to Truth Claim
                </Button>
              </Alert>
            )}
          </TabPanel>

          {/* History Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>Match History</Typography>
            <Alert severity="info">
              No match history yet. History will appear here once the dispute is completed.
            </Alert>
          </TabPanel>
        </Card>

        {/* Action Buttons */}
        {dispute.status === 'in_progress' && (
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" size="large" startIcon={<EmojiEvents />}>
              Submit Result
            </Button>
            <Button variant="outlined" size="large" startIcon={<Payment />}>
              Request Payout
            </Button>
          </Box>
        )}
      </Container>
    </>
  );
};

export default DisputeDetailPage;