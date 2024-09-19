import { BitbucketNotification } from "../types/bitbucket-payload-types";
import BitbucketAPI from "./BitbucketAPI";
import {
    PullRequestCommentActionNotification,
    PullRequestFromBranchUpdatedNotification,
    PullRequestGenericNotification,
    PullRequestModifiedNotification,
    PullRequestNotification,
    PullRequestReviewersUpdatedNotification
} from "../types/normalized-payload-types";

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
                projectName: payload.pullRequest.toRef.repository.project.name,
                repositoryName: payload.pullRequest.toRef.repository.slug,
                latestCommit: payload.pullRequest.toRef.latestCommit
            },
            fromBranch: {
                branchName: payload.pullRequest.fromRef.displayId,
                projectKey: payload.pullRequest.fromRef.repository.project.key,
                projectName: payload.pullRequest.fromRef.repository.project.name,
                repositoryName: payload.pullRequest.fromRef.repository.slug,
                latestCommit: payload.pullRequest.fromRef.latestCommit
            }
        }
    };
}
