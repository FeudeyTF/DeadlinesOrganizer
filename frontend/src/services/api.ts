import { Deadline, Tag } from "../common/types";

const API_BASE_URL = "http://localhost:3001/v1";

type RestApiResponse = {
  status: number;
};

type GetDeadlinesResponse = {
  deadlines: Deadline[];
} & RestApiResponse;

type GetTagsResponse = {
  tags: Tag[];
} & RestApiResponse;

export class ApiService {
  private static async fetchJson<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url, options);
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  static async fetchDeadlines(): Promise<GetDeadlinesResponse> {
    return this.fetchJson<GetDeadlinesResponse>(`${API_BASE_URL}/deadlines`, {
      method: "GET",
    });
  }

  static async createDeadline(deadline: Deadline): Promise<Deadline> {
    return this.fetchJson<Deadline>(`${API_BASE_URL}/deadlines`, {
      method: "POST",
      body: JSON.stringify({token: "test", ...deadline}),
    });
  }

  static async updateDeadline(
    id: number,
    deadline: Partial<Deadline>
  ): Promise<Deadline> {
    return this.fetchJson<Deadline>(`${API_BASE_URL}/deadlines/${id}`, {
      method: "PUT",
      body: JSON.stringify(deadline),
    });
  }

  static async deleteDeadline(id: number): Promise<void> {
    await this.fetchJson<void>(`${API_BASE_URL}/deadlines/${id}`, {
      method: "DELETE",
    });
  }

  static async fetchTags(): Promise<GetTagsResponse> {
    return this.fetchJson<GetTagsResponse>(`${API_BASE_URL}/tags`);
  }

  static async createTag(tag: Omit<Tag, "id">): Promise<Tag> {
    return this.fetchJson<Tag>(`${API_BASE_URL}/tags`, {
      method: "POST",
      body: JSON.stringify(tag),
    });
  }

  static async deleteTag(id: number): Promise<void> {
    await this.fetchJson<void>(`${API_BASE_URL}/tags/${id}`, {
      method: "DELETE",
    });
  }
}
