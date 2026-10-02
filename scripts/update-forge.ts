#!/usr/bin/env node
/* oxlint-disable turbo/no-undeclared-env-vars -- standalone automation, not a turbo task */
import { execFileSync, spawnSync } from "node:child_process";
import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "..");
const GENERATOR_PATH = join(REPO_ROOT, "packages/cli/generate.ts");
const FORGE_REPOSITORY = "cloudflare/forge";
const OPENAPI_ASSET = "openapi.forge.json";
const OPENAPI_VERSION_PATTERN =
	/^const FORGE_OPENAPI_VERSION = "([0-9a-f]{40})";$/m;
const UPDATE_COMMIT_PATTERN =
	/^chore: update Forge and OpenAPI to [0-9a-f]{12}$/;
const UPDATE_COMMIT_EMAIL =
	"41898282+github-actions[bot]@users.noreply.github.com";
const UPDATE_BRANCH = process.env.UPDATE_BRANCH ?? "automation/update-forge";
const BASE_BRANCH = process.env.BASE_BRANCH ?? "main";
const GITHUB_API_URL = process.env.GITHUB_API_URL ?? "https://api.github.com";
const GITHUB_SERVER_URL = process.env.GITHUB_SERVER_URL ?? "https://github.com";
const CF_GITHUB_TOKEN = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;

type JsonObject = Record<string, unknown>;
type UpdatePullRequest = { number: number; headSha: string };
type ManagedUpdateCommit = { parentSha: string };

function logStep(message: string): void {
	console.log(`\n==> ${message}`);
}

function isObject(value: unknown): value is JsonObject {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function run(
	command: string,
	args: string[],
	options: { cwd?: string; env?: NodeJS.ProcessEnv } = {}
): void {
	execFileSync(command, args, {
		cwd: options.cwd ?? REPO_ROOT,
		env: options.env ?? process.env,
		stdio: "inherit",
	});
}

function output(
	command: string,
	args: string[],
	cwd = REPO_ROOT,
	environment: NodeJS.ProcessEnv = process.env
): string {
	return execFileSync(command, args, {
		cwd,
		env: environment,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "inherit"],
	}).trim();
}

function githubGitEnvironment(token: string): NodeJS.ProcessEnv {
	return {
		...process.env,
		GIT_CONFIG_COUNT: "1",
		GIT_CONFIG_KEY_0: "http.https://github.com/.extraheader",
		GIT_CONFIG_VALUE_0: `AUTHORIZATION: basic ${Buffer.from(
			`x-access-token:${token}`
		).toString("base64")}`,
	};
}

function inferRepository(): string {
	if (process.env.GITHUB_REPOSITORY) {
		return process.env.GITHUB_REPOSITORY;
	}

	const remote = output("git", ["remote", "get-url", "origin"]);
	const match = remote.match(/github\.com[/:]([^/]+\/[^/]+?)(?:\.git)?$/);
	if (!match?.[1]) {
		throw new Error(`Could not infer GitHub repository from origin: ${remote}`);
	}
	return match[1];
}

async function githubJson(
	path: string,
	init: RequestInit = {}
): Promise<unknown> {
	const response = await githubResponse(path, init, CF_GITHUB_TOKEN);
	return response.status === 204 ? undefined : response.json();
}

export async function githubResponse(
	path: string,
	init: RequestInit = {},
	token?: string,
	accept = "application/vnd.github+json"
): Promise<Response> {
	const headers = new Headers(init.headers);
	headers.set("Accept", accept);
	headers.set("X-GitHub-Api-Version", "2022-11-28");
	headers.set("User-Agent", "cloudflare-cf-forge-updater");
	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}
	if (init.body) {
		headers.set("Content-Type", "application/json");
	}

	const response = await fetch(`${GITHUB_API_URL}${path}`, {
		...init,
		headers,
	});
	if (!response.ok) {
		const detail = await response.text();
		throw new Error(
			`GitHub API ${init.method ?? "GET"} ${path} failed (${response.status} ${response.statusText}): ${detail}`
		);
	}
	return response;
}

function extractOpenApiVersion(source: string, label: string): string {
	const match = source.match(OPENAPI_VERSION_PATTERN);
	if (!match?.[1]) {
		throw new Error(`Could not read FORGE_OPENAPI_VERSION from ${label}`);
	}
	return match[1];
}

