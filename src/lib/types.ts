import { RequestHandler } from "express";

export interface User {
  id: number,
  username: string,
  password: string,
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

export interface Battle {
  id: number,
  name: string,
  location: string,
  date: Date,
  description: string | null
};

export interface BattleHonour {
  id: number,
  name: string,
  description: string,
};

export interface Award {
  honour: BattleHonour,
  battle: Battle,
  reason: string,
};

export interface Rank {
  id: number,
  name: string,
};

export interface Model {
  id: number,
  name: string,
  rank: Rank,
  wargear: Wargear[],
  honours: Award[]
};

export interface Unit {
  id: number,
  name: string,
  leader: Model,
  members: Model[],
  honours: Award[]
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
    }
    export interface Request {
      resources: {
        user?: User,
        type?: WargearType,
        rank?: Rank,
        honour?: BattleHonour,
        battle?: Battle,
        model?: Model,
        unit?: Unit,
        members?: Model[],
        leader?: Model,
        wargear?: Wargear | Wargear[],
        honours?: Award[],
        index?: number,
      }
    }
  }
}
