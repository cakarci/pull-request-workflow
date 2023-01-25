[![build-test-release](https://github.com/cakarci/pull-request-workflow/actions/workflows/build-test-release.yml/badge.svg)](https://github.com/cakarci/pull-request-workflow/actions/workflows/build-test-release.yml)
[![check-dist](https://github.com/cakarci/pull-request-workflow/actions/workflows/check-dist.yml/badge.svg)](https://github.com/cakarci/pull-request-workflow/actions/workflows/check-dist.yml)
[![pull-request-workflow](https://github.com/cakarci/pull-request-workflow/actions/workflows/pull-request-workflow.yml/badge.svg)](https://github.com/cakarci/pull-request-workflow/actions/workflows/pull-request-workflow.yml)

# Pull request workflow action

A GitHub action that creates a workflow for your pull request including the four eyes principle for the code reviews and sending Slack notifications for the whole process

- It doesn't spam your Slack channel as all the notifications are sent as a thread reply for a specific PR

![Screenshot 2023-01-25 at 15 26 02](https://user-images.githubusercontent.com/4185569/214591195-1dc5223f-c08e-42e1-b572-1f8eb77eaf43.png)

- Every events related to your pull request are added as a thread reply 

![Screenshot 2023-01-25 at 15 26 25](https://user-images.githubusercontent.com/4185569/214591718-d3e19dbe-2603-4451-8fea-30576ec50993.png)


## Inputs

### `github-token`

**Required** The GitHub Token that has access to the workflow scope .

### `slack-token`

**Required** The Slack Bot User OAuth Token starts with `xoxb-` which will be required to send messages to a Slack channel.

### `slack-channel-id`

**Required** The Slack channel for notifications to be sent.

## Example usage

```yaml
uses: cakarci/pull-request-workflow@v1
with:
  github-token: ${{ secrets.GH_TOKEN }}
  slack-token: ${{ secrets.SLACK_BOT_TOKEN }}
  slack-channel-id: '{Your public slack channel id}' 
```

## How to use it step by step 
1. Create a **Public Slack channel** and get the `Channel ID: C04LNJJUCKS` from the details of the channel
2. Create a **Slack App** and **Bot User** for that app by following these [steps](https://slack.com/help/articles/115005265703-Create-a-bot-for-your-workspace#add-a-bot-user)
3. Copy the `Bot User OAuth Token` and add it to your repository secret as `SLACK_BOT_TOKEN` 
   1. ([Check how to create a repository secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository))
4. Add the following bot token scopes
   1. Image
5. **[IMPORTANT]** Add your **Bot User** into the **Public Slack channel** you created in step 1
6. Create a [Personal Access Token](https://docs.github.com/en/enterprise-server@3.4/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-personal-access-token) and add it to your repository secret as `GH_TOKEN`
   1. ([Check how to create a repository secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository))
7. Add the following GitHub personal access token scopes 
   1. Image
8. Create `pull-request-workflow.yml` file with the following content under `./github/workflows`

```yaml
name: 'pull-request-workflow'

on:
  pull_request:
    types: [assigned, unassigned, labeled, unlabeled, opened, edited, closed, reopened, synchronize, converted_to_draft, ready_for_review, locked, unlocked, review_requested, review_request_removed, auto_merge_enabled, auto_merge_disabled]
  pull_request_review:
    types: [submitted, edited, dismissed]
  pull_request_review_comment:
    types: [created, edited, deleted]
  issue_comment:
    types: [created, edited, deleted]

jobs:
  pull_request_workflow:
    runs-on: ubuntu-latest
    name: A job that notifies slack on PR events
    steps:
      - name: Run pull request workflow
        uses: cakarci/pull-request-workflow@v1
        with:
          github-token: ${{ secrets.GH_TOKEN }}
          slack-token: ${{ secrets.SLACK_BOT_TOKEN }}
          slack-channel-id: '{Your public slack channel id}'
```

9. Create `pull-request-workflow.json` file under `./github` folder

- `githubSlackUserMapper` object should include `githubUserName` as a `key` and `Slack Member ID` as a `value` (How to get Slack Member ID)

```json
{
  "teamName": "Consumer Experience",
  "githubUserNames": ["pcakarci", "scakarci", "cakarci"],
  "githubSlackUserMapper": {
    "pcakarci": "U04L1AQ8H8U",
    "scakarci": "U04LNHEVA48",
    "cakarci": "U035MNNF8LW"
  }
}
```

10. To test the workflow run, create a PR in your repository and check if the notifications are sent to your public Slack channel :boom:


Developed with ❤️ by [Salih Cakarci](https://github.com/cakarci)
