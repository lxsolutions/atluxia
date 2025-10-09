import React, { useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Card,
  Container,
  Typography,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Pagination,
  Stack,
  Divider
} from '@mui/material';
import { Search, TrendingUp, EmojiEvents, Group } from '@mui/icons-material';

const ArgumentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Mock data for demonstration
  const argumentsData = [
    {
      id: 1,
      name: 'Catholics vs Muslims',
      game: 'StarCraft II',
      sideA: 'Catholics',
      sideB: 'Muslims',
      totalMatches: 42,
      sideAWins: 25,
      sideBWins: 17,
      winRateA: 59.5,
      trending: true
    },
    {
      id: 2,
      name: 'Capitalism vs Socialism',
      game: 'Age of Empires II',
      sideA: 'Capitalism',
      sideB: 'Socialism',
      totalMatches: 28,
      sideAWins: 15,
      sideBWins: 13,
      winRateA: 53.6,
      trending: false
    },
    {
      id: 3,
      name: 'iOS vs Android',
      game: 'Supreme Commander',
      sideA: 'iOS',
      sideB: 'Android',
      totalMatches: 15,
      sideAWins: 8,
      sideBWins: 7,
      winRateA: 53.3,
      trending: true
    },
    {
      id: 4,
      name: 'Python vs JavaScript',
      game: 'StarCraft II',
      sideA: 'Python',
      sideB: 'JavaScript',
      totalMatches: 36,
      sideAWins: 20,
      sideBWins: 16,
      winRateA: 55.6,
      trending: false
    },
    {
      id: 5,
      name: 'Coffee vs Tea',
      game: 'Age of Empires II',
      sideA: 'Coffee',
      sideB: 'Tea',
      totalMatches: 19,
      sideAWins: 11,
      sideBWins: 8,
      winRateA: 57.9,
      trending: true
    }
  ];

  const filteredArguments = argumentsData.filter(arg =>
    arg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    arg.game.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 6;
  const pageCount = Math.ceil(filteredArguments.length / itemsPerPage);
  const paginatedArguments = filteredArguments.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 60) return 'success.main';
    if (winRate >= 55) return 'warning.main';
    if (winRate >= 50) return 'info.main';
    return 'error.main';
  };

  return (
    <>
      <Head>
        <title>Arguments Explorer | Arena | PolyVerse</title>
        <meta name="description" content="Explore historical disputes and argument statistics" />
      </Head>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <EmojiEvents sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h2" component="h1" gutterBottom>
            Arguments Explorer
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Discover which arguments are winning across different games. 
            Analyze historical data and track debate trends in the Arena.
          </Typography>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search arguments or games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </Box>

        {/* Stats Summary */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Group sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" component="div" gutterBottom>
              {argumentsData.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Arguments
            </Typography>
          </Card>

          <Card sx={{ p: 3, textAlign: 'center' }}>
            <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" component="div" gutterBottom>
              {argumentsData.filter(arg => arg.trending).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Trending Now
            </Typography>
          </Card>

          <Card sx={{ p: 3, textAlign: 'center' }}>
            <EmojiEvents sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" component="div" gutterBottom>
              {argumentsData.reduce((total, arg) => total + arg.totalMatches, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Matches
            </Typography>
          </Card>
        </Box>

        {/* Arguments Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3 }}>
          {paginatedArguments.map((arg) => (
            <Card key={arg.id} sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {arg.name}
                  </Typography>
                  {arg.trending && (
                    <Chip 
                      label="Trending" 
                      size="small" 
                      color="success" 
                      variant="outlined"
                    />
                  )}
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {arg.game}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Win Statistics */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      {arg.sideA}
                    </Typography>
                    <Typography variant="h6" color={getWinRateColor(arg.winRateA)}>
                      {arg.winRateA}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {arg.sideAWins} wins
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="secondary" fontWeight="bold">
                      {arg.sideB}
                    </Typography>
                    <Typography variant="h6" color={getWinRateColor(100 - arg.winRateA)}>
                      {(100 - arg.winRateA).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {arg.sideBWins} wins
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total matches: {arg.totalMatches}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label="View Details" 
                    variant="outlined" 
                    size="small"
                    clickable
                    onClick={() => window.location.href = `/arena/arguments/${arg.id}`}
                  />
                  <Chip 
                    label="Challenge" 
                    color="primary" 
                    variant="outlined" 
                    size="small"
                    clickable
                    sx={{ ml: 1 }}
                    onClick={() => window.location.href = `/arena/dispute/new?argument=${arg.id}`}
                  />
                </Box>
            </Card>
          ))}
        </Box>

        {/* Pagination */}
        {pageCount > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}

        {/* Empty State */}
        {filteredArguments.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No arguments found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search terms or create a new argument.
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
};

export default ArgumentsPage;