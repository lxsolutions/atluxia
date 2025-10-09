import React, { useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Button,
  Card,
  Container,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import { SportsEsports, EmojiEvents, Payment, Link as LinkIcon } from '@mui/icons-material';

const CreateDisputePage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game: '',
    challengerSide: '',
    opponentSide: '',
    entryFee: '',
    paymentMethod: '',
    truthClaimId: ''
  });

  const games = [
    { id: 1, name: 'StarCraft II' },
    { id: 2, name: 'Age of Empires II' },
    { id: 3, name: 'Supreme Commander' }
  ];

  const steps = ['Debate Details', 'Game Selection', 'Stakes & Payment', 'Truth Link'];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = () => {
    // Handle dispute creation
    console.log('Creating dispute:', formData);
    // TODO: Integrate with games-api
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Debate Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Debate Title"
                  value={formData.title}
                  onChange={handleInputChange('title')}
                  placeholder="e.g., Catholics vs Muslims, Capitalism vs Socialism"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  placeholder="Describe the debate context and rules..."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Your Side"
                  value={formData.challengerSide}
                  onChange={handleInputChange('challengerSide')}
                  placeholder="e.g., Catholics, Capitalism"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Opponent Side"
                  value={formData.opponentSide}
                  onChange={handleInputChange('opponentSide')}
                  placeholder="e.g., Muslims, Socialism"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Game Selection
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select Game</InputLabel>
              <Select
                value={formData.game}
                label="Select Game"
                onChange={handleInputChange('game')}
              >
                {games.map((game) => (
                  <MenuItem key={game.id} value={game.name}>
                    {game.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              The selected game will determine the competitive format and verification process 
              for this dispute.
            </Alert>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Stakes & Payment
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Entry Fee ($)"
                  value={formData.entryFee}
                  onChange={handleInputChange('entryFee')}
                  inputProps={{ min: 1, max: 1000 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={formData.paymentMethod}
                    label="Payment Method"
                    onChange={handleInputChange('paymentMethod')}
                  >
                    <MenuItem value="stripe">Credit Card (Stripe)</MenuItem>
                    <MenuItem value="crypto">Crypto (USDC)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Alert severity="warning" sx={{ mt: 2 }}>
              The entry fee will be held in escrow and awarded to the winner. 
              Both players must contribute the same amount.
            </Alert>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Link to Truth Archive
            </Typography>
            <TextField
              fullWidth
              label="Truth Claim ID (Optional)"
              value={formData.truthClaimId}
              onChange={handleInputChange('truthClaimId')}
              placeholder="e.g., claim_abc123..."
              helperText="Link this dispute to a specific claim in the Truth Archive"
            />
            
            <Alert severity="info" sx={{ mt: 2 }}>
              Linking to a Truth Claim will emit a PlayfulSignal upon resolution, 
              contributing to the claim's confidence score (max 2% influence).
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Create Dispute | Arena | PolyVerse</title>
        <meta name="description" content="Create a new competitive dispute" />
      </Head>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <SportsEsports sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom>
            Create Dispute
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Settle debates through competitive gaming
          </Typography>
        </Box>

        <Card sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!formData.title || !formData.game || !formData.entryFee}
              >
                Create Dispute
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={
                  (activeStep === 0 && (!formData.title || !formData.challengerSide || !formData.opponentSide)) ||
                  (activeStep === 1 && !formData.game) ||
                  (activeStep === 2 && (!formData.entryFee || !formData.paymentMethod))
                }
              >
                Next
              </Button>
            )}
          </Box>
        </Card>
      </Container>
    </>
  );
};

export default CreateDisputePage;