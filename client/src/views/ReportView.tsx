import { CreateReportForm } from "../components/CreateReportForm";
import { ReportList } from "../components/ReportList";

export const ReportView = () => (
  <article>
    <header>
      <CreateReportForm />
    </header>
    <ReportList />
    <footer></footer>
  </article>
);
