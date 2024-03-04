import TestSlackGateway from "../gateways/TestSlackGateway";
import TestPayloadBuilder from "./TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { PullRequestBasicPayload } from "../contracts";
import { TestBitbucketGateway } from "../gateways/TestBitbucketGateway";

let testSlackGateway: TestSlackGateway = null;
let testBitbucketGateway: TestBitbucketGateway = null;
describe("handleBitbucketWebhook", () => {
    beforeEach(() => {
        testSlackGateway = new TestSlackGateway();
        testBitbucketGateway = new TestBitbucketGateway();
    });
    it("Should create channel, set topic and invite author and reviewers on PR opened", async () => {
        const payload = TestPayloadBuilder.pullRequestOpened();

        await handleBitbucketWebhook(payload, testSlackGateway, testBitbucketGateway);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send message on PR commented", async () => {
        const payload = TestPayloadBuilder.pullRequestCommentAdded();
        await handleBitbucketWebhook(payload, testSlackGateway, testBitbucketGateway);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
    it("Should send message on PR commit", async () => {
        const payload = TestPayloadBuilder.pullRequestFromRefUpdated();
        await handleBitbucketWebhook(payload, testSlackGateway, testBitbucketGateway);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send completion message and close the channel on PR merge", async () => {
        const payload = TestPayloadBuilder.pullRequestMerged();
        await handleBitbucketWebhook(payload, testSlackGateway, testBitbucketGateway);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send completion message and close the channel on PR declining", async () => {
        const payload = TestPayloadBuilder.pullRequestDeclined();

        await handleBitbucketWebhook(payload, testSlackGateway, testBitbucketGateway);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send completion message and close the channel on PR deletion", async () => {
        const payload = TestPayloadBuilder.pullRequestDeleted();

        await handleBitbucketWebhook(payload, testSlackGateway, testBitbucketGateway);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should throw Error on unknown action type", async () => {
        expect.assertions(1);
        try {
            await handleBitbucketWebhook({ eventKey: "unknown action" } as PullRequestBasicPayload, testSlackGateway, testBitbucketGateway);
        } catch (error) {
            expect((error as Error).message).toBe("\"unknown action\" event type is unknown.");
        }
    });
});
