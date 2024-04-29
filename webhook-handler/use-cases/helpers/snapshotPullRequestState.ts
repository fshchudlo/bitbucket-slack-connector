import { PullRequestBasicNotification } from "../../../typings";
import { PullRequestSnapshotInSlackMetadata } from "../../ports/SlackAPIAdapter";

export function snapshotPullRequestState(payload: PullRequestBasicNotification) {
    return {
        eventType: "bitbucket_pull_request_opened",
        eventPayload: <PullRequestSnapshotInSlackMetadata>{
            pullRequestId: payload.pullRequest.id.toString(),
            projectKey: payload.pullRequest.toRef.repository.project.key,
            repositorySlug: payload.pullRequest.toRef.repository.slug
        }
    };
}