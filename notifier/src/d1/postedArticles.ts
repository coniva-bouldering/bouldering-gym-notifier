import { Article } from "../../type";

export const insertArticles = async (
  DB: D1Database,
  articleList: Article[]
): Promise<D1Result<unknown>> => {
  const placeHolder = articleList.map(() => "(?, ?)").join(", ");
  const info = await DB.prepare(
    `INSERT INTO posted_articles (title, url) VALUES ${placeHolder};`
  )
    .bind(...articleList.flatMap((article) => [article.title, article.url]))
    .run();

  return info;
};

export const getAllURL = async (DB: D1Database): Promise<string[]> => {
  const results = await DB.prepare(`select url from posted_articles`).raw<string>();
  return results.flat() || [];
};

export const deleteOldArticles = async (
  DB: D1Database,
  exceptLatestNumber = 20
): Promise<D1Result<unknown>> => {
  const info = await DB.prepare(
    `DELETE FROM posted_articles WHERE url NOT IN (SELECT url FROM posted_articles ORDER BY created_at DESC LIMIT ?);`
  )
    .bind(exceptLatestNumber)
    .run();

  return info;
};
