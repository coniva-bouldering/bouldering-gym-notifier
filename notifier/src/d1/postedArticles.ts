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
