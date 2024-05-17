// see https://confluence.atlassian.com/bitbucketserver0816/event-payload-1333334207.html#Eventpayload-pullrequest
export type BitbucketNotification =
    PullRequestBasicNotification
    | PullRequestFromRefUpdatedNotification
    | PullRequestModifiedNotification
    | PullRequestCommentActionNotification
    | PullRequestReviewersUpdatedNotification;

export type PullRequestNotificationBasicPayload = {
    readonly actor: UserPayload;
    readonly pullRequest: PullRequestPayload;
};

export type PullRequestBasicNotificationEventTypes =
    "pr:opened"
    | "pr:reviewer:unapproved"
    | "pr:reviewer:needs_work"
    | "pr:reviewer:approved"
    | "pr:merged"
    | "pr:declined"
    | "pr:deleted";
export type PullRequestBasicNotification = PullRequestNotificationBasicPayload & {
    readonly eventKey: PullRequestBasicNotificationEventTypes;
};

export type PullRequestFromRefUpdatedNotificationEventType = "pr:from_ref_updated";
export type PullRequestFromRefUpdatedNotification = PullRequestNotificationBasicPayload & {
    readonly eventKey: PullRequestFromRefUpdatedNotificationEventType;
    readonly latestCommitMessage: string | null;
};


export type PullRequestModifiedNotificationEventType = "pr:modified";
export type PullRequestModifiedNotification = PullRequestNotificationBasicPayload & {
    readonly eventKey: PullRequestModifiedNotificationEventType;
    readonly previousTitle: string;
    readonly previousDescription: string | null;
    readonly previousTarget: {
        readonly displayId: string;
        readonly latestCommit: string
    }
};

export type PullRequestCommentActionNotificationEventTypes =
    "pr:comment:added"
    | "pr:comment:deleted"
    | "pr:comment:edited";
export type PullRequestCommentActionNotification = PullRequestNotificationBasicPayload & {
    readonly eventKey: PullRequestCommentActionNotificationEventTypes;
    readonly commentParentId?: number;
    readonly previousComment?: string;
    readonly comment: {
        readonly id: number;
        readonly text: string;
        readonly author: UserPayload;
        readonly severity: CommentSeverity;
        readonly resolvedDate?: number;
        readonly threadResolvedDate?: number;
    };
};


export type PullRequestReviewersUpdatedNotificationEventType = "pr:reviewer:updated";
export type PullRequestReviewersUpdatedNotification = PullRequestNotificationBasicPayload & {
    readonly eventKey: PullRequestReviewersUpdatedNotificationEventType;
    readonly addedReviewers: Array<UserPayload>;
    readonly removedReviewers: Array<UserPayload>;
};

export type UserPayload = {
    readonly name: string;
    readonly displayName: string;
    readonly emailAddress: string;
};

export type ReviewerPayload = {
    readonly user: UserPayload,
    readonly status: ReviewStatus;
};

export type RefPayload = {
    readonly displayId: string;
    readonly latestCommit: string;
    readonly repository: {
        readonly slug: string;
        readonly project: {
            readonly key: string;
            readonly name: string
        };
    };
};

export type PullRequestPayload = {
    readonly id: number;
    readonly createdDate: number,
    readonly title: string;
    readonly description: string | null;
    readonly author: { readonly user: UserPayload };
    readonly reviewers: Array<ReviewerPayload>;
    readonly links: {
        readonly self: Array<{ readonly href: string }>
    };
    readonly fromRef: RefPayload;
    readonly toRef: RefPayload;
};

export type CommentSeverity = "NORMAL" | "BLOCKER";
export type ReviewStatus = "UNAPPROVED" | "NEEDS_WORK" | "APPROVED";
