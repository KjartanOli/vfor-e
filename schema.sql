CREATE TABLE e.users(
  id SERIAL PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE,
  password CHAR(97) NOT NULL,
  admin BOOLEAN DEFAULT false
);

CREATE TABLE e.ranks(
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES e.users(id),
       name VARCHAR(64) UNIQUE
);

CREATE TABLE e.battles(
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES e.users(id),
       name VARCHAR(64),
       location VARCHAR(64),
       date DATE,
       description TEXT
);

CREATE TABLE e.factions(
       id SERIAL PRIMARY KEY,
       name VARCHAR(64)
);

CREATE TABLE e.battle_honours(
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES e.users(id),
       name VARCHAR(64) UNIQUE,
       description VARCHAR(1024)
);

CREATE TABLE e.wargear_types(
       id SERIAL PRIMARY KEY,
       name VARCHAR(20) UNIQUE
);

CREATE TABLE e.wargear(
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES e.users(id),
       name VARCHAR(30),
       type INTEGER REFERENCES e.wargear_types(id)
);

CREATE TABLE e.models(
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES e.users(id),
       name VARCHAR(64),
       rank INTEGER REFERENCES e.ranks(id)
);

CREATE TABLE e.model_wargear(
       id SERIAL PRIMARY KEY,
       model INTEGER REFERENCES e.models(id),
       wargear INTEGER REFERENCES e.wargear(id)
);

CREATE TABLE e.model_battle_honours(
       model INTEGER REFERENCES e.models(id),
       honour INTEGER REFERENCES e.battle_honours(id),
       battle INTEGER REFERENCES e.battles(id),
       reason VARCHAR(2048),
       PRIMARY KEY (model, honour, battle)
);

CREATE TABLE e.units(
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES e.users(id),
       name VARCHAR(64),
       leader INTEGER REFERENCES e.models(id)
);

CREATE TABLE e.unit_models(
       unit INTEGER REFERENCES e.units(id),
       model INTEGER REFERENCES e.models(id)
);

CREATE TABLE e.unit_battle_honours(
       unit INTEGER REFERENCES e.units(id),
       honour INTEGER REFERENCES e.battle_honours(id),
       battle INTEGER REFERENCES e.battles(id),
       reason VARCHAR(2048),
       PRIMARY KEY (unit, honour, battle)
);

CREATE TABLE e.armies(
       id SERIAL PRIMARY KEY,
       player VARCHAR(64),
       commander INTEGER REFERENCES e.units(id)
);

CREATE TABLE e.army_units(
       army INTEGER REFERENCES e.armies(id),
       unit INTEGER REFERENCES e.units(id),
       PRIMARY KEY (army, unit)
);

CREATE TABLE e.faction_armies(
       faction INTEGER REFERENCES e.factions(id),
       army INTEGER REFERENCES e.armies(id)
);
