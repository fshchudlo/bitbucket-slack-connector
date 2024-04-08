import {
    BitbucketNotification,
    PullRequestBasicNotification, PullRequestCommentActionNotification, PullRequestModifiedNotification,
    PullRequestReviewersUpdatedNotification
} from "../../typings";

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

function getBasicPayload(): PullRequestBasicNotification {
    return {
        eventKey: "pr:opened",
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
    static pullRequestOpened(): BitbucketNotification {
        return {
            ...getBasicPayload(),
            eventKey: "pr:opened"
        };
    }

    static pullRequestMerged(): BitbucketNotification {
        return {
            ...getBasicPayload(),
            eventKey: "pr:merged"
        };
    }

    static pullRequestDeclined(): BitbucketNotification {
        return {
            ...getBasicPayload(),
            eventKey: "pr:declined"
        };
    }

    static pullRequestDeleted(): BitbucketNotification {
        return {
            ...getBasicPayload(),
            eventKey: "pr:deleted"
        };
    }

    static pullRequestCommentDeleted(): PullRequestCommentActionNotification {
        const payload = this.pullRequestCommentAdded() as any;
        return {
            ...payload,
            eventKey: "pr:comment:deleted"
        };
    }

    static pullRequestCommentAdded(): PullRequestCommentActionNotification {
        return {
            ...getBasicPayload(),
            eventKey: "pr:comment:added",
            actor: { ...reviewer1User },
            comment: {
                id: 1,
                severity: "NORMAL",
                text: "Test comment",
                author: { ...reviewer1User }
            }
        };
    }

    static pullRequestCommentEdited(): PullRequestCommentActionNotification {
        const payload = this.pullRequestCommentAdded();
        payload.eventKey = "pr:comment:edited";
        payload.comment.text = "Updated comment text";
        return payload;
    }

    static pullRequestModified(): PullRequestModifiedNotification {
        const payload = getBasicPayload();

        return {
            ...payload,
            eventKey: "pr:modified",
            previousDescription: payload.pullRequest.description,
            previousTitle: payload.pullRequest.title,
            previousTarget: {
                displayId: payload.pullRequest.toRef.displayId,
                latestCommit: payload.pullRequest.toRef.latestCommit
            },
            pullRequest: {
                ...payload.pullRequest,
                title: "New pull request title",
                description: "New pull request description",
                toRef: { ...payload.pullRequest.toRef, displayId: "not-the-master" }
            }
        };
    }

    static pullRequestNeedsWork(): BitbucketNotification {
        const payload = getBasicPayload();

        payload.pullRequest.reviewers.forEach(r => r.status = r.user.displayName == payload.actor.displayName ? "NEEDS_WORK" : r.status);

        return {
            ...payload,
            eventKey: "pr:reviewer:needs_work",
            actor: { ...reviewer1User }
        };
    }

    static pullRequestApproved(): BitbucketNotification {
        const payload = getBasicPayload();
        payload.pullRequest.reviewers.forEach(r => r.status = r.user.displayName == payload.actor.displayName ? "APPROVED" : r.status);

        return {
            ...payload,
            eventKey: "pr:reviewer:approved",
            actor: { ...reviewer1User }
        };
    }

    static pullRequestUnapproved(): BitbucketNotification {
        const payload = getBasicPayload();

        payload.pullRequest.reviewers.forEach(r => r.status = r.user.displayName == payload.actor.displayName ? "UNAPPROVED" : r.status);

        return {
            ...payload,
            eventKey: "pr:reviewer:unapproved",
            actor: { ...reviewer1User }
        };
    }

    static pullRequestFromRefUpdated(): BitbucketNotification {
        return {
            ...getBasicPayload(),
            ...{ fromRef: { latestCommit: "from-ref-updated-hash" } },
            eventKey: "pr:from_ref_updated"
        };
    }

    static reviewersUpdated(): PullRequestReviewersUpdatedNotification {
        return {
            ...getBasicPayload(),
            eventKey: "pr:reviewer:updated",
            addedReviewers: [reviewer2User],
            removedReviewers: [reviewer1User]
        };
    }
}