export async function getLatestForgeRelease(): Promise<{
	tag: string;
	version: string;
	assetId: number;
}> {
	const response = await githubResponse(
		`/repos/${FORGE_REPOSITORY}/releases/latest`
	);
	const release: unknown = await response.json();
	if (!isObject(release) || typeof release.tag_name !== "string") {
		throw new Error("Latest Forge release has no tag_name");
	}

	const match = release.tag_name.match(/^openapi@([0-9a-f]{40})$/);
	if (!match?.[1]) {
		throw new Error(
			`Latest Forge release has an unexpected tag: ${release.tag_name}`
		);
	}
	const asset = Array.isArray(release.assets)
		? release.assets.find(
				(item) => isObject(item) && item.name === OPENAPI_ASSET
			)
		: undefined;
	if (!isObject(asset) || typeof asset.id !== "number") {
		throw new Error(
			`Forge release ${release.tag_name} has no ${OPENAPI_ASSET} asset`
		);
	}

	return { tag: release.tag_name, version: match[1], assetId: asset.id };
}

/**
 * Forge is public, so its commands do not need the cf credentials used for
 * branch updates and PR creation. Remove inherited GitHub tokens and injected
 * Git authentication from their environment to avoid unnecessary credentials.
 */
export function getForgeEnvironment(
	environment: NodeJS.ProcessEnv = process.env
): NodeJS.ProcessEnv {
	// Windows environment variable names are case-insensitive.
	return Object.fromEntries(
		Object.entries(environment).filter(([key]) => {
			const name = key.toUpperCase();
			return (
				!["GH_TOKEN", "GITHUB_TOKEN", "FORGE_GITHUB_TOKEN"].includes(name) &&
				name !== "GIT_CONFIG_PARAMETERS" &&
				!/^GIT_CONFIG_(?:COUNT|KEY_\d+|VALUE_\d+)$/.test(name)
			);
		})
	);
}

export async function prepareForgeOpenApi(
	forgeDir: string,
	assetId: number
): Promise<void> {
	const response = await githubResponse(
		`/repos/${FORGE_REPOSITORY}/releases/assets/${assetId}`,
		{},
		undefined,
		"application/octet-stream"
	);
	const source = (await response.json()) as unknown;
	if (!isObject(source) || !isObject(source.paths)) {
		throw new Error(`Forge release asset ${OPENAPI_ASSET} is not OpenAPI JSON`);
	}

	const compatibilityModulePath = join(
		forgeDir,
		"packages/forge/shared/fern-openapi-compat.ts"
	);
	const compatibilityModule = (await import(
		pathToFileURL(compatibilityModulePath).href
	)) as {
		applyFernCompatibilityFixes?: (openapi: object) => unknown;
	};
	const applyFernCompatibilityFixes =
		compatibilityModule.applyFernCompatibilityFixes;
	if (typeof applyFernCompatibilityFixes !== "function") {
		throw new Error(
			`Forge checkout has no applyFernCompatibilityFixes export at ${compatibilityModulePath}`
		);
	}

	const fernSource = structuredClone(source);
	const fixes = applyFernCompatibilityFixes(fernSource);
	const rootSpecPath = join(forgeDir, "openapi.json");
	const fernSpecPath = join(
		forgeDir,
		"packages/cloudflare-fern-config/fern/openapi.json"
	);
	mkdirSync(dirname(fernSpecPath), { recursive: true });
	writeFileSync(rootSpecPath, `${JSON.stringify(source, null, 2)}\n`);
	writeFileSync(fernSpecPath, `${JSON.stringify(fernSource, null, 2)}\n`);
	console.log(
		`Prepared Forge OpenAPI build inputs (${JSON.stringify(fixes)}).`
	);
}

