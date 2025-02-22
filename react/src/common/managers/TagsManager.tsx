import { Tag } from "../types";

export class TagsManager {
  tags: Tag[];

  constructor() {
    this.tags = JSON.parse(localStorage.getItem("tags") || "[]");
  }

  addTag(tag: Tag) {
    this.tags.push(tag);
    this.saveTags();
    return tag;
  }

  deleteTag(id: number) {
    this.tags = this.tags.filter((tag) => tag.id !== id);
    this.saveTags();
  }

  getTagById(id: number) {
    return this.tags.find((tag) => tag.id === id);
  }

  saveTags() {
    localStorage.setItem("tags", JSON.stringify(this.tags));
  }
}
