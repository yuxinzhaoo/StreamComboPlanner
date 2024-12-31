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
  LinearProgress,
  Tooltip,
} from '@mui/material';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

const PackageComparison = ({ results }) => {
  const { packages, combinations, totalGames } = results;

  const formatPrice = (price) => {
    return `€${price.toFixed(2)}`;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Package Comparison
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Total matches for selected teams: {totalGames}
      </Typography>

      {/* Individual Packages */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Package</TableCell>
              <TableCell align="right">Monthly Price</TableCell>
              <TableCell align="right">Yearly Price (per month)</TableCell>
              <TableCell>Coverage</TableCell>
              <TableCell align="right">Live Games</TableCell>
              <TableCell align="right">On Demand</TableCell>
              <TableCell align="right">Value (Games/€)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell component="th" scope="row">
                  {pkg.name}
                </TableCell>
                <TableCell align="right">
                  {formatPrice(pkg.monthlyPrice)}
                </TableCell>
                <TableCell align="right">
                  {formatPrice(pkg.yearlyPrice)}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={pkg.coverage}
                      sx={{ flexGrow: 1 }}
                    />
                    <Typography variant="body2">
                      {pkg.coverage.toFixed(1)}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Live Games">
                    <Chip
                      icon={<LiveTvIcon />}
                      label={pkg.liveGames}
                      size="small"
                      color="primary"
                    />
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="On Demand Games">
                    <Chip
                      icon={<VideoLibraryIcon />}
                      label={pkg.onDemandGames}
                      size="small"
                      color="secondary"
                    />
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  {pkg.gamesPerEuro.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Best Combinations */}
      <Typography variant="h6" gutterBottom>
        Best Package Combinations
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Combination</TableCell>
              <TableCell align="right">Monthly Cost</TableCell>
              <TableCell>Coverage</TableCell>
              <TableCell align="right">Games Covered</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {combinations.map((combo, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {combo.packages.map((pkg) => (
                      <Chip
                        key={pkg.id}
                        label={pkg.name}
                        color="primary"
                        size="small"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  {formatPrice(combo.totalPrice)}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={combo.coverage}
                      sx={{ flexGrow: 1 }}
                    />
                    <Typography variant="body2">
                      {combo.coverage.toFixed(1)}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  {combo.coveredGames} / {totalGames}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PackageComparison;
