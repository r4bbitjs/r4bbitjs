import { HEADER_REQUEST_ID } from '../types';
import { nanoid } from 'nanoid';

export const extractReqId = (headers: Record<string, string>) => {
  return headers[HEADER_REQUEST_ID] ?? nanoid();
};
