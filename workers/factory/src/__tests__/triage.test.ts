import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { triageIssue } from "../triage";
import type { Env } from "../env";
import type { Issue } from "../triage";

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

const privateKey = generateKeyPairSync("rsa", { modulusLength: 2048 })
	.privateKey.export({ format: "pem", type: "pkcs1" })
	.toString();

function createEnv(run: ReturnType<typeof vi.fn>): Env {
	return {
		AI: { run } as unknown as Ai,
		GITHUB_APP_ID: "123",
		GITHUB_APP_PRIVATE_KEY: privateKey.replace(/\n/g, "\\n"),
		GITHUB_WEBHOOK_SECRET: "test-secret",
	};
}

describe("issue type classification", () => {
	it.each(["Bug", "Feature", "Task"])(
		"assigns the Clef Flash choice %s and changes only the type",
		async (type) => {
			github.get.mockResolvedValue({ data: { type: null } });
			github.update.mockResolvedValue({ data: { type: { name: type } } });
			const run = vi.fn().mockResolvedValue({
				answers: { issueType: { choice: type, type: "choice" } },
			});
			expect(await triageIssue(createEnv(run), issue)).toEqual({
				skipped: false,
				type,
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
		}
	);

	it("preserves an existing type on redelivery", async () => {
		github.get.mockResolvedValue({ data: { type: { name: "Feature" } } });
		const run = vi.fn();
		expect(await triageIssue(createEnv(run), issue)).toEqual({
			skipped: true,
			type: "Feature",
		});
		expect(run).not.toHaveBeenCalled();
		expect(github.update).not.toHaveBeenCalled();
	});

	it("rejects model output outside the three allowed issue types", async () => {
		github.get.mockResolvedValue({ data: { type: null } });
		const run = vi.fn().mockResolvedValue({
			answers: { issueType: { choice: "Epic", type: "choice" } },
		});
		await expect(triageIssue(createEnv(run), issue)).rejects.toThrow();
		expect(github.update).not.toHaveBeenCalled();
	});

	it("surfaces GitHub silently dropping the type update", async () => {
		github.get.mockResolvedValue({ data: { type: null } });
		github.update.mockResolvedValue({ data: { type: null } });
		const run = vi.fn().mockResolvedValue({
			answers: { issueType: { choice: "Bug", type: "choice" } },
		});
		await expect(triageIssue(createEnv(run), issue)).rejects.toThrow(
			"GitHub did not assign issue type Bug"
		);
	});
});
