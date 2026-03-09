import { createSlice } from "@reduxjs/toolkit";

const movieSlice = createSlice({
  name: "movies",
  initialState: {
    trending:      [],
    popular:       [],
    topRated:      [],
    tvShows:       [],
    upcoming:      [],
    searchResults: [],
    searchQuery:   "",
    isLoading:     false,
    error:         null,
  },
  reducers: {
    setTrending:      (state, action) => { state.trending      = action.payload; },
    setPopular:       (state, action) => { state.popular       = action.payload; },
    setTopRated:      (state, action) => { state.topRated      = action.payload; },
    setTvShows:       (state, action) => { state.tvShows       = action.payload; },
    setUpcoming:      (state, action) => { state.upcoming      = action.payload; },
    setSearchResults: (state, action) => { state.searchResults = action.payload; },
    setSearchQuery:   (state, action) => { state.searchQuery   = action.payload; },
    setLoading:       (state, action) => { state.isLoading     = action.payload; },
    setError:         (state, action) => { state.error         = action.payload; },
    clearSearch:      (state)         => {
      state.searchResults = [];
      state.searchQuery   = "";
    },
  },
});

export const {
  setTrending, setPopular, setTopRated,
  setTvShows, setUpcoming,
  setSearchResults, setSearchQuery,
  setLoading, setError, clearSearch,
} = movieSlice.actions;

export default movieSlice.reducer;