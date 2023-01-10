# Full Stack Take Home Assignment

## Requirements

**Task:** create an API generating PDF reports and a UI requesting and downloading these reports. Report format and data are your choice. 
**Hint:** both API and UI should be able to handle long-lasting requests/jobs.
**Idea:** kline/candlestick bars for crypto token market data.

## Motivation

One of the reasons for me to complete this assignment was the fact that I was fascinated how such a short description can have so many implementation implications. Another reason was that I wanted to try some technologies I had no experience with before: tRPC, Vite, Dynamo DB, etc.

## Design decisions

I tend to consider this project as a proof of concept and all the decisions layed out below are rather arbitrary.

The requirements mentioned long-lasting requests/jobs. My mental model for that is a job queue on the server. The client sends a request to the server enqueuing the job, the server then processes the queue job by job and notifies the client about job statuses and links to download generated reports.

Two way communication between server and the client can be fulfilled either by using socket or by polling. I chose polling, the client would regularly hit the server for the fresh version of the data.

The downloadable files should be stored somewhere and I decided to use AWS S3 for that. As a DB for the project I chose Dynamo DB, as I was interested to play with noSQL database and also because I heard this buzz word recently.

And as for the queue processing I decided to use a cron job and a table to store the status of the job. As lock for the cron I decided to use a rough and dirty solution - a local temporary file with a timestamp inside to be able to track if some job hung up. For a production ready solution I would use Redis/Zookeeper.

I decided to use React, Vite, PicoCSS for the client. And tRPC and a monorepo to have server-client type safety.

Implementing the actual data downloading, unzipping and generating PDF file required some playing around and I decided to stop on the first workable solution which is creating intermediate files in a local project folder. Maybe a better solution would be to try to implement it with buffers.

## How to run project locally
### Playing around

```bash
npm i
npm run dev
```

Try editing the ts files to see the type checking in action :)

### Building

```bash
npm run build
npm run start
```

## useful links

While developing I was doing some research and saving the links for the found information in this file. As I am writing this document I decided not to wipe them out.

### tRPC

https://trpc.io/docs/react 
https://github.com/trpc/trpc/tree/main/examples/minimal-react
https://github.com/trpc/trpc/tree/main/examples/express-minimal

### pdfKit

https://pdfkit.org/docs/getting_started.html
https://github.com/natancabral/pdfkit-table#readme

### binance

https://data.binance.vision/?prefix=data/spot/daily/klines/1INCHBTC/1s/
https://www.binance.com/en/support/faq/how-to-download-historical-market-data-on-binance-5810ae42176b4770b880ce1f14932262

