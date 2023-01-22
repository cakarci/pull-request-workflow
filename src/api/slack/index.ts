import * as core from '@actions/core'
import {WebClient} from '@slack/web-api'
import {conversationsHistory} from './conversations-history'
import {postMessage} from './post-message'

const token = core.getInput('slack-token')

const slackClient = new WebClient(token)

export const Slack = {
  postMessage: postMessage(slackClient),
  conversationsHistory: conversationsHistory(slackClient)
}
