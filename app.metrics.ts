import client, { collectDefaultMetrics } from "prom-client";
import { NextFunction, Request, Response } from "express";

collectDefaultMetrics();

const httpRequestDurationMicroseconds = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.1, 0.5, 1, 2, 5, 10] // Define your buckets here
});

export default function measureRequestDuration(req: Request, res: Response, next: NextFunction) {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on("finish", () => {
        end({ method: req.method, route: req.route ? req.route.path : req.path, status_code: res.statusCode });
    });
    next();
}
