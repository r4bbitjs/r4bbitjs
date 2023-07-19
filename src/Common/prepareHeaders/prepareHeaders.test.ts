import { prepareHeaders } from './prepareHeaders';
import {
  HEADER_REPLY_SIGNATURE,
  HEADER_REQUEST_ID,
  HEADER_SEND_TYPE,
} from '../types';
import { HEADER_RECEIVE_TYPE } from '../types';

describe('prepareHeaders', () => {
  const defaultMsgType = 'json';

  it('should prepare default headers for a client', () => {
    // given
    const isServer = false;
    const expectedHeaders = {
      [HEADER_SEND_TYPE]: defaultMsgType,
      [HEADER_RECEIVE_TYPE]: defaultMsgType,
      [HEADER_REQUEST_ID]: expect.any(String),
    };

    // when
    const headers = prepareHeaders({ isServer });

    // then
    expect(headers).toEqual(expectedHeaders);
  });

  it('should prepare headers for a client as specified in options', () => {
    // given
    const isServer = false;
    const sendType = 'string';
    const receiveType = 'object';
    const expectedHeaders = {
      [HEADER_SEND_TYPE]: sendType,
      [HEADER_RECEIVE_TYPE]: receiveType,
      [HEADER_REQUEST_ID]: expect.any(String),
    };

    // when
    const headers = prepareHeaders({ isServer, sendType, receiveType });

    // then
    expect(headers).toEqual(expectedHeaders);
  });

  it('should prepare default headers for a server without signature', () => {
    // given
    const isServer = true;
    const expectedHeaders = {
      [HEADER_SEND_TYPE]: defaultMsgType,
      [HEADER_REQUEST_ID]: expect.any(String),
    };

    // when
    const headers = prepareHeaders({ isServer });

    // then
    expect(headers).toEqual(expectedHeaders);
  });

  it('should prepare headers for a server with signature', () => {
    // given
    const isServer = true;
    const sendType = 'object';
    const signature = 'test-server';
    const expectedHeaders = {
      [HEADER_REPLY_SIGNATURE]: signature,
      [HEADER_SEND_TYPE]: sendType,
      [HEADER_REQUEST_ID]: expect.any(String),
    };

    // when
    const headers = prepareHeaders({ isServer, sendType, signature });

    // then
    expect(headers).toEqual(expectedHeaders);
  });
});
