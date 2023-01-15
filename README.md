[![build-test-release](https://github.com/cakarci/github-actions/actions/workflows/build-test-release.yml/badge.svg)](https://github.com/cakarci/github-actions/actions/workflows/build-test-release.yml)

# Pull request workflow action

This action is an example action that sends welcome message to the provided name

## Inputs

### `your-name`

**Required** The name of the author. Default `"Salih"`.

## Outputs

### `welcome-message`

The greeting message we send you. Default `"Hello Salih"`

## Example usage

```yaml
uses: cakarci/pull-request-workflow@v1
with:
  your-name: 'Salih'
```

