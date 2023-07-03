import scrapeGyms from "./scraping/scraping";
import { sendMessage } from "./line-api/line-api";
import { getAllGroupId } from "./d1/lineGroupId";
import { insertArticles, getAllURL, deleteOldArticles } from "./d1/postedArticles";
import { Article } from "../type";

interface Env {
  CHANNEL_ACCESS_TOKEN: string;
  DB: D1Database;
}

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    switch (controller.cron) {
      case "0 1 * * *":
        ctx.waitUntil(deleteArticles(controller, env));
        break;
      case "0 0 * * *":
        ctx.waitUntil(scrapeAndSendNews(controller, env));
        break;
    }
  },
};

async function scrapeAndSendNews(
  controller: ScheduledController,
  env: Env
): Promise<void> {
  console.log("Hello ", controller.scheduledTime);

  const articleList = await scrapeGyms();
  if (!articleList || articleList.length === 0) {
    return;
  }

  const postedURLList = await getAllURL(env.DB);
  const filteredArticleList = articleList.filter(
    (article: Article) => !postedURLList.includes(article.url)
  );
  const groupIdList = await getAllGroupId(env.DB);

  if (filteredArticleList.length > 0) {
    const promises: Promise<void>[] = groupIdList.map((groupId: string) => {
      return sendMessage(env.CHANNEL_ACCESS_TOKEN, groupId, filteredArticleList);
    });

    return Promise.all(promises)
      .then(() => {
        console.log("Message sent successfully!");
        return insertArticles(env.DB, filteredArticleList);
      })
      .then(() => {
        console.log("Articles inserted successfully!");
      })
      .catch((e: Error) => {
        console.error(e);
      });
  }
}

async function deleteArticles(controller: ScheduledController, env: Env): Promise<void> {
  console.log("Hello2 ", controller.scheduledTime);

  return deleteOldArticles(env.DB)
    .then(() => {
      console.log("Articles deleted successfully!");
    })
    .catch((e: Error) => {
      console.error(e);
    });
}
