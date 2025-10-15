import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import '../../styles/wiki.css';

interface WikiPage {
  id: string;
  title: string;
  path: string;
  category: string;
  order: number;
}

interface WikiStructure {
  title: string;
  pages: WikiPage[];
}

// Function to process language table placeholder
const processLanguageTable = async (content: string): Promise<string> => {
  try {
    const response = await fetch('/data/languages/languages.json');
    if (!response.ok) {
      throw new Error('Failed to load languages data');
    }
    const languages = await response.json();

    // Generate markdown table
    let table = `
| Name | Type | Description | Magical |
|------|------|-------------|---------|
`;

    languages.forEach((lang: any) => {
      const magicalIcon = lang.magic ? '✓' : '✗';
      const type = lang.magic ? 'Magical' : lang.id.includes('_') ? 'Regional' : 'Common';
      // Escape pipes in descriptions for markdown table
      const description = lang.description.replace(/\|/g, '\\|');
      table += `| ${lang.name} | ${type} | ${description} | ${magicalIcon} |\n`;
    });

    // Replace the placeholder with the generated table
    return content.replace(
      /<!-- LANGUAGE_TABLE_START -->[\s\S]*?<!-- LANGUAGE_TABLE_END -->/,
      table
    );
  } catch (error) {
    console.error('Error processing language table:', error);
    return content.replace(
      /<!-- LANGUAGE_TABLE_START -->[\s\S]*?<!-- LANGUAGE_TABLE_END -->/,
      '*Error loading language data*'
    );
  }
};

// Function to process injury table placeholders
const processInjuryTables = async (content: string): Promise<string> => {
  try {
    // Load all injury files from API endpoint
    const response = await fetch('/api/injuries');
    if (!response.ok) {
      throw new Error('Failed to load injuries data');
    }
    const injuries = await response.json();

    // Group injuries by type
    const injuriesByType: { [key: string]: any[] } = {};
    injuries.forEach((injury: any) => {
      if (!injuriesByType[injury.type]) {
        injuriesByType[injury.type] = [];
      }
      injuriesByType[injury.type].push(injury);
    });

    // Process each injury type table
    let processedContent = content;

    // Define the order and display names for injury types
    const injuryTypes = [
      { key: 'cosmetic_injury', name: 'Cosmetic Injuries' },
      { key: 'physical_injury', name: 'Physical Injuries' },
      { key: 'mental_injury', name: 'Mental Injuries' },
      { key: 'missing_part', name: 'Missing Parts' }
    ];

    for (const injuryType of injuryTypes) {
      const injuries = injuriesByType[injuryType.key] || [];
      // Sort by recovery_dc for physical/mental injuries (shows Minor/Major/Severe order)
      // Sort alphabetically for cosmetic injuries and missing parts
      const sortedInjuries = (injuryType.key === 'physical_injury' || injuryType.key === 'mental_injury')
        ? injuries.sort((a, b) => (a.recovery_dc || 0) - (b.recovery_dc || 0))
        : injuries.sort((a, b) => a.name.localeCompare(b.name));

      // Generate markdown table for this injury type with recovery info
      let table = '';

      // Different columns for different injury types
      if (injuryType.key === 'cosmetic_injury' || injuryType.key === 'missing_part') {
        // Cosmetic and missing parts don't have recovery mechanics
        table = `
| Name | Description |
|------|-------------|
`;
        sortedInjuries.forEach((injury: any) => {
          const description = injury.description.replace(/\|/g, '\\|');
          table += `| ${injury.name} | ${description} |\n`;
        });
      } else {
        // Physical and mental injuries show recovery mechanics
        const checkType = injuryType.key === 'physical_injury' ? 'Endurance' : 'Resilience';
        table = `
| Name | Description | Recovery Check |
|------|-------------|----------------|
`;
        sortedInjuries.forEach((injury: any) => {
          const description = injury.description.replace(/\|/g, '\\|');
          const recoveryDC = injury.recovery_dc || 10;
          table += `| ${injury.name} | ${description} | ${checkType} ${recoveryDC} |\n`;
        });
      }

      // Replace the placeholder for this injury type
      const regex = new RegExp(
        `<!-- ${injuryType.key.toUpperCase()}_TABLE_START -->[\\s\\S]*?<!-- ${injuryType.key.toUpperCase()}_TABLE_END -->`,
        'g'
      );
      processedContent = processedContent.replace(regex, table);
    }

    return processedContent;
  } catch (error) {
    console.error('Error processing injury tables:', error);
    // Replace all injury table placeholders with error message
    const injuryTypes = ['cosmetic_injury', 'physical_injury', 'mental_injury', 'missing_part'];
    let processedContent = content;

    for (const type of injuryTypes) {
      const regex = new RegExp(
        `<!-- ${type.toUpperCase()}_TABLE_START -->[\\s\\S]*?<!-- ${type.toUpperCase()}_TABLE_END -->`,
        'g'
      );
      processedContent = processedContent.replace(regex, '*Error loading injury data*');
    }

    return processedContent;
  }
};

