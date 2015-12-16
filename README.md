# passport-qq-token

[![Build Status](https://travis-ci.org/drudge/passport-qq-token.svg)](https://travis-ci.org/drudge/passport-qq-token)
[![Coverage Status](https://coveralls.io/repos/drudge/passport-qq-token/badge.svg?branch=master&service=github)](https://coveralls.io/github/drudge/passport-qq-token?branch=master)
![Downloads](https://img.shields.io/npm/dm/passport-qq-token.svg)
![Downloads](https://img.shields.io/npm/dt/passport-qq-token.svg)
![npm version](https://img.shields.io/npm/v/passport-qq-token.svg)
![dependencies](https://img.shields.io/david/drudge/passport-qq-token.svg)
![dev dependencies](https://img.shields.io/david/dev/drudge/passport-qq-token.svg)
![License](https://img.shields.io/npm/l/passport-qq-token.svg)

[Passport](http://passportjs.org/) strategy for authenticating with [Tencent QQ](http://www.qq.com/)
access tokens using the OAuth 2.0 API.
If you are looking for Web integration, please refer to [passport-sina](https://github.com/kfll/passport-sina)

This module lets you authenticate using Facebook in your Node.js applications.
By plugging into Passport, Facebook authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

Inspired from [passport-facebook-token](https://github.com/drudge/passport-facebook-token)

## Installation

    $ npm install passport-qq-token

## Usage

### Configure Strategy

The Tencent QQ authentication strategy authenticates users using a QQ
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a app ID and app secret.

```js
var QQTokenStrategy = require('passport-qq-token');

passport.use(new QQTokenStrategy({
    clientID: QQ_APP_ID,
    clientSecret: QQ_APP_SECRET
  }, function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({qqId: profile.id}, function (error, user) {
      return done(error, user);
    });
  }
));
```

### Authenticate Requests

Use `passport.authenticate()`, specifying the `'qq-token'` strategy, to authenticate requests.

```js
app.post('/auth/qq/token',
  passport.authenticate('qq-token'),
  function (req, res) {
    // do something with req.user
    res.send(req.user? 200 : 401);
  }
);
```

Or using Sails framework:

```javascript
// api/controllers/AuthController.js
module.exports = {
  qq: function(req, res) {
    passport.authenticate('qq-token', function(error, user, info) {
      // do stuff with user
      res.ok();
    })(req, res);
  }
};
```

The post request to this route should include POST or GET data with the keys `access_token` and optionally, `refresh_token` set to the credentials you receive from Tencent QQ.

```
GET /auth/qq/token?access_token=<TOKEN_HERE>
```

## Credits

  - [Nicholas Penree](http://github.com/drudge)
  - [Jared Hanson](http://github.com/jaredhanson)
  - [Eugene Obrezkov](http://github.com/ghaiklor)

## License

The MIT License (MIT)

Copyright (c) 2015 Nicholas Penree

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.