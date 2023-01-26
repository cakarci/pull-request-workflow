import {Context} from '@actions/github/lib/context'
import {Block, KnownBlock} from '@slack/types'
import {getRandomItemFromArray} from '../get-random-list-items'

export const generatePullRequestReviewSubmittedMessage = (
  githubContext: Context,
  githubSlackUserMapper: Record<string, string>
): (KnownBlock | Block)[] => {
  const {pull_request, review} = githubContext.payload
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Hi <@${
          githubSlackUserMapper[pull_request?.user.login]
        }>, a new <${review?.html_url}|review comment> added by <@${
          githubSlackUserMapper[githubContext.actor]
        }>`
      }
    }
  ]
}

export const generatePullRequestApprovedMessage = (
  githubContext: Context,
  githubSlackUserMapper: Record<string, string>
): (KnownBlock | Block)[] => {
  const {pull_request} = githubContext.payload
  const secondReviewer = getRandomItemFromArray(
    pull_request?.requested_reviewers,
    [githubContext.actor]
  )
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Hi <@${
          githubSlackUserMapper[pull_request?.user.login]
        }> :wave: your pull request is approved by <@${
          githubSlackUserMapper[githubContext.actor]
        }>`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Hi <@${githubSlackUserMapper[secondReviewer]}> :wave: you are assigned as a *Second Code Reviewer*,`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '• Please check the comments from the *First Code Reviewer* and ensure that all issues have been addressed properly \n • If required, please add your own review comments as well'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Happy code reviews :tada:'
      }
    }
  ]
}
