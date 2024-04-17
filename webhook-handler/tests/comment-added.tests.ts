import SlackAdapterSnapshottingMock from "./mocks/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "./mocks/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestBitbucketGateway } from "./mocks/TestBitbucketGateway";

describe("handleBitbucketWebhook", () => {
    it("Should send message on PR comment", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();
        const payload = TestPayloadBuilder.pullRequestCommentAdded();
        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway());

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
