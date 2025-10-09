import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Badge
} from '@mui/material';
import {
  Home as HomeIcon,
  SportsEsports,
  AutoStories,
  Gavel,
  QuestionAnswer,
  FactCheck,
  Receipt as ReceiptIcon,
  Category
} from '@mui/icons-material';
import { ReceiptsProvider, useReceipts } from './ReceiptsDrawer';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const LayoutContent: React.FC<LayoutProps> = ({ children, title = 'PolyVerse' }) => {
  const router = useRouter();
  const { receipts, openDrawer } = useReceipts();

  const navigation = [
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/truth', label: 'Truth', icon: <FactCheck /> },
    { path: '/truth/bundles', label: 'Bundles', icon: <Category /> },
    { path: '/arena', label: 'Arena', icon: <SportsEsports /> },
    { path: '/ask', label: 'Truth Agent', icon: <QuestionAnswer /> },
    { path: '/governance', label: 'Governance', icon: <Gavel /> },
    { path: '/wiki', label: 'Wiki', icon: <AutoStories /> }
  ];

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="PolyVerse - Protocol-first social network with Truth Archive and Arena" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PolyVerse
          </Typography>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {navigation.map((item) => (
              <Link key={item.path} href={item.path} passHref>
                <Button
                  color="inherit"
                  startIcon={item.icon}
                  variant={router.pathname === item.path ? 'contained' : 'text'}
                  sx={{
                    borderRadius: 2,
                    '&.MuiButton-contained': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' }
                    }
                  }}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              onClick={openDrawer}
              title="View transparency receipts"
              size="large"
            >
              <Badge badgeContent={receipts.length} color="secondary">
                <ReceiptIcon />
              </Badge>
            </IconButton>
          </Box>

          {/* Mobile menu would go here */}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" component="main" sx={{ py: 4 }}>
        {children}
      </Container>

      {/* Footer would go here */}
    </>
  );
};

const Layout: React.FC<LayoutProps> = (props) => {
  return (
    <ReceiptsProvider>
      <LayoutContent {...props} />
    </ReceiptsProvider>
  );
};

export default Layout;