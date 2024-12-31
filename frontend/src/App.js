import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, Typography, Paper, CircularProgress } from '@mui/material';
import TeamSelection from './components/TeamSelection';
import PackageComparison from './components/PackageComparison';
import MatchSchedule from './components/MatchSchedule';
import { calculatePackageRankings } from './services/packageService';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function App() {
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTeamSelection = async (teams) => {
    setSelectedTeams(teams);
    if (teams.length > 0) {
      setLoading(true);
      try {
        const results = await calculatePackageRankings(teams);
        setComparisonResults(results);
      } catch (error) {
        console.error('Error calculating package rankings:', error);
        // Here you would show an error message to the user
      } finally {
        setLoading(false);
      }
    } else {
      setComparisonResults(null);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Stream Package Comparison
          </Typography>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <TeamSelection 
              onTeamsSelected={handleTeamSelection}
              selectedTeams={selectedTeams}
            />
          </Paper>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : comparisonResults && (
            <>
              <Paper sx={{ p: 3, mb: 3 }}>
                <PackageComparison results={comparisonResults} />
              </Paper>
              
              <Paper sx={{ p: 3 }}>
                <MatchSchedule 
                  selectedTeams={selectedTeams}
                  packages={comparisonResults.packages}
                />
              </Paper>
            </>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
