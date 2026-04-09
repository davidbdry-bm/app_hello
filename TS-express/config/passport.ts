import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';

export function configurePassport() {
  passport.use(new OAuth2Strategy(
    {
      authorizationURL : process.env.OAUTH_AUTHORIZATION_URL ?? '',
      tokenURL         : process.env.OAUTH_TOKEN_URL         ?? '',
      clientID         : process.env.OAUTH_CLIENT_ID         ?? '',
      clientSecret     : process.env.OAUTH_CLIENT_SECRET     ?? '',
      callbackURL      : process.env.OAUTH_URL_CALLBACK     ?? '',
    },
    (_accessToken: string, _refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
      return done(null, { accessToken: _accessToken, refreshToken: _refreshToken, ...profile });
    }
  ));

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user: any, done) => done(null, user));
}