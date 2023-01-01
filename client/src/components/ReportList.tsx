import { trpc } from "../utils/trpc";
import { format } from "date-fns";
import React from "react";

const POLLING_DELAY_MS = 1000_000;

export const ReportList = () => {
  const { data, refetch } = trpc.listReports.useQuery({});
  const intervalRef = React.useRef(0);
  const generate = trpc.generateReport.useMutation();

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
          <th>Download URL</th>
          <th>Action</th>
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
              <td>{format(new Date(created), "yyyy-MM-dd HH:mm:ss")}</td>
              <td>{date}</td>
              <td>{ticker}</td>
              <td>{frequency}</td>
              <td>{jobStatus}</td>
              <td>{downloadUrl ? downloadUrl : ""}</td>
              <td>
                <span role="button" onClick={() => generate.mutate({ id: id })}>
                  Start
                </span>
              </td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
};
