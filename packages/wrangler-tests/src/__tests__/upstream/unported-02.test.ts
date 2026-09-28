// Generated from cloudflare/workers-sdk@93d72a577. Do not rename cases.
import { describe, it } from "vitest";

const groups = [
	{
		file: "agents-skills-install.test.ts",
		ancestors: [
			"runSkillsInstallFlow with force-install prompt",
			"skip conditions",
		],
		status: "skip",
		names: [
			"skips silently when metadata file exists and sends no metrics",
			"skips silently when metadata file has accepted='unanswered' (user interrupted prompt)",
			"skips silently when metadata file uses the legacy format (no version field) and migrates it on disk",
			"force=true ignores existing metadata file",
			"skips and sends skills_install_skipped when no agents are detected",
			"skips and sends skills_install_skipped when rosie.agents() returns empty",
			"warns and sends skills_install_skipped when rosie.install() throws",
			"sends skills_install_skipped with errorMessage when rosie.agents() throws",
			"skips in CI and sends skills_install_skipped when ci.isCI is true",
			"force=true bypasses CI check and installs skills",
			"sends skills_install_skipped without logging anything in the terminal when TTY is false",
		],
	},
	{
		file: "agents-skills-install.test.ts",
		ancestors: [
			"runSkillsInstallFlow with force-install prompt",
			"user prompt interaction",
		],
		status: "skip",
		names: [
			"writes metadata, sends skills_install_skipped, and does not install when user declines",
			"calls rosie.install, logs success, and sends skills_install_completed when user accepts",
			"writes metadata with accepted='unanswered' before showing the confirm prompt",
			"force=true installs skills without prompting",
			"force=true does not write 'unanswered' metadata before installing",
		],
	},
	{
		file: "agents-skills-install.test.ts",
		ancestors: [
			"runSkillsInstallFlow with force-install prompt",
			"telemetry command property",
		],
		status: "skip",
		names: [
			"includes command in skills_install_completed when provided",
			"includes command in skills_install_skipped when provided",
			"omits command from metrics when not provided",
		],
	},
	{
		file: "agents-skills-install.test.ts",
		ancestors: [
			"runSkillsInstallFlow with force-install prompt",
			"multiple agents",
		],
		status: "skip",
		names: ["detects and installs skills for multiple agents"],
	},
	{
		file: "agents-skills-install.test.ts",
		ancestors: [
			"runSkillsInstallFlow with force-install prompt",
			"install failure",
		],
		status: "skip",
		names: [
			"writes metadata with installFailed when rosie.install() throws",
			"success message excludes agents that failed",
		],
	},
	{
		file: "agents-skills-install.test.ts",
		ancestors: [
			"runSkillsInstallFlow with force-install prompt",
			"metadata file",
		],
		status: "skip",
		names: [
			"writes metadata file with correct content when user accepts",
			"writes metadata file when user declines",
			"does not include installFailed in metadata when user declines",
			"sets installFailed to true when rosie.install() throws",
			"sets installFailed to agent names on partial failure",
			"sets installFailed to false when all agents succeed",
			"records union of previous and current skill names on partial install failure",
			"preserves previous skill names when GitHub API fetch fails during install",
			"falls back to cached tree SHA when post-install fetchSkillsTreeSha fails",
		],
	},
	{
		file: "agents-skills-install.test.ts",
		ancestors: [
			"runSkillsInstallFlow with custom prompt message",
			"skip conditions",
		],
		status: "skip",
		names: [
			"skips silently when metadata file exists",
			"skips silently when metadata file records a decline",
			"skips silently when metadata file has accepted='unanswered'",
			"skips in CI",
			"skips in non-interactive terminal",
			"skips when no agents are detected",
		],
	},
	{
		file: "agents-skills-install.test.ts",
		ancestors: [
			"runSkillsInstallFlow with custom prompt message",
			"prompt message",
		],
		status: "skip",
		names: ["uses the caller-provided prompt message"],
	},
	{
		file: "agents-skills-install.test.ts",
		ancestors: [
			"runSkillsInstallFlow with custom prompt message",
			"user prompt interaction",
		],
		status: "skip",
		names: [
			"installs skills when user accepts",
			"writes metadata with accepted=false when user declines",
		],
	},
	{
		file: "agents-skills-install.test.ts",
		ancestors: ["telemetryCurrentAgentSkillsInstalled"],
		status: "skip",
		names: [
			"resolves to null when no agent is detected",
			"resolves to null when detectAgent returns null id",
			"resolves to null when agent is detected but not in telemetryAgentMappings",
			"resolves to false when GitHub API fetch fails and no cache exists",
			"resolves to false when no skills are present in agent's globalSkillsPath",
			"resolves to 'manual' when some skills exist but no metadata file",
			"resolves to 'automatic' when skills exist and metadata confirms successful install",
			"resolves to 'manual' when metadata says install failed entirely (installFailed: true)",
			"resolves to 'manual' when metadata says install failed for this agent (installFailed: string[])",
			"resolves to 'manual' when agent is not in detectedAgents",
			"resolves to 'manual' when metadata has accepted='unanswered' (user interrupted prompt)",
			"uses cached GitHub API response within TTL",
			"falls back to stale cache when GitHub API returns an error",
			"works with cursor-agent amIVibingId mapping",
			"resolves to 'manual' when skills exist at an alternativeGlobalPath but no metadata",
			"resolves to 'automatic' when skills at alternativeGlobalPath were installed for another agent",
			"resolves to 'manual' when skills at alternativeGlobalPath were installed for another agent but failed",
			"resolves to false when skills are not at primary or any alternativeGlobalPath",
			"memoises the result across multiple calls",
		],
	},
	{
		file: "agents-skills-install.test.ts",
		ancestors: [
			"telemetryCurrentAgentSkillsInstalled",
			"legacy metadata migration",
		],
		status: "skip",
		names: [
			"resolves to 'automatic' when metadata uses the legacy flat AgentInfo schema",
			"migrates legacy metadata to version 1 on disk when read",
			"resolves to 'manual' when legacy metadata says install failed",
		],
	},
	{
		file: "agents-skills-install.test.ts",
		ancestors: ["runSkillsUpdateFlow"],
		status: "skip",
		names: [
			"skips when no metadata file exists",
			"skips when metadata says user declined install",
			"skips when metadata says install failed entirely",
			"skips when installedTreeSha matches remote SHA",
			"skips when user already declined this remote SHA",
			"prompts and updates when upstream SHA is different",
			"records a freshly-fetched tree SHA instead of the cached one after a successful update",
			"writes declinedTreeSha before showing the confirm prompt so an interrupted prompt does not reappear",
			"records declinedTreeSha when user declines and does not opt out of future prompts",
			"persists skipUpdatePrompts when user declines and opts out of future prompts",
			"skips update check when skipUpdatePrompts is set in metadata",
			"prompts again after upstream changes past a previously declined SHA",
			"handles update failure gracefully",
			"retries previously-failed agents on next update run",
			"skips when no managed agent skills exist on disk",
			"skips when skills were installed less than 30 days ago",
			"checks for updates when skills are older than 30 days",
			"prompts when installedTreeSha is missing",
			"back-fills missing skillsTreeSha from a fresh cache and proceeds with update check",
			"removes stale skill directories that no longer exist upstream after a successful update",
			"preserves non-Cloudflare skill directories during update",
			"restores backed-up skill directories when rosieInstall throws during update",
			"restores backed-up skill directories for agents that partially failed during update",
			"preserves backup directory and warns when restore fails after a thrown install",
			"persists installedSkillNames in metadata after successful update",
		],
	},
	{
		file: "agents-skills-install.test.ts",
		ancestors: ["runSkillsInstallFlow cleanup"],
		status: "skip",
		names: [
			"persists installedSkillNames in metadata after successful install",
			"restores backed-up skill directories when rosieInstall throws during install",
		],
	},
	{
		file: "api/startDevWorker/utils.test.ts",
		ancestors: ["isSameUserWorkerOrigin"],
		status: "skip",
		names: [
			"matches same-origin requests regardless of path or query",
			"does not match when the port differs",
			"does not match when the hostname differs",
			"does not match when the protocol differs",
			"does not match when there is no proxyData (UserWorker torn down)",
		],
	},
	{
		file: "api/startDevWorker/utils.test.ts",
		ancestors: ["convertConfigBindingsToStartWorkerBindings"],
		status: "skip",
		names: [
			"converts config bindings into startWorker bindings",
			"prioritizes preview values compared to their standard counterparts",
			"converts programmatic dev stream bindings",
		],
	},
	{
		file: "api/startDevWorker/utils.test.ts",
		ancestors: ["rewriteUrlInHeaderValue"],
		status: "skip",
		names: [
			"rewrites a URL whose host is exactly the proxied host",
			"does not corrupt a subdomain of the proxied host",
			"does not corrupt a host that merely contains the proxied host as a substring",
			"leaves an unrelated host untouched",
			"does not append a trailing slash to a bare origin (e.g. an Origin header)",
			"preserves host-like substrings inside the query string",
			"maps the local dev address back to the proxied host (request path)",
		],
	},
	{
		file: "cf-wrangler/build.test.ts",
		ancestors: ["cf-wrangler build"],
		status: "skip",
		names: ["emits the Build Output Specification tree"],
	},
	{
		file: "cloudchamber/instance-type.test.ts",
		ancestors: ["inferInstanceType"],
		status: "skip",
		names: [
			"returns 'lite' for lite specs (0.0625 vcpu, 256 MiB, 2 GB disk)",
			"normalizes legacy 'standard' alias to 'standard-1' (prevents phantom EDIT diffs)",
			"returns 'basic' for basic specs",
			"returns 'standard-2' for standard-2 specs",
			"returns undefined when config does not match any known instance type",
			"returns undefined when disk is absent",
		],
	},
	{
		file: "containers/registries.test.ts",
		ancestors: ["containers registries configure", "FedRAMP compliance region"],
		status: "todo",
		names: ["should configure AWS ECR registry with interactive prompts"],
	},
	{
		file: "containers/registries.test.ts",
		ancestors: [
			"containers registries configure",
			"FedRAMP compliance region",
			"non-interactive",
		],
		status: "todo",
		names: ["should accept the secret from piped input"],
	},
	{
		file: "containers/registries.test.ts",
		ancestors: [
			"containers registries configure",
			"AWS ECR registry configuration",
		],
		status: "todo",
		names: ["should configure AWS ECR registry with interactive prompts"],
	},
	{
		file: "containers/registries.test.ts",
		ancestors: [
			"containers registries configure",
			"AWS ECR registry configuration",
			"non-interactive",
		],
		status: "todo",
		names: [
			"should accept the secret from piped input",
			"should reuse existing secret without requiring a value (no stdin)",
		],
	},
	{
		file: "containers/registries.test.ts",
		ancestors: [
			"containers registries configure",
			"DockerHub registry configuration",
			"non-interactive",
		],
		status: "todo",
		names: [
			"should accept the secret from piped input",
			"should reuse existing secret without requiring a value (no stdin)",
		],
	},
	{
		file: "containers/registries.test.ts",
		ancestors: ["containers registries list"],
		status: "todo",
		names: ["should output valid JSON when --json flag is used"],
	},
	{
		file: "containers/registries.test.ts",
		ancestors: ["containers registries credentials"],
		status: "todo",
		names: ["should output valid JSON when --json flag is used"],
	},
	{
		file: "d1/execute.test.ts",
		ancestors: ["execute", "duration formatting"],
		status: "todo",
		names: [
			"should preserve quoted CRLF when normalizing commands sent to the remote query API",
		],
	},
	{
		file: "deploy/build.test.ts",
		ancestors: ["deploy", "[define]"],
		status: "skip",
		names: [
			"should be able to define values that will be substituted into top-level identifiers",
			"can be overriden in environments",
			"can be overridden with cli args",
			"can be overridden with cli args containing colons",
		],
	},
	{
		file: "deploy/build.test.ts",
		ancestors: ["deploy", "custom builds"],
		status: "skip",
		names: [
			"should run a custom build before publishing",
			"should run a custom build of multiple steps combined by && before publishing",
			"should throw an error if the entry doesn't exist after the build finishes",
			"should throw an error if the entry is a directory after the build finishes",
			"should minify the script when `--minify` is true (sw)",
			"should minify the script when `minify` in config is true (esm)",
			"should apply esbuild's keep-names functionality by default",
			"should apply esbuild's keep-names functionality unless keep_names is set to false",
		],
	},
	{
		file: "deploy/build.test.ts",
		ancestors: ["deploy", "--node-compat"],
		status: "skip",
		names: [
			"should error when using node compatibility mode",
			"should recommend node compatibility flag when using node builtins and no node compat is enabled",
			"should recommend node compatibility flag when using node builtins and node compat is set only to nodejs_als",
			"should recommend updating the compatibility date when using node builtins and the `nodejs_compat` flag",
			"should recommend updating the compatibility date flag when using no_nodejs_compat and non-prefixed node builtins",
		],
	},
	{
		file: "deploy/build.test.ts",
		ancestors: ["deploy", "unresolved module error messages"],
		status: "skip",
		names: [
			"should recommend alias when a non-Node module cannot be resolved",
			"should NOT recommend alias for Node built-in modules",
		],
	},
	{
		file: "deploy/build.test.ts",
		ancestors: ["deploy", "`nodejs_compat` compatibility flag"],
		status: "skip",
		names: [
			'when absent, should warn on any "external" `node:*` imports',
			'when present, should support "external" `node:*` imports',
			'when present, and compat date is on or after 2024-09-23, should support "external" non-prefixed node imports',
		],
	},
	{
		file: "deploy/build.test.ts",
		ancestors: ["deploy", "bundle reporter"],
		status: "skip",
		names: [
			"should print the bundle size",
			"should print the bundle size, with API errors",
			"should check biggest dependencies when upload fails with script size error",
			"should offer some helpful advice when upload fails with script startup error",
		],
	},
	{
		file: "deploy/build.test.ts",
		ancestors: ["deploy", "bundle reporter", "unit tests"],
		status: "skip",
		names: [
			"should calculate the bundle size",
			"should print the bundle size",
			"should print the top biggest dependencies in the bundle when upload fails",
		],
	},
	{
		file: "deploy/build.test.ts",
		ancestors: ["deploy", "--no-bundle"],
		status: "skip",
		names: [
			"(cli) should not transform the source code before publishing it",
			"(config) should not transform the source code before publishing it",
			"should preserve source phase imports without error",
			"should collect additional modules when find_additional_modules is not set",
			"should not collect additional modules when find_additional_modules is false",
		],
	},
	{
		file: "deploy/build.test.ts",
		ancestors: ["deploy", "--no-bundle --minify"],
		status: "skip",
		names: [
			"should warn that no-bundle and minify can't be used together",
			"should warn that no-bundle and minify can't be used together",
		],
	},
	{
		file: "deploy/build.test.ts",
		ancestors: ["deploy", "source maps"],
		status: "skip",
		names: [
			"should include source map with bundle when upload_source_maps = true",
			"should not include source map with bundle when upload_source_maps = false",
			"should include source maps emitted by custom build when upload_source_maps = true",
			"should include source maps when a //# debugId= comment follows the //# sourceMappingURL= comment",
			"should not include source maps emitted by custom build when upload_source_maps = false",
			"should correctly read sourcemaps with custom wrangler.toml location",
		],
	},
	{
		file: "deploy/formats.test.ts",
		ancestors: ["deploy", "upload rules"],
		status: "skip",
		names: [
			"should be able to define rules for uploading non-js modules (sw)",
			"should be able to define rules for uploading non-js modules (esm)",
			"should be able to use fallthrough:true for multiple rules",
			"should be able to use fallthrough:false for multiple rules",
			"should warn when multiple rules for the same type do not have fallback defined",
			"should be able to preserve file names when defining rules for uploading non-js modules (sw)",
			"should be able to preserve file names when defining rules for uploading non-js modules (esm)",
			"should strip query string suffixes from module names (esm)",
			"should strip query string suffixes from module names with preserve_file_names (esm)",
		],
	},
	{
		file: "deploy/formats.test.ts",
		ancestors: ["deploy", "upload rules", "inject process.env.NODE_ENV"],
		status: "skip",
		names: ["should replace `process.env.NODE_ENV` in scripts"],
	},
	{
		file: "deploy/formats.test.ts",
		ancestors: ["deploy", "service worker format"],
		status: "skip",
		names: [
			"should error if trying to import a cloudflare prefixed external when in service worker format",
			"should error if importing a node.js library when in service worker format",
			"should error if nodejs_compat (v2) is turned on when in service worker format",
		],
	},
	{
		file: "deploy/formats.test.ts",
		ancestors: ["deploy", "legacy module specifiers"],
		status: "skip",
		names: [
			"should work with legacy module specifiers, with a deprecation warning (1)",
			"should work with legacy module specifiers, with a deprecation warning (2)",
			"should work with legacy module specifiers, with a deprecation warning (3)",
			"should not match regular module specifiers when there aren't any possible legacy module matches",
		],
	},
	{
		file: "deploy/formats.test.ts",
		ancestors: ["deploy", "tsconfig"],
		status: "skip",
		names: [
			"should use compilerOptions.paths to resolve modules",
			"should use compilerOptions.paths to resolve non-js modules with module rules",
			"should output to target es2022 even if tsconfig says otherwise",
		],
	},
	{
		file: "deploy/formats.test.ts",
		ancestors: ["deploy", "--outdir"],
		status: "skip",
		names: [
			"should generate built assets at --outdir if specified",
			"should copy any module imports related assets to --outdir if specified",
			"should copy source phase wasm imports to --outdir if specified",
		],
	},
	{
		file: "deploy/formats.test.ts",
		ancestors: ["deploy", "--outfile"],
		status: "skip",
		names: [
			"should generate worker bundle at --outfile if specified",
			"should include any module imports related assets in the worker bundle",
			"should include source phase wasm imports in the worker bundle",
			"should include bindings in the worker bundle",
		],
	},
	{
		file: "deploy/formats.test.ts",
		ancestors: ["deploy", "--metafile"],
		status: "skip",
		names: [
			"should output a metafile when --metafile is set",
			"should output a metafile when --metafile=./meta.json is set",
		],
	},
	{
		file: "deployment-bundle/source-maps.test.ts",
		ancestors: ["loadSourceMaps"],
		status: "skip",
		names: [
			"loads source maps from bundled metadata",
			"throws when bundled source map file is missing",
			"scans modules for sourceMappingURL when bundle has no metadata",
			"handles multiple modules with source maps in scan mode",
		],
	},
	{
		file: "deployment-bundle/source-maps.test.ts",
		ancestors: ["tryAttachSourcemapToModule"],
		status: "skip",
		names: [
			"attaches source map when module has file path and sourceMappingURL",
			"does nothing for non-js module types",
			"does nothing for virtual modules without filePath",
			"does nothing when module has no sourceMappingURL comment",
			"throws when sourceMappingURL points to missing file",
		],
	},
	{
		file: "fetch-graphql-result.test.ts",
		ancestors: ["fetchGraphqlResult"],
		status: "skip",
		names: [
			"should make a request against the graphql endpoint by default",
			"should accept a request with no init, but return no data",
		],
	},
	{
		file: "match-tag.test.ts",
		ancestors: ["match-tag", "happy path"],
		status: "skip",
		names: ["throws no errors", "ignores errors if no tag match provided"],
	},
	{
		file: "match-tag.test.ts",
		ancestors: ["match-tag", "error cases"],
		status: "skip",
		names: [
			"catches worker not found from API and throws validation error",
			"catches all other API errors and throws proper error",
			"catches all other errors and throws generic error",
			"throws validation error if tag mismatches",
			"throws validation error if account_id mismatches",
		],
	},
	{
		file: "match-tag.test.ts",
		ancestors: ["match-tag", "error cases", "deploy"],
		status: "skip",
		names: [
			"catches worker not found from API and throws validation error",
			"catches all other API errors and throws generic validation error",
			"throws validation error if tag mismatches",
			"throws validation error if account_id mismatches",
			"throws validation error if account_id mismatches w/ custom wrangler.toml path",
		],
	},
	{
		file: "pages/deployment-list.test.ts",
		ancestors: ["pages deployment list"],
		status: "todo",
		names: [
			"should make request to list deployments",
			"should pass no environment",
			"should pass production environment with flag",
			"should pass preview environment with flag",
		],
	},
	{
		file: "pages/deployment-list.test.ts",
		ancestors: ["pages deployment list"],
		status: "skip",
		names: [
			"should make request to list deployments and return result as json",
			"should prefer CLOUDFLARE_ACCOUNT_ID over cached account id",
		],
	},
	{
		file: "pages/routes-validation.test.ts",
		ancestors: ["routes-validation adapter"],
		status: "skip",
		names: [
			"converts invalid JSON specs to FatalError",
			"converts missing include rules to FatalError",
			"converts too many rules to FatalError",
			"converts rules that are too long to FatalError",
			"converts invalid rules to FatalError",
			"converts overlapping rules to FatalError",
			"preserves unexpected validation errors",
		],
	},
	{
		file: "process-env-populated.test.ts",
		ancestors: ["isProcessEnvPopulated"],
		status: "skip",
		names: [
			"default",
			"future date",
			"old date",
			"switch date",
			"old date, but with flag",
			"old date, with disable flag",
			"future date, but with disable flag",
			"future date, with enable flag",
			"future date without nodejs_compat",
			"date where nodejs_compat is on by default, without the flag",
			"date where nodejs_compat is on by default, opted out with no_nodejs_compat",
			"date where nodejs_compat is on by default, with disable flag",
			"future date, with enable flag but without nodejs_compat",
			"errors with disable and enable flags specified",
		],
	},
	{
		file: "triggers.test.ts",
		ancestors: ["triggers deploy"],
		status: "skip",
		names: ["uses a redirected deploy configuration"],
	},
	{
		file: "utils/format-message.test.ts",
		ancestors: ["formatMessage"],
		status: "skip",
		names: [
			"should format message without location",
			"should format message with location",
			"should format message with location and notes",
		],
	},
	{
		file: "zones.test.ts",
		ancestors: ["Zones", "getZoneForRoute", "getZoneFromRoute"],
		status: "skip",
		names: [
			"returns the URL host for a SimpleRoute (string)",
			"returns `zone_name` for a ZoneNameRoute (subdomain pattern)",
			"returns `zone_name` for a ZoneNameRoute (apex pattern)",
			"returns `zone_name` for a ZoneNameRoute with the unparseable `*/*` pattern",
			"returns `undefined` when the pattern is unparseable and no `zone_name` is available",
			"falls back to the pattern hostname for a ZoneIdRoute",
			"falls back to the pattern hostname for a CustomDomainRoute",
		],
	},
] as const;

function register(group: (typeof groups)[number], depth = 0): void {
	const ancestor = group.ancestors[depth];
	if (ancestor !== undefined) {
		describe(ancestor, () => register(group, depth + 1));
		return;
	}
	for (const name of group.names) {
		if (group.status === "todo") {
			it.todo(name);
		} else {
			it.skip(name);
		}
	}
}

for (const group of groups) {
	register(group);
}
