import { buildChannelName } from "../buildChannelName";
import { PullRequestPayload } from "../../../use-cases/contracts";

describe("buildChannelName", () => {
    it("should generate the correct channel name", () => {
        const payload = <PullRequestPayload>{
            number: 123,
            targetBranch: {
                repositoryName: "REPOSITORY",
                projectKey: "PROJECT"
            }
        };
        expect(buildChannelName(payload)).toEqual("pr-project-repository-123");
    });

    it("should handle flatten params structure", () => {
        const payload = {
            pullRequestId: 123,
            repositorySlug: "REPOSITORY",
            projectKey: "PROJECT"
        };
        expect(buildChannelName(payload)).toEqual("pr-project-repository-123");
    });

    it("should remove extra dashes", () => {
        const payload = <PullRequestPayload>{
            number: 123,
            targetBranch: {
                repositoryName: "------REPOSITORY------",
                projectKey: "------PROJECT------"
            }
        };

        expect(buildChannelName(payload)).toEqual("pr-project-repository-123");
    });

    it("should handle project key with ~ and repository slug with .", () => {
        const payload = <PullRequestPayload>{
            number: 456,
            targetBranch: {
                repositoryName: "REPOSI.TORY.SLUG",
                projectKey: "~PROJECT"
            }
        };

        expect(buildChannelName(payload)).toEqual("pr-project-reposi-tory-slug-456");
    });

    it("should limit channel name to 80 symbols", () => {
        const payload = <PullRequestPayload>{
            number: 789,
            targetBranch: {
                repositoryName: "REALLY_REALLY_REALLY_LONG_REPOSITORY_SLUG",
                projectKey: "REALLY_REALLY_REALLY_LONG_PROJECT_NAME"
            }
        };
        expect(buildChannelName(payload)).toEqual("pr-really_really_really_long_project_name-really_really_really_long_reposito-789");
    });
});
