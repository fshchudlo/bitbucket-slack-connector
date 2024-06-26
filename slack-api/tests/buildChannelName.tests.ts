import { buildChannelName } from "../buildChannelName";
import { PullRequestPayload } from "../../bitbucket-payload-types";

describe("buildChannelName", () => {
    it("should generate the correct channel name", () => {
        const payload = <PullRequestPayload>{
            id: 123,
            toRef: {
                repository: {
                    slug: "REPOSITORY",
                    project: {
                        key: "PROJECT"
                    }
                }
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
            id: 123,
            toRef: {
                repository: {
                    slug: "------REPOSITORY------",
                    project: {
                        key: "------PROJECT------"
                    }
                }
            }
        };

        expect(buildChannelName(payload)).toEqual("pr-project-repository-123");
    });

    it("should handle project key with ~ and repository slug with .", () => {
        const payload = <PullRequestPayload>{
            id: 456,
            toRef: {
                repository: {
                    slug: "REPOSI.TORY.SLUG",
                    project: {
                        key: "~PROJECT"
                    }
                }
            }
        };

        expect(buildChannelName(payload)).toEqual("pr-project-reposi-tory-slug-456");
    });

    it("should limit channel name to 80 symbols", () => {
        const payload = <PullRequestPayload>{
            id: 789,
            toRef: {
                repository: {
                    slug: "REALLY_REALLY_REALLY_LONG_REPOSITORY_SLUG",
                    project: {
                        key: "REALLY_REALLY_REALLY_LONG_PROJECT_NAME"
                    }
                }
            }
        };
        expect(buildChannelName(payload)).toEqual("pr-really_really_really_long_project_name-really_really_really_long_reposito-789");
    });
});
