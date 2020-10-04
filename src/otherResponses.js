const { XMLHttpRequest } = require('xmlhttprequest');

const users = {};

const respondJSON = (req, res, content, statusCode) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  res.writeHead(statusCode, headers);
  res.write(JSON.stringify(content));
  res.end();
};

const respondJSONMeta = (req, res, statusCode) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  res.writeHead(statusCode, headers);
  res.end();
};

const addPosterandPlot = (xhr, title, user, type) => {
  const omdbResponse = JSON.parse(xhr.responseText);
  const obj = users[user][type].find((o) => o.title === title);
  if (omdbResponse.Plot && omdbResponse.Poster) {
    obj.plot = omdbResponse.Plot;
    obj.poster = omdbResponse.Poster;
  } else {
    obj.plot = 'Plot Not found';
    obj.poster = '/N-A_Placeholder.png';
  }
};
const sendOMDBRequest = (title, name, type) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `http://www.omdbapi.com/?t=${title}&type=${type}&apikey=31bf1020`);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onload = () => addPosterandPlot(xhr, title, name, type);
  xhr.send();
};
const getUsers = (req, res, query) => {
  let responseJSON;
  if (!query.name) {
    responseJSON = {
      users,
    };
  } else if (query.type) {
    responseJSON = users[query.name][query.type];
  } else {
    responseJSON = users[query.name];
  }

  return respondJSON(req, res, responseJSON, 200);
};

const getUsersMeta = (req, res) => respondJSONMeta(req, res, 200);

const notReal = (req, res) => {
  const responseJSON = {
    message: 'The page you are looking for was not able to be found',
    id: 'notFound',
  };
  return respondJSON(req, res, responseJSON, 404);
};

const notRealMeta = (req, res) => respondJSONMeta(req, res, 404);

const updateUsers = (req, res, body) => {
  const responseJSON = {
    message: 'Name, Title, Type and Status are all required.',
  };
  let responseCode = 201;
  const {
    title, status, type, name,
  } = body;
  if (!name || !title || !type || !status) {
    responseJSON.id = 'missingParams';
    return respondJSON(req, res, responseJSON, 400);
  }

  if (users[name]) {
    responseCode = 204;
  } else {
    users[name] = { movie: [], series: [] };
  }

  const alreadyExistingItem = users[name][type].find((o) => o.title === title);

  if (alreadyExistingItem) {
    alreadyExistingItem.status = status;
  } else {
    users[name][type].push({
      title,
      status,
    });
  }

  sendOMDBRequest(title, body.name, type);
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(req, res, responseJSON, responseCode);
  }

  return respondJSONMeta(req, res, responseCode);
};

// exports
module.exports = {
  getUsers,
  getUsersMeta,
  notReal,
  notRealMeta,
  updateUsers,
};
