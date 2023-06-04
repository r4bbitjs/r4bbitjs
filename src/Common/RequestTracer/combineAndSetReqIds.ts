import { ClientObservable } from '../../Client/client.type';
import { RequestTracer } from './requestTracer';

export const combineAndSetReqIds = (allReplies: ClientObservable[]) => {
  const combinedRequestIds = allReplies.reduce(
    (combinedRequestId: string, reply: ClientObservable) =>
      combinedRequestId + '__' + reply.reqId,
    ''
  );

  const requestTracer = RequestTracer.getInstance();
  requestTracer.setRequestId && requestTracer.setRequestId(combinedRequestIds);
};
