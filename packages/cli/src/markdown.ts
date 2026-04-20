export interface MarkdownSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  ordered?: string[];
}

export function renderMarkdown(title: string, sections: MarkdownSection[]): string {
  const lines: string[] = [title, ""];

  sections.forEach((section, index) => {
    if (section.heading) {
      lines.push(section.heading, "");
    }
    section.paragraphs?.forEach((paragraph) => lines.push(paragraph));
    if (section.paragraphs?.length) {
      lines.push("");
    }
    section.bullets?.forEach((bullet) => lines.push(`- ${bullet}`));
    if (section.bullets?.length) {
      lines.push("");
    }
    section.ordered?.forEach((item, itemIndex) => lines.push(`${itemIndex + 1}. ${item}`));
    if (section.ordered?.length) {
      lines.push("");
    }
    if (!section.heading && !section.paragraphs?.length && !section.bullets?.length && !section.ordered?.length && index < sections.length - 1) {
      lines.push("");
    }
  });

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}
