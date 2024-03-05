export default function buildChannelName(projectKey: string, repositorySlug: string, pullRequestId: string | number): string {
    pullRequestId = pullRequestId.toString();
    projectKey = projectKey.replace("~", "").trim();
    repositorySlug = repositorySlug.replace(".", "");

    const maxChannelNameLengthInSlack = 80;
    const lengthLeftForTheKey = maxChannelNameLengthInSlack - pullRequestId.length - 4; //4 is the length of 'pr--' symbols in resulting channel name;

    const key = `${projectKey}-${repositorySlug}`.slice(0, lengthLeftForTheKey).toLowerCase();
    return `pr-${key}-${pullRequestId}`.replace(/-+/g, '-');
}

