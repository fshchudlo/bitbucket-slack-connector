import { PullRequestGenericNotification, PullRequestNotification } from "../../use-cases/contracts";
import { AppConfig } from "../../app.config";

export async function normalizeGithubPayload(payload: GithubPullRequestNotification): Promise<PullRequestNotification> {
    switch (payload.action) {
        case "opened":
            return {
                ...normalizePayloadGenericPart(payload),
                eventKey: "pr:opened"
            } as PullRequestGenericNotification;
        case "closed":
            return {
                ...normalizePayloadGenericPart(payload),
                eventKey: payload.pull_request.merged ? "pr:merged" : "pr:deleted"
            } as PullRequestGenericNotification;
        default:
            throw new Error(`"${payload.action}" action key is unknown.`);
    }
}

function normalizePayloadGenericPart(payload: GithubPullRequestNotification) {
    const basePayload: PullRequestGenericNotification = {
        eventKey: "pr:opened",
        actor: {
            name: payload.sender.login,
            email: AppConfig.getUserEmailFromGithubLogin(payload.sender.login)
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
                email: AppConfig.getUserEmailFromGithubLogin(payload.pull_request.user.login)
            },
            reviewers: payload.pull_request.requested_reviewers.map(reviewer => ({
                user: { name: reviewer.login, email: AppConfig.getUserEmailFromGithubLogin(reviewer.login) },
                status: "UNAPPROVED"
            })),
            links: {
                self: payload.pull_request.html_url
            }
        }
    };
    return basePayload;
}


export interface GithubPullRequestNotification {
    action: "opened" | "closed";
    number: number;
    pull_request: {
        html_url: string;
        number: string;
        state: "open" | "closed";
        locked: boolean;
        title: string;
        user: GithubUserPayload;
        body: string | null;
        created_at: string;
        updated_at: string;
        closed_at: string | null;
        merged_at: string | null;
        merge_commit_sha: string | null;
        assignee: string | null;
        assignees: string[];
        requested_reviewers: GithubUserPayload[];
        draft: boolean;
        head: GithubRefPayload;
        base: GithubRefPayload;
        author_association: string;
        auto_merge: string | null;
        active_lock_reason: string | null;
        merged: boolean;
        mergeable: boolean | null;
        rebaseable: boolean | null;
        mergeable_state: "unknown" | "clean";
        merged_by: GithubUserPayload | null;
        comments: number;
        review_comments: number;
        maintainer_can_modify: boolean;
        commits: number;
        additions: number;
        deletions: number;
        changed_files: number;
    };
    repository: {
        name: string;
    };
    sender: GithubUserPayload;
}

type GithubUserPayload = {
    login: string;
    type: string;
};

type GithubRefPayload = {
    ref: string;
    sha: string;
    repo: {
        name: string;
        full_name: string;
        owner: GithubUserPayload
    };
};
