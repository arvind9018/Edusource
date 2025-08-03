import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { debounce } from 'lodash';

const FilterBar = ({
  filterCategory,
  setFilterCategory,
  searchKeyword,
  setSearchKeyword,
  categories = [],
}) => {
  const [localSearchInput, setLocalSearchInput] = useState(searchKeyword || '');
  
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchKeyword(value.trim());
    }, 500),
    []
  );

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleCategoryChange = (event) => {
    setFilterCategory(event.target.value);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setLocalSearchInput(value);
    debouncedSearch(value);
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      debouncedSearch.flush(); // Immediately apply any pending debounced update
    }
  };

  const handleClearSearch = () => {
    setLocalSearchInput('');
    setSearchKeyword('');
    debouncedSearch.cancel(); // Cancel any pending debounced updates
  };

  // Sync local state with props when they change (e.g., from external reset)
  useEffect(() => {
    setLocalSearchInput(searchKeyword || '');
  }, [searchKeyword]);

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      mb: 4, 
      flexWrap: 'wrap', 
      alignItems: 'center',
      p: 1,
      backgroundColor: 'background.paper',
      borderRadius: 1,
      boxShadow: 1
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        flexGrow: 1,
        minWidth: 250
      }}>
        <TextField
          label="Search Courses"
          variant="outlined"
          size="small"
          value={localSearchInput}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyPress}
          sx={{ flexGrow: 1 }}
          fullWidth
          placeholder="Type to search..."
        />
        {localSearchInput && (
          <IconButton 
            onClick={handleClearSearch}
            edge="end"
            aria-label="clear search"
            sx={{ ml: 1 }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <FormControl sx={{ minWidth: 180 }} size="small">
        <InputLabel id="category-filter-label">Category</InputLabel>
        <Select
          labelId="category-filter-label"
          id="category-filter"
          value={filterCategory}
          label="Category"
          onChange={handleCategoryChange}
          sx={{ backgroundColor: 'background.paper' }}
        >
          <MenuItem value="All">All Categories</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default React.memo(FilterBar);