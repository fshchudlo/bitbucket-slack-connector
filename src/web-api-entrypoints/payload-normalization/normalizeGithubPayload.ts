import { PullRequestGenericNotification, PullRequestNotification, PullRequestReviewersUpdatedNotification, ReviewerPayload } from "../../use-cases/contracts";
import { AppConfig } from "../../app.config";
import { SlackUserIdResolver } from "./ports/SlackUserIdResolver";

export async function normalizeGithubPayload(notification: GithubNotification, slackUserIdResolver: SlackUserIdResolver): Promise<PullRequestNotification> {
    const eventKey = notification.action;
    switch (eventKey) {
        case "opened":
            return {
                ...(await normalizePayloadGenericPart(notification, slackUserIdResolver)),
                eventKey: "pr:opened"
            } as PullRequestGenericNotification;
        case "closed":
            return {
                ...(await normalizePayloadGenericPart(notification, slackUserIdResolver)),
                eventKey: notification.pull_request.merged ? "pr:merged" : "pr:deleted"
            } as PullRequestGenericNotification;
        case "review_requested":
            return {
                ...(await normalizePayloadGenericPart(notification, slackUserIdResolver)),
                eventKey: "pr:reviewer:updated",
                addedReviewers: [{
                    name: notification.requested_reviewer.login,
                    slackUserId: await slackUserIdResolver.getUserId(AppConfig.getUserEmailFromGithubLogin(notification.requested_reviewer.login))
                }],
                removedReviewers: []
            } as PullRequestReviewersUpdatedNotification;
        case "review_request_removed":
            return {
                ...(await normalizePayloadGenericPart(notification, slackUserIdResolver)),
                eventKey: "pr:reviewer:updated",
                addedReviewers: [],
                removedReviewers: [{
                    name: notification.requested_reviewer.login,
                    slackUserId: await slackUserIdResolver.getUserId(AppConfig.getUserEmailFromGithubLogin(notification.requested_reviewer.login))
                }]
            } as PullRequestReviewersUpdatedNotification;
        default:
            throw new Error(`"${eventKey}" action key is unknown.`);
    }
}

async function normalizePayloadGenericPart(payload: GithubNotification, slackUserIdResolver: SlackUserIdResolver) {
    const normalizedReviewersPayload = await Promise.all(
        payload.pull_request.requested_reviewers.map(async reviewer => {
            return {
                user: {
                    name: reviewer.login,
                    slackUserId: await slackUserIdResolver.getUserId(AppConfig.getUserEmailFromGithubLogin(reviewer.login))
                },
                status: "UNAPPROVED"
            } as ReviewerPayload;
        }));

    const basePayload: PullRequestGenericNotification = {
        eventKey: "pr:opened",
        actor: {
            name: payload.sender.login,
            slackUserId: await slackUserIdResolver.getUserId(AppConfig.getUserEmailFromGithubLogin(payload.sender.login))
        },
        pullRequest: {
            number: +payload.number,
            title: payload.pull_request.title,
            description: payload.pull_request.body,
            createdAt: new Date(payload.pull_request.created_at),
            targetBranch: {
                branchName: payload.pull_request.base.ref,
                latestCommit: payload.pull_request.base.sha,
                repositoryName: payload.pull_request.base.repo.name,
                projectKey: payload.pull_request.base.repo.owner.login
            },
            fromBranch: {
                branchName: payload.pull_request.head.ref,
                latestCommit: payload.pull_request.head.sha,
                repositoryName: payload.pull_request.head.repo.name,
                projectKey: payload.pull_request.head.repo.owner.login
            },
            author: {
                name: payload.pull_request.user.login,
                slackUserId: await slackUserIdResolver.getUserId(AppConfig.getUserEmailFromGithubLogin(payload.pull_request.user.login))
            },
            reviewers: normalizedReviewersPayload,
            links: {
                self: payload.pull_request.html_url
            }
        }
    };
    return basePayload;
}


type GithubNotification = GithubPullRequestBasicNotification | GithubPullRequestReviewersUpdatedNotification;


type GithubPullRequestBasicNotification = GithubPullRequestNotificationBasicPayload & {
    readonly action: "opened" | "closed";
};

export type GithubPullRequestReviewersUpdatedNotification = GithubPullRequestNotificationBasicPayload & {
    readonly action: "review_requested" | "review_request_removed";
    readonly requested_reviewer: GithubUserPayload;
};

type GithubPullRequestNotificationBasicPayload = {
    readonly number: number;
    readonly pull_request: GithubPullRequestPayload;
    readonly repository: {
        readonly name: string;
    };
    readonly sender: GithubUserPayload;
}

type GithubPullRequestPayload = {
    readonly html_url: string;
    readonly number: string;
    readonly state: "open" | "closed";
    readonly locked: boolean;
    readonly title: string;
    readonly user: GithubUserPayload;
    readonly body: string | null;
    readonly created_at: string;
    readonly updated_at: string;
    readonly closed_at: string | null;
    readonly merged_at: string | null;
    readonly merge_commit_sha: string | null;
    readonly assignee: string | null;
    readonly assignees: string[];
    readonly requested_reviewers: GithubUserPayload[];
    readonly draft: boolean;
    readonly head: GithubRefPayload;
    readonly base: GithubRefPayload;
    readonly author_association: string;
    readonly auto_merge: string | null;
    readonly active_lock_reason: string | null;
    readonly merged: boolean;
    readonly mergeable: boolean | null;
    readonly rebaseable: boolean | null;
    readonly mergeable_state: "unknown" | "clean";
    readonly merged_by: GithubUserPayload | null;
    readonly comments: number;
    readonly review_comments: number;
    readonly maintainer_can_modify: boolean;
    readonly commits: number;
    readonly additions: number;
    readonly deletions: number;
    readonly changed_files: number;
}
type GithubUserPayload = {
    readonly login: string;
    readonly type: string;
};
type GithubRefPayload = {
    readonly ref: string;
    readonly sha: string;
    readonly repo: {
        readonly name: string;
        readonly full_name: string;
        readonly owner: GithubUserPayload
    };
};
