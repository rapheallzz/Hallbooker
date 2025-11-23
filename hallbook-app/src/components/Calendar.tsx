// components/Calendar.tsx
'use client';

import React from 'react';
import { DateRange, Range } from 'react-date-range';
import Swal from 'sweetalert2';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { isSameDay, isBefore, startOfDay } from 'date-fns';

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

  const handleDisabledDateClick = () => {
    Swal.fire({
      icon: 'error',
      title: 'Date Not Available',
      text: 'This date is blocked and cannot be selected.',
      confirmButtonColor: '#295FA7',
    });
  };

  // Custom day renderer to handle clicks and apply custom classes
  const dayContentRenderer = (day: Date) => {
    const isBlocked = unavailableDates.some(disabledDate => isSameDay(day, disabledDate));
    const isPast = isBefore(day, startOfDay(new Date()));

    let className = "w-full h-full flex items-center justify-center";
    if (isBlocked && !isPast) {
      className += " blocked-date";
    }

    return (
      <div
        onClick={() => isBlocked && !isPast && handleDisabledDateClick()}
        className={className}
      >
        <span>{day.getDate()}</span>
      </div>
    );
  };

  return (
    <div className="custom-calendar">
      <DateRange
        editableDateInputs={true}
        onChange={handleOnChange}
        moveRangeOnFirstSelection={false}
        ranges={state}
        disabledDates={unavailableDates}
        minDate={new Date()} // Prevent selecting past dates
        dayContentRenderer={dayContentRenderer}
        className="w-full availability-calendar"
      />
    </div>
  );
};

export default Calendar;
