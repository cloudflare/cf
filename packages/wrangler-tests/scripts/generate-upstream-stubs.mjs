import fs from "node:fs";
import path from "node:path";

const [
	upstreamInventoryPath,
	localInventoryPath,
	referenceTestsRoot,
	localTestsRoot,
	shardText,
	shardCountText,
	outputFile,
	manifestFile,
] = process.argv.slice(2);

if (
	!upstreamInventoryPath ||
	!localInventoryPath ||
	!referenceTestsRoot ||
	!localTestsRoot ||
	!shardText ||
	!shardCountText
) {
	throw new Error(
		"Usage: node generate-upstream-stubs.mjs <upstream-list.json> <local-list.json> <upstream-tests-dir> <local-tests-dir> <shard> <shard-count> [output-file] [manifest-file]"
	);
}

const shard = Number(shardText);
const shardCount = Number(shardCountText);
const upstreamInventory = JSON.parse(
	fs.readFileSync(upstreamInventoryPath, "utf8")
);
const localInventory = JSON.parse(fs.readFileSync(localInventoryPath, "utf8"));

function flattenInventory(inventory) {
	if (Array.isArray(inventory)) {
		throw new Error("Use a full Vitest JSON report, not `vitest list` output");
	}
	return inventory.testResults.flatMap((result) =>
		result.assertionResults.map((assertion) => ({
			file: result.name,
			ancestors: assertion.ancestorTitles ?? [],
			name: assertion.title,
			status: assertion.status,
		}))
	);
}

function upstreamTestFile(file) {
	const relative = path.relative(
		path.resolve(referenceTestsRoot),
		path.resolve(file)
	);
	const sourcePrefix = path.join("src", "__tests__") + path.sep;
	return relative.startsWith(sourcePrefix)
		? relative.slice(sourcePrefix.length)
		: relative;
}

function localTestFile(file) {
	return path.relative(path.resolve(localTestsRoot), path.resolve(file));
}

function leafKey(file, name) {
	return `${file}\0${name}`;
}

const upstreamTests = flattenInventory(upstreamInventory).map((test) => ({
	...test,
	file: upstreamTestFile(test.file),
}));
const upstreamLeafCounts = new Map();
for (const test of upstreamTests) {
	const testKey = leafKey(test.file, test.name);
	upstreamLeafCounts.set(testKey, (upstreamLeafCounts.get(testKey) ?? 0) + 1);
}

function identity(file, test) {
	const leaf = leafKey(file, test.name);
	if ((upstreamLeafCounts.get(leaf) ?? 0) <= 1) {
		return test.name;
	}
	return [...test.ancestors, test.name].join("\0");
}

function key(file, test) {
	return `${file}\0${identity(file, test)}`;
}

// Missing cases are todos by default. Every entry here has been audited as
// Wrangler implementation machinery or behavior that conflicts with cf's
// explicit config/build/output design.
const skippedFiles = new Set([
	"agents-skills-install.test.ts",
	"api.test.ts",
	"assets.test.ts",
	"auth-credentials.test.ts",
	"banner.test.ts",
	"build-output.test.ts",
	"case-insensitive-env.test.ts",
	"check-fetch.test.ts",
	"cli-hotkeys.test.ts",
	"complete.test.ts",
	"core/command-registration.test.ts",
	"custom-build.test.ts",
	"deployment-bundle/build-container-images.test.ts",
	"deployment-bundle/source-maps.test.ts",
	"dev.test.ts",
	"errors.test.ts",
	"experimental-commands-api.test.ts",
	"experimental-config/convert.test.ts",
	"fetch-graphql-result.test.ts",
	"find-additional-modules.test.ts",
	"friendly-validator-errors.test.ts",
	"get-entry.test.ts",
	"guess-worker-format.test.ts",
	"init.test.ts",
	"is-local.test.ts",
	"logger.test.ts",
	"match-tag.test.ts",
	"metrics.test.ts",
	"metrics/sanitization.test.ts",
	"middleware.scheduled.test.ts",
	"middleware.test.ts",
	"navigator-user-agent.test.ts",
	"output.test.ts",
	"pages/build-functions-errors.test.ts",
	"pages/delegate-to-workers.test.ts",
	"pages/delegation-commands.test.ts",
	"pages/pages-build-env.test.ts",
	"pages/pages-download-config.test.ts",
	"pages/pages.test.ts",
	"pages/routes-validation.test.ts",
	"pages/run-workers-deploy.test.ts",
	"pages/utf8-truncation.test.ts",
	"paths.test.ts",
	"preview-config.test.ts",
	"preview/containers.test.ts",
	"print-bindings.test.ts",
	"process-env-populated.test.ts",
	"provision.test.ts",
	"register-yargs-command-skills.test.ts",
	"sentry.test.ts",
	"startup-profiling.test.ts",
	"templates/__tests__/pages-dev-util.test.ts",
	"triggers.test.ts",
	"type-generation-pipeline-schema.test.ts",
	"type-generation.test.ts",
	"unstable-get-miniflare-worker-options.test.ts",
	"update-config-file.test.ts",
	"zones.test.ts",
]);

