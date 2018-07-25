# do...end Match

This is a simple extension that matches keyword blocks like brackets, `()`, `[]`, or `{}`. When the cursor is on or next to a block keyword it will underline it and the opening/closing word. This extension was designed with Elixir in mind, so the default keywords are `do` and `fn` to open, and `end` to close. This extension is fully configurable to match any keywords though! 

For example, in Ruby you would have to add `while`, `if`, `def`, etc, to `doEndMatch.keywords.open` for it to work, but it'd be doable. If you have any issues or requests for features open a ticket on GitHub and I'd be happy to help if possible.

## Features

- When the cursor is on a block-defining keyword it and the corresponding opening/closing word will be underlined.
- Allows jumping to these keywords like Go to Bracket command.
  - Keyboard Shortcut: `alt+shift+\`

## Extension Settings

| Setting                        | Default                                                                                                        | Description                                                                         |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `doEndMatch.keywords`          | <code>{<br>&nbsp;&nbsp;"open": ["do", "fn"], <br>&nbsp;&nbsp;"close": ["end"]<br>}</code>                      | Keywords to match. Any combination of words in open and close will trigger matches. |
| `doEndMatch.style`             | <code>{<br>&nbsp;&nbsp;"borderWidth": "1px", <br>&nbsp;&nbsp;"borderStyle": "none none solid none"<br>}</code> | Custom style for matching do...end blocks                                           |
| `doEndMatch.wordSeparators`    | ``" \n\t`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?"``                                                                   | Characters that will be used as word separators when looking for do/end.            |
| `doEndMatch.ignoreDoWithColon` | `true`                                                                                                         | When enabled fixes a bug that causes `do:` to still match with `end` in Elixir.     |

## Acknowledgements

I used the source code from [Subtle Match Brackets](https://marketplace.visualstudio.com/items?itemName=rafamel.subtle-brackets) as guide for this extension. It's a great extension that adds customizability to the style of matched brackets.