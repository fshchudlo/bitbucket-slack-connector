// mainApp.test.ts
import { TestSlackGateway } from "../../TestSlackGateway";
import { sendCompletionMessageAndCloseTheChannel } from "./sendCompletionMessageAndCloseTheChannel";

let payload: PullRequestMergedDeclinedDeletedPayload = {
    eventKey: "pr:merged",
    date: "2017-09-19T09:58:11+1000",
    actor: {
        name: "test.author",
        emailAddress: "test.author@test.com",
    },
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

describe("sendCompletionMessageAndCloseTheChannel", () => {
    it("Should send completion message and close the channel on PR merge", async () => {
        const testee = new TestSlackGateway();
        payload.eventKey = "pr:merged";
        await sendCompletionMessageAndCloseTheChannel(payload, testee);

        expect(testee.snapshot).toMatchSnapshot();
    });

    it("Should send completion message and close the channel on PR declining", async () => {
        const testee = new TestSlackGateway();
        payload.eventKey = "pr:declined";

        await sendCompletionMessageAndCloseTheChannel(payload, testee);

        expect(testee.snapshot).toMatchSnapshot();
    });

    it("Should send completion message and close the channel on PR deletion", async () => {
        const testee = new TestSlackGateway();
        payload.eventKey = "pr:deleted";

        await sendCompletionMessageAndCloseTheChannel(payload, testee);

        expect(testee.snapshot).toMatchSnapshot();
    });

    it("Should throw Error on unkonwn action type", async () => {
        const testee = new TestSlackGateway();
        payload.eventKey = "unknown action";

        expect.assertions(1);
        try {
            await sendCompletionMessageAndCloseTheChannel(payload, testee);
        } catch (error) {
            expect((error as Error).message).toBe("Unknown payload type.");
        }
    });
});
