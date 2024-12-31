import React, { useState } from 'react';
import {
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const StreamPlannerDashboard = () => {
  const [streams, setStreams] = useState([]);
  const [newStream, setNewStream] = useState({
    name: '',
    platform: '',
    viewerCount: '',
    category: '',
  });

  const handleAddStream = () => {
    if (newStream.name && newStream.platform) {
      setStreams([...streams, { ...newStream, id: Date.now() }]);
      setNewStream({ name: '', platform: '', viewerCount: '', category: '' });
    }
  };

  const handleDeleteStream = (id) => {
    setStreams(streams.filter(stream => stream.id !== id));
  };

  return (
    <Box sx={{ flexGrow: 1, mt: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Stream Name"
              value={newStream.name}
              onChange={(e) => setNewStream({ ...newStream, name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Platform"
              value={newStream.platform}
              onChange={(e) => setNewStream({ ...newStream, platform: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Viewer Count"
              type="number"
              value={newStream.viewerCount}
              onChange={(e) => setNewStream({ ...newStream, viewerCount: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Category"
              value={newStream.category}
              onChange={(e) => setNewStream({ ...newStream, category: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={1}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleAddStream}
              sx={{ height: '100%' }}
            >
              <AddIcon />
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        {streams.map((stream) => (
          <Grid item xs={12} sm={6} md={4} key={stream.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Typography variant="h6" component="div">
                    {stream.name}
                  </Typography>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDeleteStream(stream.id)}
                  >
                    <DeleteIcon />
                  </Button>
                </Box>
                <Typography color="text.secondary">
                  Platform: {stream.platform}
                </Typography>
                <Typography color="text.secondary">
                  Viewers: {stream.viewerCount}
                </Typography>
                <Typography color="text.secondary">
                  Category: {stream.category}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StreamPlannerDashboard;
