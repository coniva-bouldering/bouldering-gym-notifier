export const getAllGroupId = async (DB: D1Database): Promise<string[]> => {
  const { results } = await DB.prepare(`select line_group_id from line_groups`).all();
  const ids: string[] = [];
  results?.forEach((item) => {
    if (typeof item === "object" && item !== null && "line_group_id" in item) {
      ids.push(item.line_group_id as string);
    }
  });
  return ids;
};
