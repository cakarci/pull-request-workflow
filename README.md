[![build-test-release](https://github.com/cakarci/pull-request-workflow/actions/workflows/build-test-release.yml/badge.svg)](https://github.com/cakarci/pull-request-workflow/actions/workflows/build-test-release.yml)
[![check-dist](https://github.com/cakarci/pull-request-workflow/actions/workflows/check-dist.yml/badge.svg)](https://github.com/cakarci/pull-request-workflow/actions/workflows/check-dist.yml)
[![pull-request-workflow](https://github.com/cakarci/pull-request-workflow/actions/workflows/pull-request-workflow.yml/badge.svg)](https://github.com/cakarci/pull-request-workflow/actions/workflows/pull-request-workflow.yml)

# Pull request workflow action

Pull request workflow with for eyes principle

## Inputs

### `github-token`

**Required** The GitHub Token that has access to the workflow scope .

### `slack-token`

**Required** The Slack Bot User OAuth Token starts with `xoxb-` which will be required to send messages to a Slack channel.

### `slack-channel-id`

**Required** The Slack channel for notifications to be sent.

## Outputs

### `action`

Outputs the GitHub action name

## Example usage

```yaml
uses: cakarci/pull-request-workflow@v1
with:
  github-token: ${{ secrets.GH_TOKEN }}
  slack-token: ${{ secrets.SLACK_BOT_TOKEN }}
  slack-channel-id: 'C04LNJJUCKS' 
```

