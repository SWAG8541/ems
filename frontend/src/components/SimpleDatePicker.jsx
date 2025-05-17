import React from 'react';
import { TextField } from '@mui/material';

/**
 * A simple date picker component that uses MUI TextField with native date input
 * This is a temporary solution until we can fix the date-fns compatibility issues
 */
const SimpleDatePicker = ({
  label,
  value,
  onChange,
  error,
  helperText,
  slotProps = {}
}) => {
  // Format date to YYYY-MM-DD for the input
  const formatDateForInput = (date) => {
    if (!date) return '';

    // If it's already a string in YYYY-MM-DD format, return it
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    // Otherwise, convert to Date object and format
    const d = new Date(date);
    if (isNaN(d.getTime())) return ''; // Invalid date

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    if (!inputValue) {
      onChange(null);
      return;
    }

    const newDate = new Date(inputValue);
    if (!isNaN(newDate.getTime())) {
      onChange(newDate);
    }
  };

  return (
    <TextField
      label={label}
      type="date"
      value={formatDateForInput(value)}
      onChange={handleInputChange}
      error={error}
      helperText={helperText}
      InputLabelProps={{
        shrink: true,
      }}
      fullWidth={slotProps?.textField?.fullWidth}
      size={slotProps?.textField?.size || 'medium'}
      {...(slotProps?.textField || {})}
    />
  );
};

export default SimpleDatePicker;
