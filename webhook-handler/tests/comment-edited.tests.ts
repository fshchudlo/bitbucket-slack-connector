import SlackAdapterSnapshottingMock from "./mocks/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "./mocks/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestBitbucketGateway } from "./mocks/TestBitbucketGateway";

describe("handleBitbucketWebhook", () => {
    it("Should send message on PR comment edit", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();
        const payload = TestPayloadBuilder.pullRequestCommentEdited();
        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway());

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send message on comment conversion to the task", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentAdded(), testSlackGateway, new TestBitbucketGateway());


        const payload = TestPayloadBuilder.pullRequestCommentConvertedToTheTask();
        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway());

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send message on task conversion to the comment", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestTaskAdded(), testSlackGateway, new TestBitbucketGateway());


        const payload = TestPayloadBuilder.pullRequestTaskConvertedToTheComment();
        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway());

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
    it("Should send message on comment resolving and reopening", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentAdded(), testSlackGateway, new TestBitbucketGateway());


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentResolved(), testSlackGateway, new TestBitbucketGateway());

        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentReopened(), testSlackGateway, new TestBitbucketGateway());

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
    it("Should send message on task resolving and reopening", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestTaskAdded(), testSlackGateway, new TestBitbucketGateway());


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestTaskResolved(), testSlackGateway, new TestBitbucketGateway());

        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestTaskReopened(), testSlackGateway, new TestBitbucketGateway());

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
