import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const MONTHS = [
  'Січень',
  'Лютий',
  'Березень',
  'Квітень',
  'Травень',
  'Червень',
  'Липень',
  'Серпень',
  'Вересень',
  'Жовтень',
  'Листопад',
  'Грудень',
  
];

const WEEKDAYS_SHORT = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export function Calendar() {
  return (
    <DayPicker
      locale="it"
      months={MONTHS}
      weekdaysShort={WEEKDAYS_SHORT}
      firstDayOfWeek={1}
      showWeekNumber />
  );
}