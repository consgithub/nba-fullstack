import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../store';

// Types
export interface Coordinate {
  x: number;
  y: number;
  count: number;
  made: number;
  zone: string;
}

export interface ShotDistribution {
  year: number;
  totalShots: number;
  shotZones: {
    [zone: string]: {
      made: number;
      missed: number;
      total: number;
    };
  };
  zoneFrequency: {
    [zone: string]: number;
  };
  zonePercentage: {
    [zone: string]: number;
  };
  coordinates: Coordinate[];
}

export interface ShotTrend {
  zone: string;
  trend: {
    year: number;
    frequency: number;
    percentage: number;
  }[];
}

interface ShotState {
  selectedYear: number;
  availableYears: number[];
  shotDistribution: ShotDistribution | null;
  shotTrends: ShotTrend[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: ShotState = {
  selectedYear: new Date().getFullYear(),
  availableYears: Array.from({ length: new Date().getFullYear() - 2016 }, (_, i) => 2017 + i),
  shotDistribution: null,
  shotTrends: [],
  isLoading: false,
  error: null
};

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchShotsByYear = createAsyncThunk(
  'shots/fetchByYear',
  async (year: number, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      const response = await axios.get(`${API_URL}/shots/${year}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to fetch shot data');
      }
      return rejectWithValue('Failed to fetch shot data');
    }
  }
);

export const fetchShotTrends = createAsyncThunk(
  'shots/fetchTrends',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      const response = await axios.get(`${API_URL}/shots/trends`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to fetch trend data');
      }
      return rejectWithValue('Failed to fetch trend data');
    }
  }
);

// Slice
const shotSlice = createSlice({
  name: 'shots',
  initialState,
  reducers: {
    setSelectedYear: (state, action) => {
      state.selectedYear = action.payload;
    },
    clearShotError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch shots by year
      .addCase(fetchShotsByYear.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShotsByYear.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shotDistribution = action.payload;
      })
      .addCase(fetchShotsByYear.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch shot data';
      })
      
      // Fetch shot trends
      .addCase(fetchShotTrends.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShotTrends.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shotTrends = action.payload;
      })
      .addCase(fetchShotTrends.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch trend data';
      });
  }
});

// Actions
export const { setSelectedYear, clearShotError } = shotSlice.actions;

// Selectors
export const selectShot = (state: RootState) => state.shots;
export const selectSelectedYear = (state: RootState) => state.shots.selectedYear;
export const selectAvailableYears = (state: RootState) => state.shots.availableYears;
export const selectShotDistribution = (state: RootState) => state.shots.shotDistribution;
export const selectShotTrends = (state: RootState) => state.shots.shotTrends;
export const selectShotLoading = (state: RootState) => state.shots.isLoading;
export const selectShotError = (state: RootState) => state.shots.error;

export default shotSlice.reducer;