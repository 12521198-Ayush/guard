'use client'
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
} from '@mui/material';

const LocalStorageViewer = () => {
  const [localData, setLocalData] = useState<{ key: string; value: string }[]>([]);

  const loadLocalStorage = () => {
    const items: { key: string; value: string }[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const value = localStorage.getItem(key);
      items.push({ key, value: value ?? '' });
    }

    setLocalData(items);
  };

  useEffect(() => {
    loadLocalStorage();

    const handleStorageChange = () => {
      loadLocalStorage();
    };

    // Optional: Handle cross-tab sync
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        📦 LocalStorage Data
      </Typography>

      <Button variant="outlined" onClick={loadLocalStorage} sx={{ mb: 2 }}>
        🔄 Refresh
      </Button>

      {localData.length === 0 ? (
        <Typography>No data found in localStorage.</Typography>
      ) : (
        localData.map(({ key, value }) => (
          <Card key={key} sx={{ mb: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                {key}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {value}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default LocalStorageViewer;
