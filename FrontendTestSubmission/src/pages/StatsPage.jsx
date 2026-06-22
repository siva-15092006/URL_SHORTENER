import { useEffect, useState } from 'react';
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
  Collapse,
  IconButton,
  Chip,
} from '@mui/material';
import { Log } from 'logging-middleware';
import { getAllUrls } from '../utils/storage';

function StatsRow({ record }) {
  const [open, setOpen] = useState(false);
  const isExpired = new Date(record.expiresAt) < new Date();

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? '▲' : '▼'}
          </IconButton>
        </TableCell>
        <TableCell>{window.location.origin}/{record.shortcode}</TableCell>
        <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {record.longUrl}
        </TableCell>
        <TableCell>{new Date(record.createdAt).toLocaleString()}</TableCell>
        <TableCell>{new Date(record.expiresAt).toLocaleString()}</TableCell>
        <TableCell>
          <Chip
            label={isExpired ? 'Expired' : 'Active'}
            color={isExpired ? 'default' : 'success'}
            size="small"
          />
        </TableCell>
        <TableCell align="center">{record.clicks.length}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={7} sx={{ p: 0, border: 0 }}>
          <Collapse in={open} unmountOnExit>
            <Box sx={{ p: 2, bgcolor: '#fafafa' }}>
              <Typography variant="subtitle2" gutterBottom>
                Click Details
              </Typography>
              {record.clicks.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No clicks yet.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Location</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {record.clicks.map((click, i) => (
                      <TableRow key={i}>
                        <TableCell>{new Date(click.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{click.source}</TableCell>
                        <TableCell>{click.location}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function StatsPage() {
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    async function loadStats() {
      const all = getAllUrls();
      setUrls(all);
      await Log('frontend', 'info', 'page', `Loaded stats page with ${all.length} URL(s)`);
    }
    loadStats();
  }, []);

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        URL Shortener Statistics
      </Typography>

      {urls.length === 0 ? (
        <Typography color="text.secondary">No shortened URLs yet.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Short URL</TableCell>
                <TableCell>Original URL</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Clicks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {urls.map((record) => (
                <StatsRow key={record.shortcode} record={record} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default StatsPage;