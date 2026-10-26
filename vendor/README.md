# Temporary workers-utils prerelease

`cloudflare-workers-utils-9d444f329a999e8fff31eed2c27a4719506a39c5.tgz` is the
unmodified `@cloudflare/workers-utils` pkg.pr.new build from the final commit of
[workers-sdk #15955](https://github.com/cloudflare/workers-sdk/pull/15955).

- Source: <https://pkg.pr.new/cloudflare/workers-sdk/@cloudflare/workers-utils@9d444f329a999e8fff31eed2c27a4719506a39c5>
- SHA-256: `2d7184196cd118e8a661edf5e92227df352f936bd6ed290823a506a763209007`

The matching deploy-helpers prerelease depends on this build through a remote
tarball URL, which pnpm's `blockExoticSubdeps` rule rejects. The workspace
override uses this local tarball and shares it with cf and the other consumers.
The remaining deploy-helpers overrides retain cf's existing npm dependencies.

Once npm releases include #15955, update deploy-helpers and workers-utils to
those versions, remove these temporary overrides, and delete this directory.
Keep the unrelated container image cleanup patches.
