import { readFileSync } from "node:fs";
import { join } from "node:path";
import satisfies from "semver/functions/satisfies.js";
import { CliExit } from "../../lib/cli-exit.js";
import { errorBlock, theme } from "../../lib/ui/index.js";
import { GUIDE_WIDTH } from "../../lib/ui/log.js";
import { discoverImpls, type DiscoveredImpl } from "./discover.js";
import { KNOWN_IMPLS, type KnownImpl } from "./known-impls.js";

type ImplCompatibility = Pick<
	KnownImpl,
	"pkg" | "versionConstraint" | "installCommands"
>;

// Native Vite commands still need the plugin release that understands cf profiles.
export function validateVitePluginCompatibility(cwd: string): void {
	const pkg = "@cloudflare/vite-plugin";
	let installedVersion: string | undefined;
	try {
		const manifest = JSON.parse(
			readFileSync(join(cwd, "package.json"), "utf8")
		) as Record<string, Record<string, unknown> | undefined>;
		if (
			![
				"dependencies",
				"devDependencies",
				"peerDependencies",
				"optionalDependencies",
			].some((field) => manifest[field]?.[pkg] !== undefined)
		) {
			return;
		}
		const installed = JSON.parse(
			readFileSync(join(cwd, "node_modules", pkg, "package.json"), "utf8")
		) as { version?: unknown };
		installedVersion =
			typeof installed.version === "string" ? installed.version : undefined;
	} catch {
		return;
	}
	// Autoconfig handles missing packages and incompatible plugin majors.
	if (
		isVersionCompatible(installedVersion, ">=2.0.0-0 <3.0.0-0") &&
		!isVersionCompatible(installedVersion, ">=2.0.0-beta.v.13 <3.0.0-0")
	) {
		incompatibleVersionError({
			installedVersion,
			impl: {
				pkg,
				versionConstraint: {
					range: ">=2.0.0-beta.v.13 <3.0.0-0",
					display: "@cloudflare/vite-plugin v2 beta (2.0.0-beta.v.13 or newer)",
				},
				installCommands: [
					"npm install --save-dev @cloudflare/vite-plugin@beta",
				],
			},
		});
		throw new CliExit(1);
	}
}

export function resolveProjectImpl(cwd: string): DiscoveredImpl {
	const discovered = discoverImpls(cwd);

	if (discovered.length === 0) {
		noImplError(cwd);
		throw new CliExit(1);
	}

	if (discovered.length > 1) {
		multipleImplsError(discovered);
		throw new CliExit(1);
	}

	const [picked] = discovered;
	if (!picked) {
		throw new CliExit(1);
	}

	if (!picked.binary) {
		notInstalledError(picked);
		throw new CliExit(1);
	}
	if (
		picked.impl.versionConstraint !== undefined &&
		!isVersionCompatible(
			picked.installedVersion,
			picked.impl.versionConstraint.range
		)
	) {
		incompatibleVersionError(picked);
		throw new CliExit(1);
	}

	return picked;
}

function isVersionCompatible(
	installed: string | undefined,
	range: string
): boolean {
	return (
		installed !== undefined &&
		satisfies(installed, range, { includePrerelease: true })
	);
}

function incompatibleVersionError(d: {
	impl: ImplCompatibility;
	installedVersion?: string;
}): void {
	printError(
		`${d.impl.pkg}@${d.installedVersion ?? "unknown"} is installed, but it is not compatible with cf's local runtime.`,
		requiredVersionMessage(d),
		d.impl
	);
}

function requiredVersionMessage(d: { impl: ImplCompatibility }): string {
	const requirement =
		d.impl.versionConstraint?.display ?? "a compatible version";
	return `cf requires ${requirement} for cf dev, cf build, cf deploy, and cf previews deploy.`;
}

function noImplError(cwd: string): void {
	console.error(
		errorBlock(
			`No Cloudflare dev server is installed in ${cwd}.`,
			"Checked package.json, pyproject.toml and Cargo.toml."
		)
	);
	console.error("\nInstall one of these:");
	console.error(
		`\n${theme.bold("@cloudflare/vite-plugin")}  ${theme.muted("Vite-based dev server (recommended for JavaScript/TypeScript)")}\n` +
			`${" ".repeat(GUIDE_WIDTH)}${theme.code("npm install --save-dev @cloudflare/vite-plugin@beta vite")}`
	);
	for (const impl of KNOWN_IMPLS) {
		console.error(
			`\n${theme.bold(impl.pkg)}  ${theme.muted(impl.description)}`
		);
		printInstallCommands(impl);
	}
}

function multipleImplsError(discovered: DiscoveredImpl[]): void {
	console.error(
		errorBlock(
			"Multiple Cloudflare dev-server implementations are configured.",
			[
				...discovered.map((d) => `${d.impl.pkg} (${d.manifestPath})`),
				"",
				"A project can only use one dev-server. Remove all but one from your project's manifest and try again.",
			].join("\n")
		)
	);
}

function notInstalledError(d: DiscoveredImpl): void {
	if (d.installed && d.impl.versionConstraint) {
		printError(
			`${d.impl.pkg} is declared in ${d.manifestPath}, but this installation does not include the cf delegate.`,
			requiredVersionMessage(d),
			d.impl
		);
		return;
	}
	printError(
		`${d.impl.pkg} is declared in ${d.manifestPath} but is not installed.`,
		undefined,
		d.impl
	);
}

function printError(
	message: string,
	details: string | undefined,
	impl: Pick<KnownImpl, "installCommands">
): void {
	console.error(errorBlock(message, details));
	console.error("\nTry:");
	printInstallCommands(impl);
}

/** Each command on its own line, outside the frame, so it copies cleanly. */
function printInstallCommands(impl: Pick<KnownImpl, "installCommands">): void {
	for (const command of impl.installCommands) {
		console.error(`${" ".repeat(GUIDE_WIDTH)}${theme.code(command)}`);
	}
}