// Function to process ancestry data placeholder
const processAncestryData = async (content: string): Promise<string> => {
  try {
    // Load all ancestries from API endpoint
    const response = await fetch('/api/ancestries');
    if (!response.ok) {
      throw new Error('Failed to load ancestries data');
    }
    const ancestries = await response.json();

    // Sort ancestries by name
    ancestries.sort((a: any, b: any) => a.name.localeCompare(b.name));

    // Generate ancestry sections
    let ancestryContent = '';

    for (const ancestry of ancestries) {
      // Escape any markdown characters in descriptions
      const description = ancestry.description?.replace(/\|/g, '\\|') || 'No description available.';

      // Generate correct portrait path
      const ancestryName = ancestry.name.toLowerCase().replace(/\s+/g, '-');
      const portraitPath = `/assets/races/${ancestryName}.png`;

      ancestryContent += `
<div class="ancestry-card">
  <div class="ancestry-header">
    <div class="ancestry-portrait">
      <img src="${portraitPath}" alt="${ancestry.name} Portrait" />
    </div>
    <div class="ancestry-info">
      <h3 class="ancestry-name">${ancestry.name.toUpperCase()}</h3>
      <div class="ancestry-size-type">${ancestry.size} Type</div>
      <div class="ancestry-details">
        <p><strong>Homeworld:</strong> ${ancestry.homeworld || 'Unknown'}</p>
        <p><strong>Lifespan:</strong> ${ancestry.lifespan || 'Unknown'}</p>
        <p><strong>Language:</strong> ${ancestry.language || 'Unknown'}</p>
      </div>
    </div>
  </div>

  <div class="ancestry-description">
    <p>${description}</p>
  </div>

  <div class="ancestry-traits">
    <h4>Actions / Traits</h4>
    <div class="traits-container">`;

      // Process options/traits with individual styling
      if (ancestry.options && ancestry.options.length > 0) {
        for (const option of ancestry.options) {
          if (option.name && option.description) {
            const optionDesc = option.description.replace(/\|/g, '\\|');
            ancestryContent += `
      <div class="trait-item">
        <div class="trait-name">${option.name}</div>
        <div class="trait-description">${optionDesc}</div>`;

            // Handle subchoices if they exist
            if (option.subchoices && option.subchoices.length > 0) {
              ancestryContent += `
        <div class="subchoices-container">
          <div class="subchoices-header">Choose one of the following:</div>`;

              for (const subchoice of option.subchoices) {
                if (subchoice.name && subchoice.description) {
                  const subchoiceDesc = subchoice.description.replace(/\|/g, '\\|');
                  ancestryContent += `
          <div class="subchoice-item">
            <div class="subchoice-name">• ${subchoice.name}</div>
            <div class="subchoice-description">${subchoiceDesc}</div>
          </div>`;
                }
              }

              ancestryContent += `
        </div>`;
            }

            ancestryContent += `
      </div>`;
          }
        }
      } else {
        ancestryContent += `
      <div class="trait-item">
        <div class="trait-name">No Traits</div>
        <div class="trait-description">Traits information not available</div>
      </div>`;
      }

      ancestryContent += `
    </div>
  </div>
</div>

<div class="triangle-line"></div>
`;
    }

    // Replace the placeholder with the generated content
    return content.replace(
      /<!-- ANCESTRY_DATA_START -->[\s\S]*?<!-- ANCESTRY_DATA_END -->/,
      ancestryContent.trim()
    );
  } catch (error) {
    console.error('Error processing ancestry data:', error);
    return content.replace(
      /<!-- ANCESTRY_DATA_START -->[\s\S]*?<!-- ANCESTRY_DATA_END -->/,
      '*Error loading ancestry data*'
    );
  }
};

