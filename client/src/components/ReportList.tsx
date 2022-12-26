import { trpc } from "../utils/trpc";

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
          <th>ID</th>
          <th>Created</th>
          <th>Date</th>
          <th>Ticker</th>
          <th>Frequency</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {list.map((report) => (
          <tr>
            <td>{report.id}</td>
            <td>{report.created}</td>
            <td>{report.date}</td>
            <td>{report.ticker}</td>
            <td>{report.frequency}</td>
            <td>{report.frequency}</td>
            <td>{report.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
