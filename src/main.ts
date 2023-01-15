import {welcomeMessage} from './welcome-message'

export async function run(): Promise<void> {
  await welcomeMessage()
}
run()
