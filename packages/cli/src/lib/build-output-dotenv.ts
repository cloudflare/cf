import { readBuildOutput } from "@cloudflare/build-output-utils";
import { withCloudflareDotEnv } from "./dotenv.js";
import type { BuildOutput } from "@cloudflare/build-output-utils";

/**
 * Read the Build Output, then run a callback with cf's dotenv values for the
 * mode it was built in, so deploys use the same `.env.<mode>` files as the
 * build. `--mode` isn't consulted: callers reject one that differs from the
 * recorded mode, and reject `--local`.
 *
 * Reading first is safe because `readBuildOutput` does not use `process.env`.
 */
export async function withBuildOutputDotEnv<T>(
	callback: (output: BuildOutput) => T | Promise<T>
): Promise<T> {
	const output = await readBuildOutput(process.cwd());
	return withCloudflareDotEnv(
		{ mode: output.rootConfig.buildContext.mode },
		() => callback(output)
	);
}
