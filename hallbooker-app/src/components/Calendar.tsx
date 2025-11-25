// components/Calendar.tsx
'use client';

import React from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export type CalendarMode = 'range' | 'multiple';

interface CalendarProps {
  unavailableDates: Date[];
  mode: CalendarMode;
  onModeChange: (mode: CalendarMode) => void;
  selectedRange: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  selectedMultiple: Date[] | undefined;
  onMultipleChange: (dates: Date[] | undefined) => void;
  onDisabledDateClick?: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  unavailableDates,
  mode,
  onModeChange,
  selectedRange,
  onRangeChange,
  selectedMultiple,
  onMultipleChange,
  onDisabledDateClick,
}) => {
  const footer =
    mode === 'range' ? (
      <p>Please pick the first and last day of your stay.</p>
    ) : (
      <p>Please pick one or more days.</p>
    );

  return (
    <div className="custom-calendar-wrapper">
      <div className="flex justify-center mb-4 border-b">
        <button
          className={`px-4 py-2 ${mode === 'range' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => onModeChange('range')}
        >
          Date Range
        </button>
        <button
          className={`px-4 py-2 ${mode === 'multiple' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => onModeChange('multiple')}
        >
          Individual Dates
        </button>
      </div>
      {mode === 'range' ? (
        <DayPicker
          mode="range"
          selected={selectedRange}
          onSelect={onRangeChange}
          disabled={unavailableDates}
          footer={footer}
          onDayClick={(day, modifiers) => {
            if (modifiers.disabled && onDisabledDateClick) {
              onDisabledDateClick(day);
            }
          }}
        />
      ) : (
        <DayPicker
          mode="multiple"
          min={1}
          selected={selectedMultiple}
          onSelect={onMultipleChange}
          disabled={unavailableDates}
          footer={footer}
          onDayClick={(day, modifiers) => {
            if (modifiers.disabled && onDisabledDateClick) {
              onDisabledDateClick(day);
            }
          }}
        />
      )}
    </div>
  );
};

export default Calendar;
