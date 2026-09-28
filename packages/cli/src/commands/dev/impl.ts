import satisfies from "semver/functions/satisfies.js";
import { CliExit } from "../../lib/cli-exit.js";
import { theme } from "../../lib/ui/index.js";
import { discoverImpls, type DiscoveredImpl } from "./discover.js";
import { KNOWN_IMPLS } from "./known-impls.js";

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
	console.error(
		`\n${theme.bold(d.impl.pkg)}@${d.installedVersion ?? "unknown"} is installed, but it is not compatible with cf's local runtime.\n\n` +
			requiredVersionMessage(d) +
			`Try: ${d.impl.installHint}`
	);
}

function requiredVersionMessage(d: DiscoveredImpl): string {
	const requirement =
		d.impl.versionConstraint?.display ?? "a compatible version";
	return `cf requires ${theme.bold(requirement)} for ${theme.bold("cf dev")}, ${theme.bold("cf build")}, ${theme.bold("cf deploy")}, and ${theme.bold("cf previews deploy")}.\n`;
}

function noImplError(cwd: string): void {
	console.error(
		`\nNo Cloudflare dev-server is installed in this project.\n\n` +
			`A project must declare exactly one of the following in its manifest:\n`
	);
	for (const impl of KNOWN_IMPLS) {
		console.error(
			`  ${theme.bold(impl.pkg)}  ${theme.muted(`(${impl.description})`)}`
		);
		console.error(`    install:  ${impl.installHint}`);
	}
	console.error(
		`\nThe manifest checked was: ${cwd}/(package.json|pyproject.toml|Cargo.toml)`
	);
}

function multipleImplsError(discovered: DiscoveredImpl[]): void {
	console.error(
		`\nMultiple Cloudflare dev-server implementations are configured:\n`
	);
	for (const d of discovered) {
		console.error(`  - ${theme.bold(d.impl.pkg)} (${d.manifestPath})`);
	}
	console.error(
		`\nA project can only use one dev-server. Remove all but one\n` +
			`from your project's manifest and try again.`
	);
}

function notInstalledError(d: DiscoveredImpl): void {
	if (d.installed && d.impl.versionConstraint) {
		console.error(
			`\n${theme.bold(d.impl.pkg)} is declared in ${d.manifestPath}, but this installation does not include the cf delegate.\n\n` +
				requiredVersionMessage(d) +
				`Try: ${d.impl.installHint}`
		);
		return;
	}

	console.error(
		`\n${theme.bold(d.impl.pkg)} is declared in ${d.manifestPath} but is not installed.\n\n` +
			`Try: ${d.impl.installHint}`
	);
}
