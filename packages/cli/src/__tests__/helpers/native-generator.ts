import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	FLAG_OWNER_TEXT,
	FUTURE_OPTION_NAMES,
	GLOBAL_OPTION_NAMES,
} from "../../lib/global-options.js";
import type {
	Arg,
	Ctx,
	Derived,
	Method,
	OperationInfo,
	OutputKind,
} from "./generator-model.js";

export type * from "./generator-model.js";

const cargoEnv = { ...process.env };
const manifest = fileURLToPath(
	new URL("../../../../generator/Cargo.toml", import.meta.url)
);
const target = join(dirname(manifest), "target");
let built = false;

function run<T>(task: string, input: Record<string, unknown>): T {
	if (!built) {
		execFileSync(
			"cargo",
			[
				"build",
				"--locked",
				"--manifest-path",
				manifest,
				"--target-dir",
				target,
				"--features",
				"test-harness",
				"--bin",
				"cf-generator-tests",
			],
			{ env: cargoEnv, stdio: "pipe" }
		);
		built = true;
	}
	try {
		return JSON.parse(
			execFileSync(
				join(
					target,
					"debug",
					`cf-generator-tests${process.platform === "win32" ? ".exe" : ""}`
				),
				[],
				{
					input: JSON.stringify({
						...input,
						task,
						flagPolicy: {
							globalOptions: GLOBAL_OPTION_NAMES,
							futureOptions: FUTURE_OPTION_NAMES,
							ownerText: FLAG_OWNER_TEXT,
						},
					}),
					encoding: "utf8",
					env: cargoEnv,
					maxBuffer: 16 * 1024 * 1024,
				}
			)
		) as T;
	} catch (error) {
		const stderr = (error as { stderr?: Buffer }).stderr?.toString();
		throw new Error(stderr?.trim() || String(error));
	}
}

function restoreArgs(derived: Derived): Derived {
	for (const arg of derived.args) {
		for (const key of [
			"choices",
			"default",
			"fromFile",
			"conflicts",
			"implies",
			"optionalParentPath",
		] as const) {
			if (!(key in arg)) {
				Object.assign(arg, { [key]: undefined });
			}
		}
	}
	return derived;
}

export function derive(
	method: Method,
	resource: string,
	op: OperationInfo
): Derived {
	return restoreArgs(run<Derived>("derive", { method, resource, op }));
}
export function emitContext(
	method: Method,
	resource: string,
	group: string | undefined,
	op: OperationInfo,
	root: string
): [Ctx, string] {
	const result = run<Ctx & { command: string }>("context", {
		method,
		resource,
		group,
		op,
		root,
	});
	result.derived = restoreArgs(result.derived);
	return [result, result.command];
}
const lines = (task: string, ctx: Ctx): string[] =>
	run<string>(task, { ...ctx })
		.trimEnd()
		.split("\n");
export const builderLines = (ctx: Ctx): string[] => lines("builderLines", ctx);
export const handler = (ctx: Ctx): string[] => lines("handler", ctx);
export const dryRun = (ctx: Ctx): string[] => lines("dryRun", ctx);
export const bodyPrompts = (ctx: Ctx): string[] => lines("bodyPrompts", ctx);
export const bodyObject = (ctx: Ctx, _indent: string): string[] =>
	lines("bodyObject", ctx);
export const imports = (ctx: Ctx): { render: () => string[] } => ({
	render: () => lines("imports", ctx),
});
export const outputKind = (op: OperationInfo): OutputKind =>
	run("outputKind", { op });
export const summary = (method: Method): string => run("summary", { method });
export const leafUsage = (
	method: Method,
	resource: string,
	group: string | undefined,
	command: string,
	accountOrZone = false
): string =>
	run("leafUsage", { method, resource, group, command, accountOrZone });
export const telemetrySafeFlags = (
	args: readonly Arg[],
	force: boolean,
	text: boolean
): string[] => run("telemetrySafeFlags", { args, force, text });
export const variantPromptBlock = (
	op: OperationInfo,
	args: readonly Arg[]
): [string[], boolean] => run("variantPromptBlock", { op, args });
export const accountOrZoneLocal = (
	path: string,
	param: string
): string | undefined =>
	run<string | null>("accountOrZoneLocal", { path, param }) ?? undefined;
export const ACCOUNT_OR_ZONE_HELP =
	"Runs against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.";
