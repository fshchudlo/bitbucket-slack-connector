import { BitbucketGateway } from "../webhook-handler/BitbucketGateway";
import axios, { AxiosRequestConfig } from "axios";

export default class BitbucketWebAPIGateway implements BitbucketGateway {
    private readonly apiURL: string;
    private readonly token: string;

    constructor(baseURL: string, token: string) {
        this.apiURL = baseURL.endsWith("/") ? `${baseURL}rest/api/1.0` : `${baseURL}/rest/api/1.0`;
        this.token = token;
    }

    private async tryExecuteRequest<T>(url: string): Promise<T | null> {
        const config: AxiosRequestConfig = {
            headers: {
                "Authorization": `Bearer ${this.token}`
            }
        };

        try {
            const response = await axios.get<T>(url, config);
            if (response.status === 200) {
                return response.data;
            } else {
                console.error(`Error executing request for ${url} message: ${response.statusText}`);
                return null;
            }
        } catch (error) {
            console.error(`Error executing request for ${url} message:`, error);
            return null;
        }
    }

    async tryGetCommitMessage(projectKey: string, repoSlug: string, commitHash: string): Promise<string | null> {
        const url = `${this.apiURL}/projects/${projectKey}/repos/${repoSlug}/commits/${commitHash}`.replace(/\/+/g, "\/");

        return (await this.tryExecuteRequest<{ message: string }>(url)).message;
    }
}