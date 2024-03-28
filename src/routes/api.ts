import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { matchedData } from 'express-validator';
import jwt from 'jsonwebtoken';
import { Endpoint, Method, MethodDescriptor, User, default_method_descriptor } from '../lib/types.js';
import { jwt_secret, token_lifetime } from '../app.js';
import { check_validation, ensure_authenticated, ensure_admin, existing_user_validator, new_user_validator, new_wargear_validator, new_wargear_type_validator, existing_wargear_type_id_validator, wargear_type_name_validator } from '../lib/validators.js';
import * as Users from '../lib/users.js';
import { Errors } from '../lib/errors.js';
import { get_units } from './units.js';
import { get_wargear, get_wargear_type, get_wargear_types, patch_wargear_type, post_wargear, post_wargear_types } from './wargear.js';

export const router = express.Router();

const endpoints: Array<Endpoint> = [
  {
    href: '/', methods: [
      {
        ...default_method_descriptor,
        method: Method.GET,
        handlers: [get_index]
      }
    ]
  },
  {
    href: '/login',
    methods: [
      {
        ...default_method_descriptor,
        validation: [...existing_user_validator],
        method: Method.POST,
        handlers: [post_login]
      }
    ]
  },
  {
    href: '/register',
    methods: [
      {
        ...default_method_descriptor,
        method: Method.POST,
        validation: [...new_user_validator],
        handlers: [post_register, post_login]
      }
    ]
  },
  {
    href: '/units',
    methods: [
      {
        ...default_method_descriptor,
        method: Method.GET,
        authentication: [ensure_authenticated],
        handlers: [get_units]
      }
    ],
  },
  {
    href: '/wargear',
    methods: [
      {
        ...default_method_descriptor,
        method: Method.GET,
        handlers: [get_wargear]
      },
      {
        ...default_method_descriptor,
        method: Method.POST,
        authentication: [ensure_authenticated, ensure_admin],
        validation: [...new_wargear_validator],
        handlers: [post_wargear]
      },
    ]
  },
  {
    href: '/wargear/types',
    methods: [
      {
        ...default_method_descriptor,
        method: Method.GET,
        handlers: [get_wargear_types]
      },
      {
        ...default_method_descriptor,
        method: Method.POST,
        authentication: [ensure_authenticated, ensure_admin],
        validation: [...new_wargear_type_validator],
        handlers: [post_wargear_types]
      },
    ],
  },
  {
    href: '/wargear/types/:id',
    methods: [
      {
        ...default_method_descriptor,
        method: Method.GET,
        validation: [existing_wargear_type_id_validator()],
        handlers: [get_wargear_type]
      },
      {
        ...default_method_descriptor,
        method: Method.PATCH,
        authentication: [ensure_authenticated, ensure_admin],
        validation: [existing_wargear_type_id_validator(), wargear_type_name_validator()],
        handlers: [patch_wargear_type]
      }
    ]
  }
]

async function get_index(req: Request, res: Response) {
  res.json(endpoints.map(endpoint => ({
    href: endpoint.href,
    methods: endpoint.methods.map(endpoint => Method[endpoint.method])
  })));
}

async function post_login(req: Request, res: Response) {
  const user = req.resources.user;
  if (!user)
    return res.status(500).json({ error: Errors.INTERNAL });
  const { password } = matchedData(req);

  if (!await Users.compare_passwords(password, user))
    return res.status(401).json({ error: 'Incorrect username or password' });

  const data = { id: user.id };
  const options = { expiresIn: token_lifetime() };
  const token = jwt.sign({ data }, jwt_secret(), options);

  return res.json({ token });
}

async function post_register(req: Request, res: Response, next: NextFunction) {
  const { username, password } = matchedData(req);

  const result = await Users.create({
    username, password
  });

  if (result.isErr())
    return res.status(500).json({ error: 'Internal error' });

  if (!req.resources)
    req.resources = {};
  req.resources.user = result.value;
  return next();
}

endpoints.forEach(endpoint => {
  endpoint.methods.forEach(method => {
    const routing_function = ((method: MethodDescriptor) => {
      switch (method.method) {
        case Method.GET:
          return (href: string, ...handlers: Array<RequestHandler>) => router.get(href, handlers)
        case Method.POST:
          return (href: string, ...handlers: Array<RequestHandler>) => router.post(href, handlers)
        case Method.PATCH:
          return (href: string, ...handlers: Array<RequestHandler>) => router.patch(href, handlers)
        case Method.DELETE:
          return (href: string, ...handlers: Array<RequestHandler>) => router.delete(href, handlers)
      }
    })(method);
    routing_function(endpoint.href, ...[
            ...method.authentication,
            ...method.validation,
            check_validation,
            ...method.handlers
    ]);
  });
});
