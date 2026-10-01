import { env } from "cloudflare:workers";
import { describe, expect, it, vi } from "vitest";
import { createClassifyIssueTypeTool } from "../tools/classify-issue-type.tool";
import type { Issue } from "../schemas";

const github = vi.hoisted(() => ({ get: vi.fn(), update: vi.fn() }));
vi.mock("@octokit/rest", () => ({
	Octokit: class {
		rest = { issues: github };
	},
}));

const issue: Issue = {
	body: "The CLI crashes.",
	installationId: 123,
	issueNumber: 42,
	owner: "cloudflare",
	repo: "cf",
	title: "CLI crash",
};

const onTriaged = vi.fn();
const context = {
	log: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
	toolCallId: "test-classification",
};

describe("issue type classification tool", () => {
	it.each(["Bug", "Feature", "Task"])(
		"assigns the Clef Flash choice %s and changes only the type",
		async (type) => {
			github.get.mockResolvedValue({ data: { type: null } });
			github.update.mockResolvedValue({ data: { type: { name: type } } });

			const run = vi.spyOn(env.AI, "run").mockResolvedValue({
				answers: {
					issueType: {
						choice: type,
						type: "choice",
					},
				},
			});

			const tool = createClassifyIssueTypeTool({
				issue,
				onTriaged,
				triaged: false,
			});

			expect(await tool.run(context)).toEqual({
				output: { skipped: false, type },
				terminate: true,
			});
			expect(run).toHaveBeenCalledExactlyOnceWith(
				"@cf/cloudflare/clef-flash",
				expect.objectContaining({
					model: "clef-flash",
					state: { body: issue.body, title: issue.title },
				})
			);
			expect(github.update).toHaveBeenCalledExactlyOnceWith({
				issue_number: 42,
				owner: "cloudflare",
				repo: "cf",
				type,
			});
			expect(onTriaged).toHaveBeenCalledOnce();
		}
	);

	it("preserves an existing type on redelivery", async () => {
		github.get.mockResolvedValue({ data: { type: { name: "Feature" } } });

		const run = vi
			.spyOn(env.AI, "run")
			.mockRejectedValue(new Error("Unexpected Workers AI request."));

		const tool = createClassifyIssueTypeTool({
			issue,
			onTriaged,
			triaged: false,
		});

		expect(await tool.run(context)).toEqual({
			output: {
				skipped: true,
				type: "Feature",
			},
			terminate: true,
		});
		expect(run).not.toHaveBeenCalled();
		expect(github.update).not.toHaveBeenCalled();
		expect(onTriaged).toHaveBeenCalledOnce();
	});

	it("skips an already triaged agent without external calls", async () => {
		const run = vi
			.spyOn(env.AI, "run")
			.mockRejectedValue(new Error("Unexpected Workers AI request."));

		const tool = createClassifyIssueTypeTool({
			issue,
			onTriaged,
			triaged: true,
		});

		expect(await tool.run(context)).toEqual({
			output: { skipped: true },
			terminate: true,
		});
		expect(github.get).not.toHaveBeenCalled();
		expect(github.update).not.toHaveBeenCalled();
		expect(run).not.toHaveBeenCalled();
		expect(onTriaged).not.toHaveBeenCalled();
	});

	it("rejects model output outside the three allowed issue types", async () => {
		github.get.mockResolvedValue({ data: { type: null } });

		vi.spyOn(env.AI, "run").mockResolvedValue({
			answers: {
				issueType: {
					choice: "Epic",
					type: "choice",
				},
			},
		});

		const tool = createClassifyIssueTypeTool({
			issue,
			onTriaged,
			triaged: false,
		});

		await expect(tool.run(context)).rejects.toThrow();
		expect(github.update).not.toHaveBeenCalled();
		expect(onTriaged).not.toHaveBeenCalled();
	});

	it("surfaces GitHub silently dropping the type update", async () => {
		github.get.mockResolvedValue({ data: { type: null } });
		github.update.mockResolvedValue({ data: { type: null } });

		vi.spyOn(env.AI, "run").mockResolvedValue({
			answers: {
				issueType: {
					choice: "Bug",
					type: "choice",
				},
			},
		});

		const tool = createClassifyIssueTypeTool({
			issue,
			onTriaged,
			triaged: false,
		});

		await expect(tool.run(context)).rejects.toThrow(
			"GitHub did not assign issue type Bug"
		);
		expect(onTriaged).not.toHaveBeenCalled();
	});

	it("leaves triage incomplete when inference fails", async () => {
		github.get.mockResolvedValue({ data: { type: null } });

		vi.spyOn(env.AI, "run").mockRejectedValue(new Error("Inference failed."));

		const tool = createClassifyIssueTypeTool({
			issue,
			onTriaged,
			triaged: false,
		});

		await expect(tool.run(context)).rejects.toThrow("Inference failed.");
		expect(github.update).not.toHaveBeenCalled();
		expect(onTriaged).not.toHaveBeenCalled();
	});
});
