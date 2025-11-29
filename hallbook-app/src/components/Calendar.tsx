// components/Calendar.tsx
'use client';

import React from 'react';
import { DateRange, Range } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface CalendarProps {
  unavailableDates: Date[];
  onChange: (range: Range) => void;
}

const Calendar: React.FC<CalendarProps> = ({ unavailableDates, onChange }) => {
  const [state, setState] = React.useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  const handleOnChange = (ranges: any) => {
    const { selection } = ranges;
    onChange(selection);
    setState([selection]);
  };

  return (
    <div className="calendar-wrapper">
      <DateRange
        editableDateInputs={true}
        onChange={handleOnChange}
        moveRangeOnFirstSelection={false}
        ranges={state}
        disabledDates={unavailableDates}
        className="w-full"
      />
    </div>
  );
};

export default Calendar;
