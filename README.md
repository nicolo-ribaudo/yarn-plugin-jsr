# Yarn JSR plugin

A Yarn plugin to improve the developer experience when working with JSR.

> [!NOTE]
> This plugin does not support Yarn 1.

### Installation

Run the following command in your project:

```
yarn plugin import https://raw.githubusercontent.com/nicolo-ribaudo/yarn-plugin-jsr/main/dist/yarn-plugin-jsr.js
```

### Usage

To install a package from JSR, you can use the `yarn jsr add` command:

```
yarn jsr add @nic-test/test-log
yarn jsr add @nic-test/test-log @luca/flag
yarn jsr add @nic-test/test-log@~0.1.0
```

#### `jsr:` protocol

This plugin adds a `jsr:` protocol to Yarn, which allows you to reference packages from JSR in your `package.json`. It also supports aliases, like the `npm:` protocol:

```json
{
  "dependencies": {
    "@nic-test/test-log": "jsr:^0.1.0",
    "aliased": "jsr:@nic-test/depends-on-log@^0.1.0"
  }
}
```

> [!WARNING]
> The `jsr:` protocol is only supported by Yarn when using this plugin, and it's not supported by npm and pnpm.
> On publish, it is replaced with an alias `@jsr/<scope>__<name>`,
> [as done by JSR itself](https://jsr.io/docs/npm-compatibility#advanced-setup).
> Users of your package will have to configure the `@jsr` scope to map to `https://npm.jsr.io`, either trough
> a `.npmrc` file (when using npm, Yarn 1, or pnpm):
>
> ```ini
> @jsr:registry=https://npm.jsr.io
> ```
>
> or using `.yarnrc.yml` (for modern Yarn versions):
>
> ```yaml
> npmScopes:
>   jsr:
>     npmRegistryServer: https://npm.jsr.io
> ```
