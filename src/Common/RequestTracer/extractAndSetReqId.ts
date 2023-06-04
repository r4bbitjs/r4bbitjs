import { HEADER_REQUEST_ID } from '../types';
import { RequestTracer } from './requestTracer';
import { nanoid } from 'nanoid';

const requestTracer = RequestTracer.getInstance();

export const extractAndSetReqId = (headers: Record<string, string>) => {
  if (!requestTracer.setRequestId) {
    return;
  }

  const requestId = headers[HEADER_REQUEST_ID] ?? nanoid();
  requestTracer.setRequestId(requestId);
};
