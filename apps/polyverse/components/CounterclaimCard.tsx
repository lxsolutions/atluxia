import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import {
  Balance as BalanceIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

interface Counterclaim {
  id: string;
  claimId: string;
  statement: string;
  description?: string;
  creator: string;
  createdAt: string;
  confidence?: number;
  status: 'draft' | 'under_review' | 'resolved' | 'disputed';
  evidenceCount?: number;
}

interface CounterclaimCardProps {
  counterclaim: Counterclaim;
  onViewDetails?: (counterclaimId: string) => void;
  showActions?: boolean;
}

const CounterclaimCard: React.FC<CounterclaimCardProps> = ({
  counterclaim,
  onViewDetails,
  showActions = false,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'success';
      case 'under_review': return 'warning';
      case 'disputed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BalanceIcon color="action" />
            <Typography variant="h6" component="h3">
              Counterclaim
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={counterclaim.status.replace('_', ' ').toUpperCase()}
              size="small"
              color={getStatusColor(counterclaim.status)}
            />
            {counterclaim.confidence && (
              <Chip
                label={`${Math.round(counterclaim.confidence * 100)}%`}
                size="small"
                color={counterclaim.confidence > 0.7 ? 'success' : counterclaim.confidence > 0.4 ? 'warning' : 'error'}
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        <Typography variant="body1" paragraph sx={{ fontStyle: 'italic' }}>
          "{counterclaim.statement}"
        </Typography>

        {counterclaim.description && (
          <Typography variant="body2" color="text.secondary" paragraph>
            {counterclaim.description}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Created by {counterclaim.creator} • {new Date(counterclaim.createdAt).toLocaleDateString()}
            {counterclaim.evidenceCount !== undefined && (
              <> • {counterclaim.evidenceCount} pieces of evidence</>
            )}
          </Typography>

          {showActions && onViewDetails && (
            <Button
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => onViewDetails(counterclaim.id)}
            >
              View Details
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CounterclaimCard;