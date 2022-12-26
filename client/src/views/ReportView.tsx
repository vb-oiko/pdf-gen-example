import { CreateReportButton } from "../components/CreateReportButton";
import { ReportList } from "../components/ReportList";

export const ReportView = () => (
  <article>
    <header>
      <CreateReportButton />
    </header>
    <ReportList />
    <footer></footer>
  </article>
);
