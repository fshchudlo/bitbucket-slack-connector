import SlackTestGateway from "../slack-gateway/SlackTestGateway";
import TestPayloadBuilder from "./TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { PullRequestBasicPayload } from "../contracts";

describe("handleBitbucketWebhook", () => {
    it("Should create channel, set topic and invite author and reviewers on PR opened", async () => {
        const testGateway = new SlackTestGateway();
        const payload = TestPayloadBuilder.pullRequestOpened();

        await handleBitbucketWebhook(payload, testGateway);

        expect(testGateway.snapshot).toMatchSnapshot();
    });

    it("Should send message on PR commented", async () => {
        const testGateway = new SlackTestGateway();
        const payload = TestPayloadBuilder.pullRequestCommentAdded();
        await handleBitbucketWebhook(payload, testGateway);

        expect(testGateway.snapshot).toMatchSnapshot();
    });

    it("Should send completion message and close the channel on PR merge", async () => {
        const testGateway = new SlackTestGateway();
        const payload = TestPayloadBuilder.pullRequestMerged();
        await handleBitbucketWebhook(payload, testGateway);

        expect(testGateway.snapshot).toMatchSnapshot();
    });

    it("Should send completion message and close the channel on PR declining", async () => {
        const testGateway = new SlackTestGateway();
        const payload = TestPayloadBuilder.pullRequestDeclined();

        await handleBitbucketWebhook(payload, testGateway);

        expect(testGateway.snapshot).toMatchSnapshot();
    });

    it("Should send completion message and close the channel on PR deletion", async () => {
        const testGateway = new SlackTestGateway();
        const payload = TestPayloadBuilder.pullRequestDeleted();

        await handleBitbucketWebhook(payload, testGateway);

        expect(testGateway.snapshot).toMatchSnapshot();
    });

    it("Should throw Error on unknown action type", async () => {
        const testGateway = new SlackTestGateway();
        expect.assertions(1);
        try {
            await handleBitbucketWebhook({ eventKey: "unknown action" } as PullRequestBasicPayload, testGateway);
        } catch (error) {
            expect((error as Error).message).toBe("\"unknown action\" event type is unknown.");
        }
    });
});
