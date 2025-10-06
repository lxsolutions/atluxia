import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  Typography,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import {
  SportsEsports,
  TrendingUp,
  Group,
  EmojiEvents
} from '@mui/icons-material';

const ArenaPage = () => {
  // Mock data for demonstration
  const queues = [
    { id: 1, name: 'StarCraft II', players: 42, disputes: 8 },
    { id: 2, name: 'Age of Empires II', players: 28, disputes: 5 },
    { id: 3, name: 'Supreme Commander', players: 15, disputes: 3 }
  ];

  const activeDisputes = [
    { id: 1, title: 'Catholics vs Muslims', game: 'StarCraft II', status: 'in_progress' },
    { id: 2, title: 'Capitalism vs Socialism', game: 'Age of Empires II', status: 'confirmed' },
    { id: 3, title: 'iOS vs Android', game: 'Supreme Commander', status: 'pending' }
  ];

  return (
    <Layout title="Arena | PolyVerse">
      <Head>
        <title>Arena | PolyVerse</title>
        <meta name="description" content="Challenge claims through competitive gaming" />
      </Head>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <SportsEsports sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h2" component="h1" gutterBottom>
            The Arena
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Settle debates through competitive gaming. Challenge claims, prove your side, 
            and earn tribute while contributing to the Truth Archive.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Group sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Create Dispute
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Challenge a claim or start a new debate through competitive gaming
              </Typography>
              <Link href="/arena/dispute/new" passHref>
                <Button variant="contained" fullWidth>
                  Start Challenge
                </Button>
              </Link>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                View Leaderboards
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                See top players and track your ranking across different games
              </Typography>
              <Link href="/arena/leaderboards" passHref>
                <Button variant="outlined" fullWidth>
                  View Rankings
                </Button>
              </Link>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <EmojiEvents sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Explore Arguments
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Browse historical disputes and see which arguments are winning
              </Typography>
              <Link href="/arena/arguments" passHref>
                <Button variant="outlined" fullWidth>
                  Browse Arguments
                </Button>
              </Link>
            </Card>
          </Grid>

          {/* Active Queues */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Active Queues
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2}>
                {queues.map((queue) => (
                  <Box key={queue.id} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1
                  }}>
                    <Box>
                      <Typography variant="h6">{queue.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {queue.players} players online
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${queue.disputes} disputes`}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Stack>
            </Card>
          </Grid>

          {/* Recent Disputes */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Recent Disputes
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2}>
                {activeDisputes.map((dispute) => (
                  <Link key={dispute.id} href={`/arena/dispute/${dispute.id}`} passHref>
                    <Box sx={{ 
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}>
                      <Typography variant="h6" gutterBottom>
                        {dispute.title}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          {dispute.game}
                        </Typography>
                        <Chip 
                          label={dispute.status.replace('_', ' ')}
                          size="small"
                          color={
                            dispute.status === 'completed' ? 'success' :
                            dispute.status === 'in_progress' ? 'warning' : 'default'
                          }
                        />
                      </Box>
                    </Box>
                  </Link>
                ))}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default ArenaPage;