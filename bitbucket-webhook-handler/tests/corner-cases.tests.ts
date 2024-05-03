import SlackChannelSnapshottingMock from "../../test-helpers/SlackChannelSnapshottingMock";
import sendTargetNotificationToSlack from "../handleBitbucketWebhook";
import { PullRequestBasicNotification } from "../../bitbucket-payload-types";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";

describe("handleBitbucketWebhook", () => {
    it("Should throw Error on unknown action type", async () => {
        expect.assertions(1);

        const channelMock = new SlackChannelSnapshottingMock();
        const invalidPayload = ({
            ...TestPayloadBuilder.reviewersUpdated(),
            eventKey: "unknown action"
        } as unknown) as PullRequestBasicNotification;

        try {
            await sendTargetNotificationToSlack(invalidPayload, channelMock);
        } catch (error) {
            expect((error as Error).message).toBe("\"unknown action\" event key is unknown.");
        }
    });
});
