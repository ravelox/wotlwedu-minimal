import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const packageJsonPath = path.join(rootDir, "package.json");
const runtimeConfigTemplatePath = path.join(
  rootDir,
  "src",
  "assets",
  "wotlwedu-config.json.template"
);

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const runtimeConfig = JSON.parse(
  fs.readFileSync(runtimeConfigTemplatePath, "utf8")
);

if (runtimeConfig.appVersion !== packageJson.version) {
  runtimeConfig.appVersion = packageJson.version;
  fs.writeFileSync(
    runtimeConfigTemplatePath,
    `${JSON.stringify(runtimeConfig, null, 4)}\n`
  );
  console.log(
    `Synced runtime config appVersion to ${packageJson.version}`
  );
}
