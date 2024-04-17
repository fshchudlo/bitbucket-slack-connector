import SlackAdapterSnapshottingMock from "./mocks/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "./mocks/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestBitbucketGateway } from "./mocks/TestBitbucketGateway";

describe("handleBitbucketWebhook", () => {
    it("Should send message on PR approval/unapproval/needs work", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();

        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestNeedsWork(), testSlackGateway, new TestBitbucketGateway());
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestUnapproved(), testSlackGateway, new TestBitbucketGateway());
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestApproved(), testSlackGateway, new TestBitbucketGateway());

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
