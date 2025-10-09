import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Create as CreateIcon,
  Edit as EditIcon,
  FactCheck as FactCheckIcon,
  Balance as BalanceIcon,
  Description as EvidenceIcon,
  Group as JuryIcon,
  TrendingUp as ConsensusIcon,
} from '@mui/icons-material';

interface TimelineEvent {
  id: string;
  type: 'creation' | 'edit' | 'evidence_added' | 'counterclaim' | 'jury_review' | 'consensus_update';
  timestamp: string;
  actor: string;
  description: string;
  details?: Record<string, any>;
}

interface ProvenanceTimelineProps {
  events: TimelineEvent[];
  maxEvents?: number;
}

const ProvenanceTimeline: React.FC<ProvenanceTimelineProps> = ({
  events,
  maxEvents = 10,
}) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'creation': return <CreateIcon />;
      case 'edit': return <EditIcon />;
      case 'evidence_added': return <EvidenceIcon />;
      case 'counterclaim': return <BalanceIcon />;
      case 'jury_review': return <JuryIcon />;
      case 'consensus_update': return <ConsensusIcon />;
      default: return <FactCheckIcon />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'creation': return 'primary';
      case 'edit': return 'info';
      case 'evidence_added': return 'success';
      case 'counterclaim': return 'warning';
      case 'jury_review': return 'secondary';
      case 'consensus_update': return 'info';
      default: return 'grey';
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'creation': return 'Claim Created';
      case 'edit': return 'Claim Edited';
      case 'evidence_added': return 'Evidence Added';
      case 'counterclaim': return 'Counterclaim';
      case 'jury_review': return 'Jury Review';
      case 'consensus_update': return 'Consensus Update';
      default: return 'Event';
    }
  };

  const sortedEvents = events
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, maxEvents);

  if (sortedEvents.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No timeline events yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Timeline position="alternate">
      {sortedEvents.map((event, index) => (
        <TimelineItem key={event.id}>
          <TimelineOppositeContent
            sx={{ m: 'auto 0' }}
            align="right"
            variant="body2"
            color="text.secondary"
          >
            {new Date(event.timestamp).toLocaleDateString()}
            <br />
            {new Date(event.timestamp).toLocaleTimeString()}
          </TimelineOppositeContent>
          
          <TimelineSeparator>
            <TimelineConnector />
            <TimelineDot color={getEventColor(event.type)}>
              {getEventIcon(event.type)}
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          
          <TimelineContent sx={{ py: '12px', px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" component="span">
                {getEventLabel(event.type)}
              </Typography>
              <Chip
                label={event.actor}
                size="small"
                variant="outlined"
              />
            </Box>
            
            <Typography variant="body2">
              {event.description}
            </Typography>
            
            {event.details && Object.keys(event.details).length > 0 && (
              <Box sx={{ mt: 1 }}>
                {Object.entries(event.details).map(([key, value]) => (
                  <Typography key={key} variant="caption" component="div" color="text.secondary">
                    <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
                  </Typography>
                ))}
              </Box>
            )}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default ProvenanceTimeline;