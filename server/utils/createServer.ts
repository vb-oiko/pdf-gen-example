import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import http from "http";
import { AppRouter } from "..";

export const createServer = (appRouter: AppRouter) => {
  const handler = createHTTPHandler({
    router: appRouter,
    createContext() {
      return {};
    },
  });

  return http.createServer((req, res) => {
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
};
