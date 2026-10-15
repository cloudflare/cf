import { getAuthToken } from "./auth-token.js";
import { getAccountId, type ComplianceRegion } from "./context.js";

interface BuildOutputAuthOptions {
	accountId?: string;
	complianceRegion: ComplianceRegion;
	dryRun?: boolean;
	isPreview?: boolean;
}

/** Resolve deployment credentials using the account and region from the build. */
export function resolveBuildOutputAuth(
	options: BuildOutputAuthOptions & { dryRun?: false }
): Promise<{ authToken: string; accountId: string }>;
export function resolveBuildOutputAuth(
	options: BuildOutputAuthOptions
): Promise<{ authToken: string; accountId: string | undefined }>;
export async function resolveBuildOutputAuth(
	options: BuildOutputAuthOptions
): Promise<{ authToken: string; accountId: string | undefined }> {
	const { accountId: configuredAccountId, dryRun, ...authOptions } = options;
	// Dry runs make no API requests. Leaving the account unresolved also skips
	// deploy-helpers' account-scoped checks, such as its deployment lookup.
	if (dryRun) {
		return { authToken: "", accountId: undefined };
	}

	const authToken = await getAuthToken(authOptions);
	const accountId =
		configuredAccountId ??
		(await getAccountId({ ...authOptions, skipProjectSettings: true }));
	return { authToken, accountId };
}
