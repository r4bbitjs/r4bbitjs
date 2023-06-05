import { setLogger } from '../logger/logger';
import { ILogger } from '../logger/logger.type';
import {
  SetReqId,
  GetReqId,
  RequestTracer,
} from '../RequestTracer/requestTracer';

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
  }

  if (requestTracer?.getReqId) {
    RequestTracer.getInstance().getRequestId = requestTracer.getReqId;
  }
};
