## Contributing

[fork]: https://github.com/cakarci/pull-request-workflow/fork
[pr]: https://github.com/actions/github/compare
[code-of-conduct]: CODE_OF_CONDUCT.md

Hi there! I'm thrilled that you'd like to contribute to this project 💙. Your help is essential for keeping it great.

Contributions to this project are [released](https://help.github.com/articles/github-terms-of-service/#6-contributions-under-repository-license) to the public under the [project's open source license](LICENSE.md).

Please note that this project is released with a [Contributor Code of Conduct][code-of-conduct]. By participating in this project you agree to abide by its terms.

## Submitting a pull request


1. [Fork][fork] and clone the repository
2. Create a new branch: `git checkout -b my-branch-name`
3. Install dependencies `yarn install`
4. Make your change, add tests, and make sure the tests still pass
5. Push to your fork and [submit a pull request](https://help.github.com/en/articles/creating-a-pull-request)
6. Pushing your changes to the remote branch will **automatically** run the `yarn all` on pre-push hook in your local
7. After it runs, new bundled files will be generated under `dist/` folder and an additional commit `chore: update dist folder` will be added **automatically**
8. Wait for your pull request to be reviewed and merged. 🚀

Here are a few things you can do that will increase the likelihood of your pull request being accepted:

- 🧪 Write tests.
- ⛵ Keep your change as focused as possible. If there are multiple changes you would like to make that are not dependent upon each other, consider submitting them as separate pull requests.
- 🥇 Write a [good commit message](https://www.conventionalcommits.org/).

## Resources

- [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
- [Using Pull Requests](https://help.github.com/articles/about-pull-requests/)
- [GitHub Help](https://help.github.com)
