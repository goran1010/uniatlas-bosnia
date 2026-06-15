import { FRONTEND_URL } from "../config/env.js";

function emailConfirmHTML() {
  return `    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Email Confirmed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
          }
          h1 {
            color: #4CAF50;
          }
          a {
            color: #4CAF50;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <h1>Your email has been confirmed!</h1>
        <p>You can now close this window and <a href="${FRONTEND_URL}/login">log in</a> to your account.</p>
      </body>
    </html>
   `;
}

export { emailConfirmHTML };
