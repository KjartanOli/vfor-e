import { RequestHandler } from "express";

export interface User {
  id: number,
  username: string,
  password: string,
  admin: boolean,
};

export interface WargearType {
  id: number,
  name: string
};

export interface Wargear {
  id: number,
  name: string,
  type: WargearType
};

export interface BattleHonour {
  id: number,
  name: string,
  reason: string,
  awarded: Date
};

export interface Model {
  id: number,
  name: string,
  rank: string,
  wargear: Wargear[],
  honours: BattleHonour[]
};

export interface Unit {
  id: number,
  name: string,
  leader: Model,
  members: Model[],
  honours: BattleHonour[]
};

export enum Method {
  GET,
  POST,
  PATCH,
  DELETE
}

export interface MethodDescriptor {
  method: Method,
  authentication: Array<RequestHandler>,
  validation: Array<RequestHandler>,
  handlers: Array<RequestHandler>
};

/**
 * A default method descriptor to reduce boilerplate.  If your method
 *  descriptor does not require authentication or validatian you can
 *  spread this value in its initialiser, i.e.
 * { ...default_method_descriptor } to set the authentication and
 * validation handlers as empty.
 */
export const default_method_descriptor: Omit<Omit<MethodDescriptor, 'method'>, 'handlers'> = {
  authentication: [],
  validation: [],
};

export interface Endpoint {
  href: string,
  methods: Array<MethodDescriptor>
}

declare global {
  namespace Express {
    interface User {
      id: number,
      username: string,
      password: string,
      admin: boolean,
    }
    export interface Request {
      resources: { user?: User, type?: WargearType }
    }
  }
}
