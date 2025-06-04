import { parseCommand } from './CommandParser';
import { executeUserCommand } from '../commandExecutorService';
import { getContext, updateContext } from './ContextStore';

export async function handleCommand(userId: string, message: string, model: string = 'gpt-4o') {
  const context = getContext(userId);
  const routing = await parseCommand(message, context, model);
  const result = await executeUserCommand(userId, message, routing);
  if (routing.conversation_context) {
    updateContext(userId, routing.conversation_context);
  }
  return result;
}
