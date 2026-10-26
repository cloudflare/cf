import satisfies from "semver/functions/satisfies.js";
import { CliExit } from "../../lib/cli-exit.js";
import { errorBlock, theme } from "../../lib/ui/index.js";
import { GUIDE_WIDTH } from "../../lib/ui/log.js";
import { discoverImpls, type DiscoveredImpl } from "./discover.js";
import { KNOWN_IMPLS, type KnownImpl } from "./known-impls.js";

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

function incompatibleVersionError(d: DiscoveredImpl): void {
	printError(
		`${d.impl.pkg}@${d.installedVersion ?? "unknown"} is installed, but it is not compatible with cf's local runtime.`,
		requiredVersionMessage(d),
		d.impl
	);
}

function requiredVersionMessage(d: DiscoveredImpl): string {
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
	impl: KnownImpl
): void {
	console.error(errorBlock(message, details));
	console.error("\nTry:");
	printInstallCommands(impl);
}

/** Each command on its own line, outside the frame, so it copies cleanly. */
function printInstallCommands(impl: KnownImpl): void {
	for (const command of impl.installCommands) {
		console.error(`${" ".repeat(GUIDE_WIDTH)}${theme.code(command)}`);
	}
}
