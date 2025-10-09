import React, { useState } from 'react';
import Layout from '../../components/Layout';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Alert
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const TruthCreate = () => {
  const [title, setTitle] = useState('');
  const [statement, setStatement] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddTopic = () => {
    if (currentTopic.trim() && !topics.includes(currentTopic.trim())) {
      setTopics([...topics, currentTopic.trim()]);
      setCurrentTopic('');
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter(topic => topic !== topicToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !statement.trim()) {
      setError('Title and statement are required');
      return;
    }

    try {
      // TODO: Integrate with truth-graph service
      console.log('Creating claim:', { title, statement, topics });
      
      setSuccess('Claim created successfully!');
      setTitle('');
      setStatement('');
      setTopics([]);
    } catch (err) {
      setError('Failed to create claim');
    }
  };

  return (
    <Layout title="Create Claim">
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          href="/truth"
          sx={{ mb: 2 }}
        >
          Back to Truth Archive
        </Button>

        <Typography variant="h4" component="h1" gutterBottom>
          Create New Claim
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
          <Box sx={{ gridColumn: 'span 2' }}>
            <Card>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
                  
                  {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      {success}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    label="Claim Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    margin="normal"
                    required
                    helperText="A clear, concise title for your claim"
                  />

                  <TextField
                    fullWidth
                    label="Statement"
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                    margin="normal"
                    multiline
                    rows={4}
                    required
                    helperText="The factual statement you want to verify"
                  />

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Topics
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        label="Add topic"
                        value={currentTopic}
                        onChange={(e) => setCurrentTopic(e.target.value)}
                        size="small"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTopic();
                          }
                        }}
                      />
                      <Button
                        variant="outlined"
                        onClick={handleAddTopic}
                        disabled={!currentTopic.trim()}
                      >
                        Add
                      </Button>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {topics.map((topic) => (
                        <Chip
                          key={topic}
                          label={topic}
                          onDelete={() => handleRemoveTopic(topic)}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{ mt: 3 }}
                    fullWidth
                  >
                    Create Claim
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Guidelines
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Be specific:</strong> Claims should be clear, testable statements
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Provide evidence:</strong> You'll be able to add supporting evidence after creation
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Use relevant topics:</strong> Help others find and review your claim
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Stay factual:</strong> Focus on verifiable information rather than opinions
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default TruthCreate;