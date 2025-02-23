import { Tag } from "../types";
import { ApiService } from "../../services/api";

export class TagsManager {
  tags: Tag[];

  constructor() {
    this.tags = [];
    this.loadTags();
  }

  private async loadTags() {
    this.tags = await ApiService.fetchTags();
  }

  async addTag(tag: Tag) {
    const newTag = await ApiService.createTag(tag);
    this.tags.push(newTag);
    return newTag;
  }

  async deleteTag(id: number) {
    await ApiService.deleteTag(id);
    this.tags = this.tags.filter((tag) => tag.id !== id);
  }

  getTagById(id: number) {
    return this.tags.find((tag) => tag.id === id);
  }
}
