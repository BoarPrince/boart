/**
 *
 */
export class Indentation {

  /**
   *
   */
  public static unindent(text: string): string {
    const lines = text.split('\n');

    const minIndentation = lines
        .filter(line => line.trim().length > 0)
        .reduce((min, line) => Math.min(min, line.search(/\S|$/)), 0);

    if (minIndentation === 0) {
        return text;
    }

    return lines.map(line => line.substring(minIndentation)) //
        .join('\n');
  }
}
