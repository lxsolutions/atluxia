import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Tooltip,
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

interface Lens {
  id: string;
  name: string;
  description: string;
  weight: number;
  isActive: boolean;
}

interface LensSelectorProps {
  lenses: Lens[];
  selectedLens: string;
  onLensChange: (lensId: string) => void;
  showWeights?: boolean;
}

const LensSelector: React.FC<LensSelectorProps> = ({
  lenses,
  selectedLens,
  onLensChange,
  showWeights = false,
}) => {
  const lensOptions = [
    { id: 'all', name: 'All Lenses', description: 'Combine all active consensus lenses', weight: 0 },
    ...lenses.filter(lens => lens.isActive),
  ];

  return (
    <Box sx={{ minWidth: 300 }}>
      <FormControl fullWidth>
        <InputLabel id="lens-selector-label">Consensus Lens</InputLabel>
        <Select
          labelId="lens-selector-label"
          value={selectedLens}
          label="Consensus Lens"
          onChange={(e) => onLensChange(e.target.value)}
          renderValue={(selected) => {
            const lens = lensOptions.find(l => l.id === selected);
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>{lens?.name}</Typography>
                {showWeights && lens && lens.id !== 'all' && (
                  <Chip 
                    label={`${Math.round(lens.weight * 100)}%`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                )}
              </Box>
            );
          }}
        >
          {lensOptions.map((lens) => (
            <MenuItem key={lens.id} value={lens.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Box>
                  <Typography variant="body1">{lens.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {lens.description}
                  </Typography>
                </Box>
                {showWeights && lens.id !== 'all' && (
                  <Chip 
                    label={`${Math.round(lens.weight * 100)}%`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {selectedLens !== 'all' && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Selected: {lensOptions.find(l => l.id === selectedLens)?.name}
          </Typography>
          <Tooltip title={lensOptions.find(l => l.id === selectedLens)?.description}>
            <InfoIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default LensSelector;