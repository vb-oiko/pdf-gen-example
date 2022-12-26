import { z } from "zod";
import { TRPCInstance } from "..";
import { DATE_RANGE_START, FREQUENCIES, TICKERS } from "../constant/constants";
import { TickerDate, Frequency, Ticker } from "../constant/types";

export const getAppSettingsRequest = z.object({}).nullish();

export default class AppSettingsController {
  constructor(private readonly trpcInstance: TRPCInstance) {}

  getAppSettings() {
    return this.trpcInstance.procedure
      .input(getAppSettingsRequest)
      .query((): GetAppSettingsResponse => {
        return {
          date_range_start: DATE_RANGE_START,
          tickers: [...TICKERS],
          frequencies: [...FREQUENCIES],
        };
      });
  }
}

export type GetAppSettingsResponse = {
  date_range_start: TickerDate;
  tickers: Ticker[];
  frequencies: Frequency[];
};
