const contextMap = new Map<string, string>();

export function getContext(userId: string) {
  return contextMap.get(userId);
}

export function updateContext(userId: string, context: string) {
  contextMap.set(userId, context);
}
