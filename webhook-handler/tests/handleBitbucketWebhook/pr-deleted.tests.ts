import SlackAdapterSnapshottingMock from "../SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "../TestPayloadBuilder";
import handleBitbucketWebhook from "../../handleBitbucketWebhook";
import { TestBitbucketGateway } from "../TestBitbucketGateway";

describe("handleBitbucketWebhook", () => {
    it("Should send completion message and close the channel on PR deletion", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();
        const payload = TestPayloadBuilder.pullRequestDeleted();

        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway());

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
