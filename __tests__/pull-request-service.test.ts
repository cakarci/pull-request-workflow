import {getInput, setOutput} from '@actions/core'
import {PullRequestService} from '../src/pull-request-service'

jest.mock('@actions/core', () => ({
  setOutput: jest.fn(),
  setFailed: jest.fn(),
  getInput: jest.fn()
}))

jest.mock('@actions/github', () => ({
  getOctokit: jest.fn(),
  context: {
    payload: {
      action: 'my-action'
    },
    eventName: 'pull_request'
  }
}))

describe('welcome-message', () => {
  it('should print the context correctly', async () => {
    await PullRequestService()
    expect(setOutput).toBeCalledWith('action', 'my-action')
  })
})
