import { createGitHubChannel } from "@flue/github";
import { dispatch } from "@flue/runtime";
import { env } from "cloudflare:workers";
import * as v from "valibot";
import { IssueTriage } from "../agents/issue-triage.agent";
import { IssueSchema } from "../triage";

export const channel = createGitHubChannel<{ Bindings: Env }>({
	webhook: async ({ c, delivery }) => {
		if (delivery.name !== "issues" || delivery.payload.action !== "opened") {
			return;
		}

		const { installation, issue, repository } = delivery.payload;
		if (!installation) {
			return c.json(
				{
					error: "A GitHub App installation is required.",
				},
				400
			);
		}

		const parsed = v.safeParse(IssueSchema, {
			body: issue?.body ?? "",
			installationId: installation.id,
			issueNumber: issue?.number,
			owner: repository?.owner?.login,
			repo: repository?.name,
			title: issue?.title,
		});
		if (!parsed.success) {
			return c.json(
				{
					error: "Invalid issue payload.",
				},
				400
			);
		}

		await dispatch(IssueTriage, {
			id: channel.instanceId(parsed.output),
			initialData: parsed.output,
			message: {
				attributes: { deliveryId: delivery.deliveryId },
				body: "Classify the newly opened issue using the classify-issue-type skill.",
				kind: "signal",
				type: "github.issues.opened",
			},
		});
	},
	webhookSecret: env.GITHUB_WEBHOOK_SECRET,
});
