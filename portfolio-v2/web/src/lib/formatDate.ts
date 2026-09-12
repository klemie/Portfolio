const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/**
 * Sanity date fields are plain 'YYYY-MM-DD' strings. Parsed manually rather
 * than via Date, which would treat them as UTC and shift a day in PST.
 */
export const formatMonthYear = (date: string): string => {
  const [year, month] = date.split('-')
  const name = MONTHS[Number(month) - 1]
  return name ? `${name} ${year}` : date
}

export const formatRange = (start: string, end?: string | null): string =>
  `${formatMonthYear(start)} — ${end ? formatMonthYear(end) : 'Present'}`
