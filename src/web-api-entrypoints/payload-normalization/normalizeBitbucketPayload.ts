import BitbucketAPI from "../../adapters/BitbucketAPI";
import {
    PullRequestCommentActionNotification,
    PullRequestFromBranchUpdatedNotification,
    PullRequestGenericNotification,
    PullRequestModifiedNotification,
    PullRequestNotification,
    PullRequestReviewersUpdatedNotification
} from "../../use-cases/contracts";

export async function normalizeBitbucketPayload(payload: BitbucketNotification, bitbucketAPI: BitbucketAPI): Promise<PullRequestNotification> {
    const eventKey = payload.eventKey;

    switch (eventKey) {
        case "pr:opened":
        case "pr:merged":
        case "pr:declined":
        case "pr:deleted":
        case "pr:reviewer:unapproved":
        case "pr:reviewer:needs_work":
        case "pr:reviewer:approved":
            return {
                ...normalizePayloadGenericPart(payload),
                eventKey
            };
        case "pr:modified":
            return <PullRequestModifiedNotification>{
                ...normalizePayloadGenericPart(payload),
                eventKey,
                previousTitle: payload.previousTitle,
                previousDescription: payload.previousDescription,
                previousTargetBranch: {
                    branchName: payload.previousTarget.displayId,
                    latestCommit: payload.previousTarget.latestCommit
                }
            };
        case "pr:from_ref_updated":
            return <PullRequestFromBranchUpdatedNotification>{
                ...normalizePayloadGenericPart(payload),
                eventKey,
                latestCommitMessage: bitbucketAPI.canRead() ? await bitbucketAPI.fetchCommitMessage(payload.pullRequest.fromRef.repository.project.key, payload.pullRequest.fromRef.repository.slug, payload.pullRequest.fromRef.latestCommit) : null,
                latestCommitViewUrl: `${payload.pullRequest.links.self[0].href.replace("/overview", "")}/commits/${payload.pullRequest.fromRef.latestCommit}`
            };
        case "pr:reviewer:updated":
            return <PullRequestReviewersUpdatedNotification>{
                ...normalizePayloadGenericPart(payload),
                eventKey,
                addedReviewers: payload.addedReviewers.map(reviewer => ({
                    name: reviewer.displayName,
                    email: reviewer.emailAddress
                })),
                removedReviewers: payload.removedReviewers.map(reviewer => ({
                    name: reviewer.displayName,
                    email: reviewer.emailAddress
                }))
            };
        case "pr:comment:added":
        case "pr:comment:edited":
        case "pr:comment:deleted":
            return <PullRequestCommentActionNotification>{
                ...normalizePayloadGenericPart(payload),
                eventKey,
                commentParentId: payload.commentParentId,
                comment: {
                    id: payload.comment.id,
                    text: payload.comment.text,
                    severity: payload.comment.severity,
                    author: {
                        name: payload.comment.author.displayName,
                        email: payload.comment.author.emailAddress
                    },
                    resolvedAt: payload.comment.resolvedDate ? new Date(payload.comment.resolvedDate) : null,
                    threadResolvedAt: payload.comment.threadResolvedDate ? new Date(payload.comment.threadResolvedDate) : null,
                    link: `${payload.pullRequest.links.self}?commentId=${payload.comment.id}`
                },
                previousComment: payload.previousComment
            };
        default:
            throw new Error(`"${eventKey}" event key is unknown.`);
    }
}

function normalizePayloadGenericPart(payload: BitbucketNotification) {
    return <PullRequestGenericNotification>{
        eventKey: payload.eventKey,
        actor: {
            name: payload.actor.displayName,
            email: payload.actor.emailAddress
        },
        pullRequest: {
            number: payload.pullRequest.id,
            title: payload.pullRequest.title,
            createdAt: new Date(payload.pullRequest.createdDate),
            author: {
                name: payload.pullRequest.author.user.displayName,
                email: payload.pullRequest.author.user.emailAddress
            },
            description: payload.pullRequest.description,
            links: {
                self: payload.pullRequest.links.self[0].href
            },
            reviewers: payload.pullRequest.reviewers.map(reviewer => ({
                user: {
                    name: reviewer.user.displayName, email: reviewer.user.emailAddress
                },
                status: reviewer.status
            })),
            targetBranch: {
                branchName: payload.pullRequest.toRef.displayId,
                projectKey: payload.pullRequest.toRef.repository.project.key,
                repositoryName: payload.pullRequest.toRef.repository.slug,
                latestCommit: payload.pullRequest.toRef.latestCommit
            },
            fromBranch: {
                branchName: payload.pullRequest.fromRef.displayId,
                projectKey: payload.pullRequest.fromRef.repository.project.key,
                repositoryName: payload.pullRequest.fromRef.repository.slug,
                latestCommit: payload.pullRequest.fromRef.latestCommit
            }
        }
    };
}

// see https://confluence.atlassian.com/bitbucketserver0816/event-payload-1333334207.html#Eventpayload-pullrequest
type BitbucketNotification =
    BitbucketPullRequestBasicNotification
    | BitbucketPullRequestFromRefUpdatedNotification
    | BitbucketPullRequestModifiedNotification
    | BitbucketPullRequestCommentActionNotification
    | BitbucketPullRequestReviewersUpdatedNotification;

type BitbucketPullRequestNotificationBasicPayload = {
    readonly actor: BitbucketUserPayload;
    readonly pullRequest: BitbucketPullRequestPayload;
};

type BitbucketPullRequestBasicNotification = BitbucketPullRequestNotificationBasicPayload & {
    readonly eventKey: "pr:opened" | "pr:reviewer:unapproved" | "pr:reviewer:needs_work" | "pr:reviewer:approved" | "pr:merged" | "pr:declined" | "pr:deleted";
};

type BitbucketPullRequestFromRefUpdatedNotification = BitbucketPullRequestNotificationBasicPayload & {
    readonly eventKey: "pr:from_ref_updated";
    readonly latestCommitMessage: string | null;
};


type BitbucketPullRequestModifiedNotification = BitbucketPullRequestNotificationBasicPayload & {
    readonly eventKey: "pr:modified";
    readonly previousTitle: string;
    readonly previousDescription: string | null;
    readonly previousTarget: {
        readonly displayId: string;
        readonly latestCommit: string
    }
};

type BitbucketPullRequestCommentActionNotification = BitbucketPullRequestNotificationBasicPayload & {
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


type BitbucketPullRequestReviewersUpdatedNotification = BitbucketPullRequestNotificationBasicPayload & {
    readonly eventKey: "pr:reviewer:updated";
    readonly addedReviewers: Array<BitbucketUserPayload>;
    readonly removedReviewers: Array<BitbucketUserPayload>;
};

type BitbucketUserPayload = {
    readonly name: string;
    readonly displayName: string;
    readonly emailAddress: string;
};

type BitbucketReviewerPayload = {
    readonly user: BitbucketUserPayload,
    readonly status: BitbucketReviewStatus;
};

type BitbucketRefPayload = {
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

type BitbucketPullRequestPayload = {
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

type BitbucketCommentSeverity = "NORMAL" | "BLOCKER";
type BitbucketReviewStatus = "UNAPPROVED" | "NEEDS_WORK" | "APPROVED";
