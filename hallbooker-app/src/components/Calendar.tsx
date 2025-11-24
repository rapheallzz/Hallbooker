'use client';

import DatePicker from 'react-multi-date-picker';
import { DateObject } from 'react-multi-date-picker';

interface CalendarProps {
  unavailableDates: Date[];
  value: DateObject[] | null;
  onChange: (dates: DateObject[] | null) => void;
  onDisabledDateClick: () => void;
}

const Calendar = ({ unavailableDates, value, onChange, onDisabledDateClick }: CalendarProps) => {
  return (
    <div className="w-full">
      <DatePicker
        multiple
        value={value}
        onChange={onChange}
        mapDays={({ date, isSameDate }) => {
          const isUnavailable = unavailableDates.some(unavailableDate => isSameDate(date, unavailableDate));
          if (isUnavailable) {
            return {
              disabled: true,
              style: { color: "#ccc" },
              onClick: onDisabledDateClick,
            };
          }
        }}
        minDate={new Date()}
        containerClassName="w-full"
        className="rmdp-prime w-full"
      />
    </div>
  );
};

export default Calendar;
