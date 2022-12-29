import { trpc } from "../utils/trpc";
import { format } from "date-fns";

export const ReportList = () => {
  const { data } = trpc.listReports.useQuery({});

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
            <td>{report.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
