import { DATE_RANGE_START } from "../constant/constants";
import { TickerDate } from "../constant/types";

export const isValidTickerDate = (
  dateString: unknown
): dateString is TickerDate => {
  if (typeof dateString !== "string") {
    return false;
  }

  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/) === null) {
    return false;
  }

  const timestamp = new Date(dateString).getTime();
  const rangeStart = new Date(DATE_RANGE_START).getTime();

  const now = new Date();

  const rangeEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDay() - (now.getUTCHours() < 10 ? 2 : 1)
  ).getTime();

  if (timestamp < rangeStart || timestamp > rangeEnd) {
    return false;
  }

  return true;
};
