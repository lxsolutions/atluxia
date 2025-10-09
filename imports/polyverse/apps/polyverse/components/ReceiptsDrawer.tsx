import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  FactCheck as TruthIcon,
  TrendingUp as RankingIcon,
  Gavel as ModerationIcon,
  SportsEsports as ArenaIcon,
  Paid as BoostIcon,
} from '@mui/icons-material';

interface Receipt {
  id: string;
  type: 'truth' | 'ranking' | 'moderation' | 'arena' | 'boost';
  timestamp: string;
  title: string;
  description: string;
  details: Record<string, any>;
  confidence?: number;
  transparencyRecordId?: string;
}

interface ReceiptsContextType {
  receipts: Receipt[];
  addReceipt: (receipt: Omit<Receipt, 'id' | 'timestamp'>) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  isOpen: boolean;
}

const ReceiptsContext = createContext<ReceiptsContextType | undefined>(undefined);

export const useReceipts = () => {
  const context = useContext(ReceiptsContext);
  if (!context) {
    throw new Error('useReceipts must be used within a ReceiptsProvider');
  }
  return context;
};

interface ReceiptsProviderProps {
  children: ReactNode;
}

export const ReceiptsProvider: React.FC<ReceiptsProviderProps> = ({ children }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addReceipt = (receiptData: Omit<Receipt, 'id' | 'timestamp'>) => {
    const newReceipt: Receipt = {
      ...receiptData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    setReceipts(prev => [newReceipt, ...prev].slice(0, 50)); // Keep last 50 receipts
  };

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  return (
    <ReceiptsContext.Provider
      value={{
        receipts,
        addReceipt,
        openDrawer,
        closeDrawer,
        isOpen,
      }}
    >
      {children}
      <ReceiptsDrawer />
    </ReceiptsContext.Provider>
  );
};

const ReceiptsDrawer: React.FC = () => {
  const { receipts, isOpen, closeDrawer } = useReceipts();

  const getReceiptIcon = (type: string) => {
    switch (type) {
      case 'truth': return <TruthIcon />;
      case 'ranking': return <RankingIcon />;
      case 'moderation': return <ModerationIcon />;
      case 'arena': return <ArenaIcon />;
      case 'boost': return <BoostIcon />;
      default: return <ReceiptIcon />;
    }
  };

  const getReceiptColor = (type: string) => {
    switch (type) {
      case 'truth': return 'primary';
      case 'ranking': return 'info';
      case 'moderation': return 'warning';
      case 'arena': return 'success';
      case 'boost': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={closeDrawer}
      sx={{ 
        '& .MuiDrawer-paper': { 
          width: 400,
          maxWidth: '90vw',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="h2">
            <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Transparency Receipts
          </Typography>
          <IconButton onClick={closeDrawer} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {receipts.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No receipts yet. Receipts will appear here as actions are taken.
          </Alert>
        ) : (
          <List>
            {receipts.map((receipt) => (
              <ListItem key={receipt.id} sx={{ 
                border: 1, 
                borderColor: 'divider', 
                borderRadius: 1, 
                mb: 1,
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, width: '100%' }}>
                  <ListItemIcon sx={{ minWidth: 'auto' }}>
                    {getReceiptIcon(receipt.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={receipt.title}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={receipt.type}
                          size="small"
                          color={getReceiptColor(receipt.type) as any}
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(receipt.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  {receipt.description}
                </Typography>

                {receipt.confidence && (
                  <Chip
                    label={`${Math.round(receipt.confidence * 100)}% confidence`}
                    size="small"
                    color={receipt.confidence > 0.7 ? 'success' : receipt.confidence > 0.4 ? 'warning' : 'error'}
                    sx={{ mb: 1 }}
                  />
                )}

                {Object.entries(receipt.details).length > 0 && (
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                      Details:
                    </Typography>
                    <Box sx={{ mt: 0.5, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      {Object.entries(receipt.details).map(([key, value]) => (
                        <Typography key={key} variant="caption" component="div">
                          <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}

                {receipt.transparencyRecordId && (
                  <Typography variant="caption" color="text.secondary">
                    Record ID: {receipt.transparencyRecordId}
                  </Typography>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default ReceiptsDrawer;