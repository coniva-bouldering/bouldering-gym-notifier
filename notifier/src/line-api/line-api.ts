import type { Article } from "../../type";

export const sendMessage = async (
	channelAccessToken: string,
	groupId: string,
	articleList: Article[],
): Promise<void> => {
	const message = articleList.reduce((acc, article) => {
		return `${article.title}\n${article.url}\n\n${acc}`;
	}, "");

	return fetch("https://api.line.me/v2/bot/message/push", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${channelAccessToken}`,
		},
		body: JSON.stringify({
			to: groupId,
			messages: [
				{
					type: "text",
					text: message,
				},
			],
		}),
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
		})
		.catch((e: Error) => {
			throw e;
		});
};
