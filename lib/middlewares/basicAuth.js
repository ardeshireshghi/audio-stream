const showAuthPrompt = (res) => {
  res.statusCode = 401;
  res.setHeader('WWW-Authenticate', 'Basic realm=<realm>, charset="UTF-8"');
  res.end();
};

const credentialsFromAuthHeader = (authorization) => {
  const base64Credentials = authorization.trim().split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString(
    'ascii'
  );

  const [username, password] = credentials.split(':');
  return [username, password];
};

function withBasicAuth(routeHandler) {
  const basicAuthHandler = (req, res) => {
    const authorization = req.headers.authorization;

    if (!process.env.ADMIN_USERNAME) {
      routeHandler(req, res);
      return;
    }

    if (!authorization || !authorization.startsWith('Basic')) {
      showAuthPrompt(res);
      return;
    }

    const [username, password] = credentialsFromAuthHeader(authorization);

    const isAdminUser =
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD;

    if (!isAdminUser) {
      showAuthPrompt(res);
      return;
    }

    // Show record page
    routeHandler(req, res);
  };

  return basicAuthHandler;
}

exports.withBasicAuth = withBasicAuth;
