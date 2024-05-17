import {
    BitbucketNotification,
    PullRequestBasicNotification, PullRequestCommentActionNotification, PullRequestModifiedNotification,
    PullRequestReviewersUpdatedNotification
} from "../../../bitbucket-payload-types";

const authorUser = {
    name: "TestAuthor",
    displayName: "Test Author",
    emailAddress: "test.author@test.com"
};
const reviewer1User = {
    name: "TestReviewer1",
    displayName: "Test Reviewer 1",
    emailAddress: "test.reviewer1@test.com"
};
const reviewer2User = {
    name: "TestReviewer2",
    displayName: "Test Reviewer 2",
    emailAddress: "test.reviewer2@test.com"
};
const reviewer3User = {
    name: "TestReviewer3",
    displayName: "Test Reviewer 3",
    emailAddress: "test.reviewer3@test.com"
};

function getBasicPayload(): PullRequestBasicNotification {
    return {
        eventKey: "pr:opened",
        actor: { ...authorUser },
        pullRequest: {
            id: 1,
            createdDate: 1714381184802,
            title: "Test pull request title",
            description: "Test pull request description",
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
                    status: "UNAPPROVED"
                },
                {
                    user: { ...reviewer2User },
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

    static pullRequestTaskAdded(): PullRequestCommentActionNotification {
        const basicPayload = this.pullRequestCommentAdded();
        return {
            ...basicPayload,
            comment: {
                ...basicPayload.comment,
                severity: "BLOCKER"
            }
        };
    }

    static pullRequestCommentEdited(): PullRequestCommentActionNotification {
        const payload = this.pullRequestCommentAdded();
        return {
            ...payload,
            eventKey: "pr:comment:edited",
            comment: {
                ...payload.comment,
                text: "Updated comment text"
            }
        };
    }

    static pullRequestCommentConvertedToTheTask(): PullRequestCommentActionNotification {
        const payload = this.pullRequestCommentAdded();
        return {
            ...payload,
            eventKey: "pr:comment:edited",
            comment: {
                ...payload.comment,
                severity: "BLOCKER"
            }
        };
    }

    static pullRequestTaskConvertedToTheComment(): PullRequestCommentActionNotification {
        const payload = this.pullRequestTaskAdded();
        return {
            ...payload,
            eventKey: "pr:comment:edited",
            comment: {
                ...payload.comment,
                severity: "NORMAL"
            }
        };
    }

    static pullRequestTaskResolved(): PullRequestCommentActionNotification {
        const payload = this.pullRequestTaskAdded();
        return {
            ...payload,
            eventKey: "pr:comment:edited",
            comment: {
                ...payload.comment,
                resolvedDate: 123456789
            }
        };
    }

    static pullRequestTaskReopened(): PullRequestCommentActionNotification {
        const payload = this.pullRequestTaskAdded();
        return {
            ...payload,
            eventKey: "pr:comment:edited",
            comment: {
                ...payload.comment,
                resolvedDate: undefined
            }
        };
    }

    static pullRequestCommentResolved(): PullRequestCommentActionNotification {
        const payload = this.pullRequestCommentAdded();
        return {
            ...payload,
            eventKey: "pr:comment:edited",
            comment: {
                ...payload.comment,
                threadResolvedDate: 123456789
            }
        };
    }

    static pullRequestCommentReopened(): PullRequestCommentActionNotification {
        const payload = this.pullRequestCommentAdded();
        return {
            ...payload,
            eventKey: "pr:comment:edited",
            comment: {
                ...payload.comment,
                threadResolvedDate: undefined
            }
        };
    }

    static pullRequestModifiedWithoutVisibleChanges(): PullRequestModifiedNotification {
        const prCreatedPayload = TestPayloadBuilder.pullRequestOpened();
        return <PullRequestModifiedNotification>{
            ...prCreatedPayload,
            eventKey: "pr:modified",
            previousDescription: prCreatedPayload.pullRequest.description,
            previousTitle: prCreatedPayload.pullRequest.title,
            previousTarget: {
                displayId: prCreatedPayload.pullRequest.toRef.displayId,
                latestCommit: prCreatedPayload.pullRequest.toRef.latestCommit
            }
        };
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

        payload.pullRequest.reviewers[0] = {
            ...payload.pullRequest.reviewers[0],
            status: "NEEDS_WORK"
        };

        return {
            ...payload,
            eventKey: "pr:reviewer:needs_work",
            actor: { ...reviewer1User }
        };
    }

    static pullRequestApproved(): BitbucketNotification {
        const payload = getBasicPayload();
        payload.pullRequest.reviewers[0] = {
            ...payload.pullRequest.reviewers[0],
            status: "APPROVED"
        };

        return {
            ...payload,
            eventKey: "pr:reviewer:approved",
            actor: { ...reviewer1User }
        };
    }

    static pullRequestUnapproved(): BitbucketNotification {
        const payload = getBasicPayload();

        payload.pullRequest.reviewers[0] = {
            ...payload.pullRequest.reviewers[0],
            status: "UNAPPROVED"
        };

        return {
            ...payload,
            eventKey: "pr:reviewer:unapproved",
            actor: { ...reviewer1User }
        };
    }

    static pullRequestFromRefUpdated(): BitbucketNotification {
        const basicPayload =getBasicPayload();
        return {
            ...basicPayload,
            ...{ fromRef: { latestCommit: "from-ref-updated-hash" } },
            eventKey: "pr:from_ref_updated",
            latestCommitMessage: `Test comment for ${basicPayload.pullRequest.fromRef.repository.project.key}, ${basicPayload.pullRequest.fromRef.repository.slug}, ${basicPayload.pullRequest.fromRef.latestCommit}`
        };
    }

    static reviewersUpdated(): PullRequestReviewersUpdatedNotification {
        return {
            ...getBasicPayload(),
            eventKey: "pr:reviewer:updated",
            addedReviewers: [reviewer3User],
            removedReviewers: [reviewer1User]
        };
    }
}