import TestSlackGateway from "./TestSlackGateway";
import TestPayloadBuilder from "./TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestBitbucketGateway } from "./TestBitbucketGateway";
import { PullRequestBasicNotification } from "../../typings";

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

    it("Should send message on PR comment", async () => {
        const payload = TestPayloadBuilder.pullRequestCommentAdded();
        await handleBitbucketWebhook(payload, testSlackGateway, testBitbucketGateway);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send message on PR comment modification", async () => {
        const payload = TestPayloadBuilder.pullRequestCommentEdited();
        await handleBitbucketWebhook(payload, testSlackGateway, testBitbucketGateway);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send message on PR comment deletion", async () => {
        const payload = TestPayloadBuilder.pullRequestCommentDeleted();
        await handleBitbucketWebhook(payload, testSlackGateway, testBitbucketGateway);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send message on PR modification", async () => {
        const payload = TestPayloadBuilder.pullRequestModified();
        await handleBitbucketWebhook(payload, testSlackGateway, testBitbucketGateway);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send message on PR approval/unapproval/needs work", async () => {
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestNeedsWork(), testSlackGateway, testBitbucketGateway);
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestUnapproved(), testSlackGateway, testBitbucketGateway);
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestApproved(), testSlackGateway, testBitbucketGateway);
        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send message on PR commit", async () => {
        const payload = TestPayloadBuilder.pullRequestFromRefUpdated();
        await handleBitbucketWebhook(payload, testSlackGateway, testBitbucketGateway);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should update channel participants on reviewers list update", async () => {
        const payload = TestPayloadBuilder.reviewersUpdated();
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

        const invalidPayload = ({ eventKey: "unknown action" } as unknown) as PullRequestBasicNotification;

        try {
            await handleBitbucketWebhook(invalidPayload, testSlackGateway, testBitbucketGateway);
        } catch (error) {
            expect((error as Error).message).toBe("\"unknown action\" event key is unknown.");
        }
    });
});
