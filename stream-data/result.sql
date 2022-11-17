CREATE EXTENSION postgis;
CREATE TABLE geometries (id integer, no integer, name varchar, flow decimal, time timestamp, geom geometry);

-- INSERT INTO geometries VALUES
--   ('Point', 'POINT(0 0)', timestamp '2021-01-04T00:00:00Z');

COPY geometries(id,no,name,flow,time,geom) FROM '/docker-entrypoint-initdb.d/result.csv' WITH (FORMAT CSV, DELIMITER ',', HEADER TRUE);
