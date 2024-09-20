import { PullRequestPayload } from "../../contracts";
import { link, section } from "./slack-building-blocks";

export function reviewPRAction(payload: PullRequestPayload) {
    const pleaseReviewText = `Please ${link(payload.links.self, "review the PR")}`;
    return section(pleaseReviewText)
}