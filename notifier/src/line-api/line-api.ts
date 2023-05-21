import { Article } from "../../type";

export const sendMessage = async (
  channelAccessToken: string,
  groupId: string,
  articleList: Article[]
): Promise<void> => {
  const message = articleList.map((article) => ({
    type: "text",
    text: article.title + "\n" + article.url,
  }));

  return fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      to: groupId,
      messages: message,
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
