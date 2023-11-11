![@observerly:astrometry](./.github/assets/banner.png)

We appreciate your interest in contributing to observerly, and your contributions are integral to enhancing this project. Whether you are addressing a bug, implementing new features, or suggesting improvements, your involvement is highly valued and essential.

## Code Style

There isn't a specific code style guide for this project, but we do have a few rules that we follow:

- Use [Prettier](https://prettier.io/) for code formatting.
- Use [ESLint](https://eslint.org/) for code linting.
- Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages.
- Use [Semantic Versioning](https://semver.org/) for versioning.

## Getting Started

### 1. Fork the Repository

To get started, fork the observerly repository. This creates a duplicate of the project, allowing you to make and test your changes without affecting the original project.

[Fork @observerly/astrometry repository](https://github.com/observerly/astrometry/fork)

### 2. Clone the Repository

Clone your forked repository to your local development environment using this command:

```bash
git clone https://github.com/<REPLACE_WITH_YOUR_USERNAME>/astrometry.git
```

### 3. Setup

Navigate to the project folder and install the necessary dependencies:

```bash
cd astrometry
```

#### Existing Module Contribution

Mobule contribution is much simpler, ensure that any new variables are correctly exported and the index.ts file should be setup to ensure they are exposed at the package root.

#### New Module Contribution

Modules are added to the vite.config bundler [here](https://github.com/observerly/astrometry/blob/2055036e5f7b3d533ee92a80c3ce1c373ec040b2/vite.config.ts#L21), to ensure that each file is built. This allows for the tree-shaking of unused dependencies.

We also update the package.json file to include the new dependencies:

```json
{
  exports: {
    ...
    "./module": {
      "import": "./dist/module.js",
      "require": "./dist/module.cjs",
      "types": "./dist/module.d.ts"
    },
  }
}
```

Ensuring that the package.json file is updated with the new dependencies is important, as it allows for the correct dependencies to be installed when the package is used as a dependency.

We also require that the index.ts entrypoint is updated with the associated exports from your added module.

#### Install Custom Dependencies

```bash
pnpm run install # or pnpm i
```

### 4. Build

Once changes have been made, the CI/CD pipeline will automatically build the project. However, you can also build the project locally using the following command:

```bash
pnpm run build
```

### 5. Test

Once changes have been made, the CI/CD pipeline will automatically test the project. However, you can also test the project locally using the following command:

```bash
pnpm run test
```

## Contribution

The main repository is the primary location for the project. It is where development takes place and where contributions are made.

## Branches

The main branch is the default branch for the project. It is the most recent, canary version of the codebase.

The latest branch is the most recent stable version of the codebase. It is the most recent version that has been tested and is ready for production.

All development work should be performed in a separate branch to both main and latest, using a trunk-based git workflow.

### Creating a New Branch

Begin by creating a new branch where you will work on your changes. You can do this with the following command:

```shell
git checkout -b <COMMIT_TYPE>/<PACKAGE_NAME>/branch-name
```

Alternatively, you can create a branch using:

```shell
git branch <COMMIT_TYPE>/<PACKAGE_NAME>/branch-name
```

### Staging Your Changes

Use the following command to stage the changes you want to commit:

```shell
git add your-file-name
```

Alternatively, you can stage all changes with:

```shell
git add .
```

### Committing Your Changes

Make clear and concise commits with a descriptive message that follows the conventional commit format: [https://www.conventionalcommits.org/en/v1.0.0/](https://www.conventionalcommits.org/en/v1.0.0/).

### Pushing Your Changes

Once your changes are committed, push them to your branch:

```shell
git push origin <COMMIT_TYPE>/<PACKAGE_NAME>/your-branch-name
```

## Create a Pull Request

Effective pull requests, which can include patches, improvements, or new features, are a valuable contribution. Ensure they are focused on a specific scope and do not contain unrelated commits.

To create a pull request, navigate to the original repository on GitHub and click the "New Pull Request" button. Compare and create a pull request from your branch to the main repository. Provide a clear and concise description of your changes in the pull request.

## Review and Feedback

After submitting your pull request, maintainers and other contributors will review your changes and provide feedback. Be prepared to address any suggested improvements.

## Merging

Once your pull request is approved, it will be merged into the main repository.

## Bug Reports

If you encounter any issues or bugs, please report them with detailed information to aid in troubleshooting.

## Feature Requests

Feel free to submit detailed feature requests for new functionality you would like to see.

## Testing

Comprehensive testing of your changes is vital to prevent regressions and errors.

## Good First Issues

To begin your contribution journey, explore our list of "good first issue" tasks specifically curated for newcomers and first-time contributors.

## Code Of Conduct

Please ensure that your contributions align with our [Code of Conduct](https://github.com/observerly/astrometry/blob/main/CODE_OF_CONDUCT.md). Show respect, inclusivity, and consideration for others.
