"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import DoEndParser from "./DoEndParser";
import DoEndParserController from "./DoEndParserController";

// This method is called when your extension is activated. Activation is
// controlled by the activation events defined in package.json.
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("do...end Match is active!");

  const parser = new DoEndParser();
  const controller = new DoEndParserController(parser);

  context.subscriptions.push(parser);
  context.subscriptions.push(controller);
}

// this method is called when your extension is deactivated
export function deactivate() {}
