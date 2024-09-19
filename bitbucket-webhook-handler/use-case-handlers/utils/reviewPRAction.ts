import { PullRequestPayload } from "../../../types/bitbucket-payload-types";
import { link, section } from "./slack-building-blocks";

export function reviewPRAction(payload: PullRequestPayload) {
    const pleaseReviewText = `Please ${link(payload.links.self[0].href, "review the PR")}`;
    return section(pleaseReviewText)
}