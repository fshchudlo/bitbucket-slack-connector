import { PullRequestPayload } from "../../typings";

export default function buildChannelName(pullRequest: PullRequestPayload): string {
    const pullRequestId = pullRequest.id.toString();
    const projectKey = pullRequest.toRef.repository.project.key.replace("~", "").trim();
    const repositorySlug = pullRequest.toRef.repository.slug.replace(".", "");

    const maxChannelNameLengthInSlack = 80;
    const lengthLeftForTheKey = maxChannelNameLengthInSlack - pullRequestId.length - 4; //4 is the length of 'pr--' symbols in resulting channel name;

    const key = `${projectKey}-${repositorySlug}`.slice(0, lengthLeftForTheKey).toLowerCase();
    return `pr-${key}-${pullRequestId}`.replace(/-+/g, '-');
}

