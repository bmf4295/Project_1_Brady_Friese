const { XMLHttpRequest } = require('xmlhttprequest');

const users = {};

// general response function for get or post requests
const respondJSON = (req, res, content, statusCode) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  res.writeHead(statusCode, headers);
  res.write(JSON.stringify(content));
  res.end();
};
// general response function for head requests
const respondJSONMeta = (req, res, statusCode) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  res.writeHead(statusCode, headers);
  res.end();
};
// takes data recieved from sendOMDBRequest and adds the plot and poster to the object needed.
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
// function that calls the OMDB Api usuing the xmlhttprequest node module
const sendOMDBRequest = (title, name, type) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `http://www.omdbapi.com/?t=${title}&type=${type}&apikey=31bf1020`);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onload = () => addPosterandPlot(xhr, title, name, type);
  xhr.send();
};
// function that gets users, can be queried by name or type.
// Any request from the main page is always queried by the username
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

// Head request version of getUsers
const getUsersMeta = (req, res) => respondJSONMeta(req, res, 200);

// returns an 404 not found error for any route thats not supported
const notReal = (req, res) => {
  const responseJSON = {
    message: 'The page you are looking for was not able to be found',
    id: 'notFound',
  };
  return respondJSON(req, res, responseJSON, 404);
};

// Head request version of notReal
const notRealMeta = (req, res) => respondJSONMeta(req, res, 404);

// handler function for adding and updating users and their watch lists
const updateUsers = (req, res, body) => {
  const responseJSON = {
    message: 'Name, Title, Type and Status are all required.',
  };
  // Sets status code to created initially
  let responseCode = 201;
  const {
    title, status, type, name,
  } = body;
  // if there are any missing parameters set error id and send a 400
  if (!name || !title || !type || !status) {
    responseJSON.id = 'missingParams';
    return respondJSON(req, res, responseJSON, 400);
  }

  // if the user already exists set the code to 204
  if (users[name]) {
    responseCode = 204;
  } else {
    // if the user is new create the needed arrays
    users[name] = { movie: [], series: [] };
  }

  // check if title already exists in the specified array
  const alreadyExistingItem = users[name][type].find((o) => o.title === title);

  // if there is one update the status
  if (alreadyExistingItem) {
    alreadyExistingItem.status = status;
  } else {
    // if there isnt push it to the array
    users[name][type].push({
      title,
      status,
    });
  }
  // push off the request for the poster and plot from the OMDB Api
  sendOMDBRequest(title, name, type);
  // if the response code is 201 set message and send
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(req, res, responseJSON, responseCode);
  }

  // send whatever response is left if this hits here
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
