// Temporary exact-commit resolver for workers-sdk#16764. Keep other exotic
// transitive sources blocked. Remove this when these packages are released.
const commit = "55b5567f278ce000cd4a6e00bfeeef06df596cde";
const packages = new Set([
	"@cloudflare/build-output-utils",
	"@cloudflare/config",
	"@cloudflare/codemods",
	"@cloudflare/containers-shared",
	"@cloudflare/deploy-helpers",
	"@cloudflare/workers-utils",
	"miniflare",
]);

/** @param {{alias?: string, bareSpecifier: string}} dependency */
function canResolve(dependency) {
	const name = dependency.alias;
	if (!name || !packages.has(name)) {
		return false;
	}
	return (
		dependency.bareSpecifier === `https://pkg.pr.new/${name}@${commit}` ||
		dependency.bareSpecifier ===
			`https://pkg.pr.new/cloudflare/workers-sdk/${name}@${commit.slice(0, 7)}`
	);
}

export default {
	resolvers: [
		{
			canResolve,
			/** @param {{alias?: string, bareSpecifier: string}} dependency */
			resolve(dependency) {
				if (!canResolve(dependency)) {
					throw new Error("Unapproved Workers SDK prerelease");
				}
				const tarball = `https://pkg.pr.new/cloudflare/workers-sdk/${dependency.alias}@${commit}`;
				return { id: tarball, resolution: { tarball } };
			},
		},
	],
};
