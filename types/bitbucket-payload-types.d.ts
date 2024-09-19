// see https://confluence.atlassian.com/bitbucketserver0816/event-payload-1333334207.html#Eventpayload-pullrequest
export type BitbucketNotification =
    BitbucketPullRequestBasicNotification
    | BitbucketPullRequestFromRefUpdatedNotification
    | BitbucketPullRequestModifiedNotification
    | BitbucketPullRequestCommentActionNotification
    | BitbucketPullRequestReviewersUpdatedNotification;

export type BitbucketPullRequestNotificationBasicPayload = {
    readonly actor: BitbucketUserPayload;
    readonly pullRequest: BitbucketPullRequestPayload;
};

export type BitbucketPullRequestBasicNotification = BitbucketPullRequestNotificationBasicPayload & {
    readonly eventKey: "pr:opened" | "pr:reviewer:unapproved" | "pr:reviewer:needs_work" | "pr:reviewer:approved" | "pr:merged" | "pr:declined" | "pr:deleted";
};

export type BitbucketPullRequestFromRefUpdatedNotification = BitbucketPullRequestNotificationBasicPayload & {
    readonly eventKey: "pr:from_ref_updated";
    readonly latestCommitMessage: string | null;
};


export type BitbucketPullRequestModifiedNotification = BitbucketPullRequestNotificationBasicPayload & {
    readonly eventKey: "pr:modified";
    readonly previousTitle: string;
    readonly previousDescription: string | null;
    readonly previousTarget: {
        readonly displayId: string;
        readonly latestCommit: string
    }
};

export type BitbucketPullRequestCommentActionNotification = BitbucketPullRequestNotificationBasicPayload & {
    readonly eventKey: "pr:comment:added" | "pr:comment:deleted" | "pr:comment:edited";
    readonly commentParentId?: number;
    readonly previousComment?: string;
    readonly comment: {
        readonly id: number;
        readonly text: string;
        readonly author: BitbucketUserPayload;
        readonly severity: BitbucketCommentSeverity;
        readonly resolvedDate?: number;
        readonly threadResolvedDate?: number;
    };
};


export type BitbucketPullRequestReviewersUpdatedNotification = BitbucketPullRequestNotificationBasicPayload & {
    readonly eventKey: "pr:reviewer:updated";
    readonly addedReviewers: Array<BitbucketUserPayload>;
    readonly removedReviewers: Array<BitbucketUserPayload>;
};

export type BitbucketUserPayload = {
    readonly name: string;
    readonly displayName: string;
    readonly emailAddress: string;
};

export type BitbucketReviewerPayload = {
    readonly user: BitbucketUserPayload,
    readonly status: BitbucketReviewStatus;
};

export type BitbucketRefPayload = {
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

export type BitbucketPullRequestPayload = {
    readonly id: number;
    readonly createdDate: number,
    readonly title: string;
    readonly description: string | null;
    readonly author: { readonly user: BitbucketUserPayload };
    readonly reviewers: Array<BitbucketReviewerPayload>;
    readonly links: {
        readonly self: Array<{ readonly href: string }>
    };
    readonly fromRef: BitbucketRefPayload;
    readonly toRef: BitbucketRefPayload;
};

export type BitbucketCommentSeverity = "NORMAL" | "BLOCKER";
export type BitbucketReviewStatus = "UNAPPROVED" | "NEEDS_WORK" | "APPROVED";
