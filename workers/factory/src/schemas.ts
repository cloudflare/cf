import * as v from "valibot";

export const IssueTypeSchema = v.picklist(["Bug", "Feature", "Task"]);
export type IssueType = v.InferOutput<typeof IssueTypeSchema>;

export const IssueSchema = v.object({
	body: v.string(),
	installationId: v.pipe(v.number(), v.integer(), v.minValue(1)),
	issueNumber: v.pipe(v.number(), v.integer(), v.minValue(1)),
	owner: v.pipe(v.string(), v.minLength(1)),
	repo: v.pipe(v.string(), v.minLength(1)),
	title: v.string(),
});
export type Issue = v.InferOutput<typeof IssueSchema>;

export const ClefResponseSchema = v.object({
	answers: v.object({
		issueType: v.object({
			choice: IssueTypeSchema,
			type: v.literal("choice"),
		}),
	}),
});
