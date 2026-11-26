import { spawn } from "node:child_process";
import { readFile, realpath } from "node:fs/promises";
import { createRequire } from "node:module";
import { constants, tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join } from "node:path";
import { detect } from "package-manager-detector/detect";
import { valid, validRange } from "semver";
import { normalizeSpawnCommand, x } from "tinyexec";
import { CliExit } from "../../lib/cli-exit.js";
import { resolveNpmLauncher } from "../../lib/npm-launcher.js";
import { createChildProcessController } from "../../lib/process.js";
import { log } from "../../lib/ui/log.js";

const GLOBAL_PROBES = {
	npm: ["root", "--global"],
	pnpm: ["list", "--global", "--parseable", "--depth=0", "cf"],
	yarn: ["global", "dir"],
	bun: ["pm", "ls", "--global"],
};

type Manager = keyof typeof GLOBAL_PROBES;
type Dependency = "optionalDependencies" | "dependencies" | "devDependencies";
type Manifest = Partial<Record<Dependency, Record<string, string>>> | null;
type LocalInstall = { cwd: string; dependency: Dependency; spec: string };
type UpdatePlan = {
	scope: "local" | "global";
	cwd: string;
	command: [Manager, ...string[]];
};

export function isReleaseTag(target: string): boolean {
	return (
		/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(target) && validRange(target) === null
	);
}

async function canonicalPath(path: string): Promise<string | undefined> {
	return realpath(path).catch(() => undefined);
}

function parseManifest(path: string, text: string): Manifest {
	try {
		return JSON.parse(text) as Manifest;
	} catch {
		throw new Error(
			`cf update could not parse ${path} as JSON. Fix the file or update cf manually.`
		);
	}
}

async function findLocalInstall(
	cwd: string,
	installedManifest: string
): Promise<LocalInstall | undefined> {
	for (let directory = cwd; ; directory = dirname(directory)) {
		const projectManifest = join(directory, "package.json");
		let resolved: string;
		try {
			resolved = createRequire(projectManifest).resolve("cf/package.json");
		} catch (error) {
			if (
				error instanceof Error &&
				"code" in error &&
				error.code === "ERR_INVALID_PACKAGE_CONFIG"
			) {
				throw new Error(
					`cf update could not resolve the local installation: ${error.message} Fix the file or update cf manually.`,
					{ cause: error }
				);
			}
			return undefined;
		}
		if ((await canonicalPath(resolved)) !== installedManifest) {
			return undefined;
		}
		const text = await readFile(projectManifest, "utf8").catch(
			(error: unknown) => {
				if (
					error instanceof Error &&
					"code" in error &&
					error.code === "ENOENT"
				) {
					return undefined;
				}
				throw error;
			}
		);
		if (text !== undefined) {
			const manifest = parseManifest(projectManifest, text);
			for (const dependency of [
				"optionalDependencies",
				"dependencies",
				"devDependencies",
			] as const) {
				const spec = manifest?.[dependency]?.cf;
				if (typeof spec === "string") {
					return { cwd: directory, dependency, spec };
				}
			}
		}
		if (dirname(directory) === directory) {
			return undefined;
		}
	}
}

function globalManifests(manager: Manager, stdout: string): string[] {
	return stdout.split(/\r?\n/).flatMap((line) => {
		const text = line.trim();
		const directory =
			manager === "bun" ? /^(.+) node_modules \(.*\)$/.exec(text)?.[1] : text;
		if (!directory || !isAbsolute(directory)) {
			return [];
		}
		if (manager === "pnpm") {
			return basename(directory) === "cf"
				? [join(directory, "package.json")]
				: [];
		}
		return [
			manager === "npm"
				? join(directory, "cf", "package.json")
				: join(directory, "node_modules", "cf", "package.json"),
		];
	});
}

async function findGlobalManifest(
	manager: Manager,
	cwd: string,
	installedManifest: string
): Promise<string | undefined> {
	try {
		const result = await x(manager, GLOBAL_PROBES[manager], {
			timeout: 5_000,
			nodePath: false,
			nodeOptions: {
				cwd,
				env: {
					...process.env,
					COREPACK_DEFAULT_TO_LATEST: "0",
					COREPACK_ENABLE_NETWORK: "0",
				},
				stdio: ["ignore", "pipe", "pipe"],
			},
		});
		if (result.exitCode !== 0) {
			return undefined;
		}
		const manifests = globalManifests(manager, result.stdout);
		const canonical = await Promise.all(manifests.map(canonicalPath));
		return manifests[canonical.indexOf(installedManifest)];
	} catch {
		return undefined;
	}
}

