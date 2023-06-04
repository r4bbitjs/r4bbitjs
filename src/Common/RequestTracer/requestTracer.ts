import { setLogger } from '../logger/logger';
import { ILogger } from '../logger/logger.type';

type GetReqId = () => string;
type SetReqId = (message: string) => void;

export class RequestTracer {
  private static _requestTracer?: RequestTracer;
  private _getRequestId?: GetReqId;
  private _setRequestId?: SetReqId;

  private constructor() {
    // empty for singleton
  }

  public static getInstance(): RequestTracer {
    if (!this._requestTracer) {
      this._requestTracer = new RequestTracer();
    }

    return this._requestTracer;
  }

  set setRequestId(value: SetReqId | undefined) {
    this._setRequestId = value;
  }

  get setRequestId(): SetReqId | undefined {
    return this._setRequestId;
  }

  set getRequestId(value: GetReqId | undefined) {
    this._getRequestId = value;
  }

  get getRequestId(): GetReqId | undefined {
    return this._getRequestId;
  }
}

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
