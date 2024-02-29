// mainApp.test.ts
import { TestSlackGateway } from "../../TestSlackGateway";
import { handlePullRequestCreated } from "./pull-request-created-handler";

let payload: PullRequestCreatedPayload = {
    eventKey: "pr:opened",
    date: "2017-09-19T09:58:11+1000",
    pullRequest: {
        id: 1,
        title: "a new file added",
        toRef: {
            displayId: "master",
            repository: {
                slug: "test-repository",
                project: {
                    key: "TEST-PROJ",
                    name: "Test project",
                },
            },
        },
        author: {
            user: {
                name: "test.author",
                emailAddress: "test.author@test.com",
            },
        },
        reviewers: [
            {
                user: {
                    name: "test.reviewer1",
                    emailAddress: "test.reviewer1@test.com",
                    },
            },
        ],
        links: {
            self: ["https://git.test.com/projects/TEST-PROJ/repos/test-repository/pull-requests/1/overview"],
        },
    },
};

describe("Webhook handling", () => {
    it("should handle pull request creation", async () => {
        const testee = new TestSlackGateway();

        await handlePullRequestCreated(payload, testee);

        expect(testee.snapshot).toMatchSnapshot();
    });
});
