import {getInput, setOutput} from '@actions/core'
import {welcomeMessage} from '../src/welcome-message'

jest.mock('@actions/core', () => ({
  setOutput: jest.fn(),
  setFailed: jest.fn(),
  getInput: jest.fn()
}))

describe('welcome-message', () => {
  beforeAll(() => {
    jest
      .spyOn(Date.prototype, 'toTimeString')
      .mockReturnValue('04:00:00 GMT+0200 (Central European Summer Time)')
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should print the name correctly', async () => {
    ;(getInput as jest.Mock).mockReturnValue('Pelin')
    await welcomeMessage()
    expect(setOutput).toBeCalledWith(
      'message',
      'Hello Pelin!! - 04:00:00 GMT+0200 (Central European Summer Time)'
    )
  })
})
