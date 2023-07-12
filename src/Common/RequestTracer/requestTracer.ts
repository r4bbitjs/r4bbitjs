export type GetReqId = () => string;
export type SetReqId = (message: string) => void;

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
