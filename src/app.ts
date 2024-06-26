import express from 'express';
import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { router } from './routes/api.js';
import * as users from './lib/repositories/users.js';
import postgres from 'postgres';

const {
  PORT: port,
  JWT_SECRET,
  DATABASE_URL
} = process.env;

if (!JWT_SECRET) {
  console.error('Missing JWT_SECRET');
  process.exit(1);
}

if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const TOKEN_LIFETIME = process.env.TOKEN_LIFETIME
  ? parseInt(process.env.TOKEN_LIFETIME, 10)
  : 20;

export const jwt_secret = (): string => {
  return JWT_SECRET;
}

export const token_lifetime = (): number => {
  return TOKEN_LIFETIME;
}

export const db = postgres(DATABASE_URL);

const app = express();

// TODO: Find the correct types for data and any
async function strat(data: any, next: any) {
    // No idea why the second level of data is neccesary
    const user = await users.find_by_id(data.data.id);
    if (user.isErr() || user.value.isNone())
        next(null, false);
    else
        next(null, user.value.value);
}
passport.use(new Strategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
},
  strat
));


app.get('/');
app.use(express.json());
app.use(passport.initialize());
app.use(router);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
