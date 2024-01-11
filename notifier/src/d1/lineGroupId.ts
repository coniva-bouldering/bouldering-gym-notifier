export const getAllGroupId = async (DB: D1Database): Promise<string[]> => {
	const results = await DB.prepare(
		"select line_group_id from line_groups",
	).raw<string>();
	return results.flat() || [];
};
