import {Context} from '@actions/github/lib/context'
import {Block, KnownBlock} from '@slack/types'

export const generateSlackMessage = (
  githubContext: Context,
  slack: Record<string, string>,
  firstReviewer: string,
  secondReviewer: string
): (KnownBlock | Block)[] => {
  const repoName = githubContext.payload.repository?.name
  const repoURL = githubContext.payload.repository?.html_url
  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: ':rocket:  A New Pull Request is created  :boom:'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ' :loud_sound: *It is time to add your reviews* :loud_sound:'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Let's add your reviews to the <${githubContext.payload.pull_request?.html_url}|Pull Request>`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        {
          text: `*Reviewers*: <@${slack[firstReviewer]}> & <@${
            slack[secondReviewer]
          }>  \n*PR Author*: <@${
            slack[githubContext.actor]
          }> \n*Repository*: <${repoURL}|${repoName}>`,
          type: 'mrkdwn'
        }
      ]
    }
  ]
}
