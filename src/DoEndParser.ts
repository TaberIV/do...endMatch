"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
  window,
  // workspace,
  TextEditorDecorationType,
  Range,
  Position,
  TextDocument
} from "vscode";

export default class DoEndParser {
  private parseDict: {
    open: string[];
    close: string[];
    all: string[];
  };
  private decoration: TextEditorDecorationType;
  private past: boolean;
  private wordSeparators = " \n\t`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?";

  constructor() {
    // TODO config integration
    // const config = workspace.getConfiguration("do-end-match");
    const decoration = {
      borderWidth: "1px",
      borderStyle: "none none solid none"
    };

    this.decoration = window.createTextEditorDecorationType(decoration);
    this.past = false;
    this.parseDict = {
      open: ["do", "fn"],
      close: ["end"],
      all: ["do", "fn", "end"]
    };
  }

  private findWordRange(
    lineText: string,
    character: number
  ): {
    start: number;
    end: number;
  } {
    let start = character;
    while (start > 0) {
      const char = lineText.slice(start - 1, start);

      if (this.wordSeparators.includes(char)) {
        break;
      } else {
        start--;
      }
    }

    let end = character;
    while (end < lineText.length) {
      const char = lineText.slice(end, end + 1);

      if (this.wordSeparators.includes(char)) {
        break;
      } else {
        end++;
      }
    }

    return { start, end };
  }

  public matchDoEnd() {
    // Get the current text editor
    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    // Clean past styles
    if (this.past) {
      editor.setDecorations(this.decoration, []);
    }

    const selection = editor.selection;
    const range = new Range(selection.start, selection.end);

    // Ensures nothing is selected
    if (range.isEmpty) {
      const doc = editor.document;

      // Line and column numbers
      const { line, character } = selection.start;
      const lineText = doc.lineAt(line).text;

      // Get word surrounding cursor, if any
      const wordARange = this.findWordRange(lineText, character);
      const wordA = lineText.slice(wordARange.start, wordARange.end);

      if (this.parseDict.all.includes(wordA)) {
        const parseDir = this.parseDict.open.includes(wordA) ? 1 : -1;

        // Find complement of wordA
        const wordBRange = this.parseUntilComplement(
          1,
          parseDir,
          doc,
          line,
          parseDir === 1 ? wordARange.end : wordARange.start - 1
        );

        if (wordBRange !== undefined) {
          const ranges = [
            new Range(
              new Position(line, wordARange.start),
              new Position(line, wordARange.end)
            ),
            wordBRange
          ];

          this.past = true;
          editor.setDecorations(this.decoration, ranges);
        }
      }
    }
  }

  private parseUntilComplement(
    open: number,
    parseDir: 1 | -1,
    doc: TextDocument,
    line: number,
    character?: number
  ): Range | undefined {
    const forward = parseDir === 1;
    const lineText = doc.lineAt(line).text;

    if (character === undefined) {
      character = forward ? 0 : lineText.length;
    }

    while (forward ? character < lineText.length : character >= 0) {
      // If not on a word move on
      if (this.wordSeparators.includes(lineText[character])) {
        character += parseDir;
        continue;
      }

      const wordRange = this.findWordRange(lineText, character);
      const word = lineText.slice(wordRange.start, wordRange.end);

      if (this.parseDict.open.includes(word)) {
        open += parseDir;
      } else if (this.parseDict.close.includes(word)) {
        open -= parseDir;
      }

      character = forward ? wordRange.end : wordRange.start - 1;

      if (open === 0) {
        return new Range(
          new Position(line, wordRange.start),
          new Position(line, wordRange.end)
        );
      }
    }

    // Go to next line
    if (forward) {
      return doc.lineCount > line
        ? this.parseUntilComplement(open, parseDir, doc, line + 1)
        : undefined;
    } else {
      return line > 0
        ? this.parseUntilComplement(open, parseDir, doc, line - 1)
        : undefined;
    }
  }

  dispose() {}
}
