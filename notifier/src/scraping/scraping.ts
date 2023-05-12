import { Article } from "../../type";
import { getNews as getBPumpTokyoNews } from "./gyms/b-pump-tokyo";

const scrapeGyms = async () => {
  const promises: Promise<Article[]>[] = [];
  promises.push(getBPumpTokyoNews());

  return Promise.allSettled(promises)
    .then((results) => {
      const fulfilledResults: Article[] = [];
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          fulfilledResults.push(...result.value);
        } else {
          console.error(result.reason);
        }
      });
      return fulfilledResults;
    })
    .catch((error) => {
      console.error(error);
    });
};

export default scrapeGyms;
