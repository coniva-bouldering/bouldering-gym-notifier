import scrapeGyms from "./scraping/scraping";
import { sendMessage } from "./line-api/line-api";
import { getAllGroupId } from "./d1/d1";

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
  const URLList = await scrapeGyms();
  const groupIdList = await getAllGroupId(env.DB);

  if (URLList && URLList.length > 0) {
    const promises: Promise<void>[] = groupIdList.map((groupId: string) => {
      return sendMessage(env.CHANNEL_ACCESS_TOKEN, groupId, URLList);
    });

    Promise.all(promises)
      .then(() => {
        console.log("Message sent successfully!");
      })
      .catch((e: Error) => {
        console.error(e);
      });
  }
}
