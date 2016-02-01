import uri from 'url';
import crypto from 'crypto';
import { OAuth2Strategy, InternalOAuthError } from 'passport-oauth';

/**
 * `QQTokenStrategy` constructor.
 *
 * The tencents QQ authentication strategy authenticates requests by delegating to
 * Sina Weibo using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occurred, `error` should be set.
 *
 * @param {Object} options
 * @param {Function} verify
 * @example
 * passport.use(new QQTokenStrategy({
 *   clientID: '123456789',
 *   clientSecret: 'shhh-its-a-secret'
 * }), (accessToken, refreshToken, profile, done) => {
 *   User.findOrCreate({qqId: profile.id}, done);
 * });
 */
export default class QQTokenStrategy extends OAuth2Strategy {
  constructor(_options, _verify) {
    let options = _options || {};
    let verify = _verify;

    options.authorizationURL = options.authorizationURL || 'https://graph.qq.com/oauth2.0/authorize';
    options.tokenURL = options.tokenURL || 'https://graph.qq.com/oauth2.0/token';

    super(options, verify);

    this.name = 'qq-token';
    this._accessTokenField = options.accessTokenField || 'access_token';
    this._refreshTokenField = options.refreshTokenField || 'refresh_token';
    this._getOpenIdURL = options.getOpenIdURL ||  'https://graph.qq.com/oauth2.0/me';
    this._getUserInfoURL = options.getUserInfoURL || 'https://graph.qq.com/user/get_user_info';
    this._clientSecret = options.clientSecret;
    this._enableProof = typeof options.enableProof === 'boolean' ? options.enableProof : true;
    this._passReqToCallback = options.passReqToCallback;

    this._oauth2.useAuthorizationHeaderforGET(false);
  }

  /**
   * Authenticate request by delegating to a service provider using OAuth 2.0.
   * @param {Object} req
   * @param {Object} options
   */
  authenticate(req, options) {
    let accessToken = (req.body && req.body[this._accessTokenField]) || (req.query && req.query[this._accessTokenField]);
    let refreshToken = (req.body && req.body[this._refreshTokenField]) || (req.query && req.query[this._refreshTokenField]);

    if (!accessToken) return this.fail({message: `You should provide ${this._accessTokenField}`});

    this._loadUserProfile(accessToken, (error, profile) => {
      if (error) return this.error(error);

      const verified = (error, user, info) => {
        if (error) return this.error(error);
        if (!user) return this.fail(info);

        return this.success(user, info);
      };

      if (this._passReqToCallback) {
        this._verify(req, accessToken, refreshToken, profile, verified);
      } else {
        this._verify(accessToken, refreshToken, profile, verified);
      }
    });
  }

  /**
   * Retrieve user profile from Weibo.
   *
   * This function constructs a normalized profile, with the following properties:
   *
   *   - `provider`         always set to `weibo`
   *   - `id`               the user's Sina Weibo ID
   *   - `username`         the user's Sina Weibo username
   *   - `displayName`      the user's full name
   *   - `gender`           the user's gender: `male` or `female`
   *   - `profileUrl`       the URL of the profile for the user on Weibo
   *
   * @param {String} accessToken
   * @param {Function} done
   */
  userProfile(accessToken, done) {
    this._oauth2.get(this._getOpenIdURL, accessToken, (error, body, res) => {
      if (error) return done(new InternalOAuthError('Failed to fetch uid', error));

      let clientid;
      let openid;

      try {
        let str = body.substring(body.lastIndexOf('callback(') + 'callback('.length, body.lastIndexOf(')'));
        var oauthResult = JSON.parse(str);

        clientid = oauthResult.client_id;
        openid = oauthResult.openid;
      } catch (e) {
        done(e);
      }

      this._oauth2.get(this._getUserInfoURL + '?oauth_consumer_key=' + clientid + '&openid=' + openid, accessToken, (error, body, res) => {
        if (error) return done(new InternalOAuthError('Failed to fetch user profile', error));

        try {
          let json = JSON.parse(body);
          let profile = {
            provider: 'qq',
            id: openid,
            displayName: json.nickname || '',
            gender: json.gender || '',
            photos: [{
              value: json.figureurl_qq_2 || ''
            }],
            _raw: body,
            _json: json
          };

          done(null, profile);
        } catch (e) {
          done(e);
        }
      });
    });
  }

}
