const fs = require('fs');
const path = require('path');

// Directory where creature folders are located
const baseDir = './creatures';

function processFile(filePath) {
    // Read the JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file ${filePath}: ${err}`);
            return;
        }

        try {
            // Parse the JSON
            let jsonData = JSON.parse(data);

            // Check if the portrait field exists and update its value
            if (jsonData.portrait && typeof jsonData.portrait === 'string') {
                // Check if it already starts with the correct URL
                if (!jsonData.portrait.startsWith("https://anyventured12.com")) {
                    jsonData.portrait = "https://anyventured12.com" + jsonData.portrait;
                }
            } else {
                console.error("No portrait field found or portrait is not a string.");
            }

            // Write the updated JSON back to the file
            fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
                if (err) {
                    console.error(`Error writing file ${filePath}: ${err}`);
                } else {
                    console.log(`Updated file: ${filePath}`);
                }
            });
        } catch (parseErr) {
            console.error(`Error parsing JSON in file ${filePath}: ${parseErr}`);
        }
    });
}
// Function to recursively process directories
function processDirectory(dirPath) {
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            console.error(`Error reading directory ${dirPath}: ${err}`);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(dirPath, file);
            console.log("Processing " + filePath);
            fs.stat(filePath, (err, stat) => {
                if (err) {
                    console.error(`Error getting stats for file ${filePath}: ${err}`);
                    return;
                }

                // If it's a directory, recurse
                if (stat.isDirectory()) {
                    processDirectory(filePath);
                }

                // If it's a file and has .json extension, process it
                else if (path.extname(filePath) === '.json') {
                    processFile(filePath);
                }
            });
        });
    });
}

// Start processing from the base directory
processDirectory(baseDir);
