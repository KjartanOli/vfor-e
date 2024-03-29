CREATE TABLE e.users(
  id SERIAL PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE,
  password CHAR(97) NOT NULL
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

CREATE TABLE e.battle_honours(
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES e.users(id),
       name VARCHAR(64) UNIQUE,
       description VARCHAR(1024)
);

CREATE TABLE e.wargear_types(
       id SERIAL PRIMARY KEY,
       name VARCHAR(20) UNIQUE,
       user_id INTEGER REFERENCES e.users(id)
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

CREATE OR REPLACE FUNCTION delete_unit_dependents()
RETURNS TRIGGER AS $$
BEGIN
DELETE FROM e.unit_models
WHERE unit = OLD.id;

DELETE FROM e.unit_battle_honours
WHERE unit = OLD.id;
RETURN OLD;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER before_unit_delete BEFORE DELETE ON e.units
FOR EACH ROW
EXECUTE FUNCTION delete_unit_dependents();

CREATE OR REPLACE FUNCTION delete_model_dependents()
RETURNS TRIGGER AS $$
BEGIN
DELETE FROM e.model_wargear
WHERE model = OLD.id;

DELETE FROM e.unit_models
WHERE model = OLD.id;

DELETE FROM e.model_battle_honours
WHERE model = OLD.id;
RETURN OLD;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER before_model_delete BEFORE DELETE ON e.models
FOR EACH ROW
EXECUTE FUNCTION delete_model_dependents();


CREATE OR REPLACE FUNCTION delete_honour_dependents()
RETURNS TRIGGER AS $$
BEGIN
DELETE FROM e.model_battle_honours
WHERE honour = OLD.id;

DELETE FROM e.unit_battle_honours
WHERE honour = OLD.id;

RETURN OLD;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER before_honour_delet BEFORE DELETE ON e.battle_honours
FOR EACH ROW
EXECUTE FUNCTION delete_honour_dependents();
