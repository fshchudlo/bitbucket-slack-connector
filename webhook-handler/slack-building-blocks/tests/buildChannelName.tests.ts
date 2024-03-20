import { buildChannelName } from "../buildChannelName";
import { PullRequestPayload } from "../../../typings";

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
                    slug: "REPOSITORY.SLUG",
                    project: {
                        key: "~PROJECT"
                    }
                }
            }
        };

        expect(buildChannelName(payload)).toEqual("pr-project-repositoryslug-456");
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