const skippedPrefixes = [
	"api/startDevWorker/",
	"cf-wrangler/",
	"config/",
	"create-worker-upload-form/",
	"dev/",
	"utils/",
];

const skippedCloudchamberFiles = new Set([
	"apply.test.ts",
	"build.test.ts",
	"common.test.ts",
	"curl.test.ts",
	"instance-type.test.ts",
]);

const skippedD1Files = new Set([
	"convert-timestamp-to-iso.test.ts",
	"export.test.ts",
	"info.test.ts",
	"splitter.test.ts",
	"trimmer.test.ts",
	"utils.test.ts",
]);

const skippedDeployFiles = new Set([
	"build.test.ts",
	"config-args-merging.test.ts",
	"deploy-interactive-prompts.test.ts",
	"entry-points.test.ts",
	"formats.test.ts",
	"get-config-patch.test.ts",
	"get-remote-config-diff.test.ts",
	"legacy-assets.test.ts",
	"name-collision-guard.test.ts",
	"open-next.test.ts",
]);

// These files contain both cf-compatible situations and cases coupled to
// Wrangler's config, metrics, temporary-account, or auth-command design.
// Keeping the exceptions next to the file defaults prevents the generated
// fallback inventory from hiding missing cf behavior behind `it.skip()`.
const skippedCases = new Map([
	[
		"agent-memory.test.ts",
		new Set([
			"should list namespaces in a table",
			"should print a message when no namespaces exist",
			"should get a namespace in a table",
		]),
	],
	[
		"artifacts.test.ts",
		new Set([
			"should list namespaces in human mode",
			"should get a namespace in human mode",
			"should create a repo in human mode without sending secrets through the logger",
			"should get a repo in human mode",
			"should issue a repo token in human mode without sending plaintext through the logger",
		]),
	],
	[
		"d1/migrate.test.ts",
		new Set([
			"should reject the --local flag for create",
			"should error when no config file is present",
			"should try to read D1 config from wrangler.toml",
			"should throw a clear error when executeSql returns null (execution cancelled)",
			"should try to read D1 config from wrangler.toml when logged in",
		]),
	],
	[
		"d1/migrations/helpers.test.ts",
		new Set([
			"rejects migrations_pattern set without an explicit migrations_dir, with an actionable hint",
		]),
	],
	[
		"index.test.ts",
		new Set([
			"should not require temporary terms acceptance before root help",
			"is rejected on commands that don't opt in",
		]),
	],
	[
		"logout.test.ts",
		new Set([
			"should clear a cached temporary preview account when not logged in via OAuth",
		]),
	],
	[
		"pages/deployment-delete.test.ts",
		new Set(["should prefer CLOUDFLARE_ACCOUNT_ID over cached account id"]),
	],
	[
		"pages/deployment-list.test.ts",
		new Set([
			"should make request to list deployments and return result as json",
			"should prefer CLOUDFLARE_ACCOUNT_ID over cached account id",
		]),
	],
	[
		"pages/project-list.test.ts",
		new Set([
			"should override cached accountId with CLOUDFLARE_ACCOUNT_ID environmental variable if provided",
		]),
	],
	[
		"pages/secret.test.ts",
		new Set([
			"should error if request for available memberships fails",
			"should prefer CLOUDFLARE_ACCOUNT_ID over cached account id",
		]),
	],
	[
		"queues/queues-subscription.test.ts",
		new Set([
			"should show message when no subscriptions exist",
			"should render the sending domain as the resource for email.sending source",
			"should error when no fields provided",
		]),
	],
	[
		"secret.test.ts",
		new Set([
			"should not warn if the wrangler config contains environments and CLOUDFLARE_ENV is set",
			'should not warn if --env="" is passed to explicitly target the top-level environment',
		]),
	],
	[
		"tail.test.ts",
		new Set([
			"creates and then delete tails: legacy envs",
			"creates and then delete tails: service envs",
			"should error helpfully if pages_build_output_dir is set in wrangler.toml",
		]),
	],
	[
		"user.test.ts",
		new Set([
			"should clear the cached temporary preview account when logging in",
			"should send the `login user` metric when `--scopes` is provided",
			"--use-keyring stores credentials in an encrypted file with a key in the OS keyring",
			"--no-use-keyring scrubs encrypted credentials without writing them to plaintext, then the fresh login uses the file store",
			"--no-use-keyring still scrubs the encrypted credentials and keyring entry when CLOUDFLARE_AUTH_USE_KEYRING=false is set (the env var must not defeat the opt-out scrub)",
			"--use-keyring rolls the keyring_enabled preference back when eager credential-store validation throws",
			"--use-keyring rolls the keyring_enabled preference back when the resolver soft-falls-back to the file store",
			"--use-keyring persists the preference and skips the misleading rollback when CLOUDFLARE_AUTH_USE_KEYRING=false overrides for this command",
			"`auth keyring enable` persists the preference without requiring a login",
			"`auth keyring enable` rolls the preference back when the keyring backend is unavailable",
			"`auth keyring disable` scrubs the default profile's encrypted credentials",
			"`auth keyring disable` scrubs encrypted credentials created via the env var even when the preference was never persisted",
			"`auth keyring` with no action reports the current setting without changing it",
			"`auth keyring` rejects the --profile flag",
			"should complete login on the first successful poll",
			"should display the effective timeout when the server's `expires_in` is shorter than the 5-minute cap",
			"should fall back to constructing a verification URL when the server omits `verification_uri_complete`",
			"should not open the browser when `--browser=false`",
			"should keep polling while the server returns `authorization_pending`, then succeed",
			"should keep polling when a poll fails transiently (non-JSON body), then succeed",
			"should time out with a message reflecting the server's `expires_in` when shorter than the cap",
			"should error with a clear message when the user denies consent",
			"should error with a clear message when the device code expires",
			"should error when `--callback-host` is passed alongside `--device`",
			"should error when `--callback-port` is passed alongside `--device`",
			"should reject the incompatible flag combination before `--no-use-keyring` mutates any credential-storage state",
			"should prefer config.account_id over env var and cache",
		]),
	],
	[
		"whoami.test.ts",
		new Set([
			"should suggest a temporary preview account when not authenticated",
		]),
	],
	[
		"workflows.test.ts",
		new Set([
			"should reject workflow binding with name with invalid characters",
			"should accept workflow binding with valid concurrency",
			"should accept workflow binding with empty concurrency object",
			"should accept workflow binding with concurrency.limit at boundary value 1",
			"should reject workflow binding with concurrency.limit of 0",
			"should reject workflow binding with non-integer concurrency.limit",
			"should reject workflow binding with negative concurrency.limit",
			"should reject workflow binding with non-object concurrency",
			"should reject workflow binding with array concurrency",
			"should warn on unexpected fields in workflow binding concurrency",
		]),
	],
]);

