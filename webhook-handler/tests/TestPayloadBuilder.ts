import {
    PullRequestCommentAddedOrDeletedPayload, PullRequestModifiedPayload,
    PullRequestNotificationBasicPayload,
    PullRequestReviewersUpdatedPayload
} from "../contracts";

const authorUser = {
    displayName: "Test Author",
    emailAddress: "test.author@test.com"
};
const reviewer1User = {
    displayName: "Test Reviewer 1",
    emailAddress: "test.reviewer1@test.com"
};
const reviewer2User = {
    displayName: "Test Reviewer 2",
    emailAddress: "test.reviewer2@test.com"
};

function getBasicPayload(eventKey: string): PullRequestNotificationBasicPayload {
    return {
        eventKey: eventKey,
        date: "2017-09-19T09:58:11+1000",
        actor: { ...authorUser },
        pullRequest: {
            id: 1,
            title: "Quite a long and comprehensive title to get channel title longer than 250 symbols which is a maximum length for the Slack",
            description: "Quite a long and comprehensive description to get channel title longer than 250 symbols which is a maximum length for the Slack",
            fromRef: {
                displayId: "feature/test-branch",
                latestCommit: "from-ref-commit-hash",
                repository: {
                    slug: "test-repository",
                    project: {
                        key: "TEST-PROJ",
                        name: "Test project"
                    }
                }
            },
            toRef: {
                displayId: "master",
                latestCommit: "to-ref-commit-hash",
                repository: {
                    slug: "test-repository",
                    project: {
                        key: "TEST-PROJ",
                        name: "Test project"
                    }
                }
            },
            author: {
                user: { ...authorUser }
            },
            reviewers: [
                {
                    user: { ...reviewer1User },
                    approved: false,
                    status: "UNAPPROVED"
                }
            ],
            links: {
                self: [{ href: "https://git.test.com/projects/TEST-PROJ/repos/test-repository/pull-requests/1/overview" }]
            }
        }
    };

}

export default class TestPayloadBuilder {
    static pullRequestOpened(): PullRequestNotificationBasicPayload {
        return getBasicPayload("pr:opened");
    }

    static pullRequestMerged(): PullRequestNotificationBasicPayload {
        return getBasicPayload("pr:merged");
    }

    static pullRequestDeclined(): PullRequestNotificationBasicPayload {
        return getBasicPayload("pr:declined");
    }

    static pullRequestDeleted(): PullRequestNotificationBasicPayload {
        return getBasicPayload("pr:deleted");
    }

    static pullRequestCommentDeleted(): PullRequestCommentAddedOrDeletedPayload {
        return {
            ...this.pullRequestCommentAdded(),
            eventKey: "pr:comment:deleted"
        };
    }

    static pullRequestCommentAdded(): PullRequestCommentAddedOrDeletedPayload {
        return {
            ...getBasicPayload("pr:comment:added"),
            actor: { ...reviewer1User },
            comment: {
                id: 1,
                text: "Test comment",
                author: { ...reviewer1User }
            }
        };
    }

    static pullRequestModified(): PullRequestModifiedPayload {
        const payload = {
            ...getBasicPayload("pr:modified")
        } as PullRequestModifiedPayload;

        payload.previousTarget = {
            displayId: payload.pullRequest.toRef.displayId,
            latestCommit: payload.pullRequest.toRef.latestCommit
        };

        payload.previousDescription = payload.pullRequest.description;
        payload.previousTitle = payload.pullRequest.title;

        payload.pullRequest.title = "New pull request title";
        payload.pullRequest.description = "New pull request description";
        payload.pullRequest.toRef.displayId = "not-the-master";

        return payload;
    }

    static pullRequestNeedsWork(): PullRequestNotificationBasicPayload {
        const payload = {
            ...getBasicPayload("pr:reviewer:needs_work"),
            actor: { ...reviewer1User }
        };

        payload.pullRequest.reviewers.forEach(r => r.status = r.user.displayName == payload.actor.displayName ? "NEEDS_WORK" : r.status);

        return payload;
    }

    static pullRequestApproved(): PullRequestNotificationBasicPayload {
        const payload = {
            ...getBasicPayload("pr:reviewer:approved"),
            actor: { ...reviewer1User }
        };

        payload.pullRequest.reviewers.forEach(r => r.status = r.user.displayName == payload.actor.displayName ? "APPROVED" : r.status);

        return payload;
    }

    static pullRequestUnapproved(): PullRequestNotificationBasicPayload {
        const payload = {
            ...getBasicPayload("pr:reviewer:unapproved"),
            actor: { ...reviewer1User }
        };

        payload.pullRequest.reviewers.forEach(r => r.status = r.user.displayName == payload.actor.displayName ? "UNAPPROVED" : r.status);

        return payload;
    }

    static pullRequestFromRefUpdated(): PullRequestNotificationBasicPayload {
        return {
            ...getBasicPayload("pr:from_ref_updated"),
            ...{ fromRef: { latestCommit: "from-ref-updated-hash" } }
        };
    }

    static reviewersUpdated(): PullRequestReviewersUpdatedPayload {
        return {
            ...getBasicPayload("pr:reviewer:updated"),
            addedReviewers: [reviewer2User],
            removedReviewers: [reviewer1User]
        };
    }
}