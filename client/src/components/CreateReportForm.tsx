import React from "react";
import { CreateReportPayload } from "../../../server/service/ReportService";
import { useAppSettings } from "../hooks/useAppSettings";

export interface CreateReportFormProps {}

export const CreateReportForm: React.FC<CreateReportFormProps> = ({}) => {
  const appSettings = useAppSettings();
  const [formData, setFormData] =
    React.useState<Partial<CreateReportPayload>>();

  const handleChange = React.useCallback(
    (ev: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      const { name, value } = ev.target;
      setFormData((data) => ({ ...data, [name]: value }));
    },
    []
  );

  const handleSubmit = React.useCallback(() => {}, []);

  if (!appSettings) {
    return null;
  }

  const {
    tickers,
    date_range_start: dateRangeStart,
    frequencies,
  } = appSettings;

  const isFormValid = formData?.ticker && formData.frequency && formData.date;

  return (
    <div className="grid">
      <select name="ticker" required onChange={handleChange}>
        <option value="">Select a ticker</option>
        {tickers.map((ticker) => (
          <option key={ticker} value={ticker}>
            {ticker}
          </option>
        ))}
      </select>

      <select name="frequency" required onChange={handleChange}>
        <option value="">Select klines frequency</option>
        {frequencies.map((frequency) => (
          <option key={frequency}>{frequency}</option>
        ))}
      </select>

      <input
        type="date"
        name="date"
        placeholder="Select a date"
        min={dateRangeStart}
        required
        onChange={handleChange}
      />

      <button
        type="submit"
        className={isFormValid ? "" : "secondary"}
        disabled={!isFormValid}
      >
        Create report
      </button>
    </div>
  );
};
