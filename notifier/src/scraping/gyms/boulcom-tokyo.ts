import { Article } from "../../../type";

const URL = "https://boulcom.jp/category/tokyo/";
const REGEX = /<div class="entry-title">\s*<h2><a href="(.*?)">(.*?)<\/a><\/h2>/gs;
const URL_CAPTURE_GROUP_INDEX = 1;
const TITLE_CAPTURE_GROUP_INDEX = 2;

export const getNews = (): Promise<Article[]> => {
  return fetch(URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then((html) => {
      const filtered = html.replace(/\r?\n/g, "");
      const match = [...filtered.matchAll(REGEX)];

      const results: Article[] = [];

      if (match) {
        match.splice(10);
        match.forEach((element) => {
          results.push({
            title: element[TITLE_CAPTURE_GROUP_INDEX],
            url: element[URL_CAPTURE_GROUP_INDEX],
          });
        });
      }

      return results;
    })
    .catch((e: Error) => {
      throw e;
    });
};
