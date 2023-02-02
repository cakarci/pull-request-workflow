import {PullRequestWorkflow} from '../src/pull-request-workflow'
import {
  generatePullRequestOpenedMessage,
  getFileContent,
  requestTwoReviewers
} from '../src/utils'
import {Slack} from '../src/api/slack'

jest.mock('../src/utils', () => ({
  getFileContent: jest.fn().mockResolvedValue({
    githubUserNames: ['pcakarci', 'scakarci', 'cakarci'],
    githubSlackUserMapper: {
      pcakarci: 'U04L1AQ8H8U',
      scakarci: 'U04LNHEVA48',

      cakarci: 'U035MNNF8LW'
    }
  }),
  requestTwoReviewers: jest.fn().mockResolvedValue(['cakarci', 'scakarci']),
  generatePullRequestOpenedMessage: jest
    .fn()
    .mockReturnValue('PULL_REQUEST_OPENED_BLOCK')
}))

jest.mock('../src/api/slack', () => ({
  Slack: {
    postMessage: jest.fn().mockResolvedValue('')
  }
}))

jest.mock('@actions/github', () => {
  return {
    getOctokit: jest.fn(),
    context: {
      payload: {
        action: 'opened',
        pull_request: {
          number: 20,
          id: 'PULL_REQUEST_ID'
        }
      },
      eventName: 'pull_request',
      repo: {
        owner: 'cakarci'
      },
      actor: 'cakarci'
    }
  }
})

jest.mock('@actions/core', () => {
  return {
    getInput: jest.fn().mockReturnValue('SLACK_CHANNEL_ID'),
    info: jest.fn()
  }
})

describe('Pull request workflow', () => {
  it('should send a message when a pull request opened', async () => {
    await PullRequestWorkflow()
    expect(getFileContent).toHaveBeenCalled()
    expect(requestTwoReviewers).toHaveBeenCalled()
    expect(Slack.postMessage).toHaveBeenCalledWith({
      blocks: 'PULL_REQUEST_OPENED_BLOCK',
      channel: 'SLACK_CHANNEL_ID',
      text: '20'
    })
    expect(generatePullRequestOpenedMessage).toHaveBeenCalledWith(
      {
        actor: 'cakarci',
        eventName: 'pull_request',
        payload: {
          action: 'opened',
          pull_request: {id: 'PULL_REQUEST_ID', number: 20}
        },

        repo: {owner: 'cakarci'}
      },
      {
        cakarci: 'U035MNNF8LW',
        pcakarci: 'U04L1AQ8H8U',
        scakarci: 'U04LNHEVA48'
      },
      'cakarci',
      'scakarci'
    )
  })
})