async function getOpenUpdatePullRequest(
	repository: string
): Promise<UpdatePullRequest | undefined> {
	const [owner, name, ...rest] = repository.split("/");
	if (!owner || !name || rest.length > 0) {
		throw new Error(`Invalid GitHub repository: ${repository}`);
	}
	const query = new URLSearchParams({
		base: BASE_BRANCH,
		head: `${owner}:${UPDATE_BRANCH}`,
		state: "open",
	});
	const pulls = await githubJson(`/repos/${repository}/pulls?${query}`);
	if (!Array.isArray(pulls)) {
		throw new Error("GitHub pull request response was not an array");
	}
	const first = pulls[0];
	if (first === undefined) {
		return undefined;
	}
	if (
		!isObject(first) ||
		typeof first.number !== "number" ||
		!isObject(first.head) ||
		typeof first.head.sha !== "string"
	) {
		throw new Error("Open update pull request has invalid metadata");
	}
	return { number: first.number, headSha: first.head.sha };
}

async function getManagedUpdateCommit(
	repository: string,
	updatePr: UpdatePullRequest
): Promise<ManagedUpdateCommit | undefined> {
	const query = new URLSearchParams({ per_page: "2" });
	const commits = await githubJson(
		`/repos/${repository}/pulls/${updatePr.number}/commits?${query}`
	);
	if (!Array.isArray(commits)) {
		throw new Error("GitHub pull request commits response was not an array");
	}
	if (commits.length !== 1) {
		return undefined;
	}

	const [commit] = commits;
	if (
		!isObject(commit) ||
		commit.sha !== updatePr.headSha ||
		!isObject(commit.commit) ||
		!isObject(commit.commit.author) ||
		commit.commit.author.email !== UPDATE_COMMIT_EMAIL ||
		!isObject(commit.commit.committer) ||
		commit.commit.committer.email !== UPDATE_COMMIT_EMAIL ||
		typeof commit.commit.message !== "string" ||
		!UPDATE_COMMIT_PATTERN.test(commit.commit.message) ||
		!Array.isArray(commit.parents) ||
		commit.parents.length !== 1 ||
		!isObject(commit.parents[0]) ||
		typeof commit.parents[0].sha !== "string"
	) {
		return undefined;
	}
	return { parentSha: commit.parents[0].sha };
}

async function getProposedOpenApiVersion(repository: string): Promise<string> {
	const query = new URLSearchParams({ ref: UPDATE_BRANCH });
	const result = await githubJson(
		`/repos/${repository}/contents/packages/cli/generate.ts?${query}`
	);
	if (
		!isObject(result) ||
		typeof result.content !== "string" ||
		result.encoding !== "base64"
	) {
		throw new Error("Update branch returned invalid generate.ts content");
	}
	const source = Buffer.from(result.content, "base64").toString("utf8");
	return extractOpenApiVersion(source, `${UPDATE_BRANCH}:generate.ts`);
}

function updateOpenApiVersion(version: string): void {
	const source = readFileSync(GENERATOR_PATH, "utf8");
	extractOpenApiVersion(source, GENERATOR_PATH);
	writeFileSync(
		GENERATOR_PATH,
		source.replace(
			OPENAPI_VERSION_PATTERN,
			`const FORGE_OPENAPI_VERSION = "${version}";`
		)
	);
}

function assertCleanWorktree(): void {
	const status = output("git", ["status", "--porcelain"]);
	if (status) {
		throw new Error(
			"Refusing to update Forge because the working tree is not clean"
		);
	}
}

function writeChangeset(version: string): void {
	const changesetPath = join(
		REPO_ROOT,
		`.changeset/update-forge-${version.slice(0, 12)}.md`
	);
	writeFileSync(
		changesetPath,
		`---
"cf": minor
---

Update the generated command surface and vendored Forge packages for
Forge OpenAPI release \`${version}\`.
`
	);
}

function getRemoteBranchSha(
	environment: NodeJS.ProcessEnv = process.env
): string | undefined {
	const result = spawnSync(
		"git",
		[
			"ls-remote",
			"--exit-code",
			"--heads",
			"origin",
			`refs/heads/${UPDATE_BRANCH}`,
		],
		{
			cwd: REPO_ROOT,
			env: environment,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "inherit"],
		}
	);
	if (result.error) {
		throw result.error;
	}
	if (result.status === 2) {
		return undefined;
	}
	if (result.status !== 0) {
		throw new Error(`git ls-remote failed with status ${result.status}`);
	}
	const sha = result.stdout.trim().split(/\s+/, 1)[0];
	if (!sha) {
		throw new Error("git ls-remote returned no branch SHA");
	}
	return sha;
}