// Function to process culture data placeholder
const processCultureData = async (content: string): Promise<string> => {
  try {
    // Load all cultures from API endpoint
    const response = await fetch('/api/cultures');
    if (!response.ok) {
      throw new Error('Failed to load cultures data');
    }
    const cultures = await response.json();

    // Sort cultures by name
    cultures.sort((a: any, b: any) => a.name.localeCompare(b.name));

    // Generate culture sections with professional layout
    let cultureContent = '';

    for (const culture of cultures) {
      // Escape any markdown characters in descriptions
      const description = culture.description?.replace(/\|/g, '\\|') || 'No description available.';

      // Generate correct portrait path
      const cultureName = culture.name.toLowerCase().replace(/\s+/g, '');
      const portraitPath = `/assets/cultures/${cultureName}.png`;

      cultureContent += `
<div class="ancestry-card">
  <div class="ancestry-header">
    <div class="ancestry-portrait">
      <img src="${portraitPath}" alt="${culture.name} Portrait" />
    </div>
    <div class="ancestry-info">
      <h3 class="ancestry-name">${culture.name.toUpperCase()}</h3>
      <div class="ancestry-size-type">Cultural Background</div>
      <div class="ancestry-description">
        <p>${description}</p>
      </div>
    </div>
  </div>

  <div class="ancestry-traits">
    <div class="traits-container">`;

      // Process cultural restrictions with choice handling
      if (culture.culturalRestrictions && culture.culturalRestrictions.length > 0) {
        cultureContent += `
      <div class="trait-item restriction-item">
        <div class="trait-name">Cultural Restriction</div>`;

        if (culture.culturalRestrictions.length > 1) {
          cultureContent += `
        <div class="subchoices-container">
          <div class="subchoices-header">Choose one of the following:</div>`;

          for (const restriction of culture.culturalRestrictions) {
            if (restriction.name && restriction.description) {
              const restrictionDesc = restriction.description.replace(/\|/g, '\\|');
              cultureContent += `
          <div class="subchoice-item">
            <div class="subchoice-name">• ${restriction.name}</div>
            <div class="subchoice-description">${restrictionDesc}</div>
          </div>`;
            }
          }

          cultureContent += `
        </div>`;
        } else {
          // Only one restriction, show it directly
          const restriction = culture.culturalRestrictions[0];
          const restrictionDesc = restriction.description.replace(/\|/g, '\\|');
          cultureContent += `
        <div class="trait-description">${restriction.name}: ${restrictionDesc}</div>`;
        }

        cultureContent += `
      </div>`;
      } else {
        cultureContent += `
      <div class="trait-item">
        <div class="trait-name">No Restrictions</div>
        <div class="trait-description">This culture has no specific restrictions</div>
      </div>`;
      }

      cultureContent += `
    </div>
    <div class="traits-container">`;

      // Process cultural benefits with choice handling
      if (culture.benefits && culture.benefits.length > 0) {
        cultureContent += `
      <div class="trait-item benefit-item">
        <div class="trait-name">Cultural Benefit</div>`;

        if (culture.benefits.length > 1) {
          cultureContent += `
        <div class="subchoices-container">
          <div class="subchoices-header">Choose one of the following:</div>`;

          for (const benefit of culture.benefits) {
            if (benefit.name && benefit.description) {
              const benefitDesc = benefit.description.replace(/\|/g, '\\|');
              cultureContent += `
          <div class="subchoice-item">
            <div class="subchoice-name">• ${benefit.name}</div>
            <div class="subchoice-description">${benefitDesc}</div>
          </div>`;
            }
          }

          cultureContent += `
        </div>`;
        } else {
          // Only one benefit, show it directly
          const benefit = culture.benefits[0];
          const benefitDesc = benefit.description.replace(/\|/g, '\\|');
          cultureContent += `
        <div class="trait-description">${benefit.name}: ${benefitDesc}</div>`;
        }

        cultureContent += `
      </div>`;
      } else {
        cultureContent += `
      <div class="trait-item">
        <div class="trait-name">No Benefits</div>
        <div class="trait-description">This culture has no specific benefits</div>
      </div>`;
      }

      cultureContent += `
    </div>
    <div class="traits-container">`;

      // Process starting items with choice handling
      if (culture.startingItems && culture.startingItems.length > 0) {
        cultureContent += `
      <div class="trait-item starting-item">
        <div class="trait-name">Starting Item</div>`;

        if (culture.startingItems.length > 1) {
          cultureContent += `
        <div class="subchoices-container">
          <div class="subchoices-header">Choose one of the following:</div>`;

          for (const item of culture.startingItems) {
            if (item.name && item.description) {
              const itemDesc = item.description.replace(/\|/g, '\\|');
              cultureContent += `
          <div class="subchoice-item">
            <div class="subchoice-name">• ${item.name}</div>
            <div class="subchoice-description">${itemDesc}</div>
          </div>`;
            }
          }

          cultureContent += `
        </div>`;
        } else {
          // Only one item, show it directly
          const item = culture.startingItems[0];
          const itemDesc = item.description.replace(/\|/g, '\\|');
          cultureContent += `
        <div class="trait-description">${item.name}: ${itemDesc}</div>`;
        }

        cultureContent += `
      </div>`;
      } else {
        cultureContent += `
      <div class="trait-item">
        <div class="trait-name">No Starting Items</div>
        <div class="trait-description">This culture provides no specific starting items</div>
      </div>`;
      }

      cultureContent += `
    </div>
  </div>
</div>

<div class="triangle-line"></div>
`;
    }

    // Replace the placeholder with the generated content
    return content.replace(
      /<!-- CULTURE_DATA_START -->[\s\S]*?<!-- CULTURE_DATA_END -->/,
      cultureContent.trim()
    );
  } catch (error) {
    console.error('Error processing culture data:', error);
    return content.replace(
      /<!-- CULTURE_DATA_START -->[\s\S]*?<!-- CULTURE_DATA_END -->/,
      '*Error loading culture data*'
    );
  }
};

