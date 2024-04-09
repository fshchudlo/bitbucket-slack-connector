import TestSlackGateway from "../TestSlackGateway";
import TestPayloadBuilder from "../TestPayloadBuilder";
import handleBitbucketWebhook from "../../handleBitbucketWebhook";
import { TestBitbucketGateway } from "../TestBitbucketGateway";

describe("handleBitbucketWebhook", () => {
    it("Should send message on PR comment edit", async () => {
        const testSlackGateway = new TestSlackGateway();
        const payload = TestPayloadBuilder.pullRequestCommentEdited();
        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway());

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
