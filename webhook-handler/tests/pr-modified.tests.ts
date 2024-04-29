import SlackAdapterSnapshottingMock from "./mocks/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "./mocks/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestBitbucketGateway } from "./mocks/TestBitbucketGateway";
import { BitbucketNotification } from "../../typings";
import { TestWebhookHandlerConfig } from "./mocks/TestWebhookHandlerConfig";

describe("handleBitbucketWebhook", () => {
    it("Should send message when PR modified", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();
        const payload = TestPayloadBuilder.pullRequestModified();
        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
    it("Doesn't send message if PR doesn't contain visible changes", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();
        const prCreatedPayload = TestPayloadBuilder.pullRequestOpened();
        const modifiedPayload = {
            ...prCreatedPayload,
            eventKey: "pr:modified",
            previousDescription: prCreatedPayload.pullRequest.description,
            previousTitle: prCreatedPayload.pullRequest.title,
            previousTarget: {
                displayId: prCreatedPayload.pullRequest.toRef.displayId,
                latestCommit: prCreatedPayload.pullRequest.toRef.latestCommit
            }
        } as BitbucketNotification;
        await handleBitbucketWebhook(modifiedPayload, testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
