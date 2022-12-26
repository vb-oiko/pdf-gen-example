import { initTRPC } from "@trpc/server";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import http from "http";
import ReportController from "./controller/ReportController";

const trpcInstance = initTRPC.create();
const reportController = new ReportController(trpcInstance);

const router = trpcInstance.router;
const appRouter = router({
  listReports: reportController.listReports(),
});

const handler = createHTTPHandler({
  router: appRouter,
  createContext() {
    return {};
  },
});

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Request-Method", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }
  handler(req, res);
});

server.listen(2022);

export type AppRouter = typeof appRouter;
export type TRPCInstance = typeof trpcInstance;
