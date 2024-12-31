import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';

const MatchSchedule = ({ selectedTeams, packages }) => {
  // Mock data - would be fetched from backend
  const matches = [
    {
      id: 1,
      date: '2024-01-15',
      homeTeam: 'Bayern München',
      awayTeam: 'Real Madrid',
      tournament: 'Champions League',
      availableOn: [
        { packageId: 1, name: 'Sky Sport', type: 'live' },
        { packageId: 2, name: 'DAZN', type: 'on-demand' },
      ],
    },
    // Add more mock matches here
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Upcoming Matches
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Match</TableCell>
              <TableCell>Tournament</TableCell>
              <TableCell>Available On</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matches.map((match) => (
              <TableRow key={match.id}>
                <TableCell>
                  {new Date(match.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {match.homeTeam} vs {match.awayTeam}
                </TableCell>
                <TableCell>{match.tournament}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {match.availableOn.map((pkg, index) => (
                      <Chip
                        key={index}
                        label={`${pkg.name} (${pkg.type})`}
                        color={pkg.type === 'live' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    ))}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MatchSchedule;
