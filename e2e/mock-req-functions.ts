import { nanoid } from 'nanoid';

let requestId = nanoid();

export const getReqId = () => {
  return requestId;
};

export const setReqId = (newReqId: string) => {
  requestId = newReqId;
};
