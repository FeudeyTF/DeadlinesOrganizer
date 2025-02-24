import { BooleanLike } from "./types";

export function classes(classNames: (string | BooleanLike)[]): string {
    let className = '';
    for (let i = 0; i < classNames.length; i++) {
      const part = classNames[i];
      if (typeof part === 'string') {
        className += `${part} `;
      }
    }
    return className;
  }