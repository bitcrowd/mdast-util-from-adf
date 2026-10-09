# Publishing Package Versions

## Overview

The package is [published to the npm registry](https://www.npmjs.com/package/mdast-util-from-adf) via [GitHub Actions](./.github/workflows/publish.yml). Each time a new GitHub release is created, GitHub Actions stages a new version on npm, which a maintainer then approves.

To publish a new version to npm, all you need to do is:

1. Bump the version number in the `package.json` [file](https://github.com/bitcrowd/mdast-util-from-adf/blob/main/package.json)
2. [Create a new release](https://github.com/bitcrowd/mdast-util-from-adf/releases/new)
3. Let the `publish` workflow [do its job](https://github.com/bitcrowd/mdast-util-from-adf/actions/workflows/publish.yml)
4. Approve the staged version with 2FA, either on [npmjs.com](https://www.npmjs.com/package/mdast-util-from-adf) or via the CLI:

   ```sh
   npm stage list mdast-util-from-adf
   npm stage approve <stage-id>
   ```

The workflow authenticates via [trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC), so no npm access token is needed. The trusted publisher is configured in the package settings on npmjs.com and only allows `npm stage publish` from the `publish.yml` workflow of this repository.

## References

- https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages
- https://docs.npmjs.com/trusted-publishers
