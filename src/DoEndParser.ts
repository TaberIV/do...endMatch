"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
  window,
  // workspace,
  TextEditorDecorationType,
  Range,
  Position
} from "vscode";

export default class DoEndParser {
  private parseDict: {
    open: string[];
    close: string[];
    all: string[];
  };
  private decoration: TextEditorDecorationType;
  private past: boolean;

  constructor() {
    // TODO config integration
    // const config = workspace.getConfiguration("do-end-match");
    const decoration = {
      color: "#A581C1",
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
      const { wordStart, wordEnd } = this.findWordRange(lineText, character);
      const word = lineText.slice(wordStart, wordEnd);

      if (this.parseDict.all.includes(word)) {
        const ranges = [
          new Range(new Position(line, wordStart), new Position(line, wordEnd))
        ];

        editor.setDecorations(this.decoration, ranges);
        this.past = true;
      }
    }
  }

  private findWordRange(lineText: string, character: number) {
    const wordSeparators = " \n\t`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?";

    let wordStart = character;
    while (wordStart > 0) {
      const char = lineText.slice(wordStart - 1, wordStart);

      if (wordSeparators.includes(char)) {
        break;
      } else {
        wordStart--;
      }
    }

    let wordEnd = character;
    while (wordEnd < lineText.length) {
      const char = lineText.slice(wordEnd, wordEnd + 1);

      if (wordSeparators.includes(char)) {
        break;
      } else {
        wordEnd++;
      }
    }

    return { wordStart, wordEnd };
  }

  dispose() {}
}
