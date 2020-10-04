const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses');
const otherHandler = require('./otherResponses');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getIndexCSS,
    '/N-A_Placeholder.png': htmlHandler.getImage,
    '/getUsers': otherHandler.getUsers,
    '/notReal': otherHandler.notReal,
    notFound: otherHandler.notReal,

  },
  HEAD: {
    '/getUsers': otherHandler.getUsersMeta,
    '/notReal': otherHandler.notRealMeta,
    notFound: otherHandler.notRealMeta,
  },
  POST: {
    '/addTitle': otherHandler.updateUsers,
  },
};
const handlePost = (req, res, parsedUrl) => {
  if (parsedUrl.pathname === '/addTitle') {
    const body = [];

    req.on('error', (err) => {
      console.log(err);
      res.statusCode = 400;
      res.end();
    });
    req.on('data', (chunk) => {
      body.push(chunk);
    });
    req.on('end', () => {
      const bodyString = Buffer.concat(body).toString();

      const bodyParams = query.parse(bodyString);

      urlStruct.POST[parsedUrl.pathname](req, res, bodyParams);
    });
  }
};
const handleGet = (req, res, parsedUrl, method, queryParams) => {
  if (urlStruct[method][parsedUrl.pathname]) {
    urlStruct[method][parsedUrl.pathname](req, res, queryParams);
  } else {
    urlStruct[method].notFound(req, res);
  }
};

const onRequest = (req, res) => {
  const parsedUrl = url.parse(req.url);
  const params = query.parse(parsedUrl.query);
  const { method } = req;
  if (method === 'POST') {
    handlePost(req, res, parsedUrl);
  } else {
    handleGet(req, res, parsedUrl, method, params);
  }
};
http.createServer(onRequest).listen(port);

console.log(`Listening on localhost:${3000}`);
