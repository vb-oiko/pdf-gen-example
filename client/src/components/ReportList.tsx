import { trpc } from "../utils/trpc";
import { format } from "date-fns";
import React from "react";

const POLLING_DELAY_MS = 10_000;

export const ReportList = () => {
  const { data, refetch } = trpc.listReports.useQuery({});
  const intervalRef = React.useRef(0);

  React.useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      refetch();
    }, POLLING_DELAY_MS);

    return () => {
      window.clearInterval(intervalRef.current);
    };
  }, []);

  if (!data) {
    return null;
  }

  const { list } = data;

  return (
    <table>
      <thead>
        <tr>
          <th>Created</th>
          <th>Date</th>
          <th>Ticker</th>
          <th>Frequency</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {list.map((report) => (
          <tr key={report.id}>
            <td>{format(new Date(report.created), "yyyy-MM-dd HH:mm:ss")}</td>
            <td>{report.date}</td>
            <td>{report.ticker}</td>
            <td>{report.frequency}</td>
            <td>{report.jobStatus}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
