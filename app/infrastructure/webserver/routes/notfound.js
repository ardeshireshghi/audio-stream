module.exports = function (_, res) {
  res.statusCode = 404;
  res.setHeader('content-type', 'text/html');
  res.setHeader('cache-control', 'no-cache, no-store');
  res.end(
    `<!DOCTYPE html>
        <html>
        <head>
          <title>Not found</title>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: Helvetica, Arial, san-serif;
              background: linear-gradient(0deg, #6367b6, #b2cbae);
              color: rgba(255,255,255,0.7);
              padding: 0;
              margin: 0;
              height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }

            h1 {
              font-size: 6rem;
              margin-bottom: 1rem;
              margin-top: 1rem;
            }

            h2 {
              font-size: 3rem;
              margin-bottom: 1rem;
              margin-top: 0;
            }

            @media all and (max-size: 400px) {
              h1 {
                font-size: 4rem;
                margin-bottom: 1rem;
              } 
              h2 {
                font-size: 1.5rem;
                margin-top: 0;
              } 
            }
          </style>
        </head>
        <body>
          <h1>404</h1>  
          <h2>Oops 😵! You are lost</h2>
        </body>
      </html>`
  );
};
