'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Avatar,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  TextField,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
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
  const [searchCardNo, setSearchCardNo] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const loader = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken || undefined;

  const fetchHelpers = useCallback(async () => {
    if (loading || (!hasMore && !isSearching)) return;
    setLoading(true);
    try {
      const res = await fetch('http://139.84.166.124:8060/staff-service/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          premise_id: session?.user?.primary_premise_id,
          page,
          limit: 10,
          bCountNeeded: 'no',
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
  }, [page, loading, hasMore, isSearching, accessToken, session]);

  const searchHelperByCardNo = async () => {
    if (!searchCardNo.trim()) {
      setIsSearching(false);
      setHelpers([]);
      setPage(1);
      setHasMore(true);
      setNoResults(false);
      return;
    }

    setIsSearching(true);
    setLoading(true);
    setNoResults(false);
    try {
      const res = await fetch('http://139.84.166.124:8060/staff-service/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          premise_id: session?.user?.primary_premise_id,
          card_no: Number(searchCardNo), // this should be a valid number
        }),
      });

      const json = await res.json();
      const result = Array.isArray(json.data?.array) ? json.data.array : [];

      console.log('Search result:', result);

      setHelpers(result);
      setHasMore(false);
      setNoResults(result.length === 0);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!isSearching) fetchHelpers();
  }, [fetchHelpers, isSearching]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !isSearching) {
          fetchHelpers();
        }
      },
      { threshold: 1 }
    );
    if (loader.current) observer.observe(loader.current);
    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, [fetchHelpers, hasMore, loading, isSearching]);

  return (
    <div className="bg-white p-3 font-sans transition-all">
      <div className="flex justify-center mb-3">
        <h2
          className="text-xl font-medium text-[#222] px-6 py-3 rounded-2xl bg-white"
          style={{
            textAlign: 'center',
            width: '90%',
            background: 'linear-gradient(to right, #ffffff, #f9fbfd)',
            boxShadow:
              'inset 0 2px 5px rgba(0, 0, 0, 0.05), inset 0 -1px 3px rgba(0, 0, 0, 0.07)',
          }}
        >
          Helper List
        </h2>
      </div>

      {/* 🔍 Search Input */}
      <Box className="flex items-center justify-center mb-4 gap-2 px-4">
        <TextField
          variant="outlined"
          size="small"
          label="Search by Card No"
          value={searchCardNo}
          onChange={(e) => setSearchCardNo(e.target.value)}
          fullWidth
        />
        <IconButton color="primary" onClick={searchHelperByCardNo}>
          <SearchIcon />
        </IconButton>
      </Box>
        {/* <Typography variant="body2" color="text.secondary" align="center">
          Searching: {isSearching ? 'Yes' : 'No'}, Helpers: {helpers.length}
        </Typography> */}


      <Box className="mt-4 space-y-4 overflow-y-auto" style={{ height: '70vh' }}>
        {helpers.map((helper) => (
          <AndroidCard key={helper._id}>
            <AndroidAvatar src={helper.picture_url} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {helper.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                {helper.skill} •{' '}
                {helper.mobile === '-' || helper.mobile === 'NA'
                  ? 'No Mobile'
                  : helper.mobile}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
              >
                {helper.address}
              </Typography>
            </Box>
          </AndroidCard>
        ))}

        {!loading && helpers.length === 0 && noResults && (
          <Typography align="center" color="text.secondary">
            No helper found.
          </Typography>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!isSearching && <div ref={loader}></div>}
      </Box>
    </div>
  );
};

export default HelperList;
