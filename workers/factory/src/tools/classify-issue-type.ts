import { defineTool } from "@flue/runtime";
import { triageIssue } from "../triage";
import type { Issue } from "../triage";

/** Bind classification to the verified issue and the agent's triage state. */
export function createClassifyIssueTypeTool(
	issue: Issue,
	triaged: boolean,
	onTriaged: () => void
) {
	return defineTool({
		name: "classify_issue_type",
		description:
			"Use Clef Flash to classify the bound issue and set only its GitHub issue type. No input is needed.",
		async run() {
			if (triaged) {
				return { output: { skipped: true }, terminate: true };
			}

			const result = await triageIssue(issue);
			onTriaged();
			return { output: result, terminate: true };
		},
	});
}
