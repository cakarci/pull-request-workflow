import * as core from '@actions/core'

export const welcomeMessage = async (): Promise<void> => {
  try {
    const nameToGreet = core.getInput('your-name')
    const message = `Hello ${nameToGreet}!!`
    const time = new Date().toTimeString()
    core.setOutput('message', `${message} - ${time}`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
