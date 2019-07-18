import { stringify } from 'query-string';
import {
  CALLBAG_START,
  CALLBAG_RECEIVE,
  CALLBAG_FINISHING,
  CallbagType,
  Source,
  Sink,
} from '../index';

interface HttpCache {
  getResponse: (params: Omit<RequestParams, 'cache'>) => RequestResponse<any> | undefined;
  pushResponse: (params: Omit<RequestParams, 'cache'>, response: RequestResponse<any>) => void;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type XhrBody =
  | string
  | FormData
  | Blob
  | ArrayBufferView
  | ArrayBuffer
  | URLSearchParams
  | ReadableStream
  | Document
  | undefined;

type HttpBody = { [key: string]: any } | XhrBody;

interface RequestParams {
  url: string;
  method?: HttpMethod;
  headers?: { [key: string]: string };
  query?: { [key: string]: string };
  body?: HttpBody;
  responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';
  cache?: HttpCache;
}

interface RequestResponse<T> {
  status: number;
  headers: { [key: string]: string };
  data: T;
}

function isRequestOk({ status }: XMLHttpRequest) {
  return status < 400;
}

function formatBody(body?: HttpBody): XhrBody {
  if (body && body.toString() === '[object Object]') {
    // handle case { [key: string]: any } which is not supported by xhr.send
    return JSON.stringify(body);
  }
  return body as XhrBody;
}

function setHeaders(xhr: XMLHttpRequest, headers: { [key: string]: string }) {
  Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));
}

function getResponseHeaders(xhr: XMLHttpRequest): { [key: string]: string } {
  const headers = xhr.getAllResponseHeaders();
  const lines = headers.trim().split(/[\r\n]+/);

  const headerMap: { [key: string]: string } = {};
  lines.forEach(line => {
    const parts = line.split(': ');
    const key = parts.shift();
    const value = parts.join(': ');
    if (key) {
      headerMap[key] = value;
    }
  });

  return headerMap;
}

function httpRequest<T = any>(params: RequestParams): Source<RequestResponse<T>> {
  const { url, method = 'GET', headers, query, body, responseType = 'json', cache } = params;
  // @ts-ignore
  return (start: CallbagType, sink: Sink<RequestResponse<T>>) => {
    if (start === CALLBAG_START) {
      if (cache) {
        const cachedResponse = cache.getResponse(params);

        if (cachedResponse) {
          sink(CALLBAG_START, () => {});
          sink(CALLBAG_RECEIVE, cachedResponse);
          sink(CALLBAG_FINISHING);
          // if we find request in cache, we don't send http request
          return;
        }
      }

      // only when there isn't cache or response doesn't exist in cache
      const xhr = new XMLHttpRequest();
      let finished = false;

      const talkback = (type: CallbagType) => {
        if (type === CALLBAG_FINISHING && !finished) {
          xhr.abort();
        }
      };
      sink(CALLBAG_START, talkback);

      xhr.responseType = responseType;

      xhr.onload = () => {
        const response = {
          status: xhr.status,
          headers: getResponseHeaders(xhr),
          data: xhr.response,
        };

        if (isRequestOk(xhr)) {
          if (cache) {
            cache.pushResponse(params, response);
          }
          sink(CALLBAG_RECEIVE, response);
          sink(CALLBAG_FINISHING);
        } else {
          sink(CALLBAG_FINISHING, response);
        }
        finished = true;
      };

      xhr.onerror = () => {
        const response = {
          status: xhr.status,
          headers: getResponseHeaders(xhr),
          data: xhr.statusText,
        };
        sink(CALLBAG_FINISHING, response);
        finished = true;
      };

      const urlToCall = query ? `${url}?${stringify(query)}` : url;
      xhr.open(method, urlToCall);
      if (headers) setHeaders(xhr, headers);
      xhr.send(formatBody(body));
    }
  };
}

export default httpRequest;
export { HttpMethod, RequestParams, RequestResponse, HttpCache };
