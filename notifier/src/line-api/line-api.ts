export const sendMessage = async (
  channelAccessToken: string,
  groupId: string,
  URLList: string[]
): Promise<void> => {
  const message = URLList.map((url) => ({
    type: "text",
    text: url,
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
