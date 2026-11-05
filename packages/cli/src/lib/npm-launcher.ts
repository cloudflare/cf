import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { basename, delimiter, dirname, join, resolve } from "node:path";

/**
 * Run `npm` / `npx` on Windows through the CLI script their `.cmd` launcher
 * would start. Node.js's bundled npm.cmd and npx.cmd keep a batch file active
 * while npm runs, so a console Ctrl+C ends at cmd's "Terminate batch job
 * (Y/N)?" prompt instead of exiting. Other commands are returned unchanged.
 */
export function resolveNpmLauncher(
	command: [string, ...string[]],
	cwd: string,
	env: NodeJS.ProcessEnv = process.env,
	platform: NodeJS.Platform = process.platform
): [string, ...string[]] {
	const [file, ...args] = command;
	if (platform !== "win32" || !/^(?:npm|npx)(?:\.cmd)?$/i.test(file)) {
		return command;
	}

	// Rewrite only when the child would start npm's batch launcher, so an
	// earlier npm.exe shim (such as a version manager's) still wins.
	const launcher = findExecutable(file, cwd, env);
	if (launcher === undefined) {
		return command;
	}
	const name = /^(npm|npx)\.cmd$/i.exec(basename(launcher))?.[1]?.toLowerCase();
	if (name === undefined) {
		return command;
	}
	const directory = dirname(launcher);
	const bin = join(directory, "node_modules", "npm", "bin");
	const script = join(bin, `${name}-cli.js`);
	if (!existsSync(script)) {
		return command;
	}

	const adjacentNode = join(directory, "node.exe");
	let node: string | undefined;
	if (existsSync(adjacentNode)) {
		node = adjacentNode;
	} else {
		// npm.cmd falls back to `node` as cmd would resolve it, not cf's runtime.
		node = findExecutable("node", cwd, env);
	}
	if (node === undefined) {
		return command;
	}
	return [node, globalPrefixScript(node, bin, name) ?? script, ...args];
}

// Mirrors tinyexec's Windows lookup so the rewrite targets the same launcher.
function findExecutable(
	command: string,
	cwd: string,
	env: NodeJS.ProcessEnv
): string | undefined {
	const pathKey = Object.keys(env).find((key) => /^path$/i.test(key));
	const path = pathKey === undefined ? "" : (env[pathKey] ?? "");
	let extensions = env.PATHEXT
		? env.PATHEXT.split(delimiter)
		: [".EXE", ".CMD", ".BAT", ".COM"];
	if (command.includes(".")) {
		extensions = ["", ...extensions];
	}
	for (const directory of [cwd, ...path.split(delimiter)]) {
		for (const extension of extensions) {
			const candidate = resolve(cwd, directory, command + extension);
			if (isFile(candidate)) {
				return candidate;
			}
		}
	}
	return undefined;
}

function isFile(path: string): boolean {
	try {
		return statSync(path).isFile();
	} catch {
		return false;
	}
}

/** Like the launchers, prefer an npm installed into the global prefix. */
function globalPrefixScript(
	node: string,
	bin: string,
	name: string
): string | undefined {
	const prefixScript = join(bin, "npm-prefix.js");
	if (!existsSync(prefixScript)) {
		return undefined;
	}
	try {
		const prefix = execFileSync(node, [prefixScript], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
			// A hung probe would otherwise block the command from ever starting.
			timeout: 5000,
			windowsHide: true,
		}).trim();
		const script = join(prefix, "node_modules", "npm", "bin", `${name}-cli.js`);
		return prefix !== "" && existsSync(script) ? script : undefined;
	} catch {
		return undefined;
	}
}
