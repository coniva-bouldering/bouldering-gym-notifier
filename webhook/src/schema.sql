DROP TABLE IF EXISTS group_id_table;
CREATE TABLE group_id_table (
  id INTEGER PRIMARY KEY autoincrement,
  line_group_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
