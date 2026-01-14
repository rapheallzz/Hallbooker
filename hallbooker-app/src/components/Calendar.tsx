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
  getDateAvailability?: (date: Date) => 'fully booked' | 'partially booked' | 'fully available';
  displayedMonth: Date;
  onMonthChange: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  unavailableDates,
  selectedDates,
  onChange,
  onDisabledDateClick,
  getDateAvailability,
  displayedMonth,
  onMonthChange,
}) => {
  const handleDayClick = (day: Date, { disabled }: { disabled: boolean }) => {
    if (disabled && onDisabledDateClick) {
      onDisabledDateClick(day);
    }
  };

  const modifiers = {
    fully_booked: (date: Date) => getDateAvailability ? getDateAvailability(date) === 'fully booked' : false,
    partially_booked: (date: Date) => getDateAvailability ? getDateAvailability(date) === 'partially booked' : false,
    fully_available: (date: Date) => getDateAvailability ? getDateAvailability(date) === 'fully available' : false,
  };

  return (
    <div className="custom-calendar-wrapper">
      <style>{`
        .rdp-day_disabled, .rdp-day_fully_booked {
          background-color: #FECACA !important;
          color: #374151 !important;
          cursor: not-allowed;
        }
        .rdp-day_disabled:hover, .rdp-day_fully_booked:hover {
          background-color: #FCA5A5 !important;
        }
        .rdp-day_partially_booked {
          background-color: #FDBA74 !important;
          color: #374151 !important;
        }
        .rdp-day_partially_booked:hover {
          background-color: #FB923C !important;
        }
        .rdp-day_fully_available {
          background-color: #A7F3D0 !important;
          color: #374151 !important;
        }
        .rdp-day_fully_available:hover {
          background-color: #6EE7B7 !important;
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
        month={displayedMonth}
        onMonthChange={onMonthChange}
        modifiers={modifiers}
        modifiersClassNames={{
            disabled: 'rdp-day_disabled',
            selected: 'rdp-day_selected',
            fully_booked: 'rdp-day_fully_booked',
            partially_booked: 'rdp-day_partially_booked',
            fully_available: 'rdp-day_fully_available',
        }}
      />
    </div>
  );
};

export default Calendar;