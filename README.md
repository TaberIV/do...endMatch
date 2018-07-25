# do...end Match

This is a simple extension that matches do end blocks like brackets, `()`, `[]`, or `{}`. When the cursor is on or next to do or end it will underline it and the closing word. This extension was designed with Elixir in mind, so fn will also act as do and close a block by default. The extension will still work with other languages and this behavior is optional.

## Features

- Underlines keywords do and end and their partner when the cursor is on it.
- Allows jumping to these keywords like Go to Bracket command.
  - Keyboard Shortcut: `ctrl+shift+\`

## Extension Settings

| Setting                   | Default                                                                                                        | Description                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| doEndMatch.dict           | <code>{<br>&nbsp;&nbsp;"open": ["do", "fn"], <br>&nbsp;&nbsp;"close": ["end"]<br>}</code>                      | The words to match. Any combination of words in open and close will trigger matches. |
| doEndMatch.style          | <code>{<br>&nbsp;&nbsp;"borderWidth": "1px", <br>&nbsp;&nbsp;"borderStyle": "none none solid none"<br>}</code> | Custom style for matching do...end blocks                                            |
| doEndMatch.wordSeparators | ``" \n\t`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?"``                                                                   | Characters that will be used as word separators when looking for do/end.             |

## Release Notes

### 1.0.0

Initial release of do...end Match

#### 1.0.1

Adds settings.

### 1.1.0

Adds keyword jumping.

#### 1.1.1

Changes keyword jumping keyboard shortcut to `alt+shift+\`

#### 1.1.2

Fixes bug for Elixir where `do:` still connects with `end`

## Acknowledgements

I used the source code from [Subtle Match Brackets](https://marketplace.visualstudio.com/items?itemName=rafamel.subtle-brackets) as guide for this extension. It's a great extension that adds customizability to the style of matched brackets.