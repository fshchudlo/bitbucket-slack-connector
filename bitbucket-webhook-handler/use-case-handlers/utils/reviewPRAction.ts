import { PullRequestPayload } from "../../../types/normalized-payload-types";
import { link, section } from "./slack-building-blocks";

export function reviewPRAction(payload: PullRequestPayload) {
    const pleaseReviewText = `Please ${link(payload.links.self, "review the PR")}`;
    return section(pleaseReviewText)
}