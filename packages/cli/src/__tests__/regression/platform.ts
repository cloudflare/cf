import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";

// Docker and SSH are OS boundaries. The original shared HTTP clients still
// request registry credentials and SSH authorization through MSW.
function output(args: string[]): string {
	if (args.includes("manifest")) {
		return "not-json";
	}
	if (args.includes("inspect")) {
		if (args.some((arg) => arg.includes(".Os"))) {
			return "linux/amd64\n";
		}
		if (args.some((arg) => arg.includes("RepoDigests"))) {
			const image = args[args.indexOf("inspect") + 1] ?? "";
			if (image.startsWith("registry")) {
				return JSON.stringify([
					`${image.slice(0, image.lastIndexOf(":"))}@sha256:${"d".repeat(64)}`,
				]);
			}
			return "[]\n";
		}
		if (args.some((arg) => arg.includes("Size"))) {
			return "123456 4\n";
		}
		return JSON.stringify([
			{ Architecture: "amd64", Os: "linux", Config: { Cmd: ["serve"] } },
		]);
	}
	return "";
}

export function spawn(_executable: string, args: string[] = []) {
	const child = Object.assign(new EventEmitter(), {
		stdin: new PassThrough(),
		stdout: new PassThrough(),
		stderr: new PassThrough(),
		exitCode: null as number | null,
		signalCode: null,
		pid: 1,
		kill: () => true,
	});
	setTimeout(() => {
		if (args.includes("-V")) {
			child.stderr.end("OpenSSH_9.9\n");
		} else {
			child.stderr.end();
		}
		child.stdout.end(output(args));
		child.exitCode = 0;
		child.emit("exit", 0, null);
		child.emit("close", 0, null);
	}, 0);
	return child;
}

export function execFileSync(_executable: string, args: string[] = []) {
	return output(args);
}

export function execFile(
	_executable: string,
	args: string[],
	...rest: unknown[]
) {
	const callback = rest.find((argument) => typeof argument === "function") as
		| ((error: Error | null, stdout: string, stderr: string) => void)
		| undefined;
	setTimeout(() => callback?.(null, output(args), ""), 0);
	return spawn(_executable, args);
}
