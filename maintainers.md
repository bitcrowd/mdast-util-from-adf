# Publishing Package Versions

## Overview

The package is [published to the npm registry](https://www.npmjs.com/package/mdast-util-from-adf) via [GitHub Actions](./.github/workflows/publish.yml). Each time a new GitHub release is created, GitHub Actions will automatically push a new version to npm.

To publish a new version to npm, all you need to do is:

1. Bump the version number in the `package.json` [file](https://github.com/bitcrowd/mdast-util-from-adf/blob/main/package.json)
2. [Create a new release](https://github.com/bitcrowd/mdast-util-from-adf/releases/new)
3. Let the `publish` workflow [do its job](https://github.com/bitcrowd/mdast-util-from-adf/actions/workflows/publish.yml)

For publishing, a valid [npm access token](https://www.npmjs.com/settings/bitcrowd/tokens) is required. We make one available to the workflow as a [secret](https://github.com/bitcrowd/mdast-util-from-adf/settings/secrets/actions).

## References

- https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages
