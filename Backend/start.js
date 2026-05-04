const path = require('path');
const Module = require('module');

const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function patchedResolveFilename(request, parent, isMain, options) {
  if (typeof request === 'string' && request.startsWith('src/')) {
    const normalized = request.slice(4);
    request = path.join(__dirname, 'dist', normalized);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

require('./dist/main.js');
