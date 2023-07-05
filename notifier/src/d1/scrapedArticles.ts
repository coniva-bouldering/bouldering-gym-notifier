import { Article } from "../../type";

export const insertArticles = async (
  DB: D1Database,
  articleList: Article[]
): Promise<D1Result<unknown>> => {
  const placeHolder = articleList.map(() => "(?, ?)").join(", ");
  const info = await DB.prepare(
    `INSERT INTO scraped_articles (title, url) VALUES ${placeHolder};`
  )
    .bind(...articleList.flatMap((article) => [article.title, article.url]))
    .run();

  return info;
};

export const getAllURL = async (DB: D1Database): Promise<string[]> => {
  const results = await DB.prepare(`select url from scraped_articles`).raw<string>();
  return results.flat() || [];
};

export const deleteOldArticles = async (
  DB: D1Database,
  exceptLatestNumber = 20
): Promise<D1Result<unknown>> => {
  const info = await DB.prepare(
    `DELETE FROM scraped_articles WHERE url NOT IN (SELECT url FROM scraped_articles ORDER BY created_at DESC LIMIT ?);`
  )
    .bind(exceptLatestNumber)
    .run();

  return info;
};

export const getNotPostedArticles = async (DB: D1Database): Promise<Article[]> => {
  const results = await DB.prepare(
    `SELECT title, url FROM scraped_articles WHERE posted == false;`
  ).raw();

  const notPostedArticles = results.map((result) => {
    const [title, url] = result as [string, string];
    return {
      title,
      url,
    };
  });

  return notPostedArticles;
};

export const updatePostedStatus = async (
  DB: D1Database,
  postedArticleList: Article[]
): Promise<D1Result<unknown>> => {
  const placeHolder = postedArticleList.map(() => "?").join(", ");
  const info = await DB.prepare(
    `UPDATE scraped_articles SET posted = true WHERE url IN (${placeHolder});`
  )
    .bind(...postedArticleList.flatMap((article) => [article.url]))
    .run();

  return info;
};
