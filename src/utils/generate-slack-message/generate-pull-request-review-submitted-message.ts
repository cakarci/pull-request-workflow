import {Context} from '@actions/github/lib/context'
import {Block, KnownBlock} from '@slack/types'
import {getRandomItemFromArray} from '../get-random-item-from-array'
import {getUserToLog} from '../get-user-to-log'

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
        text: `Hi ${getUserToLog(
          githubSlackUserMapper,
          pull_request?.user.login
        )}, a new <${review?.html_url}|review comment> added by ${getUserToLog(
          githubSlackUserMapper,
          githubContext.actor
        )}`
      }
    }
  ]
}

export const generatePullRequestApprovedMessage = (
  githubContext: Context,
  githubSlackUserMapper: Record<string, string>
): (KnownBlock | Block)[] => {
  const {pull_request} = githubContext.payload
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Hi ${getUserToLog(
          githubSlackUserMapper,
          pull_request?.user.login
        )} :wave: your pull request is approved :white_check_mark: by ${getUserToLog(
          githubSlackUserMapper,
          githubContext.actor
        )}`
      }
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
        )} :wave: you are assigned as a *Second Code Reviewer*,`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '• Please ensure all the review comments from the  *First Code Reviewer* have been addressed properly \n • If required, please add your own review comments as well'
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
