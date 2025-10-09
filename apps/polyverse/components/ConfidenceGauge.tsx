import React from 'react';
import { Box, Typography, CircularProgress, Tooltip } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

interface ConfidenceGaugeProps {
  confidence: number;
  confidenceInterval?: [number, number];
  size?: number;
  showLabel?: boolean;
}

const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  confidence,
  confidenceInterval,
  size = 100,
  showLabel = true,
}) => {
  const getColor = (value: number) => {
    if (value >= 0.7) return '#4caf50'; // Green
    if (value >= 0.4) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const getLabel = (value: number) => {
    if (value >= 0.7) return 'High';
    if (value >= 0.4) return 'Medium';
    return 'Low';
  };

  const thickness = size / 10;
  const fontSize = size / 4;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={size}
          thickness={thickness}
          sx={{ color: '#e0e0e0', position: 'absolute' }}
        />
        <CircularProgress
          variant="determinate"
          value={confidence * 100}
          size={size}
          thickness={thickness}
          sx={{ color: getColor(confidence) }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{ fontSize, fontWeight: 'bold', color: getColor(confidence) }}
          >
            {Math.round(confidence * 100)}%
          </Typography>
        </Box>
      </Box>
      
      {showLabel && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {getLabel(confidence)} Confidence
          </Typography>
          {confidenceInterval && (
            <Tooltip 
              title={`Confidence interval: ${Math.round(confidenceInterval[0] * 100)}% - ${Math.round(confidenceInterval[1] * 100)}%`}
            >
              <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ConfidenceGauge;