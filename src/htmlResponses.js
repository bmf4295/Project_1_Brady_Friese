const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const indexCSS = fs.readFileSync(`${__dirname}/../client/style.css`);
const placeHolderImage = fs.readFileSync(`${__dirname}/../client/images/N-A_Placeholder.png`);

const respond = (req, res, content, type, statusCode) => {
  res.writeHead(statusCode, { 'Content-Type': type });
  res.write(content);
  res.end();
};

// gets index page
const getIndex = (req, res) => {
  respond(req, res, index, 'text/html', 200);
};
// gets the css for the index page
const getIndexCSS = (req, res) => {
  respond(req, res, indexCSS, 'text/css', 200);
};

const getPlaceholderImage = (req, res) => {
  respond(req, res, placeHolderImage, 'image/png', 200);
};

module.exports = {
  getIndex, getIndexCSS, getPlaceholderImage,
};
