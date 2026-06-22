import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { Log } from 'logging-middleware';
import { getUrlByShortcode, recordClick } from '../utils/storage';

function RedirectHandler() {
  const { shortcode } = useParams();
  const [status, setStatus] = useState('checking'); // checking | redirecting | not_found | expired

  useEffect(() => {
    async function handleRedirect() {
      await Log('frontend', 'info', 'page', `Redirect requested for shortcode ${shortcode}`);

      const record = getUrlByShortcode(shortcode);

      if (!record) {
        setStatus('not_found');
        await Log('frontend', 'warn', 'page', `No URL found for shortcode ${shortcode}`);
        return;
      }

      const isExpired = new Date(record.expiresAt) < new Date();
      if (isExpired) {
        setStatus('expired');
        await Log('frontend', 'warn', 'page', `Shortcode ${shortcode} has expired`);
        return;
      }

      recordClick(shortcode, {
        timestamp: new Date().toISOString(),
        source: document.referrer || 'direct',
        location: 'IN', // coarse-grained placeholder; real geo lookup needs an external API
      });

      await Log('frontend', 'info', 'page', `Redirecting shortcode ${shortcode} to ${record.longUrl}`);

      setStatus('redirecting');
      window.location.href = record.longUrl;
    }

    handleRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcode]);

  if (status === 'checking' || status === 'redirecting') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Redirecting…</Typography>
      </Box>
    );
  }

  if (status === 'not_found') {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 8 }}>
        <Alert severity="error">
          No URL found for shortcode "{shortcode}". It may not exist or was never created.
        </Alert>
      </Box>
    );
  }

  if (status === 'expired') {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 8 }}>
        <Alert severity="warning">
          This shortened link has expired.
        </Alert>
      </Box>
    );
  }

  return null;
}

export default RedirectHandler;