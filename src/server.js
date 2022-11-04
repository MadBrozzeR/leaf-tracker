const http = require('http');
const fs = require('fs/promises');
const { Request } = require('mbr-serv');

const ROOT = __dirname;

function sendFile (file, request, ext = 'htm') {
  fs.readFile(ROOT + '/' + file)
    .then(function (data) {
      request.send(data, ext);
    })
    .catch(function (error) {
      console.log(error);
      if (error.code === 'ENOENT') {
        request.status = 404;
      } else {
        request.status = 500;
      }
      request.send();
    });
}

function getIndexPage (request) {
  sendFile('html/index.html', request);
}

function get404Page (request) {
  sendFile('html/404.html', request);
}

function getAssets (regMatch) {
  const request = this;
  const extension = request.getUrlParams().extension;

  sendFile('html/assets/' + regMatch[1], request, extension);
}

const ROUTER = {
  '/': { GET: getIndexPage },

  default: get404Page
};

const MATCH = {
  ASSETS: /^\/src\/(.*)$/
};

http.createServer(function (request, response) {
  const reqWrapper = new Request(request, response);

  reqWrapper.match(MATCH.ASSETS, getAssets) || reqWrapper.route(ROUTER);
}).listen(9200);
