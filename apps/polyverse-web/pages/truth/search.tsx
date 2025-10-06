import React, { useState } from 'react';
import Layout from '../../components/Layout';
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  Chip,
  Grid,
  Button,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  FactCheck as FactCheckIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

const TruthSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([
    {
      id: 'claim-001',
      title: 'Climate change primarily caused by human activities',
      status: 'under_review',
      topics: ['climate', 'science'],
      confidence: 0.85,
      evidenceCount: 5,
      createdAt: '2024-01-15'
    },
    {
      id: 'claim-002',
      title: 'Vaccines are safe and effective for preventing diseases',
      status: 'resolved',
      topics: ['health', 'medicine'],
      confidence: 0.92,
      evidenceCount: 12,
      createdAt: '2024-01-14'
    }
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual search
    console.log('Searching for:', searchQuery);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_review': return 'warning';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  return (
    <Layout title="Search Claims">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <FactCheckIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Search Claims
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
          <Box sx={{ gridColumn: 'span 2' }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <form onSubmit={handleSearch}>
                  <TextField
                    fullWidth
                    placeholder="Search claims by title, topic, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<FilterListIcon />}
                    sx={{ mt: 2 }}
                  >
                    Search & Filter
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Typography variant="h6" gutterBottom>
              Search Results ({searchResults.length})
            </Typography>

            {searchResults.length === 0 ? (
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" align="center">
                    No claims found. Try a different search term.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              searchResults.map((claim) => (
                <Card key={claim.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {claim.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
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
                      <Chip
                        label={`${Math.round(claim.confidence * 100)}% confidence`}
                        variant="outlined"
                        size="small"
                        color={claim.confidence > 0.8 ? 'success' : 'default'}
                      />
                      <Chip
                        label={`${claim.evidenceCount} evidence`}
                        variant="outlined"
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Created: {claim.createdAt}
                    </Typography>

                    <Button
                      variant="outlined"
                      href={`/truth/${claim.id}`}
                      size="small"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>

          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Search Tips
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Use specific terms:</strong> Search for exact claim titles or topics
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Filter by status:</strong> Look for resolved claims or those under review
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Check confidence:</strong> Higher confidence scores indicate stronger consensus
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Review evidence:</strong> Claims with more evidence tend to be more reliable
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Popular Topics
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  <Chip label="climate" variant="outlined" size="small" />
                  <Chip label="science" variant="outlined" size="small" />
                  <Chip label="health" variant="outlined" size="small" />
                  <Chip label="technology" variant="outlined" size="small" />
                  <Chip label="politics" variant="outlined" size="small" />
                  <Chip label="economics" variant="outlined" size="small" />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default TruthSearch;