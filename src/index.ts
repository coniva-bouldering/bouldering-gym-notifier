import scrapeGyms from "./scraping/scraping";

type Env = {
  [key: string]: string;
};

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(triggerEvent(controller, env));
  },
};

async function triggerEvent(controller: ScheduledController, env: Env): Promise<void> {
  console.log("Hello ", controller.scheduledTime, " Env : ", env.API_KEY);
  console.log(await scrapeGyms());
}
