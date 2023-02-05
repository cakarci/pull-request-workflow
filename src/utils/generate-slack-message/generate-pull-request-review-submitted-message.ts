import {Context} from '@actions/github/lib/context'
import {Block, KnownBlock} from '@slack/types'
import {getUserToLog} from '../get-user-to-log'
import {generateGreetingMessage} from './partial-messages'

export const generatePullRequestReviewSubmittedMessage = (
  githubContext: Context,
  githubSlackUserMapper: Record<string, string>
): (KnownBlock | Block)[] => {
  const {review} = githubContext.payload
  const reviewState = (review?.state).toUpperCase().replace('_', ' ')
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${generateGreetingMessage(
          githubContext,
          githubSlackUserMapper
        )}A new <${review?.html_url}|review comment> added by ${getUserToLog(
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
