'use client';

import { useContext, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { LightMode, DarkMode, Menu as MenuIcon } from '@mui/icons-material';
import { ColorModeContext } from './MuiThemeProvider';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { toggleColorMode, mode } = useContext(ColorModeContext);
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Leaderboard', href: '/', exact: true },
    { text: 'Ranking Info', href: '/ranking-info' },
    { text: 'Player Rating Info', href: '/player-rating-info' },
    { text: 'Players List', href: '/players' },
    { text: 'Teams List', href: '/teams' },
    { text: 'Events List', href: '/events' },
  ];

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href) && (href !== '/' || pathname === '/');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ bgcolor: '#1e40af' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Mobile menu button */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                noWrap
                component={Link}
                href="/"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: 'inherit',
                  textDecoration: 'none',
                  '&:hover': { opacity: 0.9 },
                }}
              >
                2K26 Global Ranking
              </Typography>
            </Box>

            {/* Desktop logo */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              <Typography
                variant="h6"
                noWrap
                component={Link}
                href="/"
                sx={{
                  mr: 2,
                  fontWeight: 700,
                  color: 'white',
                  textDecoration: 'none',
                  '&:hover': { opacity: 0.9 },
                }}
              >
                NBA 2K Pro Am Global Rankings
              </Typography>
            </Box>

            {/* Desktop navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              {menuItems.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  sx={{
                    my: 2,
                    color: isActive(item.href, item.exact) ? 'white' : 'rgba(255, 255, 255, 0.7)',
                    display: 'block',
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    fontWeight: isActive(item.href, item.exact) ? 600 : 400,
                    '&:hover': {
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    mx: 0.5,
                    px: 1.5,
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                component={Link}
                href="/submit-results"
                variant="contained"
                color="secondary"
                size="small"
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  bgcolor: 'white',
                  color: '#1e40af',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              >
                Submit Results
              </Button>
              <IconButton color="inherit" onClick={toggleColorMode} aria-label="Toggle dark mode" size="small">
                {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ my: 2, fontWeight: 600 }}>
            NBA 2K Pro Am
          </Typography>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={isActive(item.href, item.exact)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'action.selected',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    },
                    px: 3,
                  }}
                >
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontWeight: isActive(item.href, item.exact) ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/submit-results"
                selected={pathname === '/submit-results'}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  },
                  px: 3,
                  mt: 1,
                }}
              >
                <ListItemText 
                  primary="Submit Results" 
                  primaryTypographyProps={{
                    fontWeight: pathname === '/submit-results' ? 600 : 400,
                    color: 'primary.main',
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          {children}
        </Container>
      </Box>
      
      <Box component="footer" sx={{ py: 6, mt: 'auto', bgcolor: '#1f2937' }}>
        <Container maxWidth={false}>
          <Typography variant="body2" color="white" align="center">
            &copy; {new Date().getFullYear()} NBA 2K Pro Am Global Rankings
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
