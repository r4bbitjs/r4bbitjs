import { setLogger } from '../logger/logger';
import { ILogger } from '../logger/logger.type';
import {
  SetReqId,
  GetReqId,
  RequestTracer,
} from '../requestTracer/requestTracer';

export type SetupR4bbitOptions = {
  logger?: ILogger;
  requestTracer?: {
    setReqId?: SetReqId;
    getReqId?: GetReqId;
  };
};

export const setupR4bbit = ({ logger, requestTracer }: SetupR4bbitOptions) => {
  if (logger) {
    setLogger(logger);
  }

  if (requestTracer?.setReqId) {
    RequestTracer.getInstance().setRequestId = requestTracer.setReqId;
  } else {
    logger?.debug(
      "🤖 No setReqId function provided, we won't be able to set the requestId after consuming the message"
    );
  }

  if (requestTracer?.getReqId) {
    RequestTracer.getInstance().getRequestId = requestTracer.getReqId;
  } else {
    logger?.debug(
      "🤖 No getReqId function provided - it won't be possible to get the requestId and set it in headers before publishing a message"
    );
  }
};
