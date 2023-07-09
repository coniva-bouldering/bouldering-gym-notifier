-- Migration number: 0003 	 2023-07-04T10:23:59.976Z

ALTER TABLE posted_articles RENAME TO scraped_articles;
ALTER TABLE scraped_articles ADD COLUMN posted BOOLEAN DEFAULT FALSE;
UPDATE scraped_articles SET posted = true;
