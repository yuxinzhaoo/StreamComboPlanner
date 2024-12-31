import React from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Chip,
  Button,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { teams } from '../data/teams';

const TeamSelection = ({ onTeamsSelected, selectedTeams }) => {
  const handleSearch = () => {
    onTeamsSelected(selectedTeams);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Select Teams
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Autocomplete
          multiple
          options={teams}
          getOptionLabel={(option) => option.name}
          value={selectedTeams}
          onChange={(event, newValue) => {
            onTeamsSelected(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Search teams"
              placeholder="Type to search..."
              fullWidth
              helperText="Search by team name, e.g., 'Bayern München', 'Real Madrid'"
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option.name}
                {...getTagProps({ index })}
                color="primary"
              />
            ))
          }
          sx={{ flexGrow: 1 }}
          filterOptions={(options, { inputValue }) => {
            const filterValue = inputValue.toLowerCase();
            return options.filter(option => 
              option.name.toLowerCase().includes(filterValue)
            );
          }}
        />
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          startIcon={<SearchIcon />}
          sx={{ height: '56px', minWidth: '120px' }}
        >
          Compare
        </Button>
      </Box>
    </Box>
  );
};

export default TeamSelection;
