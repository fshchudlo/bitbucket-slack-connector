import buildChannelName from './buildChannelName';

describe("buildChannelName", () => {
    it("should generate the correct channel name", () => {
        const projectKey = "PROJECT";
        const repositorySlug = "REPOSITORY";
        const pullRequestId = 123;
        expect(buildChannelName(projectKey, repositorySlug, pullRequestId)).toEqual("pr-project-repository-123");
    });

    it("should remove extra dashes", () => {
        const projectKey = "------PROJECT------";
        const repositorySlug = "------REPOSITORY------";
        const pullRequestId = 123;
        expect(buildChannelName(projectKey, repositorySlug, pullRequestId)).toEqual("pr-project-repository-123");
    });

    it("should handle project key with ~ and repository slug with .", () => {
        const projectKey = "~PROJECT";
        const repositorySlug = "REPOSITORY.SLUG";
        const pullRequestId = 456;
        expect(buildChannelName(projectKey, repositorySlug, pullRequestId)).toEqual("pr-project-repositoryslug-456");
    });

    it("should limit channel name to 80 symbols", () => {
        const projectKey = "REALLY_REALLY_REALLY_LONG_PROJECT_NAME";
        const repositorySlug = "REALLY_REALLY_REALLY_LONG_REPOSITORY_NAME";
        const pullRequestId = "789";
        expect(buildChannelName(projectKey, repositorySlug, pullRequestId)).toEqual("pr-really_really_really_long_project_name-really_really_really_long_reposito-789");
    });
});
