export const getUserToLog = (
  githubSlackUserMapper: Record<string, string>,
  githubUserName: string
): string => {
  return githubSlackUserMapper[githubUserName]
    ? `<@${githubSlackUserMapper[githubUserName]}>`
    : `*${githubUserName}*`
}
