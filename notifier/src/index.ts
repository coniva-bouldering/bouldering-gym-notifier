import scrapeGyms from "./scraping/scraping";
import { sendMessage } from "./line-api/line-api";
import { getAllGroupId } from "./d1/lineGroupId";
import { insertArticles } from "./d1/postedArticles";

interface Env {
  CHANNEL_ACCESS_TOKEN: string;
  DB: D1Database;
}

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(triggerEvent(controller, env));
  },
};

async function triggerEvent(controller: ScheduledController, env: Env): Promise<void> {
  console.log("Hello ", controller.scheduledTime);

  const articleList = await scrapeGyms();
  const groupIdList = await getAllGroupId(env.DB);

  if (articleList && articleList.length > 0) {
    const promises: Promise<void>[] = groupIdList.map((groupId: string) => {
      return sendMessage(env.CHANNEL_ACCESS_TOKEN, groupId, articleList);
    });

    return Promise.all(promises)
      .then(() => {
        console.log("Message sent successfully!");
        return insertArticles(env.DB, articleList);
      })
      .then(() => {
        console.log("Articles inserted successfully!");
      })
      .catch((e: Error) => {
        console.error(e);
      });
  }
}
