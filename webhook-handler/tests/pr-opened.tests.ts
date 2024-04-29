import SlackAdapterSnapshottingMock from "./mocks/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "./mocks/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestBitbucketGateway } from "./mocks/TestBitbucketGateway";
import AppConfig from "../../app.config";

describe("handleBitbucketWebhook", () => {
    it("Should create channel, add bookmark and invite author and reviewers on PR opened", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();
        const payload = TestPayloadBuilder.pullRequestOpened();

        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway(), AppConfig);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

});
