import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Link as LinkIcon,
  PictureAsPdf as PdfIcon,
  Description as DocumentIcon,
  Dataset as DatasetIcon,
  Mic as TranscriptIcon,
  Add as AddIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
} from '@mui/icons-material';

interface Evidence {
  id: string;
  claimId: string;
  type: 'url' | 'pdf' | 'transcript' | 'dataset';
  content: string;
  title: string;
  description?: string;
  submittedBy: string;
  submittedAt: string;
  qualityScore?: number;
  upvotes?: number;
  downvotes?: number;
}

interface EvidenceListProps {
  evidence: Evidence[];
  onAddEvidence?: () => void;
  onVote?: (evidenceId: string, vote: 'up' | 'down') => void;
  showActions?: boolean;
}

const EvidenceList: React.FC<EvidenceListProps> = ({
  evidence,
  onAddEvidence,
  onVote,
  showActions = false,
}) => {
  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'url': return <LinkIcon />;
      case 'pdf': return <PdfIcon />;
      case 'transcript': return <TranscriptIcon />;
      case 'dataset': return <DatasetIcon />;
      default: return <DocumentIcon />;
    }
  };

  const getEvidenceColor = (type: string) => {
    switch (type) {
      case 'url': return 'primary';
      case 'pdf': return 'error';
      case 'transcript': return 'warning';
      case 'dataset': return 'success';
      default: return 'default';
    }
  };

  if (evidence.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          No evidence has been submitted yet.
        </Typography>
        {onAddEvidence && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAddEvidence}
            sx={{ mt: 2 }}
          >
            Add First Evidence
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {onAddEvidence && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddEvidence}
          >
            Add Evidence
          </Button>
        </Box>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
        {evidence.map((item) => (
          <Card key={item.id} variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                <Chip
                  icon={getEvidenceIcon(item.type)}
                  label={item.type.toUpperCase()}
                  size="small"
                  color={getEvidenceColor(item.type) as any}
                  variant="outlined"
                />
                {item.qualityScore && (
                  <Chip
                    label={`Quality: ${Math.round(item.qualityScore * 100)}%`}
                    size="small"
                    color={item.qualityScore > 0.7 ? 'success' : item.qualityScore > 0.4 ? 'warning' : 'error'}
                  />
                )}
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                {item.title}
              </Typography>

              {item.description && (
                <Typography variant="body2" color="text.secondary" paragraph>
                  {item.description}
                </Typography>
              )}

              {item.type === 'url' && (
                <Typography variant="caption" component="div">
                  <a href={item.content} target="_blank" rel="noopener noreferrer">
                    {item.content}
                  </a>
                </Typography>
              )}

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Submitted by {item.submittedBy} • {new Date(item.submittedAt).toLocaleDateString()}
                </Typography>

                {showActions && onVote && (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Upvote">
                      <IconButton
                        size="small"
                        onClick={() => onVote(item.id, 'up')}
                        color={item.upvotes && item.upvotes > 0 ? 'primary' : 'default'}
                      >
                        <ThumbUpIcon fontSize="small" />
                        {item.upvotes && (
                          <Typography variant="caption" sx={{ ml: 0.5 }}>
                            {item.upvotes}
                          </Typography>
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Downvote">
                      <IconButton
                        size="small"
                        onClick={() => onVote(item.id, 'down')}
                        color={item.downvotes && item.downvotes > 0 ? 'error' : 'default'}
                      >
                        <ThumbDownIcon fontSize="small" />
                        {item.downvotes && (
                          <Typography variant="caption" sx={{ ml: 0.5 }}>
                            {item.downvotes}
                          </Typography>
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default EvidenceList;