import {PullRequestWorkflow} from '../src/pull-request-workflow'
import {getFileContent} from '../src/utils'

jest.mock('../src/utils', () => ({
  getFileContent: jest.fn().mockResolvedValue('')
}))

jest.mock('@actions/github', () => {
  return {
    getOctokit: jest.fn(),
    context: {
      payload: {
        action: 'opened',
        pull_request: {
          number: 20
        }
      },
      eventName: 'pull_request'
    }
  }
})

describe('Pull request workflow', () => {
  it('should call getFileContent', async () => {
    await PullRequestWorkflow()
    expect(getFileContent).toHaveBeenCalled()
  })
})
