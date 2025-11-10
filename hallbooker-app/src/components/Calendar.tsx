// components/Calendar.tsx
'use client';

import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface CalendarProps {
  unavailableDates: Date[];
}

const Calendar: React.FC<CalendarProps> = ({ unavailableDates }) => {
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  return (
    <DateRange
      editableDateInputs={true}
      onChange={(item) => setState([item.selection] as any)}
      moveRangeOnFirstSelection={false}
      ranges={state}
      disabledDates={unavailableDates}
    />
  );
};

export default Calendar;
