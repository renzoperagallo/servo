export function getCycleDates(
  cycleStartDay: number,
  cycleEndDay: number,
  referenceDate: Date = new Date()
): { startDate: Date; endDate: Date } {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  let startDate: Date;
  let endDate: Date;

  if (cycleStartDay <= cycleEndDay) {
    startDate = new Date(year, month, cycleStartDay);
    endDate = new Date(year, month, cycleEndDay + 1);
    endDate.setMilliseconds(endDate.getMilliseconds() - 1);
  } else {
    if (referenceDate.getDate() >= cycleStartDay) {
      startDate = new Date(year, month, cycleStartDay);
      endDate = new Date(year, month + 1, cycleEndDay + 1);
      endDate.setMilliseconds(endDate.getMilliseconds() - 1);
    } else {
      startDate = new Date(year, month - 1, cycleStartDay);
      endDate = new Date(year, month, cycleEndDay + 1);
      endDate.setMilliseconds(endDate.getMilliseconds() - 1);
    }
  }

  return { startDate, endDate };
}

export function getCurrentCycleMonth(
  cycleStartDay: number,
  referenceDate: Date = new Date()
): { month: number; year: number } {
  const day = referenceDate.getDate();

  if (day >= cycleStartDay) {
    return {
      month: referenceDate.getMonth() + 1,
      year: referenceDate.getFullYear()
    };
  } else {
    const prevMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1);
    return {
      month: prevMonth.getMonth() + 1,
      year: prevMonth.getFullYear()
    };
  }
}

export function toISOString(date: Date): string {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}