function isPatternSkip(file, name) {
	// Do not classify solely from stale Wrangler switch names. cf emits JSON by
	// default and uses --force for confirmation bypasses, so those canonical
	// situations can pass even though a title still says --json, --yes, or
	// --skip-confirmation.
	if (file === "deploy/assets.test.ts") {
		return (
			name.startsWith("should use the directory specified in the CLI") ||
			/config\.site|specified by (the )?(assets )?config|specified by flag --assets|relative to wrangler\.toml|relative to cwd/.test(
				name
			) ||
			/deploy metrics|^returns (value from JWT claim|default when)/.test(name)
		);
	}
	if (file === "deploy/bindings.test.ts") {
		return (
			/(wasm modules|text blobs|data blobs|service-worker worker|capnp)/.test(
				name
			) ||
			name === "should render config vars literally and --var as hidden" ||
			name === "should read vars passed as cli arguments"
		);
	}
	if (file === "deploy/config-remote.test.ts") {
		return !new Set([
			"should warn the user when the deployment would (likely unintentionally) override remote secrets",
			"should handle the remote secrets fetching check for new workers",
			"should not fetch remote secrets in dry-run mode",
			"should abort the deployment when it would (likely unintentionally) override remote secrets in non-interactive strict mode",
		]).has(name);
	}
	if (file === "deploy/core.test.ts") {
		return !new Set([
			"should not deploy if there's any other kind of error when checking deployment source",
			"drops a user into the login flow if they're unauthenticated",
			"should not throw an error in non-TTY if 'CLOUDFLARE_API_TOKEN' & 'account_id' are in scope",
			"should not throw an error if 'CLOUDFLARE_ACCOUNT_ID' & 'CLOUDFLARE_API_TOKEN' are in scope",
			"should throw an error in non-TTY & there is more than one account associated with API token",
			"should redact account names in CI even when non-interactive",
			"should throw error in non-TTY if 'CLOUDFLARE_API_TOKEN' is missing",
			"should throw error with no account ID provided and no members retrieved",
			"should warn user when worker was last deployed from api",
		]).has(name);
	}
	if (file === "deploy/durable-objects.test.ts") {
		return (
			name === "should upload python module defined in wrangler.toml" ||
			name === "should print vendor modules correctly in table" ||
			name === "should upload python module specified in CLI args"
		);
	}
	if (file === "deploy/environments.test.ts") {
		return (
			/^(has environments|no environments|no top-level name|displays warning when error updating tags|environments with redirected config)/.test(
				name
			) || /wrangler config|redirected wrangler config|--env=""/.test(name)
		);
	}
	if (file === "deploy/routes.test.ts") {
		return (
			name === "should deploy to legacy environment specific routes" ||
			/domain flags|--domain flag/.test(name)
		);
	}
	if (file === "deploy/workers-dev.test.ts") {
		return /environment|compatibility_date|compatibility_flags|project name|\(environments|remote/.test(
			name
		);
	}
	if (file === "experimental-config/load.test.ts") {
		return !new Set([
			"threads accountId and complianceRegion from the settings export",
			"leaves settings undefined when there is no settings export",
		]).has(name);
	}
	if (file === "secret.test.ts") {
		return (
			/pages_build_output_dir|wrangler config (contains|doesn't contain) environments|--env=""/.test(
				name
			) ||
			/: (legacy|service) envs$/.test(name) ||
			name === "should use the account from wrangler.toml"
		);
	}
	if (file === "tail.test.ts") {
		return (
			name === "creates and then delete tails: legacy envs" ||
			name === "creates and then delete tails: service envs" ||
			name ===
				"should error helpfully if pages_build_output_dir is set in wrangler.toml"
		);
	}
	if (file === "user.test.ts") {
		return (
			/keyring|--use-keyring|--no-use-keyring/.test(name) ||
			/device|first successful poll|effective timeout|verification URL|authorization_pending|poll fails transiently/.test(
				name
			) ||
			/^should (output|refresh and output|error when not logged in)/.test(
				name
			) ||
			name === "login works in a different environment" ||
			name === "should have auth per environment" ||
			name === "should not warn on invalid wrangler.toml when logging in" ||
			name === "should prefer config.account_id over env var and cache"
		);
	}
	if (file === "whoami.test.ts") {
		return (
			/Global API Key|api_token field|membership role|membership error|configured account|--account|should not redact/.test(
				name
			) ||
			name ===
				"should distinguish between account and user API tokens when displaying token permissions"
		);
	}
	if (file === "workflows.test.ts") {
		return /workflows? binding/.test(name);
	}
	if (file === "cloudchamber/create.test.ts") {
		return name.startsWith("properly reads wrangler config");
	}
	if (file === "d1/create.test.ts") {
		return name === "should throw if local flag is provided";
	}
	if (
		file === "pages/project-create.test.ts" ||
		file === "pages/project-delete.test.ts"
	) {
		return /cached account ?id/i.test(name);
	}
	if (file === "pages/pages-deployment-tail.test.ts") {
		return (
			name === "activates debug mode when the cli arg is passed in" ||
			/^(logs (request|scheduled|alarm|email|queue) messages in (JSON|json|pretty) format|defaults to logging in (pretty|json) format when the output is (a TTY|not a TTY)|logs console messages and exceptions)$/.test(
				name
			)
		);
	}
	if (file === "queues/queues-subscription.test.ts") {
		return (
			name === "should show message when no subscriptions exist" ||
			name ===
				"should render the sending domain as the resource for email.sending source"
		);
	}
	if (file === "queues/queues.test.ts") {
		return (
			/^should show empty message when queue has no (consumers|worker consumers|http consumers)$/.test(
				name
			) || name === "should show the correct help text"
		);
	}
	if (file === "pages/deploy.test.ts") {
		return (
			name === "should be aliased with 'wrangler pages deploy'" ||
			name ===
				"should include the account name in the error when it is available in cache" ||
			name ===
				"should suggest `wrangler deploy` if a Workers config is detected when deploying to a non-existent Pages project" ||
			name ===
				"should prefer the CLOUDFLARE_ACCOUNT_ID environment variable over a stale cached account id in pages.json" ||
			/\b(bundle|bundling|no-bundle|no_bundle)\b/.test(name) ||
			/custom config file path|warn and ignore the config file/.test(name) ||
			/^should support wrangler\.(json|toml)$/.test(name) ||
			name.startsWith(
				"should always deploy to the Pages project specified by the top-level `name` configuration field"
			) ||
			/git detection|git summary|alias url/.test(name) ||
			name === "ignores custom domains" ||
			name === "continues to work fine if no aliases"
		);
	}
	if (file === "preview.base-config.secret.test.ts") {
		return (
			name === "does not inherit the preview script positional" ||
			/respects env-specific worker name/.test(name) ||
			name.startsWith("lists only secrets and never leaks their values") ||
			name === "shows (none) when the base config has no secrets"
		);
	}
	if (file === "preview.secret.test.ts") {
		return (
			name === "notes when the new Preview deployment has no active URLs" ||
			name === "defaults the Preview name to the current git branch" ||
			name ===
				"fails clearly when no name is given and there is no git branch" ||
			/env-specific worker name/.test(name) ||
			name.startsWith("lists only secrets and never leaks their values")
		);
	}
	if (file === "preview.test.ts") {
		return (
			/^should (prefer the Workers CI branch env var|use the GitHub Actions branch env vars|use the GitLab branch env var|join worker name, preview slug, and class name with underscores|normalise |keep apart worker names|cap the name)/.test(
				name
			) ||
			/(GitHub|GitLab|CircleCI|git remote|pull request|GITHUB_REF|commit SHA|COMMIT_SHA|blank title|HEAD commit metadata)/.test(
				name
			) ||
			name.startsWith("should extract ") ||
			name === "should return empty object when no previews block" ||
			/^should pass cross_account_grant|^should fold unsafe\.bindings/.test(
				name
			) ||
			/^resolves subdomain settings without applying production triggers$/.test(
				name
			) ||
			/JSON output|redirected config|local previews config|top-level bindings/.test(
				name
			) ||
			/container/i.test(name) ||
			name === "should name applications from the resolved worker name" ||
			/^should use previews\.(define|durable_objects|workflows)/.test(name) ||
			/^should (inherit top-level previews config|use env-specific previews config|include previews\.cache|prefer previews\.cache|respect env-specific worker name|fail before making API calls when env-specific previews config)/.test(
				name
			)
		);
	}
	return false;
}

function shouldWorkInCf(file, name) {
	return !(
		skippedFiles.has(file) ||
		skippedPrefixes.some((prefix) => file.startsWith(prefix)) ||
		(file.startsWith("config") && file.endsWith(".test.ts")) ||
		file.startsWith("utils-") ||
		(file.startsWith("cloudchamber/") &&
			skippedCloudchamberFiles.has(file.slice("cloudchamber/".length))) ||
		(file.startsWith("d1/") && skippedD1Files.has(file.slice("d1/".length))) ||
		(file.startsWith("deploy/") &&
			skippedDeployFiles.has(file.slice("deploy/".length))) ||
		skippedCases.get(file)?.has(name) ||
		isPatternSkip(file, name)
	);
}

const localStatuses = new Map();
for (const test of flattenInventory(localInventory)) {
	const file = localTestFile(test.file);
	if (file.startsWith(`upstream${path.sep}`)) {
		continue;
	}
	const testKey = key(file, test);
	const statuses = localStatuses.get(testKey) ?? [];
	statuses.push(test.status);
	localStatuses.set(testKey, statuses);
}

const missingByFile = new Map();
const manifestEntries = [];
for (const test of upstreamTests) {
	const file = test.file;
	const testKey = key(file, test);
	const statuses = localStatuses.get(testKey) ?? [];
	const localStatus = statuses.shift();
	if (localStatus !== undefined) {
		if (!["passed", "skipped", "todo"].includes(localStatus)) {
			throw new Error(
				`Cannot generate a manifest containing ${localStatus}: ${file} ${test.name}`
			);
		}
		manifestEntries.push({ ...test, status: localStatus });
		continue;
	}
	const tests = missingByFile.get(file) ?? [];
	tests.push(test);
	missingByFile.set(file, tests);
	manifestEntries.push({
		...test,
		status: shouldWorkInCf(file, test.name) ? "todo" : "skipped",
	});
}

const groups = [...missingByFile]
	.sort(([left], [right]) => left.localeCompare(right))
	.filter((_, index) => index % shardCount === shard)
	.flatMap(([file, tests]) => {
		const grouped = new Map();
		for (const test of tests) {
			const status = shouldWorkInCf(file, test.name) ? "todo" : "skip";
			const groupKey = `${status}\0${JSON.stringify(test.ancestors)}`;
			const group = grouped.get(groupKey) ?? {
				file,
				ancestors: test.ancestors,
				status,
				names: [],
			};
			group.names.push(test.name);
			grouped.set(groupKey, group);
		}
		return [...grouped.values()];
	});

const source =
	"// Generated from cloudflare/workers-sdk@c2bb4c815. Do not rename cases.\n" +
	'import { describe, it } from "vitest";\n\n' +
	`const groups = ${JSON.stringify(groups, null, "\t")} as const;\n\n` +
	"function register(group: (typeof groups)[number], depth = 0): void {\n" +
	"\tconst ancestor = group.ancestors[depth];\n" +
	"\tif (ancestor !== undefined) {\n" +
	"\t\tdescribe(ancestor, () => register(group, depth + 1));\n" +
	"\t\treturn;\n" +
	"\t}\n" +
	"\tfor (const name of group.names) {\n" +
	'\t\tif (group.status === "todo") {\n' +
	"\t\t\tit.todo(name);\n" +
	"\t\t} else {\n" +
	"\t\t\tit.skip(name);\n" +
	"\t\t}\n" +
	"\t}\n" +
	"}\n\n" +
	"for (const group of groups) {\n" +
	"\tregister(group);\n" +
	"}\n";

if (outputFile) {
	fs.writeFileSync(outputFile, source);
} else {
	process.stdout.write(source);
}

if (manifestFile) {
	const counts = { passing: 0, skip: 0, todo: 0 };
	const displayStatus = (status) =>
		status === "passed" ? "passing" : status === "skipped" ? "skip" : status;
	for (const entry of manifestEntries) {
		counts[displayStatus(entry.status)]++;
	}
	const codeCell = (value) =>
		`<code>${value
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;")
			.replaceAll("|", "&#124;")
			.replaceAll("_", "&#95;")
			.replaceAll("*", "&#42;")
			.replaceAll("`", "&#96;")
			.replaceAll("\n", " ")}</code>`;
	const rows = manifestEntries.map((entry) => {
		const canonicalName = [...entry.ancestors, entry.name].join(" › ");
		return `| ${codeCell(entry.file)} | ${codeCell(canonicalName)} | ${displayStatus(entry.status)} |`;
	});
	const manifest = `# Wrangler compatibility manifest

Generated from \`cloudflare/workers-sdk@c2bb4c815f8a6af2ebea17ab6dd4f612c7b1e8eb\`.
Test names and ancestry are canonical Wrangler identities. Statuses describe
their representation in cf: \`passing\`, \`todo\`, or \`skip\`.

| Status | Count |
| --- | ---: |
| passing | ${counts.passing} |
| todo | ${counts.todo} |
| skip | ${counts.skip} |
| **total** | **${manifestEntries.length}** |

| Wrangler file | Wrangler test | cf status |
| --- | --- | --- |
${rows.join("\n")}
`;
	fs.writeFileSync(manifestFile, manifest);
}
