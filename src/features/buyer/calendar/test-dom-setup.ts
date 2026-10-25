/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
// Ensure zlib decompress exists for undici across node versions
const zlib = require('zlib');
if (!zlib.createZstdDecompress) {
  zlib.createZstdDecompress = () => null;
}

const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost:3000',
});

(global as any).window = dom.window;
(global as any).document = dom.window.document;
(global as any).HTMLElement = dom.window.HTMLElement;
(global as any).Node = dom.window.Node;
(global as any).requestAnimationFrame = (callback: any) =>
  setTimeout(callback, 0);
(global as any).cancelAnimationFrame = (id: any) => clearTimeout(id);
