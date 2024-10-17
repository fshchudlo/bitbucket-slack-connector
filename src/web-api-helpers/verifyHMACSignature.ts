import { AppConfig } from "../app.config";
import crypto from "crypto";

export default async function verifyHMACSignature(req: any, res: any, next: any) {
    if (!AppConfig.HMAC_SECRET) {
        next();
        return;
    }
    const signature = req.headers["x-hub-signature"];
    if (!signature || typeof signature !== "string") {
        console.warn("No signature found in request");
        res.status(401).send("Invalid signature");
        return;
    }

    const hmac = crypto.createHmac("sha256", AppConfig.HMAC_SECRET);
    const digest = "sha256=" + hmac.update(req.rawBody).digest("hex");

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
        next();
    } else {
        console.warn("Request signature is invalid ");
        res.status(401).send("Invalid signature");
    }
}