import { PullRequestBasicPayload } from "../contracts";

const authorUser = {
    displayName: "Test Author",
    emailAddress: "test.author@test.com"
};
const reviewerUser = {
    displayName: "Test Reviewer",
    emailAddress: "test.reviewer1@test.com"
};

function getBasicPayload(eventKey: string): PullRequestBasicPayload {
    return {
        eventKey: eventKey,
        date: "2017-09-19T09:58:11+1000",
        actor: { ...authorUser },
        pullRequest: {
            id: 1,
            title: "Quite a long and comprehensive description to get channel title longer than 250 symbols which is a maximum length for the Slack",
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
                    user: { ...reviewerUser }
                }
            ],
            links: {
                self: [{ href: "https://git.test.com/projects/TEST-PROJ/repos/test-repository/pull-requests/1/overview" }]
            }
        }
    };

}

export default class TestPayloadBuilder {
    static pullRequestOpened() {
        return getBasicPayload("pr:opened");
    }

    static pullRequestMerged() {
        return getBasicPayload("pr:merged");
    }

    static pullRequestDeclined() {
        return getBasicPayload("pr:declined");
    }

    static pullRequestDeleted() {
        return getBasicPayload("pr:deleted");
    }

    static pullRequestCommentAdded() {
        return {
            ...getBasicPayload("pr:comment:added"),
            actor: { ...reviewerUser },
            comment: {
                id: 1,
                text: "Test comment",
                author: { ...reviewerUser }
            }
        };
    }
    static pullRequestFromRefUpdated() {
        return {
            ...getBasicPayload("pr:from_ref_updated"),
            ...{fromRef: {latestCommit: "from-ref-updated-hash"}}
        };
    }
}