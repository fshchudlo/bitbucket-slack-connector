// see https://confluence.atlassian.com/bitbucketserver0816/event-payload-1333334207.html#Eventpayload-pullrequest
export type BitbucketNotification =
    PullRequestBasicNotification
    | PullRequestModifiedNotification
    | PullRequestCommentActionNotification
    | PullRequestReviewersUpdatedNotification

export type PullRequestBasicNotification = PullRequestNotificationBasicPayload & {
    eventKey: "pr:opened" | "pr:reviewer:unapproved" | "pr:reviewer:needs_work" | "pr:reviewer:approved" | "pr:from_ref_updated" | "pr:merged" | "pr:declined" | "pr:deleted";
}
export type PullRequestModifiedNotification = PullRequestNotificationBasicPayload & {
    eventKey: "pr:modified";
    previousTitle: string;
    previousDescription: string | null;
    previousTarget: {
        displayId: string;
        latestCommit: string
    }
}

export type CommentSeverity = "NORMAL" | "BLOCKER"
export type PullRequestCommentActionNotification = PullRequestNotificationBasicPayload & {
    eventKey: "pr:comment:added" | "pr:comment:deleted" | "pr:comment:edited";
    commentParentId?: number;
    previousComment?: string;
    comment: {
        id: number;
        text: string;
        author: UserPayload;
        severity: CommentSeverity;
        state: "OPEN" | "RESOLVED";
        resolver?: UserPayload;
        threadResolved: boolean;
        threadResolver?: UserPayload;
    };
}

export type PullRequestReviewersUpdatedNotification = PullRequestNotificationBasicPayload & {
    eventKey: "pr:reviewer:updated";
    addedReviewers: Array<UserPayload>;
    removedReviewers: Array<UserPayload>;
}

export type PullRequestNotificationBasicPayload = {
    date: string;
    actor: UserPayload;
    pullRequest: PullRequestPayload;
}

export type UserPayload = {
    displayName: string;
    emailAddress: string;
}

export type ReviewerPayload = {
    user: UserPayload,
    approved: boolean,
    status: "UNAPPROVED" | "NEEDS_WORK" | "APPROVED";
}

export type RefPayload = {
    displayId: string;
    latestCommit: string;
    repository: {
        slug: string;
        project: { key: string; name: string };
    };
}

export type PullRequestPayload = {
    id: number;
    title: string;
    description: string | null;
    author: { user: UserPayload };
    reviewers: Array<ReviewerPayload>;
    links: { self: Array<{ href: string }> };
    fromRef: RefPayload;
    toRef: RefPayload;
}

export type SlackChannelInfo = {
    id?: string;
    isArchived?: boolean;
    name?: string;
}

export type BitbucketCommentSnapshotInSlackMetadata = {
    // see https://api.slack.com/reference/metadata for the reference about naming
    comment_id: string,
    severity: CommentSeverity,
    thread_resolved: boolean
}