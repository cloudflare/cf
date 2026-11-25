/**
 * Installed completion scripts: `cf complete <shell> --install` writes the
 * init script to a file the shell rc sources directly, so starting a shell
 * never spawns cf. The script is static (tab resolves commands at TAB time
 * through `cf complete -- <words…>`), so the only staleness is a tab upgrade
 * changing its template; TAB callbacks rewrite installed files to match.
 */

import {
	mkdirSync,
	readFileSync,
	renameSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import t from "@bomb.sh/tab";
import { getCfConfigPath } from "@cloudflare/workers-auth/cf";

export const SHELLS = ["bash", "zsh", "fish", "powershell"] as const;
export type Shell = (typeof SHELLS)[number];

const EXTENSIONS: Record<Shell, string> = {
	bash: "bash",
	fish: "fish",
	powershell: "ps1",
	zsh: "zsh",
};

export const RC_FILES: Record<Shell, string> = {
	bash: "~/.bashrc",
	fish: "~/.config/fish/config.fish",
	powershell: "$PROFILE",
	zsh: "~/.zshrc",
};

export function getScriptPath(shell: Shell): string {
	return join(getCfConfigPath(), "completions", `cf.${EXTENSIONS[shell]}`);
}

/** The init script `cf complete <shell>` prints. */
export function renderScript(shell: Shell): string {
	// tab only prints scripts; its setup is synchronous, so capture the
	// console.log call it makes.
	const log = console.log;
	let script = "";
	console.log = (line: unknown) => {
		script += `${String(line)}\n`;
	};
	try {
		t.setup("cf", "cf", shell);
	} finally {
		console.log = log;
	}
	return script;
}

/** The rc line that loads an installed script, quoted for that shell. */
export function getSourceLine(shell: Shell, path: string): string {
	switch (shell) {
		case "powershell":
			return `. '${path.replaceAll("'", "''")}'`;
		case "fish":
			return `source '${path.replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`;
		default:
			return `source '${path.replaceAll("'", "'\\''")}'`;
	}
}

// Rename over the old file so a shell starting mid-write, or a crash, never
// sources a truncated script.
function writeScript(path: string, script: string): void {
	mkdirSync(dirname(path), { recursive: true });
	const tempPath = `${path}.${process.pid}.tmp`;
	try {
		writeFileSync(tempPath, script, "utf-8");
		renameSync(tempPath, path);
	} catch (error) {
		// Each TAB callback has a new pid, so a failing target would
		// otherwise collect a temp file per press.
		rmSync(tempPath, { force: true });
		throw error;
	}
}

export function installScript(shell: Shell): string {
	const path = getScriptPath(shell);
	writeScript(path, renderScript(shell));
	return path;
}

/**
 * Rewrite installed scripts that differ from this cf's. A missing file was
 * never installed (or was removed on purpose), so it stays missing.
 */
export function refreshInstalledScripts(): void {
	for (const shell of SHELLS) {
		const path = getScriptPath(shell);
		try {
			const installed = readFileSync(path, "utf-8");
			const script = renderScript(shell);
			if (installed !== script) {
				writeScript(path, script);
			}
		} catch {
			// Not installed, or not writable: never disturb completion output.
		}
	}
}
