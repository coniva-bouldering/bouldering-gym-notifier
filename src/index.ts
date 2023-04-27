import { Hono } from "hono";
import scrapeGyms from "./scraping/scraping";

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono!"));

type Env = {
  [key: string]: string;
};

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(triggerEvent(controller, env));
  },
  app,
};

async function triggerEvent(controller: ScheduledController, env: Env): Promise<void> {
  console.log("Hello ", controller.scheduledTime, " Env : ", env.API_KEY);
  console.log(await scrapeGyms());
}