// Function to process trait data placeholder
const processTraitData = async (content: string): Promise<string> => {
  try {
    // Load all traits from API endpoint
    const response = await fetch('/api/traits');
    if (!response.ok) {
      throw new Error('Failed to load traits data');
    }
    const traits = await response.json();

    // Sort traits by name
    traits.sort((a: any, b: any) => a.name.localeCompare(b.name));

    // Generate trait sections with simplified layout (no portraits)
    let traitContent = '';

    for (const trait of traits) {
      // Escape any markdown characters in descriptions
      const description = trait.description?.replace(/\|/g, '\\|') || 'No description available.';

      traitContent += `
<div class="trait-card">
  <div class="trait-header">
    <h3 class="trait-name">${trait.name.toUpperCase()}</h3>
    <div class="trait-description">
      <p>${description}</p>
    </div>
  </div>

  <div class="ancestry-traits">
    <div class="traits-container">`;

      // Process trait options - each option is gained, but some may have subchoices
      if (trait.options && trait.options.length > 0) {
        for (const option of trait.options) {
          if (option.name && option.description) {
            const optionDesc = option.description.replace(/\|/g, '\\|');
            traitContent += `
      <div class="trait-item">
        <div class="trait-name">${option.name}</div>
        <div class="trait-description">${optionDesc}</div>`;

            // Handle subchoices if they exist for this specific option
            if (option.subchoices && option.subchoices.length > 0) {
              traitContent += `
        <div class="subchoices-container">
          <div class="subchoices-header">Choose one of the following:</div>`;

              for (const subchoice of option.subchoices) {
                if (subchoice.name && subchoice.description) {
                  const subchoiceDesc = subchoice.description.replace(/\|/g, '\\|');
                  traitContent += `
          <div class="subchoice-item">
            <div class="subchoice-name">• ${subchoice.name}</div>
            <div class="subchoice-description">${subchoiceDesc}</div>
          </div>`;
                }
              }

              traitContent += `
        </div>`;
            }

            traitContent += `
      </div>`;
          }
        }
      } else {
        traitContent += `
      <div class="trait-item">
        <div class="trait-name">No Options</div>
        <div class="trait-description">This trait has no options</div>
      </div>`;
      }

      traitContent += `
    </div>
  </div>
</div>

<div class="triangle-line"></div>
`;
    }

    // Replace the placeholder with the generated content
    return content.replace(
      /<!-- TRAIT_DATA_START -->[\s\S]*?<!-- TRAIT_DATA_END -->/,
      traitContent.trim()
    );
  } catch (error) {
    console.error('Error processing trait data:', error);
    return content.replace(
      /<!-- TRAIT_DATA_START -->[\s\S]*?<!-- TRAIT_DATA_END -->/,
      '*Error loading trait data*'
    );
  }
};

