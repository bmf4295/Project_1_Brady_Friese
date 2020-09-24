const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const indexCSS = fs.readFileSync(`${__dirname}/../client/style.css`);

const respond = (req, res, content, type, statusCode) => {
  res.writeHead(statusCode, { 'Content-Type': type });
  res.write(content);
  res.end();
};

const getIndex = (req, res) => {
  respond(req, res, index, 'text/html', 200);
};

const getIndexCSS = (req, res) => {
  respond(req, res, indexCSS, 'text/css', 200);
};

module.exports = {
  getIndex, getIndexCSS,
};
