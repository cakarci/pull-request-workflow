import {readFile} from 'fs/promises'

interface PullRequestWorkflowInterface {
  teamName?: string
  githubUserNames: string[]
  githubSlackUserMapper: Record<string, string>
  remindAfter?: number
}
export const getFileContent =
  async (): Promise<PullRequestWorkflowInterface> => {
    try {
      const data = JSON.parse(
        await readFile('./.github/pull-request-workflow.json', 'utf8')
      )
      validateData(data)
      return data
    } catch (err) {
      return await Promise.reject(err)
    }
  }

const validateData = ({
  remindAfter,
  githubUserNames,
  githubSlackUserMapper
}: PullRequestWorkflowInterface): void => {
  if (remindAfter && typeof remindAfter !== 'number') {
    throw new Error(`"remindAfter" should be a number`)
  }

  if (remindAfter && remindAfter <= 0) {
    throw new Error(`"remindAfter" should be greater than 0`)
  }

  if (
    (githubUserNames && !Array.isArray(githubUserNames)) ||
    !githubUserNames ||
    githubUserNames?.length === 0
  ) {
    throw new Error(
      `"githubUserNames" should be defined as ["username1", "username2"]`
    )
  }
  if (
    (githubSlackUserMapper && !isObject(githubSlackUserMapper)) ||
    !githubSlackUserMapper ||
    Object.keys(githubSlackUserMapper)?.length === 0
  ) {
    throw new Error(
      `"githubSlackUserMapper" should be defined as {"githubUserName1":"slackMemberId1", "githubUserName2":"slackMemberId2", "githubUserName3":"slackMemberId3"}`
    )
  }
  if (
    githubUserNames?.length < 3 ||
    Object.keys(githubSlackUserMapper)?.length < 3
  ) {
    throw new Error(
      `In "githubUserNames" or "githubSlackUserMapper", at least 3 users should be added`
    )
  }
}

const isObject = (item: unknown): boolean => {
  return typeof item === 'object' && !Array.isArray(item) && item !== null
}
