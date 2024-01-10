import scrapeGyms from "./scraping/scraping";
import { sendMessage } from "./line-api/line-api";
import { getAllGroupId } from "./d1/lineGroupId";
import {
	insertArticles,
	getAllURL,
	deleteOldArticles,
	getNotPostedArticles,
	updatePostedStatus,
} from "./d1/scrapedArticles";
import { Article } from "../type";

interface Env {
	CHANNEL_ACCESS_TOKEN: string;
	DB: D1Database;
}

export default {
	async scheduled(
		controller: ScheduledController,
		env: Env,
		ctx: ExecutionContext,
	) {
		switch (controller.cron) {
			case "55 23 * * *":
				ctx.waitUntil(scrapeNews(controller, env));
				break;
			case "0 0 * * 5-7":
				ctx.waitUntil(sendNews(controller, env));
				break;
			case "0 1 * * 5-7":
				ctx.waitUntil(deleteArticles(controller, env));
				break;
		}
	},
};

async function scrapeNews(
	controller: ScheduledController,
	env: Env,
): Promise<void> {
	console.log("Hello ", controller.scheduledTime);

	const articleList = await scrapeGyms();
	if (!articleList || articleList.length === 0) {
		return;
	}

	const insertedURLList = await getAllURL(env.DB);
	const filteredArticleList = articleList.filter(
		(article: Article) => !insertedURLList.includes(article.url),
	);

	if (filteredArticleList.length === 0) {
		return;
	}

	return insertArticles(env.DB, filteredArticleList)
		.then(() => {
			console.log("Articles inserted successfully!");
		})
		.catch((e: Error) => {
			console.error(e);
		});
}

async function sendNews(
	controller: ScheduledController,
	env: Env,
): Promise<void> {
	console.log("Hello ", controller.scheduledTime);

	const articleList = await getNotPostedArticles(env.DB);
	const groupIdList = await getAllGroupId(env.DB);

	if (articleList.length > 0 && groupIdList.length > 0) {
		const promises: Promise<void>[] = groupIdList.map((groupId: string) => {
			return sendMessage(env.CHANNEL_ACCESS_TOKEN, groupId, articleList);
		});

		return Promise.all(promises)
			.then(() => {
				console.log("Messages sent successfully!");
				return updatePostedStatus(env.DB, articleList);
			})
			.then(() => {
				console.log("Posted status updated successfully!");
			})
			.catch((e: Error) => {
				console.error(e);
			});
	}
}

async function deleteArticles(
	controller: ScheduledController,
	env: Env,
): Promise<void> {
	console.log("Hello ", controller.scheduledTime);

	return deleteOldArticles(env.DB)
		.then(() => {
			console.log("Articles deleted successfully!");
		})
		.catch((e: Error) => {
			console.error(e);
		});
}