// Function to process song data placeholder
const processSongData = async (content: string): Promise<string> => {
  try {
    // Load all songs from API endpoint
    const response = await fetch('/api/songs');
    if (!response.ok) {
      throw new Error('Failed to load songs data');
    }
    const songs = await response.json();

    // Sort songs by name
    songs.sort((a: any, b: any) => a.name.localeCompare(b.name));

    // Group songs by magical vs non-magical
    const regularSongs = songs.filter((song: any) => !song.magical);
    const magicalSongs = songs.filter((song: any) => song.magical);

    // Generate song table content
    let songContent = '';

    // Regular Songs Section
    if (regularSongs.length > 0) {
      songContent += `
## Regular Songs

| Name | Difficulty | Effect | Harmony Effect |
|------|------------|---------|----------------|`;

      for (const song of regularSongs) {
        const harmonyEffect = song.harmony_1 ? song.harmony_1.effect : 'None';
        songContent += `
| **${song.name}** | ${song.difficulty} | ${song.effect} | ${harmonyEffect} |`;
      }

      songContent += `

<div class="triangle-line"></div>
`;
    }

    // Magical Songs Section
    if (magicalSongs.length > 0) {
      songContent += `
## Magical Songs

| Name | Difficulty | Effect | Harmony Effect |
|------|------------|---------|----------------|`;

      for (const song of magicalSongs) {
        const harmonyEffect = song.harmony_1 ? song.harmony_1.effect : 'None';
        songContent += `
| **${song.name}** | ${song.difficulty} | ${song.effect} | ${harmonyEffect} |`;
      }
    }

    // Replace the placeholder with the generated content
    return content.replace(
      /<!-- SONG_DATA_START -->[\s\S]*?<!-- SONG_DATA_END -->/,
      songContent.trim()
    );
  } catch (error) {
    console.error('Error processing song data:', error);
    return content.replace(
      /<!-- SONG_DATA_START -->[\s\S]*?<!-- SONG_DATA_END -->/,
      '*Error loading song data*'
    );
  }
};

// Function to process condition data placeholder
const processConditionData = async (content: string): Promise<string> => {
  try {
    // Load all conditions from API endpoint
    const response = await fetch('/api/conditions');
    if (!response.ok) {
      throw new Error('Failed to load conditions data');
    }
    const conditions = await response.json();

    // Group conditions by category
    const mentalConditions = conditions.filter((c: any) => c.category === 'Mental');
    const physicalConditions = conditions.filter((c: any) => c.category === 'Physical');

    // Generate condition sections
    let conditionContent = '';

    // Helper function to render a condition with optional table
    const renderCondition = (condition: any): string => {
      let content = `
### ${condition.name}
${condition.description}
`;

      // If the condition has a table with actual content, render it
      if (condition.table &&
          condition.table.columns &&
          condition.table.rows &&
          condition.table.columns.length > 0 &&
          condition.table.rows.length > 0) {
        content += `\n`;

        // Create table header
        const headerRow = condition.table.columns.join(' | ');
        const separatorRow = condition.table.columns.map(() => '---').join(' | ');
        content += `| ${headerRow} |\n`;
        content += `| ${separatorRow} |\n`;

        // Create table rows
        for (const row of condition.table.rows) {
          content += `| ${row.join(' | ')} |\n`;
        }

        content += `\n`;
      }

      return content;
    };

    // Mental Conditions
    if (mentalConditions.length > 0) {
      for (const condition of mentalConditions) {
        conditionContent += renderCondition(condition);
      }
    }

    // Physical Conditions marker
    conditionContent += `## Physical Conditions
<div class="triangle-line"></div>

`;

    // Physical Conditions
    if (physicalConditions.length > 0) {
      for (const condition of physicalConditions) {
        conditionContent += renderCondition(condition);
      }
    }

    // Replace the placeholder with the generated content
    return content.replace(
      /<!-- CONDITION_DATA_START -->[\s\S]*?<!-- CONDITION_DATA_END -->/,
      conditionContent.trim()
    );
  } catch (error) {
    console.error('Error processing condition data:', error);
    return content.replace(
      /<!-- CONDITION_DATA_START -->[\s\S]*?<!-- CONDITION_DATA_END -->/,
      '*Error loading condition data*'
    );
  }
};

