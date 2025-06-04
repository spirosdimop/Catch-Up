import { CommandRoutingResult } from "../openai";
import { routeInputToApis } from "../openai";

export async function parseCommand(message: string, context?: string, model: string = 'gpt-4o'): Promise<CommandRoutingResult> {
  return routeInputToApis(message, context, model);
}
