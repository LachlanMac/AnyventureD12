# Anyventure Core Data - FoundryVTT Module

This module provides a sync utility to keep your FoundryVTT compendiums up-to-date with your Anyventure web server data.

## Setup

1. **Install the Module**: Copy this entire `foundry-module` folder to your FoundryVTT `Data/modules/` directory and rename it to `anyventure-core-data`.

2. **Enable the Module**: In FoundryVTT, go to Game Settings > Manage Modules and enable "Anyventure Core Data".

3. **Configure API URL**: Go to Game Settings > Configure Settings > Module Settings and set the "API Server URL" to your web server (e.g., `http://localhost:4000/fvtt`).

## Usage

### Automatic Sync Macro
The module automatically creates a "Sync Anyventure Data" macro for GMs. Click it to sync all data.

### Manual Console Commands
```javascript
// Sync all data at once
AnyventureSyncUtility.syncAllData();

// Sync individual compendiums
AnyventureSyncUtility.syncSingleCompendium('modules');
AnyventureSyncUtility.syncSingleCompendium('ancestries');
AnyventureSyncUtility.syncSingleCompendium('cultures');
AnyventureSyncUtility.syncSingleCompendium('character-traits');
AnyventureSyncUtility.syncSingleCompendium('items');
AnyventureSyncUtility.syncSingleCompendium('spells');

// Check server connection
AnyventureSyncUtility.checkDataVersion();
```

## Available API Endpoints

Your web server now provides these endpoints:

- `GET /fvtt/` - Health check and available endpoints
- `GET /fvtt/modules` - All modules in Foundry format
- `GET /fvtt/ancestries` - All ancestries in Foundry format
- `GET /fvtt/cultures` - All cultures in Foundry format
- `GET /fvtt/traits` - All character traits in Foundry format
- `GET /fvtt/items` - All items in Foundry format
- `GET /fvtt/spells` - All spells in Foundry format
- `GET /fvtt/all` - All data in one call (recommended for full sync)
- `GET /fvtt/datakey` - The datakey.txt reference file

## Development Workflow

1. **Update data on web server** (add/modify modules, items, etc.)
2. **Run sync in FoundryVTT** using the macro or console command
3. **Updated compendiums** are now available for character import

## Character Import Integration

When you implement character import, the system will:

1. Export character definition from web (ancestry, culture, modules, etc.)
2. Import to FoundryVTT with module references
3. FoundryVTT processes modules using datakey.txt logic to build final character
4. If modules are missing, sync utility can fetch them from web server

## File Structure

```
foundry-module/
├── module.json                 # Module definition
├── scripts/
│   └── sync-utility.js        # Sync utility script
├── packs/                     # Compendium data (auto-generated)
│   ├── modules/
│   ├── ancestries/
│   ├── cultures/
│   ├── character-traits/
│   ├── items/
│   └── spells/
└── README.md                  # This file
```

## Notes

- The sync utility clears and rebuilds compendiums on each sync to ensure data consistency
- All data is converted to Foundry's document format with `anyventure-*` types
- The module preserves your original data structure in the `system` field
- Homebrew modules will need special handling in character import logic