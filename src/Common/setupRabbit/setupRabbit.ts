import { setLogger } from '../logger/logger';
import { ILogger } from '../logger/logger.type';
import { RequestTracer, SetReqId } from '../RequestTracer/requestTracer';
import { GetReqId } from '../RequestTracer/requestTracer';

type SetupR4bbitOptions = {
  logger?: ILogger;
  requestTracer?: {
    setReqId?: SetReqId;
    getReqId?: GetReqId;
  };
};

export class SetupR4bbit {
  constructor({ logger, requestTracer }: SetupR4bbitOptions) {
    if (logger) {
      setLogger(logger);
    }

    if (requestTracer?.setReqId) {
      RequestTracer.getInstance().setRequestId = requestTracer.setReqId;
    }

    if (requestTracer?.getReqId) {
      RequestTracer.getInstance().getRequestId = requestTracer.getReqId;
    }
  }
}
