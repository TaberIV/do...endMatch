"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { Disposable, window } from "vscode";
import DoEndParser from "./DoEndParser";

export default class DoEndParserController {
  private parser: DoEndParser;
  private disposable: Disposable;

  constructor(parser: DoEndParser) {
    this.parser = parser;

    // Subscribe to selection change and editor activation events
    const subscriptions: Disposable[] = [];
    window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
    window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

    // Create a combined disposable from both event subscriptions
    this.disposable = Disposable.from(...subscriptions);
  }

  public dispose() {
    this.disposable.dispose();
  }

  private _onEvent() {
    this.parser.matchDoEnd();
  }
}
