let isTriggeredConsoleWarn = false;

export const triggerConsoleWarnWrapper = () => {
  if (isTriggeredConsoleWarn) return;

  console.warn = (...args: unknown[]) => {
    if (
      args[0] ===
      'amqp-connection-manager: Sending JSON message, but json option not speicifed'
    ) {
      return;
    }

    console.warn(...args);
  };

  isTriggeredConsoleWarn = true;
};
