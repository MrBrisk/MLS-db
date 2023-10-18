# MLS-db
## EJS Tags
- `<%` 'Scriptlet' tag, for control-flow, no output
- `%>`  Plain ending tag
- `<%=` Outputs the value into the template (HTML escaped)
- `<%-` Outputs the unescaped value into the template
- `<%#` Comment tag, no execution, no output
- `<%%` Outputs a literal '<%'
- `-%>` Trim-mode (\'newline slurp\') tag, trims following newline
- `<%_` 'Whitespace Slurping' Scriptlet tag, strips all whitespace before it
- `_%>` 'Whitespace Slurping' ending tag, removes all whitespace after it
