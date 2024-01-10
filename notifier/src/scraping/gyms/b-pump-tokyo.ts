import { Article } from "../../../type";

const URL = "https://pump-climbing.com/gym/akiba/news/";
const REGEX =
	/<div class="news-line my-3">(.*?)<h4><a href="(.*?)">(.*?)<\/a><\/h4>/gs;
const URL_CAPTURE_GROUP_INDEX = 2;
const TITLE_CAPTURE_GROUP_INDEX = 3;

export const getNews = (): Promise<Article[]> => {
	return fetch(URL)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.text();
		})
		.then((html) => {
			const match = [...html.matchAll(REGEX)];

			const results: Article[] = [];

			if (match) {
				match.splice(3);
				for (const element of match) {
					results.push({
						title: element[TITLE_CAPTURE_GROUP_INDEX],
						url: element[URL_CAPTURE_GROUP_INDEX],
					});
				}
			}
			return results;
		})
		.catch((e: Error) => {
			throw e;
		});
};
