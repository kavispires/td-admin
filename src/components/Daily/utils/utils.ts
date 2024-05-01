import moment from 'moment';

/**
 * Returns the current date in the format 'YYYY-MM-DD'.
 *
 * @returns {string} The current date in 'YYYY-MM-DD' format.
 */
export function getToday(): string {
  return moment().format('YYYY-MM-DD');
}

export function getNextDay(dateString: string): string {
  const inputDate = moment(dateString, 'YYYY-MM-DD');
  const nextDate = inputDate.add(1, 'days');

  return nextDate.format('YYYY-MM-DD');
}
