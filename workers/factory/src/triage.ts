import { createPrivateKey } from "node:crypto";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import * as v from "valibot";
import {
	classifyIssueType,
	ISSUE_TYPE_CRITERIA,
	IssueTypeSchema,
} from "./skills/classify-issue-type";
import type { Env } from "./env";

export const IssueSchema = v.object({
	body: v.string(),
	installationId: v.pipe(v.number(), v.integer(), v.minValue(1)),
	issueNumber: v.pipe(v.number(), v.integer(), v.minValue(1)),
	owner: v.pipe(v.string(), v.minLength(1)),
	repo: v.pipe(v.string(), v.minLength(1)),
	title: v.string(),
});

const ClefResponseSchema = v.object({
	answers: v.object({
		issueType: v.object({
			choice: IssueTypeSchema,
			type: v.literal("choice"),
		}),
	}),
});

export type Issue = v.InferOutput<typeof IssueSchema>;

export async function triageIssue(env: Env, issue: Issue) {
	const client = new Octokit({
		authStrategy: createAppAuth,
		auth: {
			appId: env.GITHUB_APP_ID,
			installationId: issue.installationId,
			privateKey: createPrivateKey(
				env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, "\n")
			)
				.export({ format: "pem", type: "pkcs8" })
				.toString(),
		},
	});
	const ref = {
		issue_number: issue.issueNumber,
		owner: issue.owner,
		repo: issue.repo,
	};
	const current = await client.rest.issues.get(ref);
	if (current.data.type) {
		return { skipped: true, type: current.data.type.name };
	}

	const response = await env.AI.run("@cf/cloudflare/clef-flash", {
		model: "clef-flash",
		questions: {
			issueType: {
				criteria: ISSUE_TYPE_CRITERIA,
				instructions: classifyIssueType.instructions,
				type: "choice",
			},
		},
		state: { body: issue.body, title: issue.title },
	});
	const type = v.parse(ClefResponseSchema, response).answers.issueType.choice;
	const updated = await client.rest.issues.update({ ...ref, type });
	if (updated.data.type?.name !== type) {
		throw new Error(
			`GitHub did not assign issue type ${type}. Check the GitHub App permissions and organization issue types.`
		);
	}
	return { skipped: false, type };
}
