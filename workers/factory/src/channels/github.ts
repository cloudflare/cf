import { createGitHubChannel } from "@flue/github";
import { dispatch } from "@flue/runtime";
import * as v from "valibot";
import { IssueTriage } from "../agents/issue-triage";
import { IssueSchema } from "../triage";
import type { Env } from "../env";

export function createGithubChannel(webhookSecret: string) {
	const channel = createGitHubChannel<{ Bindings: Env }>({
		webhookSecret,
		async webhook({ c, delivery }) {
			if (delivery.name !== "issues" || delivery.payload.action !== "opened") {
				return;
			}
			const { installation, issue, repository } = delivery.payload;
			if (!installation) {
				return c.json({ error: "A GitHub App installation is required." }, 400);
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
				return c.json({ error: "Invalid issue payload." }, 400);
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
	});
	return channel;
}
