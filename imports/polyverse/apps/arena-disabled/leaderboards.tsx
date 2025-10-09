import React, { useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Card,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  LinearProgress
} from '@mui/material';
import { EmojiEvents, TrendingUp, MilitaryTech } from '@mui/icons-material';

const LeaderboardsPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedGame, setSelectedGame] = useState('all');

  // Mock data for demonstration
  const games = [
    { id: 'all', name: 'All Games' },
    { id: 'sc2', name: 'StarCraft II' },
    { id: 'aoe2', name: 'Age of Empires II' },
    { id: 'supcom', name: 'Supreme Commander' }
  ];

  const players = [
    {
      id: 1,
      username: 'pro_gamer',
      avatar: '/avatars/1.jpg',
      totalWins: 42,
      totalLosses: 8,
      winRate: 84.0,
      eloRating: 1850,
      totalEarnings: 1250,
      favoriteGame: 'StarCraft II',
      streak: 8
    },
    {
      id: 2,
      username: 'debate_master',
      avatar: '/avatars/2.jpg',
      totalWins: 36,
      totalLosses: 12,
      winRate: 75.0,
      eloRating: 1720,
      totalEarnings: 980,
      favoriteGame: 'Age of Empires II',
      streak: 5
    },
    {
      id: 3,
      username: 'truth_seeker',
      avatar: '/avatars/3.jpg',
      totalWins: 28,
      totalLosses: 15,
      winRate: 65.1,
      eloRating: 1620,
      totalEarnings: 720,
      favoriteGame: 'Supreme Commander',
      streak: 3
    },
    {
      id: 4,
      username: 'logic_warrior',
      avatar: '/avatars/4.jpg',
      totalWins: 25,
      totalLosses: 18,
      winRate: 58.1,
      eloRating: 1550,
      totalEarnings: 620,
      favoriteGame: 'StarCraft II',
      streak: -2
    },
    {
      id: 5,
      username: 'argument_crusher',
      avatar: '/avatars/5.jpg',
      totalWins: 22,
      totalLosses: 20,
      winRate: 52.4,
      eloRating: 1480,
      totalEarnings: 540,
      favoriteGame: 'Age of Empires II',
      streak: 1
    },
    {
      id: 6,
      username: 'dispute_king',
      avatar: '/avatars/6.jpg',
      totalWins: 19,
      totalLosses: 22,
      winRate: 46.3,
      eloRating: 1420,
      totalEarnings: 480,
      favoriteGame: 'Supreme Commander',
      streak: -3
    },
    {
      id: 7,
      username: 'victory_seeker',
      avatar: '/avatars/7.jpg',
      totalWins: 15,
      totalLosses: 25,
      winRate: 37.5,
      eloRating: 1350,
      totalEarnings: 380,
      favoriteGame: 'StarCraft II',
      streak: -1
    },
    {
      id: 8,
      username: 'new_challenger',
      avatar: '/avatars/8.jpg',
      totalWins: 12,
      totalLosses: 28,
      winRate: 30.0,
      eloRating: 1280,
      totalEarnings: 290,
      favoriteGame: 'Age of Empires II',
      streak: -4
    },
    {
      id: 9,
      username: 'beginner_luck',
      avatar: '/avatars/9.jpg',
      totalWins: 8,
      totalLosses: 32,
      winRate: 20.0,
      eloRating: 1210,
      totalEarnings: 180,
      favoriteGame: 'Supreme Commander',
      streak: 2
    },
    {
      id: 10,
      username: 'learning_curve',
      avatar: '/avatars/10.jpg',
      totalWins: 5,
      totalLosses: 35,
      winRate: 12.5,
      eloRating: 1150,
      totalEarnings: 120,
      favoriteGame: 'StarCraft II',
      streak: -5
    }
  ];

  const filteredPlayers = selectedGame === 'all' 
    ? players 
    : players.filter(player => player.favoriteGame === games.find(g => g.id === selectedGame)?.name);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return { color: 'gold', icon: <EmojiEvents sx={{ color: 'gold' }} /> };
    if (index === 1) return { color: 'silver', icon: <EmojiEvents sx={{ color: 'silver' }} /> };
    if (index === 2) return { color: '#cd7f32', icon: <EmojiEvents sx={{ color: '#cd7f32' }} /> };
    return { color: 'primary', icon: <MilitaryTech /> };
  };

  const getStreakColor = (streak: number) => {
    if (streak > 0) return 'success.main';
    if (streak < 0) return 'error.main';
    return 'text.secondary';
  };

  const getStreakIcon = (streak: number) => {
    if (streak > 0) return <TrendingUp sx={{ fontSize: 16 }} />;
    return null;
  };

  return (
    <>
      <Head>
        <title>Leaderboards | Arena | PolyVerse</title>
        <meta name="description" content="View player rankings and statistics" />
      </Head>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <EmojiEvents sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h2" component="h1" gutterBottom>
            Leaderboards
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Track the top performers in the Arena. See who's dominating the debates and 
            climbing the ranks through competitive gaming.
          </Typography>
        </Box>

        {/* Game Filter */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Filter by Game</InputLabel>
              <Select
                value={selectedGame}
                label="Filter by Game"
                onChange={(e) => setSelectedGame(e.target.value)}
              >
                {games.map((game) => (
                  <MenuItem key={game.id} value={game.id}>
                    {game.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                {filteredPlayers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Players
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Leaderboard Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Player</TableCell>
                  <TableCell align="right">Win Rate</TableCell>
                  <TableCell align="right">ELO</TableCell>
                  <TableCell align="right">Earnings</TableCell>
                  <TableCell align="center">Streak</TableCell>
                  <TableCell>Game</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPlayers
                  .sort((a, b) => b.eloRating - a.eloRating)
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((player, index) => {
                    const rank = page * rowsPerPage + index + 1;
                    const badge = getRankBadge(index);
                    
                    return (
                      <TableRow key={player.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {badge.icon}
                            <Typography variant="body1" sx={{ ml: 1, fontWeight: rank <= 3 ? 'bold' : 'normal' }}>
                              {rank}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              src={player.avatar} 
                              sx={{ width: 40, height: 40, mr: 2 }}
                            />
                            <Typography variant="body1" fontWeight="medium">
                              {player.username}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Typography variant="body1" sx={{ mr: 1 }}>
                              {player.winRate}%
                            </Typography>
                            <Box sx={{ width: 60 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={player.winRate} 
                                color={
                                  player.winRate >= 70 ? 'success' :
                                  player.winRate >= 50 ? 'warning' : 'error'
                                }
                              />
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell align="right">
                          <Chip 
                            label={player.eloRating} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="body1" color="success.main" fontWeight="medium">
                            ${player.totalEarnings}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Chip 
                            label={player.streak > 0 ? `+${player.streak}` : player.streak}
                            size="small"
                            color={
                              player.streak > 0 ? 'success' :
                              player.streak < 0 ? 'error' : 'default'
                            }
                            variant="outlined"
                            icon={getStreakIcon(player.streak)}
                          />
                        </TableCell>

                        <TableCell>
                          <Chip 
                            label={player.favoriteGame} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredPlayers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>

        {/* Stats Summary */}
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {Math.max(...players.map(p => p.eloRating))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Highest ELO Rating
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" gutterBottom>
                ${Math.max(...players.map(p => p.totalEarnings))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Top Earnings
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" gutterBottom>
                {Math.max(...players.map(p => p.winRate))}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Best Win Rate
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default LeaderboardsPage;