// Function to process substance table placeholders
const processSubstanceTables = async (content: string): Promise<string> => {
  try {
    // Load all items from API endpoint
    const response = await fetch('/api/items');
    if (!response.ok) {
      throw new Error('Failed to load items data');
    }
    const items = await response.json();

    // Filter for substance items
    const substances = items.filter((item: any) =>
      item.substance && item.substance.category
    );

    // Group substances by category
    const substancesByCategory: { [key: string]: any[] } = {
      'alcohol': [],
      'painkiller': [],
      'depressant': [],
      'euphoric': []
    };

    substances.forEach((substance: any) => {
      const category = substance.substance.category;
      if (substancesByCategory[category]) {
        substancesByCategory[category].push(substance);
      }
    });

    // Process each substance category table
    let processedContent = content;

    const categories = [
      { key: 'alcohol', marker: 'ALCOHOL' },
      { key: 'painkiller', marker: 'PAINKILLER' },
      { key: 'depressant', marker: 'DEPRESSANT' },
      { key: 'euphoric', marker: 'EUPHORIC' }
    ];

    for (const category of categories) {
      const categorySubstances = substancesByCategory[category.key] || [];

      if (categorySubstances.length === 0) {
        // If no substances, just show empty message
        const emptyTable = `\n*No ${category.key} substances available yet*\n`;
        processedContent = processedContent.replace(
          new RegExp(`<!-- SUBSTANCE_${category.marker}_TABLE_START -->[\\s\\S]*?<!-- SUBSTANCE_${category.marker}_TABLE_END -->`, 'g'),
          emptyTable
        );
        continue;
      }

      // Sort substances by dependency modifier (ascending)
      const sortedSubstances = categorySubstances.sort((a, b) => {
        const depA = a.substance?.dependency || 0;
        const depB = b.substance?.dependency || 0;
        return depA - depB;
      });

      // Generate markdown table
      let table = `
| Name | Description | Dependency Modifier |
|------|-------------|---------------------|
`;

      sortedSubstances.forEach((substance: any) => {
        const description = substance.description.replace(/\|/g, '\\|');
        const modifier = substance.substance?.dependency || 0;
        const modifierStr = modifier > 0 ? `+${modifier}` : `${modifier}`;
        table += `| ${substance.name} | ${description} | ${modifierStr} |\n`;
      });

      // Replace the placeholder with the generated table
      processedContent = processedContent.replace(
        new RegExp(`<!-- SUBSTANCE_${category.marker}_TABLE_START -->[\\s\\S]*?<!-- SUBSTANCE_${category.marker}_TABLE_END -->`, 'g'),
        table
      );
    }

    return processedContent;
  } catch (error) {
    console.error('Error processing substance tables:', error);
    // Return content with error messages for each category
    let errorContent = content;
    const categories = ['ALCOHOL', 'PAINKILLER', 'DEPRESSANT', 'EUPHORIC', 'NOOTROPIC'];
    for (const category of categories) {
      errorContent = errorContent.replace(
        new RegExp(`<!-- SUBSTANCE_${category}_TABLE_START -->[\\s\\S]*?<!-- SUBSTANCE_${category}_TABLE_END -->`, 'g'),
        '*Error loading substance data*'
      );
    }
    return errorContent;
  }
};

// Function to convert range code to human-readable format
const convertRangeCode = (rangeCode: number): string => {
  const rangeMap: { [key: number]: string } = {
    1: 'Adjacent',
    2: 'Nearby',
    3: 'Very Short',
    4: 'Short',
    5: 'Moderate',
    6: 'Far',
    7: 'Very Far',
    8: 'Distant',
    9: 'Unlimited'
  };
  return rangeMap[rangeCode] || 'Unknown';
};

// Function to convert range to human-readable format
const convertRange = (minRange: number, maxRange: number): string => {
  if (minRange === maxRange) {
    return convertRangeCode(minRange);
  } else {
    return `${convertRangeCode(minRange)}-${convertRangeCode(maxRange)}`;
  }
};

