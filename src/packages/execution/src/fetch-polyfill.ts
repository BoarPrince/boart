/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import fetch, { Blob, blobFrom, blobFromSync, File, fileFrom, fileFromSync, FormData, Headers, Request, Response } from 'node-fetch';

// fetch-polyfill.js
if (globalThis.fetch !== fetch) {
    globalThis.fetch = fetch;
    globalThis.Headers = Headers;
    globalThis.Request = Request;
    globalThis.Response = Response;
    globalThis.Blob = Blob;
    globalThis.FormData = FormData;
    globalThis.File = File;
    globalThis.blobFrom = blobFrom;
    globalThis.blobFromSync = blobFromSync;
    globalThis.fileFrom = fileFrom;
    globalThis.fileFromSync = fileFromSync;
}
