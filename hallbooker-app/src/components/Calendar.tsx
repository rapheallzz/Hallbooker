// components/Calendar.tsx
'use client';

import React from 'react';
import { DateRange, Range } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { isSameDay } from 'date-fns';

interface CalendarProps {
  unavailableDates: Date[];
  onChange: (range: Range) => void;
  onDisabledDateClick?: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  unavailableDates,
  onChange,
  onDisabledDateClick,
}) => {
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

  const dayContentRenderer = (day: Date) => {
    const isDisabled = unavailableDates.some(unavailableDate =>
      isSameDay(day, unavailableDate)
    );

    const handleClick = () => {
      if (isDisabled && onDisabledDateClick) {
        onDisabledDateClick(day);
      }
    };

    return (
      <div
        onClick={handleClick}
        title={isDisabled ? 'This date is not available' : ''}
      >
        <span>{day.getDate()}</span>
      </div>
    );
  };

  return (
    <div className="custom-calendar-wrapper">
      <DateRange
        editableDateInputs={true}
        onChange={handleOnChange}
        moveRangeOnFirstSelection={false}
        ranges={state}
        disabledDates={unavailableDates}
        className="w-full"
        dayContentRenderer={dayContentRenderer}
      />
    </div>
  );
};

export default Calendar;
