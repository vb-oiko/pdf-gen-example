import { trpc } from "./utils/trpc";

export function Greeting() {
  const { data } = trpc.listReports.useQuery();

  return <div>{JSON.stringify(data, null, 2)}</div>;
}
