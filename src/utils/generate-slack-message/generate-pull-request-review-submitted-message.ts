import {Context} from '@actions/github/lib/context'
import {Block, KnownBlock} from '@slack/types'
import {getUserToLog} from '../get-user-to-log'

export const generatePullRequestReviewSubmittedMessage = (
  githubContext: Context,
  githubSlackUserMapper: Record<string, string>
): (KnownBlock | Block)[] => {
  const {pull_request, review} = githubContext.payload
  const reviewState = (review?.state).toUpperCase()
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Hi ${getUserToLog(
          githubSlackUserMapper,
          pull_request?.user.login
        )}, a new <${review?.html_url}|review comment> added by ${getUserToLog(
          githubSlackUserMapper,
          githubContext.actor
        )}`
      }
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `*Review State:* ${reviewState} ${
            reviewState === 'APPROVED'
              ? ':large_green_circle:'
              : reviewState === 'CHANGES_REQUESTED'
              ? ':red_circle:'
              : ':page_with_curl:'
          }`
        }
      ]
    }
  ]
}

export const generateSecondReviewerMessage = (
  githubContext: Context,
  githubSlackUserMapper: Record<string, string>,
  secondReviewer: string
): (KnownBlock | Block)[] => {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Hi ${getUserToLog(
          githubSlackUserMapper,
          secondReviewer
        )} :wave: you are assigned as a *second code reviewer*,`
      }
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `• Please ensure all the review comments from the  *first code reviewer* have been addressed properly \n• If required, please add your own review comments as well \nHappy code reviews :tada:`
        }
      ]
    }
  ]
}
