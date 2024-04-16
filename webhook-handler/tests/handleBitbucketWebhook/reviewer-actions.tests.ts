import SlackAdapterSnapshottingMock from "../SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "../TestPayloadBuilder";
import handleBitbucketWebhook from "../../handleBitbucketWebhook";
import { TestBitbucketGateway } from "../TestBitbucketGateway";

describe("handleBitbucketWebhook", () => {
    it("Should send message on PR approval/unapproval/needs work", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();

        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestNeedsWork(), testSlackGateway, new TestBitbucketGateway());
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestUnapproved(), testSlackGateway, new TestBitbucketGateway());
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestApproved(), testSlackGateway, new TestBitbucketGateway());

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
