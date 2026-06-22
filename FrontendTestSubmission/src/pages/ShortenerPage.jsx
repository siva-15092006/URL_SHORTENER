import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Grid,
} from '@mui/material';
import { Log } from 'logging-middleware';
import { saveUrl, isShortcodeTaken } from '../utils/storage';
import { generateShortcode, isValidShortcodeFormat } from '../utils/shortcodeGenerator';
import { isValidUrl, isValidValidityMinutes } from '../utils/urlValidator';

const MAX_URLS = 5;
const DEFAULT_VALIDITY_MINUTES = 30;

function createEmptyRow() {
  return { longUrl: '', validity: '', shortcode: '' };
}

function ShortenerPage() {
  const [rows, setRows] = useState([createEmptyRow()]);
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState([]);

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    if (rows.length >= MAX_URLS) {
      Log('frontend', 'warn', 'page', 'User attempted to add more than 5 URL rows');
      return;
    }
    setRows([...rows, createEmptyRow()]);
    Log('frontend', 'debug', 'page', `Added URL input row, total rows now ${rows.length + 1}`);
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const validateRows = () => {
    const newErrors = {};
    rows.forEach((row, i) => {
      if (!row.longUrl.trim()) {
        newErrors[i] = 'URL is required';
      } else if (!isValidUrl(row.longUrl.trim())) {
        newErrors[i] = 'Enter a valid URL (must include http:// or https://)';
      } else if (!isValidValidityMinutes(row.validity)) {
        newErrors[i] = 'Validity must be a positive whole number (minutes)';
      } else if (row.shortcode && !isValidShortcodeFormat(row.shortcode.trim())) {
        newErrors[i] = 'Shortcode must be 3-20 alphanumeric characters';
      } else if (row.shortcode && isShortcodeTaken(row.shortcode.trim())) {
        newErrors[i] = `Shortcode "${row.shortcode}" is already taken`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    await Log('frontend', 'info', 'page', `Submitting ${rows.length} URL(s) for shortening`);

    const isValid = validateRows();
    if (!isValid) {
      await Log('frontend', 'warn', 'page', 'Validation failed on URL shortener form submission');
      return;
    }

    const created = [];

    for (const row of rows) {
      const shortcode = row.shortcode.trim() || generateShortcode();
      const validityMinutes = row.validity ? parseInt(row.validity, 10) : DEFAULT_VALIDITY_MINUTES;
      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + validityMinutes * 60000);

      const record = {
        shortcode,
        longUrl: row.longUrl.trim(),
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        clicks: [],
      };

      saveUrl(record);
      created.push(record);

      await Log('frontend', 'info', 'page', `Created short URL ${shortcode} for ${row.longUrl}`);
    }

    setResults(created);
    setRows([createEmptyRow()]);
    setErrors({});
  };

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto', mt: 5, px: 2, mb: 8 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        🔗 URL Shortener
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Shorten up to {MAX_URLS} URLs at once. Validity defaults to {DEFAULT_VALIDITY_MINUTES} minutes if left blank.
      </Typography>

      {rows.map((row, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            p: 2.5,
            mt: 2,
            border: '1px solid #e0e0e0',
            borderRadius: 3,
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                label="Long URL"
                placeholder="https://example.com/page"
                value={row.longUrl}
                onChange={(e) => handleRowChange(index, 'longUrl', e.target.value)}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Validity (minutes)"
                placeholder="30"
                value={row.validity}
                onChange={(e) => handleRowChange(index, 'validity', e.target.value)}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Custom shortcode"
                placeholder="optional"
                value={row.shortcode}
                onChange={(e) => handleRowChange(index, 'shortcode', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={1} sx={{ textAlign: 'right' }}>
              {rows.length > 1 && (
                <Button color="error" size="small" onClick={() => removeRow(index)}>
                  ✕
                </Button>
              )}
            </Grid>
          </Grid>
          {errors[index] && (
            <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2 }}>
              {errors[index]}
            </Alert>
          )}
        </Paper>
      ))}

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={addRow}
          disabled={rows.length >= MAX_URLS}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          ➕ Add URL
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            boxShadow: 'none',
            '&:hover': { boxShadow: '0 2px 8px rgba(25,118,210,0.35)' },
          }}
        >
          ⚡ Shorten URLs
        </Button>
      </Box>

      {results.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            ✅ Results
          </Typography>
          {results.map((r) => (
            <Paper
              key={r.shortcode}
              elevation={0}
              sx={{
                p: 2.5,
                mb: 1.5,
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                borderLeft: '4px solid #1976d2',
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                <strong>Original:</strong> {r.longUrl}
              </Typography>
              <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5, color: '#1976d2' }}>
                🔗 {window.location.origin}/{r.shortcode}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ⏱ Expires: {new Date(r.expiresAt).toLocaleString()}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default ShortenerPage;