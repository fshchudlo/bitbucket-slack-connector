// mainApp.test.ts
import { TestSlackGateway } from "../../TestSlackGateway";
import { handlePullRequestCreated } from "./pull-request-created-handler";

let payload: PullRequestCreatedPayload = {
    eventKey: "pr:opened",
    date: "2017-09-19T09:58:11+1000",
    pullRequest: {
        id: 1,
        title: "Quite a long and comprehensive description to get channel title longer than 250 symbols which is a maximum length for the Slack",
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
