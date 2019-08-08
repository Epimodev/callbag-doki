import { stringify } from 'query-string';
import { Source } from '../index';
import { createSource } from './';

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

function httpRequestFunc<T = any>(params: RequestParams) {
  return (
    next: (response: RequestResponse<T>) => void,
    complete: () => void,
    error: (err: any) => void,
  ) => {
    const { url, method = 'GET', headers, query, body, responseType = 'json', cache } = params;

    const cachedResponse = cache && cache.getResponse(params);
    if (cachedResponse) {
      next(cachedResponse);
      complete();
      return;
    }

    // if reponse doesn't come from cache
    const xhr = new XMLHttpRequest();
    let finished = false;

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
        next(response);
        complete();
      } else {
        error(response);
      }
      finished = true;
    };

    xhr.onerror = () => {
      const response = {
        status: xhr.status,
        headers: getResponseHeaders(xhr),
        data: xhr.statusText,
      };
      error(response);
      finished = true;
    };

    const urlToCall = query ? `${url}?${stringify(query)}` : url;
    xhr.open(method, urlToCall);
    if (headers) setHeaders(xhr, headers);
    xhr.send(formatBody(body));

    return () => {
      if (!finished) {
        xhr.abort();
      }
    };
  };
}

function httpRequest<T = any>(params: RequestParams): Source<RequestResponse<T>> {
  return createSource(httpRequestFunc<T>(params));
}

export default httpRequest;
export { HttpMethod, RequestParams, RequestResponse, HttpCache };