async function planGlobalPnpmUpdate(
	manifest: string,
	target: string
): Promise<UpdatePlan["command"]> {
	const groupManifest = join(
		dirname(dirname(dirname(manifest))),
		"package.json"
	);
	const text = await readFile(groupManifest, "utf8").catch(() => undefined);
	const group =
		text === undefined ? undefined : parseManifest(groupManifest, text);
	const packages = Object.keys(group?.dependencies ?? {});
	if (packages.length !== 1 || packages[0] !== "cf") {
		throw new Error(
			"Could not verify that cf has its own pnpm global install group. Update the group manually to avoid changing other packages."
		);
	}
	return target === "latest"
		? ["pnpm", "update", "--global", "--latest", "cf"]
		: ["pnpm", "add", "--global", `cf@${target}`];
}

export async function planUpdate(
	cwd: string,
	runningManifest: string,
	target: string
): Promise<UpdatePlan> {
	const installedManifest = await canonicalPath(runningManifest);
	if (!installedManifest) {
		throw new Error("Could not locate the running cf installation.");
	}
	const pkg = `cf@${target}`;
	const local = await findLocalInstall(cwd, installedManifest);
	if (local) {
		if (!validRange(local.spec) && !isReleaseTag(local.spec)) {
			throw new Error(
				`This project uses a non-registry cf dependency. Update it manually in ${local.cwd}.`
			);
		}
		const detected = await detect({
			cwd: local.cwd,
			strategies: [
				"install-metadata",
				"lockfile",
				"packageManager-field",
				"devEngines-field",
			],
		});
		const manager = detected?.name ?? "npm";
		const flags: string[] = {
			dependencies: [],
			devDependencies: [manager === "npm" ? "--save-dev" : "--dev"],
			optionalDependencies: [
				manager === "npm" ? "--save-optional" : "--optional",
			],
		}[local.dependency];
		const saveExact = valid(local.spec) !== null || valid(target) !== null;
		let command: UpdatePlan["command"];
		switch (manager) {
			case "npm":
				if (saveExact) {
					flags.push("--save-exact");
				}
				command = [manager, "install", pkg, ...flags];
				break;
			case "pnpm":
				if (detected?.agent === "pnpm-rush") {
					throw new Error(
						"Update this project's cf dependency manually with Rush."
					);
				}
				command = [manager, "update", pkg];
				break;
			case "bun":
			case "yarn":
				if (saveExact) {
					flags.push("--exact");
				}
				command = [manager, "add", pkg, ...flags];
				if (detected?.agent === "yarn") {
					command.push("--ignore-workspace-root-check");
				}
				break;
			default:
				throw new Error(
					`Update this project's cf dependency manually with ${manager}.`
				);
		}
		return { scope: "local", cwd: local.cwd, command };
	}

	const globalCwd = tmpdir();
	const matches = await Promise.all(
		(Object.keys(GLOBAL_PROBES) as Manager[]).map(async (manager) => ({
			manager,
			manifest: await findGlobalManifest(manager, globalCwd, installedManifest),
		}))
	);
	const owners = matches.filter(({ manifest }) => manifest !== undefined);
	const owner = owners[0];
	if (!owner?.manifest || owners.length !== 1) {
		throw new Error(
			owners.length === 0
				? "Could not identify the package manager for this cf installation. Update it manually with the package manager that installed it."
				: "More than one package manager owns this cf installation. Update it manually."
		);
	}
	const commands: Record<Exclude<Manager, "pnpm">, UpdatePlan["command"]> = {
		npm: ["npm", "install", "--global", pkg],
		yarn: ["yarn", "global", "add", pkg],
		bun: ["bun", "add", "--global", pkg],
	};
	const command =
		owner.manager === "pnpm"
			? await planGlobalPnpmUpdate(owner.manifest, target)
			: commands[owner.manager];
	return { scope: "global", cwd: globalCwd, command };
}

export async function runUpdate({
	command,
	cwd,
	scope,
}: UpdatePlan): Promise<void> {
	const [file, ...args] = resolveNpmLauncher(command, cwd);
	const launch = normalizeSpawnCommand(file, args, {
		cwd,
		stdio: ["inherit", process.stderr, "inherit"],
		windowsHide: true,
	});
	log.info(`Updating the ${scope} installation of cf with ${command[0]}.`);
	const child = spawn(launch.command, launch.args, launch.options);
	const { code, signal } = await createChildProcessController(child, {
		forwardSignals: true,
	}).exited.catch((error: unknown) => {
		throw new Error(`Could not run ${command[0]}. Check that it is on PATH.`, {
			cause: error,
		});
	});
	if (code !== 0) {
		if (signal !== "SIGINT" && code !== 130) {
			log.warn(
				`The update failed. You can retry manually${scope === "local" ? ` in ${cwd}` : ""}:`,
				command.join(" ")
			);
		}
		throw new CliExit(code ?? (signal ? 128 + constants.signals[signal] : 1), {
			signal: signal ?? undefined,
			cancelled: signal === "SIGINT" || code === 130,
		});
	}
}
