import {
    PullRequestNotification,
    PullRequestGenericNotification,
    PullRequestCommentActionNotification,
    PullRequestModifiedNotification,
    PullRequestReviewersUpdatedNotification
} from "../../contracts";

const authorUser = {
    name: "Test Author",
    slackUserId: "000000"
};
const reviewer1User = {
    name: "Test Reviewer 1",
    slackUserId: "111111"
};
const reviewer2User = {
    name: "Test Reviewer 2",
    slackUserId: "222222"
};
const reviewer3User = {
    name: "Test Reviewer 3",
    slackUserId: "333333"
};

function getBasicPayload(): PullRequestGenericNotification {
    return {
        eventKey: "pr:opened",
        actor: { ...authorUser },
        pullRequest: {
            number: 1,
            createdAt: new Date(1714381184802),
            title: "Test pull request title",
            description: "Test pull request description",
            fromBranch: {
                branchName: "feature/test-branch",
                latestCommit: "from-ref-commit-hash",
                repositoryName: "test-repository",
                projectKey: "TEST-PROJ"
            },
            targetBranch: {
                branchName: "master",
                latestCommit: "to-ref-commit-hash",
                repositoryName: "test-repository",
                projectKey: "TEST-PROJ"
            },
            author: { ...authorUser },
            reviewers: [{
                user: { ...reviewer1User },
                status: "UNAPPROVED"
            }, {
                user: { ...reviewer2User },
                status: "UNAPPROVED"
            }],
            links: {
                self: "https://git.test.com/projects/TEST-PROJ/repos/test-repository/pull-requests/1/overview"
            }
        }
    };

}

export default class TestPayloadBuilder {
    static pullRequestOpened(): PullRequestNotification {
        return {
            ...getBasicPayload(),
            eventKey: "pr:opened"
        };
    }

    static pullRequestMerged(): PullRequestNotification {
        return {
            ...getBasicPayload(),
            eventKey: "pr:merged"
        };
    }

    static pullRequestDeclined(): PullRequestNotification {
        return {
            ...getBasicPayload(),
            eventKey: "pr:declined"
        };
    }

    static pullRequestDeleted(): PullRequestNotification {
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
        const payload = getBasicPayload();
        return {
            ...getBasicPayload(),
            eventKey: "pr:comment:added",
            actor: { ...reviewer1User },
            comment: {
                id: 1,
                severity: "NORMAL",
                text: "Test comment",
                author: { ...reviewer1User },
                link: `${payload.pullRequest.links.self}?commentId=1`
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
                resolvedAt: new Date(1714381184802)
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
                resolvedAt: undefined
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
                threadResolvedAt: new Date(1714381184802)
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
                threadResolvedAt: undefined
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
            previousTargetBranch: {
                branchName: prCreatedPayload.pullRequest.targetBranch.branchName,
                latestCommit: prCreatedPayload.pullRequest.targetBranch.latestCommit
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
            previousTargetBranch: {
                branchName: payload.pullRequest.targetBranch.branchName,
                latestCommit: payload.pullRequest.targetBranch.latestCommit
            },
            pullRequest: {
                ...payload.pullRequest,
                title: "New pull request title",
                description: "New pull request description",
                targetBranch: { ...payload.pullRequest.targetBranch, branchName: "not-the-master" }
            }
        };
    }

    static pullRequestNeedsWork(): PullRequestNotification {
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

    static pullRequestApproved(): PullRequestNotification {
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

    static pullRequestUnapproved(): PullRequestNotification {
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

    static pullRequestFromRefUpdated(): PullRequestNotification {
        const basicPayload = getBasicPayload();
        return {
            ...basicPayload,
            ...{
                fromRef: {
                    latestCommit: "from-ref-updated-hash"
                }
            },
            eventKey: "pr:from_ref_updated",
            latestCommitMessage: `Test comment for ${basicPayload.pullRequest.fromBranch.projectKey}, ${basicPayload.pullRequest.fromBranch.repositoryName}, ${basicPayload.pullRequest.fromBranch.latestCommit}`,
            latestCommitViewUrl: `${basicPayload.pullRequest.links.self.replace("/overview", "")}/commits/${basicPayload.pullRequest.fromBranch.latestCommit}`
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