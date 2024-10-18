export type PullRequestNotification =
    PullRequestGenericNotification
    | PullRequestCommentActionNotification
    | PullRequestModifiedNotification
    | PullRequestFromBranchUpdatedNotification
    | PullRequestReviewersUpdatedNotification;

export type PullRequestNotificationBasicPayload = {
    readonly actor: UserPayload;
    readonly pullRequest: PullRequestPayload;
};

export type PullRequestGenericNotification = PullRequestNotificationBasicPayload & {
    readonly eventKey: "pr:opened" | "pr:merged" | "pr:declined" | "pr:deleted" | "pr:reviewer:unapproved" | "pr:reviewer:needs_work" | "pr:reviewer:approved";
};

export type PullRequestCommentActionNotification = PullRequestNotificationBasicPayload & {
    readonly eventKey: "pr:comment:added" | "pr:comment:deleted" | "pr:comment:edited";
    readonly commentParentId?: number;
    readonly previousComment?: string;
    readonly comment: PullRequestCommentPayload;
};
export type PullRequestModifiedNotification = PullRequestNotificationBasicPayload & {
    readonly eventKey: "pr:modified";
    readonly previousTitle: string;
    readonly previousDescription: string | null;
    readonly previousTargetBranch: {
        readonly branchName: string;
        readonly latestCommit: string
    }
};
export type PullRequestReviewersUpdatedNotification = PullRequestNotificationBasicPayload & {
    readonly eventKey: "pr:reviewer:updated";
    readonly addedReviewers: Array<UserPayload>;
    readonly removedReviewers: Array<UserPayload>;
};
export type PullRequestFromBranchUpdatedNotification = PullRequestNotificationBasicPayload & {
    readonly eventKey: "pr:from_ref_updated";
    readonly latestCommitMessage: string | null;
    readonly latestCommitViewUrl: string;
};

export type UserPayload = {
    readonly name: string;
    readonly slackUserId: string;
};

export type BranchPayload = {
    readonly branchName: string;
    readonly latestCommit: string;
    readonly repositoryName: string;
    readonly projectKey: string;
};
export type PullRequestCommentPayload = {
    readonly id: number;
    readonly text: string;
    readonly author: UserPayload;
    readonly severity: CommentSeverity;
    readonly resolvedAt?: Date;
    readonly threadResolvedAt?: Date;
    readonly link: string;
};
export type PullRequestPayload = {
    readonly number: number;
    readonly createdAt: Date;
    readonly title: string;
    readonly description: string | null;
    readonly author: UserPayload;
    readonly reviewers: Array<ReviewerPayload>;
    readonly links: {
        readonly self: string;
    };
    readonly fromBranch: BranchPayload;
    readonly targetBranch: BranchPayload;
};
export type ReviewerPayload = {
    user: UserPayload,
    status: ReviewStatus
}
export type ReviewStatus = "UNAPPROVED" | "NEEDS_WORK" | "APPROVED";