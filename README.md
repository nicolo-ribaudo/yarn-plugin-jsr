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

> [!CAUTION]
> The `jsr:` protocol is only supported by Yarn when using this plugin, and it's not supported by npm and pnpm.
> If you publish a package containing the `jsr:` protocol in its `dependencies`, users of your package will have to use Yarn
> with this plugin to install it.