// Function to convert category to human-readable format
const convertCategory = (category: string): string => {
  if (!category || category === 'none') return '-';

  // Handle magic categories
  if (category.includes('magic')) {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Capitalize first letter for other categories
  return category.charAt(0).toUpperCase() + category.slice(1);
};

// Function to process weapon data placeholder
const processWeaponTables = async (content: string): Promise<string> => {
  try {
    // Load all items from API endpoint
    const response = await fetch('/api/items');
    if (!response.ok) {
      throw new Error('Failed to load items data');
    }
    const items = await response.json();

    // Filter for weapons only
    const weapons = items.filter((item: any) => item.type === 'weapon');

    // Categorize weapons - detect staves/wands by magic category
    const categorizeWeapon = (weapon: any) => {
      const primaryCategory = weapon.primary?.category || '';

      // Check if it's a magical implement
      if (primaryCategory.includes('magic')) {
        return weapon.hands === 2 ? 'staves' : 'wands';
      }

      // Use weapon_category for everything else
      return weapon.weapon_category;
    };

    // Group weapons by category
    const weaponsByCategory: { [key: string]: any[] } = {
      simpleMelee: [],
      complexMelee: [],
      simpleRanged: [],
      complexRanged: [],
      throwing: [],
      staves: [],
      wands: [],
      unarmed: []
    };

    weapons.forEach((weapon: any) => {
      const category = categorizeWeapon(weapon);
      if (weaponsByCategory[category]) {
        weaponsByCategory[category].push(weapon);
      }
    });

    // Sort each category by name
    Object.keys(weaponsByCategory).forEach(category => {
      weaponsByCategory[category].sort((a, b) => a.name.localeCompare(b.name));
    });

    // Helper function to generate table for a weapon group
    const generateTable = (weapons: any[], handsFilter?: number) => {
      // Filter by hands if specified
      const filteredWeapons = handsFilter
        ? weapons.filter(w => (w.hands || 1) === handsFilter)
        : weapons;

      if (filteredWeapons.length === 0) return '';

      let table = `
| Name | Damage | Energy | Range | Category | Special |
|------|--------|--------|-------|----------|---------|
`;

      // Generate rows for primary attacks only
      filteredWeapons.forEach((weapon: any) => {
        const attack = weapon.primary;
        if (!attack || !attack.damage) return;

        const name = weapon.name;
        const damageType = attack.damage_type || 'physical';
        const damage = `${attack.damage}/${attack.damage_extra} ${damageType}`;
        const energy = attack.energy || 0;
        const range = convertRange(attack.min_range || 1, attack.max_range || 1);
        const category = convertCategory(attack.category || '');

        // Build special properties
        const specials = [];
        if (attack.ammo_capacity && attack.ammo_capacity > 0) {
          specials.push('Reload');
        }
        if (weapon.secondary && weapon.secondary.damage) {
          specials.push('Alternate Attack');
        }
        const special = specials.length > 0 ? specials.join(', ') : '-';

        table += `| ${name} | ${damage} | ${energy} | ${range} | ${category} | ${special} |\n`;
      });

      return table;
    };

    let processedContent = content;

    // Process Simple Melee (1h and 2h)
    const simpleMelee1h = generateTable(weaponsByCategory.simpleMelee, 1);
    const simpleMelee2h = generateTable(weaponsByCategory.simpleMelee, 2);
    const simpleMeleeTable = (simpleMelee1h ? `### One-Handed\n${simpleMelee1h}` : '') +
                            (simpleMelee2h ? `\n### Two-Handed\n${simpleMelee2h}` : '');
    processedContent = processedContent.replace(
      /<!-- SIMPLE_MELEE_TABLE_START -->[\s\S]*?<!-- SIMPLE_MELEE_TABLE_END -->/,
      simpleMeleeTable
    );

    // Process Complex Melee (1h and 2h)
    const complexMelee1h = generateTable(weaponsByCategory.complexMelee, 1);
    const complexMelee2h = generateTable(weaponsByCategory.complexMelee, 2);
    const complexMeleeTable = (complexMelee1h ? `### One-Handed\n${complexMelee1h}` : '') +
                             (complexMelee2h ? `\n### Two-Handed\n${complexMelee2h}` : '');
    processedContent = processedContent.replace(
      /<!-- COMPLEX_MELEE_TABLE_START -->[\s\S]*?<!-- COMPLEX_MELEE_TABLE_END -->/,
      complexMeleeTable
    );

    // Process Simple Ranged
    const simpleRangedTable = generateTable(weaponsByCategory.simpleRanged);
    processedContent = processedContent.replace(
      /<!-- SIMPLE_RANGED_TABLE_START -->[\s\S]*?<!-- SIMPLE_RANGED_TABLE_END -->/,
      simpleRangedTable
    );

    // Process Complex Ranged
    const complexRangedTable = generateTable(weaponsByCategory.complexRanged);
    processedContent = processedContent.replace(
      /<!-- COMPLEX_RANGED_TABLE_START -->[\s\S]*?<!-- COMPLEX_RANGED_TABLE_END -->/,
      complexRangedTable
    );

    // Process Throwing
    const throwingTable = generateTable(weaponsByCategory.throwing);
    processedContent = processedContent.replace(
      /<!-- THROWING_TABLE_START -->[\s\S]*?<!-- THROWING_TABLE_END -->/,
      throwingTable
    );

    // Process Staves
    const stavesTable = generateTable(weaponsByCategory.staves);
    processedContent = processedContent.replace(
      /<!-- STAVES_TABLE_START -->[\s\S]*?<!-- STAVES_TABLE_END -->/,
      stavesTable
    );

    // Process Wands
    const wandsTable = generateTable(weaponsByCategory.wands);
    processedContent = processedContent.replace(
      /<!-- WANDS_TABLE_START -->[\s\S]*?<!-- WANDS_TABLE_END -->/,
      wandsTable
    );

    // Process Unarmed
    const unarmedTable = generateTable(weaponsByCategory.unarmed);
    processedContent = processedContent.replace(
      /<!-- UNARMED_TABLE_START -->[\s\S]*?<!-- UNARMED_TABLE_END -->/,
      unarmedTable
    );

    return processedContent;
  } catch (error) {
    console.error('Error processing weapon tables:', error);
    // Replace all weapon table placeholders with error message
    const markers = ['SIMPLE_MELEE', 'COMPLEX_MELEE', 'SIMPLE_RANGED', 'COMPLEX_RANGED', 'THROWING', 'STAVES', 'WANDS', 'UNARMED'];
    let processedContent = content;

    for (const marker of markers) {
      const regex = new RegExp(
        `<!-- ${marker}_TABLE_START -->[\\s\\S]*?<!-- ${marker}_TABLE_END -->`,
        'g'
      );
      processedContent = processedContent.replace(regex, '*Error loading weapon data*');
    }

    return processedContent;
  }
};

const WikiPage = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [content, setContent] = useState<string>('');
  const [pageInfo, setPageInfo] = useState<WikiPage | null>(null);
  const [structure, setStructure] = useState<WikiStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load structure if not already loaded
        const structureRes = await fetch('/wiki/structure.json');
        const structureData = await structureRes.json();
        setStructure(structureData);

        // Find page info
        const page = structureData.pages.find((p: WikiPage) => p.id === pageId);
        if (!page) {
          setError('Page not found');
          return;
        }

        setPageInfo(page);

        // Load page content
        const contentRes = await fetch(`/wiki/${page.path}`);
        if (!contentRes.ok) {
          throw new Error('Failed to load page content');
        }
        let contentText = await contentRes.text();

        // Process language table if present
        if (contentText.includes('<!-- LANGUAGE_TABLE_START -->')) {
          contentText = await processLanguageTable(contentText);
        }

        // Process injury tables if present
        if (contentText.includes('_TABLE_START -->')) {
          contentText = await processInjuryTables(contentText);
        }

        // Process ancestry data if present
        if (contentText.includes('<!-- ANCESTRY_DATA_START -->')) {
          contentText = await processAncestryData(contentText);
        }

        // Process culture data if present
        if (contentText.includes('<!-- CULTURE_DATA_START -->')) {
          contentText = await processCultureData(contentText);
        }

        // Process trait data if present
        if (contentText.includes('<!-- TRAIT_DATA_START -->')) {
          contentText = await processTraitData(contentText);
        }

        // Process song data if present
        if (contentText.includes('<!-- SONG_DATA_START -->')) {
          contentText = await processSongData(contentText);
        }

        // Process condition data if present
        if (contentText.includes('<!-- CONDITION_DATA_START -->')) {
          contentText = await processConditionData(contentText);
        }

        // Process substance tables if present
        if (contentText.includes('<!-- SUBSTANCE_')) {
          contentText = await processSubstanceTables(contentText);
        }

        // Process weapon tables if present
        if (contentText.includes('_TABLE_START -->') && (
            contentText.includes('MELEE') || contentText.includes('RANGED') ||
            contentText.includes('THROWING') || contentText.includes('STAVES') ||
            contentText.includes('WANDS') || contentText.includes('UNARMED')
          )) {
          contentText = await processWeaponTables(contentText);
        }

        setContent(contentText);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    if (pageId) {
      loadPage();
    }
  }, [pageId]);

  // Find previous and next pages
  const findAdjacentPages = () => {
    if (!structure || !pageInfo) return { prev: null, next: null };

    const currentIndex = structure.pages.findIndex((p) => p.id === pageInfo.id);
    const prev = currentIndex > 0 ? structure.pages[currentIndex - 1] : null;
    const next =
      currentIndex < structure.pages.length - 1 ? structure.pages[currentIndex + 1] : null;

    return { prev, next };
  };

  const { prev, next } = findAdjacentPages();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
        <p className="text-gray-400">{error}</p>
        <Link to="/wiki" className="mt-4 inline-block text-purple-400 hover:text-purple-300">
          ← Back to Wiki Home
        </Link>
      </div>
    );
  }

  return (
    <article className="wiki-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={{
          // Custom link renderer for internal wiki links
          a: ({ href, children }) => {
            if (href?.startsWith('/wiki/')) {
              return (
                <Link to={href} className="internal-link">
                  {children}
                </Link>
              );
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
          // Override table wrapper to add overflow handling
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Navigation */}
      <div className="wiki-nav">
        {prev ? (
          <Link to={`/wiki/${prev.id}`} className="wiki-nav-link">
            <ArrowLeftIcon className="w-4 h-4" />
            <span>{prev.title}</span>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link to={`/wiki/${next.id}`} className="wiki-nav-link">
            <span>{next.title}</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </article>
  );
};

export default WikiPage;
