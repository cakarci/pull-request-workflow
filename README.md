[![build-test-release](https://github.com/cakarci/pull-request-workflow/actions/workflows/build-test-release.yml/badge.svg)](https://github.com/cakarci/pull-request-workflow/actions/workflows/build-test-release.yml)  
[![check-dist](https://github.com/cakarci/pull-request-workflow/actions/workflows/check-dist.yml/badge.svg)](https://github.com/cakarci/pull-request-workflow/actions/workflows/check-dist.yml)  
[![pull-request-workflow](https://github.com/cakarci/pull-request-workflow/actions/workflows/pull-request-workflow.yml/badge.svg)](https://github.com/cakarci/pull-request-workflow/actions/workflows/pull-request-workflow.yml)

# Pull request workflow with 4 eyes principle action

A GitHub action that creates a workflow with ***four eyes principle***

## In this workflow,

- ***PR Author*** creates a pull request
- The pull request is automatically assigned to 2 code reviewers from the `githubUserNames` list provided
- The ***first code reviewer***, reviews the code and provide feedback
- After the feedback provided by the ***first code reviewer***, a slack notification is sent to the ***second code reviewer***
  - ***Second code reviewer*** ensures all the review comments from the ***first code reviewer*** have been addressed properly
  - If required, adds review comments as well
- It keeps your Slack channel as clean as possible as notifications related to a specific PR starts a thread and all the related activities of the pull request are sent as a thread reply [Check it here](https://user-images.githubusercontent.com/4185569/214591718-d3e19dbe-2603-4451-8fea-30576ec50993.png)

![Screenshot 2023-01-25 at 15 26 02](https://user-images.githubusercontent.com/4185569/214591195-1dc5223f-c08e-42e1-b572-1f8eb77eaf43.png)



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

- Create `pull-request-workflow.yml` file with the following content under `./github/workflows`

  - ```yaml  
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
		      - name: Checkout  
		        uses: actions/checkout@v3  
		      - name: Run pull request workflow  
		        uses: cakarci/pull-request-workflow@v1  
		        with:  
		          github-token: ${{ secrets.GH_TOKEN }}  
		          slack-token: ${{ secrets.SLACK_BOT_TOKEN }}  
		          slack-channel-id: '{Your public slack channel id}'  
		```  
- Create `pull-request-workflow.json` file with the following content under `./github` folder
  - ```json  
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
  - `githubSlackUserMapper` object should include `githubUserName` as a `key` and `Slack Member ID` as a `value` (How to get Slack Member ID)
  - All the users defined in the `githubUserNames` list should have read/write access to the repository

- Create a Slack app with both user
  - Create a **Public Slack channel** and get the `Channel ID: C04LNJJUCKS` from the details of the channel
  - Create a **Slack App** and **Bot User** for that app by following these [steps](https://slack.com/help/articles/115005265703-Create-a-bot-for-your-workspace#add-a-bot-user)
  - **[IMPORTANT]** Add the bot token scopes like in this [image](https://user-images.githubusercontent.com/4185569/214593602-0a238d97-a5bf-4fb7-9d59-8e1230f15a6c.png)
  - **[IMPORTANT]** Add your **Bot User** into the **Public Slack channel** you created
- Add your **SECRETS** to your repo ([Check how to create a repository secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository))
  - ***SLACK_BOT_TOKEN***
    - Copy the `Bot User OAuth Token` and add it to your repository secret as `SLACK_BOT_TOKEN`
  - ***GH_TOKEN***
    - Create a [Personal Access Token](https://docs.github.com/en/enterprise-server@3.4/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-personal-access-token)
    - Add the GitHub personal access token scopes like in this [image](https://user-images.githubusercontent.com/4185569/214594384-23868a6b-e6d1-4119-b9bd-a2d5c20e3bfd.png)
    - Add it to your repository secret as `GH_TOKEN`


10. To test the workflow run, create a PR in your repository and check if the notifications are sent to your public Slack channel :boom:


Developed with ❤️ by [Salih Cakarci](https://github.com/cakarci)
