// see https://confluence.atlassian.com/bitbucketserver0816/event-payload-1333334207.html#Eventpayload-pullrequest
export interface PullRequestBasicPayload {
    eventKey: string;
    date: string;
    actor: UserPayload;
    pullRequest: PullRequestPayload;
}

export interface PullRequestCommentAddedPayload extends PullRequestBasicPayload {
    comment: {
        id: number;
        text: string;
        author: UserPayload;
    };
}

export interface UserPayload {
    displayName: string;
    emailAddress: string;
}
export interface RefPayload {
    displayId: string;
    latestCommit: string;
    repository: {
        slug: string;
        project: { key: string; name: string };
    };
}

export interface PullRequestPayload {
    id: number;
    title: string;
    description: string;
    author: { user: UserPayload };
    reviewers: Array<{ user: UserPayload }>;
    links: { self: Array<{ href: string }> };
    fromRef: RefPayload;
    toRef: RefPayload;
}

