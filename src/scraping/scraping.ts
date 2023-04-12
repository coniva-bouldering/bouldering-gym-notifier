import { getNews as getBPumpTokyoNews } from "./gyms/b-pump-tokyo";

const scrapeGyms = async () => {
  const results: string[] = [];

  const promises: Promise<string[]>[] = [];
  promises.push(getBPumpTokyoNews());

  const newsResults = await Promise.all(promises);

  for (const news of newsResults) {
    results.push(...news);
  }

  return results;
};

export default scrapeGyms;
