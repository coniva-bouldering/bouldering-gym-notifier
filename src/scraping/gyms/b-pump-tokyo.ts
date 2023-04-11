const URL = "https://pump-climbing.com/gym/akiba/news/";
const REGEX = /<div class="news-line my-3">(.*?)<h4><a href="(.*?)">(.*?)<\/a><\/h4>/gs;
const CAPTURE_GROUP_INDEX = 2;

export const getNews = async () => {
  const response = await fetch(URL);
  const html = await response.text();

  const match = [...html.matchAll(REGEX)];

  const results: string[] = [];

  if (match) {
    match.splice(3);
    match.forEach((element) => {
      results.push(element[CAPTURE_GROUP_INDEX]);
    });
  }

  return results;
};
