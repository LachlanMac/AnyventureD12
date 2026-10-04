const fs = require("fs");
const path = require("path");

// Load JSON files
const modules = JSON.parse(fs.readFileSync("modules.json", "utf-8"));
const options = JSON.parse(fs.readFileSync("options.json", "utf-8"));

// Base output directory
const baseDir = path.join("data", "options", "modules");

// Ensure the base directory exists
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

// Group modules by their type (mtype)
modules.forEach(module => {
  const folderName = module.mtype; // e.g., "racial", "planar"
  const folderPath = path.join(baseDir, folderName);

  // Ensure the folder for the module type exists
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  // Get the module name for the file
  let moduleName;
  if (module.mtype === "planar" && module.name.includes("[")) {
    moduleName = module.name.split("[")[1].split("]")[0].trim().toLowerCase().replace(/\s+/g, "_");
  } else {
    moduleName = module.name.split("[")[0].trim().toLowerCase().replace(/\s+/g, "_");
  }

  const fileName = `${moduleName}.json`;
  const filePath = path.join(folderPath, fileName);

  // Collect options associated with the module_id
  const moduleOptions = options.filter(option => option.module_id === module.id);

  // Remove `module_id` from options since it's implicit
  const cleanedOptions = moduleOptions.map(({ module_id, ...rest }) => rest);

  // Write the JSON file
  const outputData = {
    id: module.id,
    name: module.name,
    mtype: module.mtype,
    ruleset: module.ruleset,
    options: cleanedOptions
  };

  fs.writeFileSync(filePath, JSON.stringify(outputData, null, 2), "utf-8");

  console.log(`Generated file: ${filePath}`);
});

console.log("All module files have been generated.");
