// see https://confluence.atlassian.com/bitbucketserver0816/event-payload-1333334207.html#Eventpayload-pullrequest
export declare interface PullRequestBasicPayload {
    eventKey: string;
    date: string;
    actor: UserPayload;
    pullRequest: PullRequestPayload;
}

export declare interface PullRequestCommentAddedPayload extends PullRequestBasicPayload {
    comment: {
        id: number;
        text: string;
        author: UserPayload;
    };
}

export declare interface UserPayload {
    displayName: string;
    emailAddress: string;
}

export declare interface PullRequestPayload {
    id: number;
    title: string;
    author: { user: UserPayload };
    reviewers: Array<{ user: UserPayload }>;
    links: { self: Array<{ href: string }> };
    toRef: {
        displayId: string;
        repository: {
            slug: string;
            project: { key: string; name: string };
        };
    };
}

