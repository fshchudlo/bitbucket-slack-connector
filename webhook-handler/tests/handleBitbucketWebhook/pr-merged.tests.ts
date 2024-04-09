import TestSlackGateway from "../TestSlackGateway";
import TestPayloadBuilder from "../TestPayloadBuilder";
import handleBitbucketWebhook from "../../handleBitbucketWebhook";
import { TestBitbucketGateway } from "../TestBitbucketGateway";

describe("handleBitbucketWebhook", () => {
    it("Should send completion message and close the channel on PR merge", async () => {
        const testSlackGateway = new TestSlackGateway();
        const payload = TestPayloadBuilder.pullRequestMerged();

        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway());

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
