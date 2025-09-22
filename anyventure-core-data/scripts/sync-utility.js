/**
 * Anyventure Core Data Sync Utility
 *
 * This utility fetches the latest game data from your web server
 * and updates the local compendiums in FoundryVTT.
 */

class AnyventureSyncUtility {
  static MODULE_ID = "anyventure-core-data";

  // Your web server base URL - change this to your actual server
  static API_BASE = "http://localhost:4000/fvtt";

  static async syncAllData() {
    try {
      ui.notifications.info("Starting Anyventure data sync...");

      const response = await fetch(`${this.API_BASE}/all`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const data = result.data;

      // Update each compendium
      await this.updateCompendium('modules', data.modules);
      await this.updateCompendium('ancestries', data.ancestries);
      await this.updateCompendium('cultures', data.cultures);
      await this.updateCompendium('character-traits', data.traits);
      await this.updateCompendium('items', data.items);
      await this.updateCompendium('spells', data.spells);

      ui.notifications.info(`Sync complete! Updated ${Object.keys(data).length} compendiums.`);
      console.log("Anyventure sync metadata:", result.metadata);

    } catch (error) {
      console.error("Anyventure sync failed:", error);
      ui.notifications.error(`Sync failed: ${error.message}`);
    }
  }

  static async updateCompendium(packName, documents) {
    const pack = game.packs.get(`${this.MODULE_ID}.${packName}`);
    if (!pack) {
      console.warn(`Compendium ${packName} not found`);
      return;
    }

    try {
      // Clear existing documents
      const existingDocuments = await pack.getDocuments();
      const deleteIds = existingDocuments.map(doc => doc.id);
      if (deleteIds.length > 0) {
        await pack.deleteEmbeddedDocuments("Item", deleteIds);
      }

      // Add new documents
      if (documents && documents.length > 0) {
        await pack.createEmbeddedDocuments("Item", documents);
      }

      console.log(`Updated ${packName} compendium with ${documents.length} documents`);

    } catch (error) {
      console.error(`Failed to update ${packName} compendium:`, error);
      ui.notifications.warn(`Failed to update ${packName}: ${error.message}`);
    }
  }

  static async syncSingleCompendium(packName) {
    try {
      ui.notifications.info(`Syncing ${packName}...`);

      const response = await fetch(`${this.API_BASE}/${packName}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      await this.updateCompendium(packName, result.data);

      ui.notifications.info(`${packName} sync complete!`);

    } catch (error) {
      console.error(`${packName} sync failed:`, error);
      ui.notifications.error(`${packName} sync failed: ${error.message}`);
    }
  }

  static async checkDataVersion() {
    try {
      const response = await fetch(`${this.API_BASE}/`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Anyventure server info:", result);
      ui.notifications.info(`Connected to Anyventure server v${result.version}`);

    } catch (error) {
      console.error("Failed to connect to Anyventure server:", error);
      ui.notifications.warn(`Cannot connect to Anyventure server: ${error.message}`);
    }
  }
}

// Hook into Foundry's ready event
Hooks.once("ready", () => {
  console.log("Anyventure Core Data module loaded");

  // Add sync buttons to the module settings
  game.settings.register(AnyventureSyncUtility.MODULE_ID, "apiUrl", {
    name: "API Server URL",
    hint: "The base URL of your Anyventure web server (e.g., http://localhost:4000/fvtt)",
    scope: "world",
    config: true,
    type: String,
    default: "http://localhost:4000/fvtt"
  });

  // Update API base when setting changes
  Hooks.on("closeSettingsConfig", () => {
    AnyventureSyncUtility.API_BASE = game.settings.get(AnyventureSyncUtility.MODULE_ID, "apiUrl");
  });

  // Check connection on ready
  AnyventureSyncUtility.checkDataVersion();
});

// Add to global scope for console access
window.AnyventureSyncUtility = AnyventureSyncUtility;

// Optional: Add a macro to the hotbar for easy access
Hooks.once("ready", () => {
  if (game.user.isGM) {
    const macroData = {
      name: "Sync Anyventure Data",
      type: "script",
      command: "AnyventureSyncUtility.syncAllData();",
      img: "icons/magic/symbols/rune-sigil-black-purple.webp"
    };

    // Check if macro already exists
    const existingMacro = game.macros.find(m => m.name === macroData.name);
    if (!existingMacro) {
      Macro.create(macroData);
    }
  }
});

console.log("Anyventure Sync Utility loaded. Use 'AnyventureSyncUtility.syncAllData()' in console to sync all data.");