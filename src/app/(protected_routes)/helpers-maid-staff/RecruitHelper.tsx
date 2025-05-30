'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Avatar,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSession } from 'next-auth/react';

const AndroidCard = styled(Card)(({ theme }) => ({
  margin: '12px',
  borderRadius: '16px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  padding: '12px',
}));

const AndroidAvatar = styled(Avatar)(() => ({
  width: 60,
  height: 60,
  marginRight: 16,
}));

interface Helper {
  _id: string;
  name: string;
  mobile: string;
  address: string;
  skill: string;
  father_name: string;
  picture_url: string;
}

const HelperList: React.FC = () => {
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loader = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();
  let accessToken = session?.user?.accessToken || undefined;


  const fetchHelpers = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch('http://139.84.166.124:8060/staff-service/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`, // Replace this
        },
        body: JSON.stringify({
          premise_id: session?.user?.primary_premise_id,
          page,
          limit: 10,
        }),
      });
      const json = await res.json();
      const newHelpers = json.data?.array || [];

      setHelpers((prev) => [...prev, ...newHelpers]);
      setHasMore(newHelpers.length > 0);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to fetch helpers:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  useEffect(() => {
    fetchHelpers();
  }, []);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchHelpers();
        }
      },
      { threshold: 1 }
    );
    if (loader.current) observer.observe(loader.current);
    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, [fetchHelpers]);

  return (
    <Box sx={{ background: '#f5f5f5', minHeight: '100vh', pb: 4 }}>
      {helpers.map((helper) => (
        <AndroidCard key={helper._id}>
          <AndroidAvatar src={helper.picture_url} />
          <CardContent sx={{ padding: 0 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {helper.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {helper.skill} • {helper.mobile === '-' || helper.mobile === 'NA' ? 'No Mobile' : helper.mobile}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {helper.address}
            </Typography>
          </CardContent>
        </AndroidCard>
      ))}
      {loading && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress size={24} />
        </Box>
      )}
      <div ref={loader}></div>
    </Box>
  );
};

export default HelperList;
