import SlackAdapterSnapshottingMock from "./mocks/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "./mocks/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestBitbucketGateway } from "./mocks/TestBitbucketGateway";
import AppConfig from "../../app.config";

describe("handleBitbucketWebhook", () => {
    it("Should update channel participants on reviewers list update", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();
        const payload = TestPayloadBuilder.reviewersUpdated();

        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway(), AppConfig);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
