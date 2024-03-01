import { BaseCommand } from "@yarnpkg/cli";
import { structUtils } from "@yarnpkg/core";
import { Command, Option, type Usage } from "clipanion";

import * as jsr from "../jsr-registry";

export default class JsxAddCommand extends BaseCommand {
  static paths = [["jsr", "add"]];

  static usage: Usage = Command.Usage({
    description: "add JSR dependencies to the project",
    details: `
      This command adds a package to the package.json from the JSR registry.
    `,
    examples: [
      ["Add a JSR package", "$0 jsx add @luca/flag"],
      [
        "Add a specific version range of a JSR package",
        "$0 jsr add @luca/flag@^0.1.0",
      ],
    ],
  });

  exact = Option.Boolean(`-E,--exact`, false, {
    description: `Don't use any semver modifier on the resolved range`,
  });

  tilde = Option.Boolean(`-T,--tilde`, false, {
    description: `Use the \`~\` semver modifier on the resolved range`,
  });

  caret = Option.Boolean(`-C,--caret`, false, {
    description: `Use the \`^\` semver modifier on the resolved range`,
  });

  dev = Option.Boolean(`-D,--dev`, false, {
    description: `Add a package as a dev dependency`,
  });

  peer = Option.Boolean(`-P,--peer`, false, {
    description: `Add a package as a peer dependency`,
  });

  packages = Option.Rest();

  async execute() {
    const packages = await Promise.all(
      this.packages.map((name) => this.#adjustPackageDescriptor(name))
    );

    return this.cli.run(
      [
        "add",
        this.exact && "--exact",
        this.tilde && "--tilde",
        this.caret && "--caret",
        this.dev && "--dev",
        this.peer && "--peer",
        ...packages,
      ].filter(Boolean)
    );
  }

  async #adjustPackageDescriptor(desc: string): Promise<string> {
    if (desc.includes("@", 1)) return desc;

    const { scope, name } = structUtils.parseIdent(desc);
    if (!scope) throw new Error(`jsr packages are scoped: ${desc}`);

    const versions = await jsr.getVersions(scope, name);
    const latest =
      versions.valid.length > 0 ? versions.valid[0] : versions.yanked[0];

    const modifier = this.exact ? "" : this.tilde ? "~" : "^";
    return `${desc}@jsr:${modifier}${latest}`;
  }
}
