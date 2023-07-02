import { setLogger } from '../logger/logger';
import { ILogger, LoggerOptions } from '../logger/logger.type';
import {
  SetReqId,
  GetReqId,
  RequestTracer,
} from '../RequestTracer/requestTracer';
import { logger as loggerInstance } from '../logger/logger';

export type SetupR4bbitOptions = {
  logger?: { options?: LoggerOptions; engine: ILogger };
  requestTracer?: {
    setReqId?: SetReqId;
    getReqId?: GetReqId;
  };
};

export const setupR4bbit = ({ logger, requestTracer }: SetupR4bbitOptions) => {
  if (logger) {
    setLogger(logger.engine, logger.options);
  }

  if (requestTracer?.setReqId) {
    RequestTracer.getInstance().setRequestId = requestTracer.setReqId;
  } else {
    loggerInstance?.debug(
      "🤖 No setReqId function provided, we won't be able to set the requestId after consuming the message"
    );
  }

  if (requestTracer?.getReqId) {
    RequestTracer.getInstance().getRequestId = requestTracer.getReqId;
  } else {
    loggerInstance?.debug(
      "🤖 No getReqId function provided - it won't be possible to get the requestId and set it in headers before publishing a message"
    );
  }
};
