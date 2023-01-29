import {Context} from '@actions/github/lib/context'
import {Block, KnownBlock} from '@slack/types'
import {getUserToLog} from '../get-user-to-log'

export const generatePullRequestOpenedMessage = (
  githubContext: Context,
  githubSlackUserMapper: Record<string, string>,
  firstReviewer: string,
  secondReviewer: string
): (KnownBlock | Block)[] => {
  const {pull_request, repository} = githubContext.payload
  const date = new Date(pull_request?.created_at).toLocaleDateString('de-DE', {
    timeZone: 'Europe/Berlin'
  })
  const time = new Date(pull_request?.created_at).toLocaleTimeString('de-DE', {
    timeZone: 'Europe/Berlin'
  })
  const pullRequestTitle = `<${pull_request?.html_url}|${pull_request?.title}>`
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:boom: *New Pull Request ${pullRequestTitle} is submitted*`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:hourglass_flowing_sand: It is time to add your reviews <${pull_request?.html_url}/files|here>`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `*PR Author:* ${getUserToLog(
            githubSlackUserMapper,
            githubContext.actor
          )} \n*Repository:* <${repository?.html_url}|${
            repository?.name
          }> \n*Created At:* ${date} | ${time} \n*Reviewers:* ${getUserToLog(
            githubSlackUserMapper,
            firstReviewer
          )} | ${getUserToLog(githubSlackUserMapper, secondReviewer)}`
        }
      ]
    }
  ]
}
