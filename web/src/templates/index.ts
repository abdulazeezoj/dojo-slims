import { readFileSync } from "fs";
import { join } from "path";

/**
 * Email template loader and renderer
 */
class EmailTemplates {
  private templateCache: Map<string, { html: string; text: string }> =
    new Map();

  private loadTemplate(templateName: string): { html: string; text: string } {
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    const basePath = join(__dirname, "emails");
    const htmlPath = join(basePath, `${templateName}.html`);
    const textPath = join(basePath, `${templateName}.txt`);

    const html = readFileSync(htmlPath, "utf-8");
    const text = readFileSync(textPath, "utf-8");

    const template = { html, text };
    this.templateCache.set(templateName, template);

    return template;
  }

  private renderTemplate(
    template: string,
    variables: Record<string, string | number>,
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key]?.toString() || match;
    });
  }

  /**
   * Get rendered email template with variables
   */
  getTemplate(
    templateName: string,
    variables: Record<string, string | number>,
  ): { html: string; text: string } {
    const template = this.loadTemplate(templateName);

    return {
      html: this.renderTemplate(template.html, variables),
      text: this.renderTemplate(template.text, variables),
    };
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
  }
}

export const emailTemplates = new EmailTemplates();
