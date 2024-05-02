import { PullRequestPayload } from "../bitbucket-payload-types";

interface PullRequestFlattenTraits {
    pullRequestId: string | number;
    repositorySlug: string;
    projectKey: string;
}

export function buildChannelName(params: PullRequestFlattenTraits | PullRequestPayload): string {
    const maxChannelNameLengthInSlack = 80;
    const channelNamePrefix = "pr-";
    const projectRepoSeparator = "-";

    const pullRequestId = ("pullRequestId" in params ? params.pullRequestId : params.id)
        .toString();
    const projectKey = ("projectKey" in params ? params.projectKey : params.toRef.repository.project.key)
        .replace("~", "").trim();
    const repositorySlug = ("repositorySlug" in params ? params.repositorySlug : params.toRef.repository.slug)
        .replaceAll(".", "-");

    const lengthLeftForTheKey = maxChannelNameLengthInSlack - pullRequestId.length - channelNamePrefix.length - projectRepoSeparator.length;

    const key = `${projectKey}-${repositorySlug}`.slice(0, lengthLeftForTheKey).toLowerCase();
    return `${channelNamePrefix}${key}${projectRepoSeparator}${pullRequestId}`.replace(/-+/g, "-");
}

