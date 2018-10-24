# browserlist-service

Test a user agent string against a list of browser targets and see if it matches.

## GET `/checkbrowser`

Query Params

- `targetBrowsers` - Optional. Comma separated string, e.g. `last 2 versions, not ie`.
Defaults to `last 2 versions, not dead`. See https://github.com/browserslist/browserslist#full-list for options that can be used.
- `userAgent` - Optional. The user agent string, if not specified then
pulled from header `user-agent`.

Results (JSON)

- Object
  - `targets` - Array of targets matched against
  - `matchesTargets` - Boolean, if the tested user agent string matched the targets.
  - `userAgent` - String, the user agent that was tested against the targets.