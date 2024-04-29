import SlackAdapterSnapshottingMock from "./mocks/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "./mocks/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestBitbucketGateway } from "./mocks/TestBitbucketGateway";
import AppConfig from "../../app.config";

describe("handleBitbucketWebhook", () => {
    it("Should send completion message and close the channel on PR declining", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();
        const payload = TestPayloadBuilder.pullRequestDeclined();

        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway(), AppConfig);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
