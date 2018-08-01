"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path"; // VS Code extensibility API
import { Disposable, window, workspace } from "vscode";
import DoEndParser from "./DoEndParser";

export default class DoEndParserController {
  private parser: DoEndParser;
  private disposable: Disposable;

  constructor(parser: DoEndParser) {
    this.parser = parser;

    const saveEv = workspace.onDidSaveTextDocument(saved => {
      setTimeout(() => {
        const fileName = path.basename(saved.fileName);
        if (fileName !== "settings.json") {
          return;
        }

        this.parser.updateConfig();
      }, 2000);
    });

    // Subscribe to selection change and editor activation events
    const subscriptions: Disposable[] = [];
    subscriptions.push(saveEv);
    window.onDidChangeTextEditorSelection(this.onEvent, this, subscriptions);
    window.onDidChangeActiveTextEditor(this.onEvent, this, subscriptions);

    // Create a combined disposable
    this.disposable = Disposable.from(...subscriptions);
  }

  public dispose() {
    this.disposable.dispose();
  }

  private onEvent() {
    this.parser.matchDoEnd();
  }
}
