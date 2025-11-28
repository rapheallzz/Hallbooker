// components/Calendar.tsx
'use client';

import React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface CalendarProps {
  unavailableDates: Date[];
  selectedDates: Date[] | undefined;
  onChange: (dates: Date[] | undefined) => void;
  onDisabledDateClick?: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  unavailableDates,
  selectedDates,
  onChange,
  onDisabledDateClick,
}) => {
  const handleDayClick = (day: Date, { disabled }: { disabled: boolean }) => {
    if (disabled && onDisabledDateClick) {
      onDisabledDateClick(day);
    }
  };

  return (
    <div className="custom-calendar-wrapper">
      <style>{`
        .rdp-day_disabled {
          color: #d1d5db;
          cursor: not-allowed;
        }
        .rdp-day_selected {
            background-color: #295FA7 !important;
            color: white !important;
        }
      `}</style>
      <DayPicker
        mode="multiple"
        min={1}
        selected={selectedDates}
        onSelect={onChange}
        disabled={unavailableDates}
        onDayClick={handleDayClick}
        modifiersClassNames={{
            disabled: 'rdp-day_disabled',
            selected: 'rdp-day_selected',
        }}
      />
    </div>
  );
};

export default Calendar;