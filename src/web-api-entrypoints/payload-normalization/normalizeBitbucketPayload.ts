import BitbucketAPI from "../../adapters/BitbucketAPI";
import {
    PullRequestCommentActionNotification,
    PullRequestFromBranchUpdatedNotification,
    PullRequestGenericNotification,
    PullRequestModifiedNotification,
    PullRequestNotification,
    PullRequestReviewersUpdatedNotification, UserPayload
} from "../../use-cases/contracts";
import { SlackUserIdResolver } from "./ports/SlackUserIdResolver";

export async function normalizeBitbucketPayload(notification: BitbucketNotification, bitbucketAPI: BitbucketAPI, slackUserIdResolver: SlackUserIdResolver): Promise<PullRequestNotification> {
    const eventKey = notification.eventKey;

    switch (eventKey) {
        case "pr:opened":
        case "pr:merged":
        case "pr:declined":
        case "pr:deleted":
        case "pr:reviewer:unapproved":
        case "pr:reviewer:needs_work":
        case "pr:reviewer:approved":
            return {
                ...(await normalizePayloadGenericPart(notification, slackUserIdResolver)),
                eventKey
            };
        case "pr:modified":
            return <PullRequestModifiedNotification>{
                ...(await normalizePayloadGenericPart(notification, slackUserIdResolver)),
                eventKey,
                previousTitle: notification.previousTitle,
                previousDescription: notification.previousDescription,
                previousTargetBranch: {
                    branchName: notification.previousTarget.displayId,
                    latestCommit: notification.previousTarget.latestCommit
                }
            };
        case "pr:from_ref_updated":
            return <PullRequestFromBranchUpdatedNotification>{
                ...(await normalizePayloadGenericPart(notification, slackUserIdResolver)),
                eventKey,
                latestCommitMessage: bitbucketAPI.canRead() ? await bitbucketAPI.fetchCommitMessage(notification.pullRequest.fromRef.repository.project.key, notification.pullRequest.fromRef.repository.slug, notification.pullRequest.fromRef.latestCommit) : null,
                latestCommitViewUrl: `${notification.pullRequest.links.self[0].href.replace("/overview", "")}/commits/${notification.pullRequest.fromRef.latestCommit}`
            };
        case "pr:reviewer:updated":
            return <PullRequestReviewersUpdatedNotification>{
                ...(await normalizePayloadGenericPart(notification, slackUserIdResolver)),
                eventKey,
                addedReviewers: await normalizeUserPayloads(notification.addedReviewers, slackUserIdResolver),
                removedReviewers: await normalizeUserPayloads(notification.removedReviewers, slackUserIdResolver)
            };
        case "pr:comment:added":
        case "pr:comment:edited":
        case "pr:comment:deleted":
            return <PullRequestCommentActionNotification>{
                ...(await normalizePayloadGenericPart(notification, slackUserIdResolver)),
                eventKey,
                commentParentId: notification.commentParentId,
                comment: {
                    id: notification.comment.id,
                    text: notification.comment.text,
                    severity: notification.comment.severity,
                    author: {
                        name: notification.comment.author.displayName,
                        slackUserId: await slackUserIdResolver.getUserId(notification.comment.author.emailAddress)
                    },
                    resolvedAt: notification.comment.resolvedDate ? new Date(notification.comment.resolvedDate) : null,
                    threadResolvedAt: notification.comment.threadResolvedDate ? new Date(notification.comment.threadResolvedDate) : null,
                    link: `${notification.pullRequest.links.self}?commentId=${notification.comment.id}`
                },
                previousComment: notification.previousComment
            };
        default:
            throw new Error(`"${eventKey}" event key is unknown.`);
    }
}

async function normalizePayloadGenericPart(payload: BitbucketNotification, slackUserIdResolver: SlackUserIdResolver): Promise<PullRequestGenericNotification> {
    const normalizedReviewersPayload = await Promise.all(
        payload.pullRequest.reviewers.map(async reviewer => {
            return {
                user: await normalizeUserPayload(reviewer.user, slackUserIdResolver),
                status: reviewer.status
            };
        }));

    return <PullRequestGenericNotification>{
        eventKey: payload.eventKey,
        actor: {
            name: payload.actor.displayName,
            slackUserId: await slackUserIdResolver.getUserId(payload.actor.emailAddress)
        },
        pullRequest: {
            number: payload.pullRequest.id,
            title: payload.pullRequest.title,
            createdAt: new Date(payload.pullRequest.createdDate),
            author: {
                name: payload.pullRequest.author.user.displayName,
                slackUserId: await slackUserIdResolver.getUserId(payload.pullRequest.author.user.emailAddress)
            },
            description: payload.pullRequest.description,
            links: {
                self: payload.pullRequest.links.self[0].href
            },
            reviewers: normalizedReviewersPayload,
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

async function normalizeUserPayloads(users: BitbucketUserPayload[], slackUserIdResolver: SlackUserIdResolver): Promise<UserPayload[]> {
    return await Promise.all(users.map(async (item) => await normalizeUserPayload(item, slackUserIdResolver)));
}

async function normalizeUserPayload(user: BitbucketUserPayload, slackUserIdResolver: SlackUserIdResolver): Promise<UserPayload> {
    const userId = await slackUserIdResolver.getUserId(user.emailAddress);
    return {
        name: user.displayName,
        slackUserId: userId
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
