# mdast-util-from-adf

[![Checks](https://github.com/bitcrowd/mdast-util-from-adf/actions/workflows/checks.yml/badge.svg)](https://github.com/bitcrowd/mdast-util-from-adf/actions/workflows/checks.yml)
[![npm version](https://img.shields.io/npm/v/mdast-util-from-adf)](https://www.npmjs.com/package/mdast-util-from-adf)

[**mdast**](https://github.com/syntax-tree/mdast) utility to convert [ADF](https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/).

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm](https://docs.npmjs.com/cli/install):

```sh
npm install mdast-util-from-adf
```

## Use

Say we have the following script, `example.js`:

```js
import { fromADF } from "mdast-util-from-adf";
import { toMarkdown } from "mdast-util-to-markdown";

const doc = {
  version: 1,
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Hello ",
        },
        {
          type: "text",
          text: "ADF",
          marks: [
            {
              type: "link",
              attrs: {
                href: "https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/",
              },
            },
            {
              type: "strong",
            },
          ],
        },
        {
          type: "text",
          text: "!",
        },
      ],
    },
  ],
};

console.log(toMarkdown(fromADF(doc)));
```

Now, running `node example` yields:

```markdown
Hello **[ADF](https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/)**!
```

## References

- Atlassian Document Format: https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/
- ADF Builder: https://developer.atlassian.com/cloud/jira/platform/apis/document/playground/
- ADF Viewer: https://developer.atlassian.com/cloud/jira/platform/apis/document/viewer/
