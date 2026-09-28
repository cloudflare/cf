import { runInTempDir as runInTempDirCommon } from "@cloudflare/workers-utils/test-helpers";

// cf has no in-process auth-token cache to invalidate after the tmp-dir
// home swap, so the wrangler `reinitialiseAuthTokens()` follow-up is
// dropped here.
export function runInTempDir(options?: { homedir: string }) {
	runInTempDirCommon(options);
}
