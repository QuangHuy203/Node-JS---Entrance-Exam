const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const { JWT_CONFIG } = require('./common/constants');
const authenticateService = require('./routes/authentication');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/authentication/', authenticateService);
app.use(authenticateToken);

//middleware
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (token === null)
      return res.status(401).json({
        status: 'FAILED',
        message: 'Unauthorized!',
      });
  
    jwt.verify(token, JWT_CONFIG.TOKEN_KEY, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
};

app.listen(5000, () => {
    console.log('Server is running at port 5000');
});

module.exports = app;