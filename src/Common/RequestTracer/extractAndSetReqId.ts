import { nanoid } from 'nanoid';
import { RequestTracer } from './requestTracer';

const requestTracer = RequestTracer.getInstance();

export const extractAndSetReqId = (headers: Record<string, string>): string => {
  const requestId = headers['x-request-id'] ?? nanoid();

  if (requestTracer.setRequestId) {
    requestTracer.setRequestId(requestId);
  }

  return requestId;
};
