import React from "react";
import { trpc } from "../utils/trpc";

export const useAppSettings = () => {
  const { data } = trpc.getAppSettings.useQuery();
  return React.useMemo(() => data, [data]);
};
