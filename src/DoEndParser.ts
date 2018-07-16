"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
  window,
  workspace,
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
  private wordSeparators: string;

  constructor() {
    // Get configuration
    const config = workspace.getConfiguration("doEndMatch");

    const decoration = config.style;
    this.decoration = window.createTextEditorDecorationType(decoration);

    const dict = config.dict;
    const all = dict.open.concat(dict.close);
    this.parseDict = { all, ...dict };

    this.wordSeparators = config.wordSeparators;

    // Set control values
    this.past = false;
  }

  private findWordRange(
    doc: TextDocument,
    line: number,
    character: number
  ): { word: string; wordRange: Range } {
    const lineText = doc.lineAt(line).text;

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

    const word = lineText.slice(start, end);
    const wordRange = new Range(
      new Position(line, start),
      new Position(line, end)
    );
    return { word, wordRange };
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

      // Get word surrounding cursor, if any
      const { word: wordA, wordRange: wordARange } = this.findWordRange(
        doc,
        line,
        character
      );

      if (this.parseDict.all.includes(wordA)) {
        // Finds whether to go forwards or backwards
        const parseDir = this.parseDict.open.includes(wordA) ? 1 : -1;

        // Find complement of wordA
        const wordBRange = this.parseUntilComplement(
          1,
          parseDir,
          doc,
          line,
          parseDir === 1
            ? wordARange.end.character
            : wordARange.start.character - 1
        );

        if (wordBRange !== undefined) {
          this.past = true;
          editor.setDecorations(this.decoration, [wordARange, wordBRange]);
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

      const { word, wordRange } = this.findWordRange(doc, line, character);

      if (this.parseDict.open.includes(word)) {
        open += parseDir;
      } else if (this.parseDict.close.includes(word)) {
        open -= parseDir;
      }

      character = forward
        ? wordRange.end.character
        : wordRange.start.character - 1;

      if (open === 0) {
        return wordRange;
      }
    }

    // Go to next line
    if (line + parseDir >= 0 && doc.lineCount > line + parseDir) {
      return this.parseUntilComplement(open, parseDir, doc, line + parseDir);
    }

    return undefined;
  }

  dispose() {}
}
