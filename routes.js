const responseUtils = require('./utils/responseUtils');
const { acceptsJson, isJson, parseBodyJson, getCredentials } = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const { getCurrentUser } = require('./auth/auth');
const { use } = require('chai');
const User = require('./models/user');

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
  '/api/register': ['POST'],
  '/api/users': ['GET'],
  '/api/products': ['GET']
};

/**
 * Use this object to store products
 */
const productdata = {
  products: require('./products.json').map(product => ({...product }))
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response
 */
const sendOptions = (filePath, response) => {
  if (filePath in allowedMethods) {
    response.writeHead(204, {
      'Access-Control-Allow-Methods': allowedMethods[filePath].join(','),
      'Access-Control-Allow-Headers': 'Content-Type,Accept',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Expose-Headers': 'Content-Type,Accept'
    });
    return response.end();
  }

  return responseUtils.notFound(response);
};

/**
 * Does the url have an ID component as its last part? (e.g. /api/users/dsf7844e)
 *
 * @param {string} url filePath
 * @param {string} prefix
 * @returns {boolean}
 */
const matchIdRoute = (url, prefix) => {
  const idPattern = '[0-9a-z]{8,24}';
  const regex = new RegExp(`^(/api)?/${prefix}/${idPattern}$`);
  return regex.test(url);
};

/**
 * Does the URL match /api/users/{id}
 *
 * @param {string} url filePath
 * @returns {boolean}
 */
const matchUserId = url => {
  return matchIdRoute(url, 'users');
};

const handleRequest = async(request, response) => {
  const { url, method, headers } = request;
  const filePath = new URL(url, `http://${headers.host}`).pathname;

  // serve static files from public/ and return immediately
  if (method.toUpperCase() === 'GET' && !filePath.startsWith('/api')) {
    const fileName = filePath === '/' || filePath === '' ? 'index.html' : filePath;
    return renderPublic(fileName, response);
  }

  if (matchUserId(filePath)) {
    // TODO: 8.6 Implement view, update and delete a single user by ID (GET, PUT, DELETE)
    // You can use parseBodyJson(request) from utils/requestUtils.js to parse request body
    // If the HTTP method of a request is OPTIONS you can use sendOptions(filePath, response) function from this module
    // If there is no currently logged in user, you can use basicAuthChallenge(response) from /utils/responseUtils.js to ask for credentials
    //  If the current user's role is not admin you can use forbidden(response) from /utils/responseUtils.js to send a reply
    // Useful methods here include:
    // - getUserById(userId) from /utils/users.js
    // - notFound(response) from  /utils/responseUtils.js 
    // - sendJson(response,  payload)  from  /utils/responseUtils.js can be used to send the requested data in JSON format

    const id = filePath.split('/').slice(-1)[0];
    const idUser = await User.findById(id).exec();

    // If user doesn't exist
    if(idUser === undefined || idUser === null){
      return responseUtils.notFound(response);
    }

    const currentUser = await getCurrentUser(request);

    if(currentUser === null || currentUser === undefined){
      return responseUtils.basicAuthChallenge(response);
    }
    if(currentUser.role === 'customer'){
      return responseUtils.forbidden(response);
    }
    if(currentUser.role === 'admin'){
      // View user
      if(method === 'GET'){
        return responseUtils.sendJson(response, currentUser);
      }

      // Update user
      else if(method === 'PUT'){
        const body = await parseBodyJson(request);

        // Role is missing
        if(!Object.prototype.hasOwnProperty.call(body, 'role')){
          return responseUtils.badRequest(response);
        }
        // Update role
        else if(body.role === 'customer' || body.role === 'admin' ){
          idUser.role = body.role;
          await idUser.save();
          return responseUtils.sendJson(response, idUser);
        }
        // Role is not valid
        else{
          return responseUtils.badRequest(response);
        }
      }

      // Delete user
      else if(method === 'DELETE'){
        await User.deleteOne({ _id: id });
        return responseUtils.sendJson(response, idUser);
      }
    }
  }

  // Default to 404 Not Found if unknown url
  if (!(filePath in allowedMethods)) return responseUtils.notFound(response);

  // See: http://restcookbook.com/HTTP%20Methods/options/
  if (method.toUpperCase() === 'OPTIONS') return sendOptions(filePath, response);

  // Check for allowable methods
  if (!allowedMethods[filePath].includes(method.toUpperCase())) {
    return responseUtils.methodNotAllowed(response);
  }

  // Require a correct accept header (require 'application/json' or '*/*')
  if (!acceptsJson(request)) {
    return responseUtils.contentTypeNotAcceptable(response);
  }

  // GET all users
  if (filePath === '/api/users' && method.toUpperCase() === 'GET') {
    // TODO: 8.5 Add authentication (only allowed to users with role "admin")
    const currentUser = await getCurrentUser(request);
    
    if(currentUser === null || currentUser === undefined){
      return responseUtils.basicAuthChallenge(response);
    }
    else if(currentUser.role === 'customer'){
      return responseUtils.forbidden(response);
    }
    // find all users
    const users = await User.find({});
    return responseUtils.sendJson(response, users);
  }

  // register new user
  if (filePath === '/api/register' && method.toUpperCase() === 'POST') {
    // Fail if not a JSON request, don't allow non-JSON Content-Type
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }
    
    const json = await parseBodyJson(request);

    if (!json.name || !json.password || !json.email) {
      return responseUtils.badRequest(response, 'Bad Request');
    }
    else if (await User.findOne({email: json.email})) {
      return responseUtils.badRequest(response, 'Bad Request');
    }

    // Create new user
    const newUser = new User(json);
    await newUser.save();
    // Change user role to customer
    newUser.role = 'customer';
    await newUser.save();

    responseUtils.sendJson(response, newUser, 201);
  }

  // Get products
  if (filePath === '/api/products' && method === 'GET'){
    const currentUser = await getCurrentUser(request);

    // If user is not authentificated
    if(currentUser === null || currentUser === undefined){
      return responseUtils.basicAuthChallenge(response);
    }
    if(currentUser.role === 'admin' || currentUser.role === 'customer'){
      return responseUtils.sendJson(response, productdata.products, 200);
    }
  }
};

module.exports = { handleRequest };