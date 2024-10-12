import axios, { AxiosRequestConfig } from "axios";

export default class BitbucketAPI {
    private readonly apiURL: string;
    private readonly readApiToken: string;

    constructor(baseURL: string, readApiToken: string | null) {
        this.apiURL = baseURL.endsWith("/") ? `${baseURL}rest/api/1.0` : `${baseURL}/rest/api/1.0`;
        this.readApiToken = readApiToken;
    }

    private async executeRequest<T>(url: string): Promise<T | null> {
        const config: AxiosRequestConfig = {
            headers: {
                "Authorization": `Bearer ${this.readApiToken}`
            }
        };
        const response = await axios.get<T>(url, config);
        if (response.status === 200) {
            return response.data;
        }
        throw new Error(`Error executing request for ${url} message: ${response.statusText}`);
    }

    canRead(): boolean {
        return !!this.readApiToken;
    }

    async fetchCommitMessage(projectKey: string, repoSlug: string, commitHash: string): Promise<string | null> {
        if (!this.canRead()) {
            return null;
        }
        const url = `${this.apiURL}/projects/${projectKey}/repos/${repoSlug}/commits/${commitHash}`.replace(/\/+/g, "/");
        return (await this.executeRequest<{ message: string }>(url)).message;
    }
}