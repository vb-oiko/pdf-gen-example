import { trpc } from "../utils/trpc";
import { format } from "date-fns";
import React from "react";

const POLLING_DELAY_MS = 1_000;

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
          <th>ID</th>
          <th>Created</th>
          <th>Date</th>
          <th>Ticker</th>
          <th>Frequency</th>
          <th>Status</th>
          <th>Download URL</th>
        </tr>
      </thead>
      <tbody>
        {list.map(
          ({
            id,
            created,
            date,
            ticker,
            frequency,
            jobStatus,
            downloadUrl,
          }) => (
            <tr key={id}>
              <td>{id.slice(0, 6)}</td>
              <td>{format(new Date(created), "yyyy-MM-dd HH:mm:ss")}</td>
              <td>{date}</td>
              <td>{ticker}</td>
              <td>{frequency}</td>
              <td>{jobStatus}</td>
              <td>{downloadUrl ? <a href={downloadUrl}>download</a> : ""}</td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
};
