function parseJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function parseTOML(raw) {
  try {
    const lines = raw.split("\n");
    console.log("lines--", lines);
    const deps = [];

    let inDepsBlock = false;
    let inArray = false;

    for (let line of lines) {
      line = line.trim().toLowerCase();

      // enter dependency section
      if (
        line === "[project.dependencies]" ||
        line === "[tool.poetry.dependencies]"
      ) {
        inDepsBlock = true;
        continue;
      }

      // exit dependency section
      if (inDepsBlock && line.startsWith("[")) {
        inDepsBlock = false;
        inArray = false;
      }

      if (!inDepsBlock) continue;

      // array start
      if (line.includes("=[")) {
        inArray = true;
        continue;
      }

      // array end
      if (inArray && line.includes("]")) {
        inArray = false;
        continue;
      }

      // array values: "django",
      if (inArray) {
        const dep = line.replace(/["',]/g, "").trim();
        if (dep) deps.push(dep);
        continue;
      }

      // key = value deps
      if (line.includes("=")) {
        deps.push(line);
      }
    }

    return deps.join(" ");
  } catch (err) {
    console.error(err.message);
    return "";
  }
}

function parseRequirements(raw) {
  return raw
    .split("\n")
    .map((line) => line.trim().toLowerCase())
    .filter((line) => line && !line.startsWith("#"))
    .join(" ");
}

function parseJava(raw) {
  return raw.toLowerCase();
}

function parseRuby(raw) {
  return raw
    .split("\n")
    .map((line) => line.trim().toLowerCase())
    .filter((line) => line.startsWith("gem "))
    .join(" ");
}

function parseGo(raw) {
  return raw
    .split("\n")
    .map((line) => line.trim().toLowerCase())
    .filter((line) => line.startsWith("require") || line.includes("/"))
    .join(" ");
}

function parseManifest(file, raw) {
  switch (file) {
    case "package.json":
    case "composer.json":
      return parseJSON(raw);

    case "pyproject.toml":
      return parseTOML(raw);

    case "requirements.txt":
      return parseRequirements(raw);

    case "pom.xml":
    case "build.gradle":
      return parseJava(raw);

    case "Gemfile":
      return parseRuby(raw);

    case "go.mod":
      return parseGo(raw);

    default:
      return null;
  }
}

module.exports = { parseManifest };
