import {PullRequestWorkflow} from '../src/pull-request-workflow'
import {getFileContent, getRandomItemFromArray} from '../src/utils'

jest.mock('../src/utils', () => ({
  getFileContent: jest.fn().mockResolvedValue(''),
  getRandomItemFromArray: jest.fn()
}))

jest.mock('@actions/github', () => {
  return {
    getOctokit: jest.fn(),
    context: {
      payload: {
        action: 'my-action'
      },
      eventName: 'pull_request'
    }
  }
})

describe('Pull request workflow', () => {
  it('should call getFileContent and getRandomListItems', async () => {
    await PullRequestWorkflow()
    expect(getFileContent).toHaveBeenCalled()
    expect(getRandomItemFromArray).toHaveBeenCalled()
  })
})
