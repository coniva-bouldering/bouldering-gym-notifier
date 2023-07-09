-- Migration number: 0002 	 2023-07-03T11:20:27.467Z
CREATE TABLE urls (
  short_url_key VARCHAR(10) PRIMARY KEY,
  original_url VARCHAR(2048) NOT NULL
);