async function createOrUpdatePullRequest(
	repository: string,
	prNumber: number | undefined,
	title: string,
	body: string
): Promise<void> {
	if (!CF_GITHUB_TOKEN) {
		throw new Error("GH_TOKEN or GITHUB_TOKEN is required to create a PR");
	}

	if (prNumber !== undefined) {
		await githubJson(`/repos/${repository}/pulls/${prNumber}`, {
			method: "PATCH",
			body: JSON.stringify({ title, body }),
		});
		console.log(`Updated PR #${prNumber}.`);
		return;
	}

	const created = await githubJson(`/repos/${repository}/pulls`, {
		method: "POST",
		body: JSON.stringify({
			base: BASE_BRANCH,
			head: UPDATE_BRANCH,
			title,
			body,
		}),
	});
	if (!isObject(created) || typeof created.html_url !== "string") {
		throw new Error("Created pull request has no html_url");
	}
	console.log(created.html_url);
}

async function closePullRequest(
	repository: string,
	prNumber: number
): Promise<void> {
	if (!CF_GITHUB_TOKEN) {
		throw new Error("GH_TOKEN or GITHUB_TOKEN is required to close a PR");
	}
	await githubJson(`/repos/${repository}/pulls/${prNumber}`, {
		method: "PATCH",
		body: JSON.stringify({ state: "closed" }),
	});
	console.log(`Closed superseded PR #${prNumber}.`);
}

