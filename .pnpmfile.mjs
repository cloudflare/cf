// Temporary exact-commit resolver for workers-sdk#16764. Keep other exotic
// transitive sources blocked. Remove this when these packages are released.
const commit = "1c83aca232ab1fc105527211f8310c1deacc1073";
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
