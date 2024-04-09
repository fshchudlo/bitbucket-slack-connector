import TestSlackGateway from "../TestSlackGateway";
import TestPayloadBuilder from "../TestPayloadBuilder";
import handleBitbucketWebhook from "../../handleBitbucketWebhook";
import { TestBitbucketGateway } from "../TestBitbucketGateway";

describe("handleBitbucketWebhook", () => {
    it("Should create channel, set topic and invite author and reviewers on PR opened", async () => {
        const testSlackGateway = new TestSlackGateway();
        const payload = TestPayloadBuilder.pullRequestOpened();

        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway());

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

});
