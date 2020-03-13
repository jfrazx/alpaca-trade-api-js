import { isString, isNumber } from './is';
import { Datelike } from '../types';

// certain endpoints don't accept ISO dates,
// so to allow the user to use regular JS date objects
// with the api, we need to convert them to strings
export function toDateString(date: Datelike | null) {
  if (date === null || isString(date) || isNumber(date)) return date;
  const year = date.getUTCFullYear();
  const month = numPad(date.getUTCMonth() + 1);
  const day = numPad(date.getUTCDate());
  return `${year}-${month}-${day}`;
}

function numPad(num: number): string {
  return num < 10 ? `0${num}` : num.toString();
}