async function main(): Promise<void> {
	const args = new Set(process.argv.slice(2));
	for (const arg of args) {
		if (arg !== "--check") {
			throw new Error("Unknown argument: " + String(arg));
		}
	}

	const checkOnly = args.has("--check");
	const repository = inferRepository();
	logStep("Checking the latest Forge release");
	const { tag, version, assetId } = await getLatestForgeRelease();
	const current = extractOpenApiVersion(
		readFileSync(GENERATOR_PATH, "utf8"),
		GENERATOR_PATH
	);
	console.log(`Latest: ${tag}; current: openapi@${current}.`);

	logStep("Inspecting the managed update pull request");
	const updatePr = await getOpenUpdatePullRequest(repository);
	const managedUpdateCommit =
		updatePr === undefined
			? undefined
			: await getManagedUpdateCommit(repository, updatePr);
	if (updatePr !== undefined && managedUpdateCommit === undefined) {
		console.warn(
			`Leaving PR #${updatePr.number} unchanged because it is not a single updater-generated commit.`
		);
		return;
	}

	if (version === current) {
		if (updatePr !== undefined) {
			if (checkOnly) {
				console.log(
					`PR #${updatePr.number} is superseded and should be closed.`
				);
			} else {
				await closePullRequest(repository, updatePr.number);
			}
		}
		console.log(`Already using the latest Forge release (${tag}).`);
		return;
	}

	const proposed =
		updatePr === undefined
			? undefined
			: await getProposedOpenApiVersion(repository);
	if (
		version === proposed &&
		updatePr !== undefined &&
		managedUpdateCommit !== undefined
	) {
		const baseSha = output("git", ["rev-parse", "HEAD"]);
		const proposedBaseSha = managedUpdateCommit.parentSha;
		if (proposedBaseSha === baseSha) {
			console.log(
				`PR #${updatePr.number} already updates to the latest Forge release (${tag}).`
			);
			return;
		}
		console.log(
			`Refreshing PR #${updatePr.number} on ${baseSha} (was based on ${proposedBaseSha}).`
		);
	} else {
		console.log(`Updating Forge OpenAPI from ${current} to ${version}.`);
	}

	if (checkOnly) {
		return;
	}
	if (!CF_GITHUB_TOKEN) {
		throw new Error("GH_TOKEN or GITHUB_TOKEN is required to update cf");
	}
	assertCleanWorktree();

	const tempRoot = mkdtempSync(
		join(process.env.RUNNER_TEMP ?? tmpdir(), "cf-update-forge-")
	);
	const forgeDir = join(tempRoot, "forge");
	let forgeSourceSha: string;
	const forgeEnvironment = getForgeEnvironment();
	const failedChecks: string[] = [];
	try {
		logStep(`Cloning Forge release ${tag}`);
		run(
			"git",
			[
				"clone",
				"--depth",
				"1",
				"--branch",
				tag,
				"--single-branch",
				`https://github.com/${FORGE_REPOSITORY}.git`,
				forgeDir,
			],
			{ env: forgeEnvironment }
		);
		forgeSourceSha = output(
			"git",
			["rev-parse", "HEAD"],
			forgeDir,
			forgeEnvironment
		);

		logStep("Installing the Forge workspace");
		run("pnpm", ["--dir", forgeDir, "install", "--frozen-lockfile"], {
			env: forgeEnvironment,
		});

		logStep("Preparing Forge OpenAPI build inputs");
		await prepareForgeOpenApi(forgeDir, assetId);

		logStep("Vendoring the Forge packages");
		updateOpenApiVersion(version);
		run("node", ["scripts/sync-forge.ts"], {
			env: { ...forgeEnvironment, FORGE_REPO: forgeDir },
		});

		writeChangeset(version);
		logStep("Regenerating the SDK and command surface");
		let generated = true;
		try {
			run("pnpm", ["generate"], { env: forgeEnvironment });
		} catch {
			generated = false;
			failedChecks.push("pnpm generate");
			console.warn("Generation failed; continuing to open the update PR.");
		}

		logStep("Validating the generated update");
		try {
			run("git", ["diff", "--check"], { env: forgeEnvironment });
		} catch {
			failedChecks.push("git diff --check");
			console.warn("Diff validation failed; continuing to open the update PR.");
		}
		if (generated) {
			try {
				run("pnpm", ["check"], { env: forgeEnvironment });
			} catch {
				failedChecks.push("pnpm check");
				console.warn(
					"Repository checks failed; continuing to open the update PR."
				);
			}
		}
	} finally {
		rmSync(tempRoot, { recursive: true, force: true });
	}

	const shortVersion = version.slice(0, 12);
	const title = `chore: update Forge and OpenAPI to ${shortVersion}`;
	const releaseUrl = `${GITHUB_SERVER_URL}/${FORGE_REPOSITORY}/releases/tag/${encodeURIComponent(tag)}`;
	const workflowRunUrl = process.env.GITHUB_RUN_ID
		? `${GITHUB_SERVER_URL}/${repository}/actions/runs/${process.env.GITHUB_RUN_ID}`
		: `${GITHUB_SERVER_URL}/${repository}/actions/workflows/update-forge.yml`;
	const validationNote = failedChecks.length
		? `\nUpdater validation failed at ${failedChecks.map((check) => `\`${check}\``).join(", ")}. The PR remains open so its checks can report the failure and the update can be fixed here. See the [updater run](${workflowRunUrl}).\n`
		: "";
	const body = `Updates cf to [\`${tag}\`](${releaseUrl}).

- pins OpenAPI revision \`${version}\`
- vendors Forge source \`${forgeSourceSha}\` from the matching release tag
- attempts to regenerate the committed SDK and command surface
${validationNote}

This PR is maintained automatically by [the Update Forge workflow](${GITHUB_SERVER_URL}/${repository}/actions/workflows/update-forge.yml).
`;

	logStep("Committing the generated update");
	run("git", ["config", "user.name", "github-actions[bot]"]);
	run("git", ["config", "user.email", UPDATE_COMMIT_EMAIL]);
	run("git", ["add", "--all"]);
	run("git", ["commit", "-m", title]);

	logStep(`Pushing ${UPDATE_BRANCH}`);
	const cfGitEnvironment = githubGitEnvironment(CF_GITHUB_TOKEN);
	const remoteSha = getRemoteBranchSha(cfGitEnvironment);
	const lease = `--force-with-lease=refs/heads/${UPDATE_BRANCH}:${remoteSha ?? ""}`;
	run("git", ["push", lease, "origin", `HEAD:refs/heads/${UPDATE_BRANCH}`], {
		env: cfGitEnvironment,
	});

	logStep("Creating or updating the pull request");
	await createOrUpdatePullRequest(repository, updatePr?.number, title, body);
	if (failedChecks.length > 0) {
		throw new Error(
			`Opened the update PR with failed validation: ${failedChecks.join(", ")}`
		);
	}
}

if (
	process.argv[1] &&
	resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
	main().catch((error: unknown) => {
		console.error(error instanceof Error ? error.message : error);
		process.exitCode = 1;
	});
}
