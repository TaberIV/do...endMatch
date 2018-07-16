"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
  Position,
  Range,
  Selection,
  TextDocument,
  TextEditorDecorationType,
  window,
  workspace
} from "vscode";

interface IWordRange {
  word: string;
  range: Range;
}

export default class DoEndParser {
  private keywords: {
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
    this.keywords = { all, ...dict };

    this.wordSeparators = config.wordSeparators;

    // Set control values
    this.past = false;
  }

  public dispose() {}

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

    const doc = editor.document;
    const pos = editor.selection.active;

    // Get word surrounding cursor, if any
    const { word: wordA, range: wordARange } = this.findWordRange(doc, pos);

    // If word is in the dict, find the complement and highlight them both.
    if (this.keywords.all.includes(wordA)) {
      // Check whether to go forwards or backwards
      const parseDir = this.keywords.open.includes(wordA) ? 1 : -1;

      // Find complement of wordA
      const wordBRange = this.parseUntilComplement(
        1,
        parseDir,
        doc,
        parseDir === 1 ? wordARange.end : wordARange.start
      );

      if (wordBRange !== undefined) {
        this.past = true;
        editor.setDecorations(this.decoration, [wordARange, wordBRange]);
      }
    }
  }

  public jump() {
    // Get the current text editor
    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    const doc = editor.document;
    const pos = editor.selection.active;

    const { word, range } = this.findWordRange(doc, pos);

    // If on a keyword, go to closing keyword. Else, go to next keyword
    if (this.keywords.all.includes(word)) {
      const parseDir = this.keywords.open.includes(word) ? 1 : -1;
      const complement = this.parseUntilComplement(
        1,
        parseDir,
        doc,
        parseDir === 1 ? range.end : range.start
      );

      if (complement !== undefined) {
        editor.selection = new Selection(complement.start, complement.end);
      }
    } else {
      const { range: nextRange } = this.findNextKeyword(
        1,
        doc,
        pos.line,
        range.end.character
      );

      if (!nextRange.isEmpty) {
        editor.selection = new Selection(nextRange.start, nextRange.end);
      }
    }
  }

  private findWordRange(doc: TextDocument, pos: Position): IWordRange {
    const { line, character } = pos;
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
    const range = new Range(new Position(line, start), new Position(line, end));

    return { word, range };
  }

  private findNextKeyword(
    parseDir: 1 | -1,
    doc: TextDocument,
    line: number,
    character?: number
  ): IWordRange {
    const forward = parseDir === 1;
    const lineText = doc.lineAt(line).text;

    if (character === undefined) {
      character = forward ? 0 : lineText.length;
    } else if (!forward) {
      character -= 1;
    }

    while (forward ? character < lineText.length : character >= 0) {
      if (this.wordSeparators.includes(lineText[character])) {
        character += parseDir;
        continue;
      }

      const { word, range } = this.findWordRange(
        doc,
        new Position(line, character)
      );

      if (this.keywords.all.includes(word)) {
        return { word, range };
      } else {
        character = forward ? range.end.character : range.start.character - 1;
      }
    }

    // Go to next line
    if (line + parseDir >= 0 && doc.lineCount > line + parseDir) {
      return this.findNextKeyword(parseDir, doc, line + parseDir);
    }

    const pos = new Position(line, character);
    return { word: "", range: new Range(pos, pos) };
  }

  private parseUntilComplement(
    open: number,
    parseDir: 1 | -1,
    doc: TextDocument,
    pos: Position
  ): Range | undefined {
    // Find next keyword
    const { word, range } = this.findNextKeyword(
      parseDir,
      doc,
      pos.line,
      pos.character
    );

    if (range.isEmpty) {
      // No word was found
      return undefined;
    }

    // Check if word opens or closes
    if (this.keywords.open.includes(word)) {
      open += parseDir;
    } else if (this.keywords.close.includes(word)) {
      open -= parseDir;
    }

    // Closing found
    if (open === 0) {
      return range;
    }

    // Check next keyword
    return this.parseUntilComplement(
      open,
      parseDir,
      doc,
      parseDir === 1 ? range.end : range.start
    );
  }
}
