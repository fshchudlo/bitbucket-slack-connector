// see https://confluence.atlassian.com/bitbucketserver0816/event-payload-1333334207.html#Eventpayload-pullrequest
declare type BitbucketNotification =
    PullRequestBasicNotification
    | PullRequestModifiedNotification
    | PullRequestCommentAddedOrDeletedNotification
    | PullRequestReviewersUpdatedNotification

declare type PullRequestBasicNotification = PullRequestNotificationBasicPayload & {
    eventKey: "pr:opened" | "pr:reviewer:unapproved" | "pr:reviewer:needs_work" | "pr:reviewer:approved" | "pr:from_ref_updated" | "pr:merged" | "pr:declined" | "pr:deleted";
}
declare type PullRequestModifiedNotification = PullRequestNotificationBasicPayload & {
    eventKey: "pr:modified";
    previousTitle: string;
    previousDescription: string | null;
    previousTarget: {
        displayId: string;
        latestCommit: string
    }
}
declare type PullRequestCommentAddedOrDeletedNotification = PullRequestNotificationBasicPayload & {
    eventKey: "pr:comment:added" | "pr:comment:deleted";
    comment: {
        id: number;
        text: string;
        author: UserPayload;
    };
}

declare type PullRequestReviewersUpdatedNotification = PullRequestNotificationBasicPayload & {
    eventKey: "pr:reviewer:updated";
    addedReviewers: Array<UserPayload>;
    removedReviewers: Array<UserPayload>;
}

declare type PullRequestNotificationBasicPayload = {
    date: string;
    actor: UserPayload;
    pullRequest: PullRequestPayload;
}

declare type UserPayload = {
    displayName: string;
    emailAddress: string;
}

declare type ReviewerPayload = {
    user: UserPayload,
    approved: boolean,
    status: "UNAPPROVED" | "NEEDS_WORK" | "APPROVED";
}

declare type RefPayload = {
    displayId: string;
    latestCommit: string;
    repository: {
        slug: string;
        project: { key: string; name: string };
    };
}

declare type PullRequestPayload = {
    id: number;
    title: string;
    description: string | null;
    author: { user: UserPayload };
    reviewers: Array<ReviewerPayload>;
    links: { self: Array<{ href: string }> };
    fromRef: RefPayload;
    toRef: RefPayload;
}