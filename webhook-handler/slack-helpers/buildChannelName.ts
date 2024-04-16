import { PullRequestPayload } from "../../typings";

interface PullRequestFlattenTraits {
    pullRequestId: string | number;
    repositorySlug: string;
    projectKey: string;
}

export function buildChannelName(params: PullRequestFlattenTraits | PullRequestPayload): string {
    const maxChannelNameLengthInSlack = 80;
    const prDashDashPartOfTheNameLength = 4;

    const pullRequestId = ("pullRequestId" in params ? params.pullRequestId : params.id)
        .toString();
    const projectKey = ("projectKey" in params ? params.projectKey : params.toRef.repository.project.key)
        .replace("~", "").trim();
    const repositorySlug = ("repositorySlug" in params ? params.repositorySlug : params.toRef.repository.slug)
        .replace(".", "");

    const lengthLeftForTheKey = maxChannelNameLengthInSlack - pullRequestId.length - prDashDashPartOfTheNameLength;

    const key = `${projectKey}-${repositorySlug}`.slice(0, lengthLeftForTheKey).toLowerCase();
    return `pr-${key}-${pullRequestId}`.replace(/-+/g, "-");
}

