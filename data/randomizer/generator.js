const fs = require("fs");
const OpenAI = require("openai");
let gptKey = JSON.parse(fs.readFileSync("gpt.json"));
const api = new OpenAI({apiKey: gptKey.key});

const SUBRACE_CHANCE = 15;
const SUBRACE_NAME_CHANCE = 30;
const ORIGIN_CHANCE = 20;
const RANDOM_INTEREST_CHANCE = 50;
const DEAD_PARENT_CHANCE = 20;

const SETTING_PROMPT = `that is part of a fantasy setting taking place on one of 5 moons surrounding a green gas giant named Viridus. Only mention setting information when it is relevant to the character's biography.`

let items = JSON.parse(fs.readFileSync("data/items/items.json")).filter(obj => obj.cost < 1000);


//get an item by its id
function getItemById(id){
    let tmpItem = items.find(obj => obj.id === parseInt(id));
    let item = {};
    if(tmpItem)
        item = JSON.parse(JSON.stringify(tmpItem));
    else{
        console.log("**** COUDL NTO FIND ITEM*****", id);
    }
     
    return item;
}

function getRandomItem(){
    let tmpItem = items[Math.floor(Math.random() * items.length)];
    return JSON.parse(JSON.stringify(tmpItem));
}

const hair = [
    { description: "long, flowing locks with a glossy COLOR sheen" },
    { description: "short, spiky hair that has a vibrant COLOR tint" },
    { description: "medium-length, curly hair, bouncing with COLOR highlights" },
    { description: "sleek, straight hair that falls smoothly in a COLOR cascade" },
    { description: "voluminous, wavy hair, full of COLOR and life" },
    { description: "tightly coiled, natural hair, rich in COLOR texture" },
    { description: "chin-length bob, sleek and shiny in a COLOR hue" },
    { description: "thick, layered hair, with COLOR streaks throughout" },
    { description: "shaved head, with a soft COLOR fuzz giving a subtle hue" },
    { description: "buzz cut, neat and tidy, with a COLOR tone" },
    { description: "long, COLOR dreadlocks, full of character" },
    { description: "short, pixie cut that playfully shows off the COLOR shade" },
    { description: "undercut style, with COLOR hair on top contrasting the shaved sides" },
    { description: "braided hair, intricately woven with COLOR strands" },
    { description: "shoulder-length, with COLOR waves gently framing the face" },
    { description: "pompadour style, bold and voluminous in COLOR" },
    { description: "cropped, curly hair that softly enhances the COLOR" },
    { description: "long, COLOR ponytail, sleek and practical" },
    { description: "afro style, proud and fluffy with a deep COLOR tone" },
    { description: "mohawk, daring and spiked in a bright COLOR" },
    { description: "balding, with wisps of COLOR hair remaining" },
    { description: "completely bald" },
    { description: "side-swept bangs, adding a mysterious touch to the COLOR hair" },
    { description: "layered, COLOR hair, creating a lively texture" },
    { description: "fringed haircut, with COLOR bangs covering the forehead" },
    { description: "asymmetrical cut, quirky and COLOR" },
    { description: "man bun, gathering the long COLOR hair stylishly" },
    { description: "shaggy, tousled hair, carefree in its COLOR hue" },
    { description: "faux hawk, edgy with a striking COLOR streak" },
    { description: "bowl cut, neat and even in a COLOR shade" },
    { description: "slicked back hair, elegant and polished in COLOR" }
];


const fur = [
    { description: "soft, plush fur with a glossy COLOR sheen" },
    { description: "thick, dense fur, rich in COLOR texture" },
    { description: "short, sleek fur with a smooth COLOR finish" },
    { description: "long, flowing fur, shimmering in the COLOR light" },
    { description: "curly, fluffy fur, bouncy and full of COLOR" },
    { description: "fine, silky fur, delicate in its COLOR hue" },
    { description: "sparse, wiry fur with a rough COLOR texture" },
    { description: "ruffled, coarse fur, rugged in COLOR appearance" },
    { description: "patchy fur, with bold COLOR spots and patterns" },
    { description: "velvety, smooth fur, luxurious in COLOR" },
    { description: "brilliant, COLOR-striped fur, vivid and striking" },
    { description: "spiky, COLOR-tipped fur, edgy and wild" },
    { description: "glossy, COLOR-spotted fur, sleek and shiny" },
    { description: "fluffy, COLOR-tufted fur, soft and airy" },
    { description: "slick, water-resistant fur, a deep COLOR" },
    { description: "bushy, voluminous fur, bristling with COLOR" },
    { description: "sparse, COLOR-streaked fur, unique and varied" },
    { description: "tangled, shaggy fur, a rustic COLOR blend" },
    { description: "pristine, well-groomed fur, immaculate in COLOR" },
    { description: "bold, monochromatic COLOR fur, striking and pure" },
    { description: "mottled fur, a mix of COLOR shades and tones" },
    { description: "frost-tipped fur, with icy COLOR highlights" },
    { description: "silky, straight fur, flowing in a COLOR cascade" },
    { description: "dull, matte fur, subtle in its COLOR" },
    { description: "vibrant, COLOR-dyed fur, eye-catching and bright" },
    { description: "patterned fur, with intricate COLOR designs" },
    { description: "two-toned fur, a COLOR contrast that's visually striking" },
    { description: "layered fur, with varying shades of COLOR" },
    { description: "faded fur, with gentle COLOR transitions" },
    { description: "marbled fur, swirling with different COLOR tones" }
];

const facial_hair = [
    { description: "full, thick beard" },
    { description: "trimmed, neat goatee" },
    { description: "long, flowing wizard's beard" },
    { description: "short, stubbly shadow" },
    { description: "sleek, sculpted sideburns" },
    { description: "elegant, thin mustache" },
    { description: "rugged, unkempt beard" },
    { description: "classic, full mutton chops" },
    { description: "twirled, handlebar mustache" },
    { description: "sharp, defined chinstrap beard" },
    { description: "bushy, wild beard" },
    { description: "slight, barely-there stubble" },
    { description: "curly, dense beard" },
    { description: "long, braided beard" },
    { description: "tidy, pencil-thin mustache" },
    { description: "anchor-shaped beard" },
    { description: "short, clipped beard" },
    { description: "extended soul patch" },
    { description: "walrus-style mustache" },
    { description: "horseshoe mustache" },
    { description: "disconnected, patchy beard" },
    { description: "Van Dyke beard" },
    { description: "chevron mustache" },
    { description: "faint, light beard" },
    { description: "ducktail beard" },
    { description: "circle beard" },
    { description: "garibaldi beard" },
    { description: "full, thick chin curtain" },
    { description: "imperial mustache" }
];


const eyes = [
    { description: "sparkling, wide-set eyes with long lashes and a COLOR hue" },
    { description: "deep-set, brooding eyes with a mysterious COLOR shade" },
    { description: "almond-shaped eyes, vibrant with a COLOR tint, radiating warmth" },
    { description: "piercing, intense eyes, the irises a striking COLOR" },
    { description: "gentle, round eyes, soft with a soothing COLOR tone" },
    { description: "sharp, cunning eyes, glinting with a sly COLOR" },
    { description: "dreamy, large eyes, filled with a whimsical COLOR light" },
    { description: "narrow, observant eyes, keen with a COLOR glimmer" },
    { description: "bold, commanding eyes, a dominant COLOR presence" },
    { description: "soft, tender eyes, brimming with a compassionate COLOR" },
    { description: "lively, spirited eyes, sparkling with a playful COLOR" },
    { description: "mysterious, enigmatic eyes, a deep and endless COLOR" },
    { description: "warm, inviting eyes, glowing with a comforting COLOR" },
    { description: "intense, focused eyes, burning with a fiery COLOR" },
    { description: "serene, tranquil eyes, reflecting a peaceful COLOR" }
];

const hair_colors = [
    // Normal Hair Colors
    "black",
    "dark brown",
    "medium brown",
    "light brown",
    "chestnut brown",
    "brown with natural highlights",
    "dark blonde",
    "golden blonde",
    "honey blonde",
    "ash blonde",
    "strawberry blonde",
    "platinum blonde",
    "auburn",
    "copper",
    "red",
    "ginger",
    "salt and pepper",
    "silver",
    "white",
    "grey",
    "jet black",
    "espresso",
    "mocha",
    "caramel",
    "sandy blonde",
    "dirty blonde",
    "chocolate brown",
    "mahogany",
    "cinnamon",
    "amber",
    "rust",
    "wine",
    "cherry red",
    "burgundy",
    "dark auburn",
    "light auburn",
    "deep brown",
    "light grey",
    "charcoal grey",
    "midnight black",
    "electric blue",
    "neon green",
    "hot pink",
    "lavender",
    "turquoise",
    "bright orange",
    "pastel pink",
    "lemon yellow",
    "deep purple",
    "rose gold",
    "teal",
    "coral",
    "mint green",
    "indigo",
    "violet",
    "pastel blue",
    "bright red",
    "sunflower yellow",
    "peach",
    "opal",
    "seafoam green",
    "sapphire",
    "ruby red",
    "emerald green",
    "amethyst purple"
];

const scales = [
    { description: "small, overlapping COLOR scales, smooth to the touch" },
    { description: "large, plate-like COLOR scales, hard and protective" },
    { description: "shiny, iridescent COLOR scales, reflecting a spectrum of hues" },
    { description: "rough, jagged COLOR scales, with a gritty texture" },
    { description: "thin, translucent COLOR scales, almost invisible" },
    { description: "thick, armored COLOR scales, tough as steel" },
    { description: "flexible, rubbery COLOR scales, bending easily" },
    { description: "circular, coin-sized COLOR scales, neatly arranged" },
    { description: "diamond-shaped COLOR scales, sharp and pointed" },
    { description: "fine, sandpaper-like COLOR scales, abrasive to the touch" },
    { description: "feathered COLOR scales, soft and downy" },
    { description: "glossy, wet-look COLOR scales, slick and smooth" },
    { description: "spiny COLOR scales, forming a defensive barrier" },
    { description: "ridged, grooved COLOR scales, creating a patterned texture" },
    { description: "square, tessellated COLOR scales, fitting perfectly together" },
    { description: "pearlescent COLOR scales, shimmering with subtle colors" },
    { description: "granular, pebble-like COLOR scales, giving a bumpy texture" },
    { description: "elongated, rectangular COLOR scales, lined up in rows" },
    { description: "fused COLOR scales, forming a solid, unbroken surface" },
    { description: "patterned COLOR scales, with intricate, natural designs" },
    { description: "gleaming, metallic COLOR scales, catching the light" },
    { description: "velvety COLOR scales, surprisingly soft" },
    { description: "delicate, flaky COLOR scales, fragile to the touch" },
    { description: "vibrant, COLOR scales, standing out boldly" },
    { description: "matte, non-reflective COLOR scales, absorbing light" },
    { description: "dual-toned COLOR scales, displaying two shades" },
    { description: "speckled COLOR scales, dotted with various hues" },
    { description: "camouflaged COLOR scales, blending into the environment" },
    { description: "luminous COLOR scales, glowing softly" },
    { description: "mosaic-like COLOR scales, forming a complex pattern" }
];


const heterochormia = [
    { description: "captivating eyes with heterochromia, one a vivid COLOR and the other a contrasting COLOR2, creating a striking appearance" },
    { description: "unique and enchanting, one eye holds a deep COLOR hue while the other sparkles with a bright COLOR2" },
    { description: "mesmerizing heterochromic eyes, with the left eye a gentle COLOR and the right eye a bold COLOR2, reflecting a rare and intriguing charm" },
    { description: "intriguing eyes, each telling a different story: one shines with a soft COLOR, while the other pierces with a vibrant COLOR2" },
    { description: "harmonious yet contrasting, one eye mirrors the calmness of the ocean with a COLOR shade, while the other resembles the earth, rich in a COLOR2 tone" }
]

const colors = [
    "amber",
    "blue",
    "brown",
    "gray",
    "green",
    "hazel",
    "red",
    "violet",
    "black",
    "silver",
    "honey",
    "golden",
    "copper",
    "emerald",
    "sapphire",
    "charcoal",
    "aqua",
    "turquoise",
    "jade",
    "crimson",
    "lavender",
    "maroon",
    "navy",
    "teal",
    "olive",
    "indigo",
    "peach",
    "cerulean",
    "magenta",
    "chocolate"
];


const stout_folk_names = [
    fs.readFileSync('data/randomizer/names/dwarf_male.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/dwarf_female.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/dwarf_surnames.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/dwarf_birth.txt').toString().split("\n")
]
const elf_names = [
    fs.readFileSync('data/randomizer/names/elf_male.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/elf_female.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/elf_surnames.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/elf_birth.txt').toString().split("\n")
]
const human_names = [
    fs.readFileSync('data/randomizer/names/human_male.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/human_female.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/human_surnames.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/human_birth.txt').toString().split("\n")
]
const gnome_names = [
    fs.readFileSync('data/randomizer/names/gnome_male.txt').toString().split("\n"), 
    fs.readFileSync('data/randomizer/names/gnome_female.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/gnome_surnames.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/gnome_birth.txt').toString().split("\n")
]
const minotaur_names = [
    fs.readFileSync('data/randomizer/names/minotaur_male.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/minotaur_female.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/minotaur_surnames.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/minotaur_birth.txt').toString().split("\n")
]
const lizardman_names = [
    fs.readFileSync('data/randomizer/names/lizard_male.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/lizard_female.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/lizard_surnames.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/lizard_birth.txt').toString().split("\n")
]
const kobold_names = [
    fs.readFileSync('data/randomizer/names/kobold_male.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/kobold_female.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/kobold_surnames.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/kobold_birth.txt').toString().split("\n")
]
const orycotal_names = [];
const arahka_names =[];
const orc_names = [];
const goblin_names = [];
const half_giant_names = [
    fs.readFileSync('data/randomizer/names/halfgiant_male.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/halfgiant_female.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/halfgiant_surnames.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/halfgiant_birth.txt').toString().split("\n")];

const dragonkind_names = [];
const gnoll_names = [];
const gloxy_names = [ 
    fs.readFileSync('data/randomizer/names/gloxy_male.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/gloxy_female.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/gloxy_surnames.txt').toString().split("\n"),
    fs.readFileSync('data/randomizer/names/gloxy_birth.txt').toString().split("\n")];
const vethi_names=[];
const tidewalker_names=[];

const biography = `You are going to write a long backstory for a dungeons and dragons character ${SETTING_PROMPT}`;
const datingProfile2 = `Imagine you're a lovelorn scribe in a whimsical medieval world, tasked with crafting an irresistible dating advertisement for a character from a fantasy setting. This ad will be featured in the most prestigious section of a widely read medieval newspaper, circulating across five moons orbiting the vibrant green gas giant, Viridus. Your goal is to highlight the character's unique qualities, quirks, and possessions in a way that's both humorous and endearing, ensuring they catch the eye of potential suitors. Weave in the character's occupation, traits, and background as part of their charm, and don't forget to inject a bit of their personal flair with a catchy catchphrase. Be creative in how you link their setting, lineage, and physical attributes to why they'd be an unmissable opportunity for romance. Remember, whether they're a battle-hardened warrior with a soft spot for poetry or a cunning mage with an awkward side, it's all about showcasing their personality in a light that's impossible to ignore. Let's make readers fall head over heels for our character, eager to learn more about their adventures, fears, and dreams. Embrace the fantasy and let the magic of love do the rest.`;

const datingProfile = `You are going to write a long advertisement in a medieval newspaper for a dating profile writen in the first person. ${SETTING_PROMPT} Include a catchphrase, and a few paragraphs about why someone should date this individual while being upfront about about of their traits.`
const wantedPoster = `You are going to write a creative and wordy wanted poster for a specific crime commited by a fantasy character ${SETTING_PROMPT}. Be creative linking the physical attributes, possessions and traits together. The reward should be an amount of gold between 1-500 based on the severity of their crime`
const lookingForWork = "a cover letter in a fantasy medieval world for seeking a job"
const bonusPrompt = "Also, mention their catchphrase somewhere within the dating profile."
const smutNovel = "a corny romance or smut paragraph"

const biography2 = `Write a backstory for a character ${SETTING_PROMPT}`;

let promptType = biography;



function getPhysicalDescription(data){
    return `${data.first_name} has ${data.eyes} and ${data.body} and is ${data.height} tall. `
    

}

function getPossessions(data){
    let items = "";
    for(i in data.items){
        items += data.items[i].toLowerCase() + ",";
    }
    items = items.slice(0, -1) + ".";
    return items;
}


async function getWeaponDescription(data){
    const completion = await api.chat.completions.create({
        messages: [{ role: "system", content: data }],
        model: "gpt-3.5-turbo",
        //model: "gpt-4-turbo-preview",
      });
      let response = completion.choices[0].message.content;
      return response;
}

async function generateBiography(data, type) {
    let promptSuffix = ""
    let promptPrefix = "";
    //manipulate data here..
    console.log("OKAYOKAY", data, type);
    switch(type){
        case "0"://normla
       // promptPrefix=biography;
        promptPrefix = `Embark on a journey through the life of a character hailing from the vast expanses of a fantasy realm. Begin with their earliest memories, nestled within ${SETTING_PROMPT}, and trace their path from the innocence of youth through the trials and triumphs that define them. Delve into their heritage, exploring the influence of their lineage and the cultural tapestry of their ancestors. Narrate the pivotal moments that shaped their beliefs, their battles, both internal and external, and the relationships that forged their heart and spirit. Consider their accomplishments and failures, the secrets they hold dear, and the scars, both seen and unseen, that map their skin and soul. Reflect on their motivations, the dreams that propel them forward, and the fears that haunt their steps. Culminate in the present, painting a portrait of who they are now, a sum of their experiences, poised on the brink of their next great adventure. This biography is not just a recounting of events; it's an intimate exploration of a life lived in a world where magic breathes, danger lurks in shadowed corners, and destiny is not just a word, but a path carved by choice and chance.`
        promptSuffix = `As you weave this tapestry of life, remember to infuse your narrative with the textures of emotion, the colors of conflict, and the light of personal growth. Explore the depths of their relationships, the bonds forged in fire and the alliances tested by time. Illuminate the corners of their mind, revealing their hopes, fears, and the indomitable spirit that drives them forward. Consider the impact of their actions on the world around them, the legacy they aim to leave behind, and the footprints they've left on the hearts of others. This biography is an invitation to walk in their shoes, to feel the weight of their sword, and to dream their dreams. Let your final words not only summarize their past but also hint at their future, leaving the door ajar for endless possibilities. Craft a narrative so compelling that it feels as if the character could step off the page and into the realm of legend.`

        //promptSuffix = "Format the response to blend the traits, items and descriptions together seamlessly without actually repeating information in the prompt verbatim."
        break;
        case "1"://dating profile
        promptPrefix = `Picture this: You're penning your own enchanting dating advertisement, set to feature in the most celebrated section of a medieval newspaper that's circulated across five mystical moons orbiting the lush green gas giant, Viridus. As the protagonist of your tale, describe yourself in a way that's both captivating and humorous, showcasing your unique qualities, endearing quirks, and prized possessions. Share your occupation, traits, and lineage as if confiding in a dear friend, with a dash of flair and a memorable catchphrase. Make it clear why you're a catch, using your setting, background, and physical attributes to paint a vivid picture of your charm. Whether you're a daring adventurer with a penchant for poetry or a wise mage who's awkwardly charming, reveal your personality in a manner that makes suitors eager to join your journey. Let your voice be heard and let the magic of love do the rest. Be sure to include Emojis when appropriate.`;
        
        //promptPrefix=datingProfile2;
        promptSuffix = `In composing your advertisement, ensure it reads as a tale told by you, about you. Weave your traits, backstory, and belongings into a narrative that radiates your essence, steering clear of simply enumerating your features. Express your quirks, aspirations, and fears with sincerity and a touch of wit, as if you're engaging in a heartfelt conversation with potential companions. Your goal is to craft a vivid, personal introduction that not only entertains but also deeply resonates with readers, compelling them to envision a future filled with shared adventures and moments. Be authentic, be imaginative, and let your true self shine through every word, transforming this profile into an unforgettable invitation to a life less ordinary.`
       // promptSuffix = "Format the response to blend the traits, items and descriptions together seamlessly without actually repeating information in the prompt verbatim."
        break;
        case "2": //wanted poster
        //promptPrefix=wantedPoster;
         promptPrefix = `Step into the role of a seasoned bounty hunter or a watchful town crier as you draft a captivating wanted poster. This isn't just any poster; it's a call to arms against a character whose deeds have left a mark on the world ${SETTING_PROMPT}. Your task is to weave their physical attributes, unique possessions, and distinct traits into the tale of their crime, crafting a narrative that's as intriguing as it is informative. The crime in question should be vividly described, highlighting how it reflects the character's personality and abilities. As for the reward, it should range from 1 to 500 gold pieces, directly correlating with the crime's severity and the trouble they've caused. Be creative, and remember, every detail adds to the allure and urgency of the hunt.`
        promptSuffix = `As you bring this wanted poster to life, delve deep into the psyche of the character in question. Consider how their physical appearance might have aided their criminal endeavors or how their personal items are telltale signs of their misdeeds. Reflect on their traits—whether cunning, brute strength, or a silver tongue—and how these characteristics played into the crime committed. Paint a picture so vivid that those who read the poster can almost see the character before them, urging them to join the hunt. The reward, set between 1 and 500 gold pieces, should not only reflect the gravity of their actions but also entice would-be heroes and bounty hunters far and wide. This is more than a simple notice; it's a story, a warning, and a call to action all rolled into one. Let your words incite fear, caution, or even a grudging admiration for the cunning or audacity of the wanted. Make it unforgettable.`

        break;
    }

  
    try {
        const completion = await api.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {role: "system", content:"You are a biography generator for a table top role playing game for the Viridus Nexus, which is a system of moons that surround a gas giant called viridus. The character is from one of the moons which will be specified in the user prompt: Atlah(A moon where a day lasts an entire week and is a fairly temperate moon), Kragfel(A barren moon where the surface is harsh and roamed by wild dragons and most everyone lives underground), Vethi (A cold moon covered in ice and snow), Gloombarrow (A desolate land filled with the undead, some of which are civilized), Fonteras (A wild, frontier moon filled with lush, colorful jungles)."},
                { role: "user", content: `${promptPrefix} ${data} ${promptSuffix}`}
            ],
        });
        let response = completion.choices[0].message.content;
        return response;
    
    } catch (error) {
        // Log the error in detail
        console.error("Error occurred while calling API:", error);
    }
}



  
const HETEROCHROMIA_CHANCE = 10;

function getBody(data){
    switch(races[data.race].body){
        case "skin":
            let hairType = hair[Math.floor(Math.random() * hair.length)].description.replace("COLOR", hair_colors[Math.floor(Math.random() * hair_colors.length)]);
            if(data.gender == 0 && Math.floor(Math.random() * 100) > 60)
                hairType += " and a " + facial_hair[Math.floor(Math.random() * facial_hair.length)].description;
            data.body = hairType;
            break;
        case "fur":
            let furType = fur[Math.floor(Math.random() * fur.length)].description.replace("COLOR", hair_colors[Math.floor(Math.random() * hair_colors.length)]);
            data.body = furType;
            break;
        case "scale":
            let scaleType = scales[Math.floor(Math.random() * scales.length)].description.replace("COLOR", colors[Math.floor(Math.random() * colors.length)]);
            data.body = scaleType;
            break;
    }
}


function getEyes(data){
    let eye = "";
    if(Math.floor(Math.random() * 100) < HETEROCHROMIA_CHANCE ){
        eye = heterochormia[Math.floor(Math.random() * heterochormia.length)];
        data.eyes = eye.description.replace("COLOR", colors[Math.floor(Math.random() * colors.length)])
        data.eyes = data.eyes.replace("COLOR2", colors[Math.floor(Math.random() * colors.length)])
    }else{
        eye = eyes[Math.floor(Math.random() * eyes.length)] 
        data.eyes = eye.description.replace("COLOR", colors[Math.floor(Math.random() * colors.length)])
    }
}

function getCulturalDataString(age, data){
    let culturalString = "o";
    switch(age){
        case 0:
            culturalString += "xxxxxx";
            data.mp += 0;
            break;
        case 1:
            Math.floor(Math.random() * 100 > 50) ? culturalString += "oxxxxx":culturalString += "xoxxxx"
            data.mp += 2;
            break;
        case 2:
            Math.floor(Math.random() * 100 > 50) ? culturalString += "oxoxxx":culturalString += "xooxxx"
            data.mp += 4;
            break;
        case 3:
            Math.floor(Math.random() * 100 > 50) ?  culturalString += "ox": culturalString += "xo"
            Math.floor(Math.random() * 100 > 50) ? culturalString += "oxox":culturalString += "ooxx"
            data.mp += 6;
            break;   
        case 4:
            Math.floor(Math.random() * 100 > 50) ?  culturalString += "ox": culturalString += "xo"
            Math.floor(Math.random() * 100 > 50) ?  culturalString += "oxo": culturalString += "oox"
            Math.floor(Math.random() * 100 > 50) ?  culturalString += "o": culturalString += "o"
            data.mp += 9;
            break;
        default:
            console.log("ERROR", age);
    }

    return culturalString;
}

function buildPrompt(data){
    let racialString = "";
    let traitString = "";
    let pronounString = "";
    
    if(data.subtype){
        racialString = "half " + races[data.race].name + " half " + races[data.subtype].name;  
    }
    else
        racialString = races[data.race].name + (races[data.race].description == ""? "":"," + races[data.race].description);
    
    for(t in data.traits)
        traitString += data.traits[t].description + " ";
    switch(data.gender){
        case 0: pronounString = "He/Him";break;
        case 1: pronounString = "She/Her";break;
        case 2: pronounString = "They/Them";break;
    }

    let pp = `The character is named ${data.first_name} ${data.surname} who is ${data.age_description} ${racialString} with an occupation as a ${data.occupation.name.toLowerCase()}. ${getPhysicalDescription(data)} Their pronouns are ${pronounString}. ${getBirthString(data)} ${data.first_name} has the following traits: ${traitString} ${getOrigin(data)}${data.first_name} has the following items in their possession: ${getPossessions(data)}`;//${bonusPrompt}`;
    return pp;
}

function getHeightInImperial(tmpHeight){
    let height = String(tmpHeight).split(".");
    let inches = parseInt(parseFloat("." + height[1]) * 12);
    if(isNaN(inches) || !inches){
        inches = Math.floor(Math.random() * 12);
    }
    return `${height[0]}'${inches}"`;
}

const races = [
    {id:0, module_id:16, age_min: 18, weight:80,age_max: 70, size_min:3.1, size_max:5.2, name:"Stout-folk", description:"", body:"skin"},
    {id:1, module_id:10, age_min: 18, weight:110,age_max: 280, size_min:5.6, size_max:7.2, name:"Elf",description:"",body:"skin"},
    {id:2, module_id:7, age_min: 18, weight:100,age_max: 85, size_min:5.5, size_max:6.4, name:"Human",description:"",body:"skin"}, 
    {id:3, module_id:15, age_min: 18, weight:300,age_max: 60, size_min:7.5, size_max:9.4, name:"Minotaur",description:"",body:"fur"},
    {id:4, module_id:6, age_min: 18, weight:60,age_max: 105, size_min:2.7, size_max:4.7, name:"Gnome",description:"",body:"skin"},
    {id:5, module_id:3, age_min: 12, weight:90,age_max: 55, size_min:3.5, size_max:6.0, name:"Lizardman",description:"",body:"scale"},
    {id:6, module_id:12, age_min: 5, weight:50,age_max: 30, size_min:2.3, size_max:3.7, name:"Kobold",description:"",body:"fur"},
    {id:7, module_id:8, age_min: 20, weight:280,age_max: 150, size_min:8.0, size_max:10.1, name:"Half-Giant",description:"",body:"skin"},
    {id:8, module_id:19, age_min: 15, weight:45,age_max: 95, size_min:2.2, size_max:3.5, name:"Gloxy",description:"a small and furry humanoid race that resemble foxes or samoyeds",body:"fur"}
]

 //7 beastkin, 1, bordn adventurer, 4 durable, 5 extraplanar, 9 cycanthrope, 3 mixed, 2 pactbound, 8 vampire  (this is vocation_code)    
//if mixed, do subrace or if extraplanar do subrace
const origins = [
    {id:8, name:"Vampire", module_id:0},
    {id:7, name:"Beastkin", module_id:0},
    {id:9, name:"Lycanthrope", module_id:0},
    {id:2, name:"Pact", module_id:0},
    {id:3, name:"Mixed", module_id:0},
    {id:1, name:"Basic", module_id:0},
    {id:5, name:"Extra-Planar", module_id:0}
];

const planes = [
    {id:0, place:"Plane of Aeron", module_id:22},
    {id:1, place:"Plane of Okkor", module_id:24},
    {id:2, place:"The Infernal Plane", module_id:21},
    {id:3, place:"Plane of Dark Tides", module_id:23},
    {id:4, place:"The Feywild", module_id:25},
    {id:5, place:"The Plane of Divinity", module_id:26},
    {id:6, place:"The Spectral Plane", module_id:27},
]

function getOrigin(data){
    let originString = "";
    if(!data.origin)
        return "";
    switch(data.origin.id){
        case 8: originString = `${data.first_name} is also a vampire. `;break;
        case 2: originString = `${data.first_name} swore a pact to an ancient entity from the ${data.origin_type.place}. `;break;
        case 7:
            let randomAnimal = animals[Math.floor(Math.random() * animals.length)];
            originString = `${data.first_name} is also a beastkin who turns into (and has features of when in human form) a ${randomAnimal.name}. `;
            break;
        case 9:
            let fear = "";
            switch(data.origin_extra){
                case 0:
                    fear = "is afraid of fire and gets frightened by open flames"
                    break;
                case 1:
                    fear = "is afraid of water and the cold and cannot willfully cross bodies of water while in beast form"
                    break;
                case 2:
                    fear = "has an aversion and fear of silver"
                    break;
            }
            originString = `${data.first_name} is also a lycanthrope who turns into a beast and ${fear}. `;
            break;
        case 5: 
            originString = `${data.first_name} has connections with ${data.origin_type.place} `;
            switch(data.origin_type.id){
                case 0: originString += " and infused with the elemental air energy. "; break;
                case 1: originString += "and is infused with earthen power which manifests with physical attributes. "; break;
                case 2: originString += "and is infused with devilish features from the fiery plane. "; break;
                case 3: originString += "and is infused with icy demon features from the water plane. "; break;
                case 4: originString += "and is infused with fey magic. "; break;
                case 5: originString += "and is infused with divine power. "; break;
                case 6: originString += "and is infused with features of the undead. "; break;      
            }
            break;
        default:
            break;
    }
    return originString;
}

const names = [stout_folk_names, elf_names, human_names, minotaur_names, gnome_names, lizardman_names,kobold_names, half_giant_names, gloxy_names];
const traits = JSON.parse(fs.readFileSync("data/randomizer/traits.json"))
const interests = JSON.parse(fs.readFileSync("data/randomizer/objects/interests.json"))
const occupation = JSON.parse(fs.readFileSync("data/randomizer/occupation.json"))
const animals = JSON.parse(fs.readFileSync("data/randomizer/objects/animals.json"))
const food = JSON.parse(fs.readFileSync("data/randomizer/objects/food.json"))
const clothing = JSON.parse(fs.readFileSync("data/randomizer/objects/clothing.json"))
const tools = JSON.parse(fs.readFileSync("data/randomizer/objects/tools.json"))
const topics = JSON.parse(fs.readFileSync("data/randomizer/objects/topics.json"))
const weapons = JSON.parse(fs.readFileSync("data/randomizer/objects/weapons.json"))
const things = animals.concat(food).concat(tools).concat(topics).concat(weapons).concat(clothing);
const allergies = animals.concat(food).concat(animals);
const DEFAULT_HUMANOID = { id:0, wealth:0, name:"humanoid", description:"", gender: 0, level: 1, power:0, health: 15,type:2, subtype:0, size:3, attack:[0,0,0,0,0,0],damage:[0,0,0,0,0,0],actions:[], traits:[], spells:[],attributes:[0,0,0,0,0], speed:[0,0,0,0,0,0], crafts:[0,0,0,0,0,0,0],mitigations:[0,0,0,0,0,0,0,0],skills:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],skills_good:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],immunities:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]};

function getString(data){
    let traitString = "";
    for(x in data.traits)
        traitString += " |" + data.traits[x].name + "| "
    return data.first_name + " " + data.surname + " OCC(" + data.occupation.name + ")" + "  " + traitString;

}

function getDeath(data){
    switch(Math.floor(Math.random() * 10)){
        case 0: return "was killed tragically in an accident";
        case 1: return "died of old age peacefully in their bed";
        case 2: return "was stricken by an illness years ago that claimed their life.";
        case 3: return "died fighting valiantly";
        case 4: return "passed away unexpectantly at a young age";
        case 5: return "went missing and was never found";
        case 6: return "lost a duel";
        case 7: return "withered away due to the passing of time";
        case 8: return "had their heart give out due to grief";
        case 9: return "died when they very young";
    }
}

function getBirthString(data){
    let birthString = names[data.race][3][Math.floor(Math.random() * names[data.race][3].length)];
    let p1death = data.parent_one.dead ? ` who ${data.parent_one.cause_of_death}` :``;
    let p2death = data.parent_two.dead ? ` who ${data.parent_two.cause_of_death}` :``;
    let str = `${data.first_name} was born to a ${data.parent_one.occupation.toLowerCase()} named ${data.parent_one.name}${p1death} and a ${data.parent_two.occupation.toLowerCase()} named ${data.parent_two.name}${p2death}. They were born ${birthString}`
    return str;
}

function getParents(data){
    let occ1 = occupation[Math.floor(Math.random() * occupation.length)];
    let occ2 = occupation[Math.floor(Math.random() * occupation.length)];

    let parent_one = {name:"",items:[],occupation: occ1.name, race: data.race, age: (data.age + Math.floor(Math.random() * 10) + 18), gender:Math.floor(Math.random() * 2) > 0 ? 1 : 0}
    parent_one.name = getParentName(parent_one, data.surname);
    let parent_two = {name:"",items:[],occupation: occ2.name, race: data.subtype ? data.subtype : data.race,age: (data.age + Math.floor(Math.random() * 10) + 18), gender: parent_one.gender == 0 ? 1 : 0}
    parent_two.name = getParentName(parent_two);
    
     parseItems(parent_one, occ1.item);
     parseItems(parent_two, occ1.item);
    
    if(parent_one.age > races[parent_one.race].age_max + 10 || Math.floor(Math.random() * 100) < DEAD_PARENT_CHANCE )
        parent_one.dead = true;
    if(parent_two.age > races[parent_two.race].age_max + 10 || Math.floor(Math.random() * 100) < DEAD_PARENT_CHANCE)
        parent_two.dead = true;

    if(parent_one.dead)
        parent_one.cause_of_death = getDeath(data);
    if(parent_two.dead)
        parent_two.cause_of_death = getDeath(data);

    data.parent_one = parent_one;
    data.parent_two = parent_two;
    Math.floor(Math.random() * races.length)
}


function getRandom(data){
    data = data.charData;
    data.mp = 0;
    //create more data for parsing
    data.conditions = [];
    data.modules = [];
    data.items = [];
    data.spells = [];
    //create the base humanoid

    let humanoid = JSON.parse(JSON.stringify(DEFAULT_HUMANOID));
    //randomize gender
    if(!data.gender)
        getRandomGender("GENDER", data);

    //randomize race
    if(!data.race){
        getRandomRace(data);
        getRandomSecondaryRace(data);
    }

    getRandomName(data,data.race, data.subtype, data.gender);
    
    if(!data.age)
        data.age = getRandomAge(data.race, data.subtype);

    getEyes(data);
    getBody(data);
    data.movement = 0;
    data.health = 0;
    data.luck = 0;

    data.age_description = getAgeDescription(races[data.race], data.age, data);
    getParents(data);
    data.traits = getTraits(data);
    getOccupation(data);
    
    
    parseStats(data, humanoid);
    //let text = getBiography(data);
    
    
    return humanoid;
    
}

function getAgeModifier(data){
    let might = 0, social = 0, agility = 0, knowledge = 0; willpower = 0;
    switch(data.temp_age){
        case 0: 
            might = Math.floor(Math.random() * 2);
            agility = Math.floor(Math.random() * 2);
            willpower = Math.floor(Math.random() * 2) - 1;
            knowledge = Math.floor(Math.random() * 2) - 2;
            social = Math.floor(Math.random() * 2);
            break;
        case 1: 
            might = Math.floor(Math.random() * 2);
            agility = Math.floor(Math.random() * 2);
            willpower = Math.floor(Math.random() * 2);
            knowledge = Math.floor(Math.random() * 2) - 1;
            social = Math.floor(Math.random() * 2);
            break;
        case 2: 
            might = Math.floor(Math.random() * 2);
            agility = Math.floor(Math.random() * 2) - 1;
            willpower = Math.floor(Math.random() * 2);
            knowledge = Math.floor(Math.random() * 2);
            social = Math.floor(Math.random() * 2);
            break;
        case 3: 
            might = Math.floor(Math.random() * 2) - 1;
            agility = Math.floor(Math.random() * 2) - 1;
            willpower = Math.floor(Math.random() * 2);
            knowledge = Math.floor(Math.random() * 2) + 1;
            social = Math.floor(Math.random() * 2);
            break;
        case 4: 
            might = Math.floor(Math.random() * 2) - 2;
            agility = Math.floor(Math.random() * 2) - 2;
            willpower = Math.floor(Math.random() * 2) - 1;
            knowledge = Math.floor(Math.random() * 2) + 2;
            social = Math.floor(Math.random() * 2) - 1;
        break;
    }
    return [might, social, agility, knowledge, willpower];

}

function parseStats(data, humanoid){
    //set name
    humanoid.name = data.name;
    if(!humanoid.name)
        humanoid.name = data.first_name + " " + data.surname;
    //set race
    humanoid.race = races[data.race].module_id;
    //set subtype if there is one
    if(!data.subtype)
        humanoid.subtype = 0;
    else
        humanoid.subtype = data.origin_extra;

    if(data.origin){
        humanoid.origin = data.origin.id;
        humanoid.origin_extra = data.origin_extra;
    }
    let ageMod = getAgeModifier(data);
    humanoid.culture = {module_id:races[data.race].module_id, data:getCulturalDataString(data.temp_age, data), sub_module_id: data.subtype ? races[data.subtype].module_id : -1, sub_data: data.subtype ? getCulturalDataString(Math.max(0, data.temp_age - 2),data) : "" }
    data.tmp_height = getBaseHeight(data.race, data.subrace);
    data.weight_mod = 1.0;
    data.height_mod = 1.0
    humanoid.age = data.age;


    humanoid.mp = data.mp;
   
    //random wealth
    humanoid.wealth = Math.floor(Math.random() * 20);
    //set initial attribute points
    for(x in humanoid.attributes)
        humanoid.attributes[x] = ageMod[x];
    //go through traits and set everything correctly
    for(x in data.traits){
        //lets take care of height here
        if(data.traits[x].height_mod > 0)
            data.height_mod *= data.traits[x].height_mod;
        //lets also take care of money
        if(data.traits[x].wealth != "")
            humanoid.wealth += parseInt(data.traits[x].wealth);
        //for each attribute in the trait
        for(y in data.traits[x].attributes){ 
            //apply that to the total attributes
            humanoid.attributes[y] += data.traits[x].attributes[y];
        }
    }
    for(y in data.occupation.attributes)
        humanoid.attributes[y] += data.occupation.attributes[y];
    
    humanoid.wealth += parseInt(data.occupation.wealth);
    

    let actualHeight = data.tmp_height * data.height_mod;

    data.height = getHeightInImperial(actualHeight);

    humanoid.height = data.height;

    for(x in data.traits){
        if(data.traits[x].weight_mod > 0)
            data.weight_mod *= data.traits[x].weight_mod;
    }
    let baseWeight = getBaseWeight(data.race, data.subrace, actualHeight);

    humanoid.weight =  baseWeight * data.weight_mod;
    humanoid.size = getSize(humanoid.weight);
    //set initial skills
    //init and search
    humanoid.skills[9] = 0;
    humanoid.skills[15] = 0;
    //{ id:0, name:"humanoid", description:"", gender: 0, level: 1, power:0, health: 15,type:2, subtype:0, size:3, actions:[], traits:[], spells:[],attributes:[0,0,0,0,0], speed:[7,0,0,0,0,0], mitigations:[0,0,0,0,0,0,0,0],skills:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],skills_good:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],crafts:[0,0,0,0,0,0,0],immunities:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]};
    //******* OCCUPATION ********/
    //set craft based on occupation
    for(y in humanoid.crafts){
        humanoid.crafts[y] += data.occupation.crafts[y];
        for(z in data.crafts){
            humanoid.crafts[y] += parseInt(datacrafts[z].crafts[y]);
        }
    }
    //set skills based on occupation
    for(y in humanoid.skills){ //iterate through skills
        //set the skill (0-19 to the occupation one...easy)
        if(data.occupation.skills[y] == "x")
            humanoid.skills_good[y] = 1;
        else
            humanoid.skills[y] += parseInt(data.occupation.skills[y]);
        //for each trait in data....
        for(z in data.traits){
            //trait one is...
            if(data.traits[z].skills[y] == "x")
                humanoid.skills_good[y] = 1;
            else{
                humanoid.skills[y] += parseInt(data.traits[z].skills[y]);
            }
        }
    }

    for(i in data.occupation.attack)
        humanoid.attack[i] += parseInt(data.occupation.attack[i])
    for(i in data.occupation.damage)
        humanoid.damage[i] += parseInt(data.occupation.damage[i])

    for(i in data.traits){
        //parse trait stuff
        for(j in data.traits[i].mitigations)
            humanoid.mitigations[j] += parseInt(data.traits[i].mitigations[j])
        for(j in data.traits[i].attack)
            humanoid.attack[j] += parseInt(data.traits[i].attack[j])
        if(data.traits[i].extra)
            parseExtra(data, data.traits[i].extra);
        if(data.traits[i].item)
            parseItems(data, data.traits[i].item);
    }

    let traitStr = "";
    for(x in data.traits){
        traitStr += " |" + data.traits[x].name + "|";
    }
    //add random item
    data.items.push(getRandomItem());
    if(data.occupation.extra)
        parseExtra(data, data.occupation.extra);
    if(data.occupation.item)
        parseItems(data, data.occupation.item);    




    humanoid.wealth = Math.max(0, humanoid.wealth);
    //console.log("CULTURE", humanoid.culture, "WEIGHT",humanoid.weight , "\nHEIGHT ", humanoid.height, "\nAGE", humanoid.age ,"\nWEALTH", humanoid.wealth, "\nATTRIUBTES:", humanoid.attributes, "\nSKILLS", humanoid.skills, "\nSKILLS GOOD", humanoid.skills_good + "\nCRAFTS", humanoid.crafts , "\nMITIG", humanoid.mitigations, "\nATTACK", humanoid.attack, "\nDAMAGE", humanoid.damage);
    //console.log(data.conditions,data.modules,data.spells,data.movement,data.health, data.luck);
    humanoid.conditions = data.conditions;
    humanoid.modules =  data.modules;

    for(y in humanoid.modules){
        if(humanoid.modules[y] >= 200)
            humanoid.mp += 2;
        else
            humanoid.mp += 4
    }

    humanoid.items = data.items;
    


    humanoid.spells = data.spells;
    humanoid.movement = data.movement;
    humanoid.health = data.health;
    humanoid.luck = data.luck;
    humanoid.eyes = data.eyes;
    humanoid.hair = data.body;
    humanoid.age = data.age;

    for(i in data.extra_items)
        if(data.extra_items)
            if(data.extra_items[i].name != null)
                humanoid.items.push(data.extra_items[i]);
        
       

    data.items = [];

    for(i in humanoid.items)
        if(humanoid.items)
            if(humanoid.items[i].name != null)
                data.items.push(humanoid.items[i].name);
    


    humanoid.hiddenBio = buildPrompt(data);
    let superCode = "AV=" + data.movement+":AH="+data.health+":L="+data.luck+":";
    let conditions = "";
    let crafts = "";
    let damage = "";
    let attack = "";
    let skill = "";
    let trait = "";



    for(c in data.conditions)
        conditions+="I"+data.conditions[c]+":";
    
    if(humanoid.crafts[0] != 0)
        crafts+="AC6="+humanoid.crafts[0]+":";
    if(humanoid.crafts[1] != 0)
        crafts+="AC5="+humanoid.crafts[1]+":";
    if(humanoid.crafts[2] != 0)
        crafts+="AC1="+humanoid.crafts[2]+":";
    if(humanoid.crafts[3] != 0)
        crafts+="AC2="+humanoid.crafts[3]+":";
    if(humanoid.crafts[4] != 0)
        crafts+="AC3="+humanoid.crafts[4]+":";
    if(humanoid.crafts[5] != 0)
        crafts+="AC4="+humanoid.crafts[5]+":";
    if(humanoid.crafts[6] != 0)
        crafts+="AC7="+humanoid.crafts[6]+":";
     //damage ::  SLASH PIERCE CRUSH RANGE UNARMED SPELL
    if(humanoid.damage[0]!=0)
        damage+="AZA="+humanoid.damage[0]+":";
    if(humanoid.damage[1]!=0)
        damage+="AZC="+humanoid.damage[1]+":";
    if(humanoid.damage[2]!=0)
        damage+="AZB="+humanoid.damage[2]+":";
    if(humanoid.damage[3]!=0)
        damage+="AZ9="+humanoid.damage[3]+":";
    if(humanoid.damage[4]!=0)
        damage+="AZN="+humanoid.damage[4]+":";
    if(humanoid.damage[5]!=0)
        damage+="AZ4="+humanoid.damage[5]+":";

    if(humanoid.attack[0]!=0)
        attack+="AZ6="+humanoid.attack[0]+":";
    if(humanoid.attack[1]!=0)
        attack+="AZ8="+humanoid.attack[1]+":";
    if(humanoid.attack[2]!=0)
        attack+="AZ7="+humanoid.attack[2]+":";
    if(humanoid.attack[3]!=0)
        attack+="AZ5="+humanoid.attack[3]+":";
    if(humanoid.attack[4]!=0)
        attack+="AZM="+humanoid.attack[4]+":";
    if(humanoid.attack[5]!=0)
        attack+="AZ2="+humanoid.attack[5]+":";

    if(humanoid.skills[0]!=0)
        skill+="AD3="+humanoid.skills[0]+":";
    if(humanoid.skills[1]!=0)
        skill+="AD2="+humanoid.skills[1]+":";
    if(humanoid.skills[2]!=0)
        skill+="AD1="+humanoid.skills[2]+":"; 
    if(humanoid.skills[3]!=0)
        skill+="AS9="+humanoid.skills[3]+":";
    if(humanoid.skills[4]!=0)
        skill+="AS3="+humanoid.skills[4]+":";
    if(humanoid.skills[5]!=0)
        skill+="ASF="+humanoid.skills[5]+":";
    if(humanoid.skills[6]!=0)
        skill+="AS7="+humanoid.skills[6]+":";
    if(humanoid.skills[7]!=0)
        skill+="AS1="+humanoid.skills[7]+":";
    if(humanoid.skills[8]!=0)
        skill+="AS5="+humanoid.skills[8]+":";
    if(humanoid.skills[9]!=0)
        skill+="ASH="+humanoid.skills[9]+":";
    if(humanoid.skills[10]!=0)
        skill+="ASD="+humanoid.skills[10]+":";
    if(humanoid.skills[11]!=0)
        skill+="AS8="+humanoid.skills[11]+":";
    if(humanoid.skills[12]!=0)
        skill+="ASE="+humanoid.skills[12]+":";
    if(humanoid.skills[13]!=0)
        skill+="ASC="+humanoid.skills[13]+":";
    if(humanoid.skills[14]!=0)
        skill+="AS6="+humanoid.skills[14]+":";
    if(humanoid.skills[15]!=0)
        skill+="ASG="+humanoid.skills[15]+":";
    if(humanoid.skills[16]!=0)
        skill+="AS4="+humanoid.skills[16]+":";
    if(humanoid.skills[17]!=0)
        skill+="AS2="+humanoid.skills[17]+":";
    if(humanoid.skills[18]!=0)
        skill+="ASA="+humanoid.skills[18]+":";   
    if(humanoid.skills[19]!=0)
        skill+="ASB="+humanoid.skills[19]+":";   
    
    
    for(t in data.traits){
        trait += "J=" + data.traits[t].name + "-"+data.traits[t].description + ":";
    }
    trait += "J=" + data.occupation.name + "-" + data.occupation.description + ":";


    superCode += conditions + crafts + damage + attack + skill + trait;;
    humanoid.custom = superCode.slice(0, -1);
    

    //console.log(humanoid);

}

function parseItems(data, items){
    if(!items)
        return;
    items = items.split(":");

    for(i in items){

        try{

        switch(items[i].charAt(0)){
            case "L": //random item
                //console.log("************ RANDOM ITEM");
                let rand = getRandomItem();
                if(!rand)
                    continue;
                data.items.push(rand);
                break;
            case "J": //random from item
                //console.log("************ RANDOM ITEM FROM ARRAY");
                let irray = items[i].split("=");
                let multiItems = irray[1].split("-");
                let str = multiItems[Math.floor(Math.random() * multiItems.length)];
                str = str.split("$");
                let randomItem
                if(str[1]){
                    randomItem = getItemById(parseInt(str[0])); 
                    if(!randomItem)
                        continue;
                    randomItem.name = str[1]; 
                    randomItem.description = "";
                }else{
                    randomItem = getItemById(parseInt(str));
                    if(!randomItem)
                        continue;
                }
                data.items.push(randomItem);
                break;
            case "I": //ITEM
            //console.log("************ ITEM BY IDITEM");
                let exactItem = getItemById(parseInt(items[i].split("=")[1]))
                if(!exactItem)
                    continue;
                data.items.push(exactItem);
                break;
            case "W": //health
                //some logic to parse a weapon here
                //console.log("****************** ", items[i]);

                //data.items += parseInt(extra[e].split("=")[1]);
                break;
            case "F":
                //console.log("************ TEMPLATE ITEM");
                let item = getItemById(1);//get template item
                if(!item)
                    continue;

                let name = items[i].split("=")[1];
                if(name)
                    item.name = name;
                else
                    item.name = "unknown item"
                item.description = "";
                data.items.push(item);
                break;
        }
    }catch{
        console.log("ITEM SPLIT ERROR");
    }

        
    }

}

function parseExtra(data, extra){

    //console.log("PARSING EXTRA", extra);
    extra = extra.split(":");
    for(e in extra){
        switch(extra[e].charAt(0)){
            case "R": //random spell
                data.spells.push(extra[e].slice(1));
                break;
            case "L": //luck dice
                data.luck += parseInt(extra[e].split("=")[1]);
                break;
            case "S": //speed
                data.movement += parseInt(extra[e].split("=")[1]);
                break;
            case "H": //health
                data.health += parseInt(extra[e].split("=")[1]);
                break;
            case "C": //condition
                data.conditions.push(extra[e].split("=")[1]);
                break;
            case "M": //module
                data.modules.push(parseInt(extra[e].split("=")[1]));
                break;
            case "N": //random module  N=111-10-110
                let choices = extra[e].split("=")[1].split("-");
                data.modules.push(parseInt(choices[Math.floor(Math.random() * choices.length)]));
                break;
        }

        
    }

}



function getBaseHeight(race, subrace){
    let minSize = races[race].size_min;
    let maxSize = races[race].size_max;
    if(subrace){
        minSize = (races[subrace].size_min + minSize) / 2;
        maxSize = (races[subrace].size_max + maxSize) / 2;
    }
    const range = maxSize - minSize;
    const randomFactor = Math.floor(Math.random() * range);
    return randomFactor + minSize; 
}
function getBaseWeight(race, subrace, baseHeight){
    let rando = (Math.floor(Math.random() * 20) - 10);
    let p = (baseHeight - races[race].size_min) / (races[race].size_max - races[race].size_min);
    let weight = (races[race].weight + rando) *   (1 + p);
    return weight;
}

function getOccupation(data){
    let  occ = JSON.parse(JSON.stringify(occupation[Math.floor(Math.random() * occupation.length)]));
    if(occ.id == 104 || occ.id == 25){ //maybe 25?
        occ.name = animals[Math.floor(Math.random() * animals.length)].name + " " + occ.name;
    } 
    occ.description = occ.description.replace("NAME", data.first_name);
    data.occupation = occ;

}

function getSize(size){
    if(size > 265)
        return 3;//large
    else if(size > 80)
        return 2;//med
    else
        return 1;//small
}

function getTraits(data){
    let traitCopy = JSON.parse(JSON.stringify(traits));
    let interestCopy = JSON.parse(JSON.stringify(interests))
    let trait_array = [];
    const trait_quantity = Math.floor(Math.random() * 3) + 2

    if(Math.floor(Math.random() * 100) <  RANDOM_INTEREST_CHANCE){
        let randomInterest = interestCopy[Math.floor(Math.random() * interestCopy.length)];
        randomInterest.description = randomInterest.description.replace("NAME", data.first_name);
        if(randomInterest.id == 0 || randomInterest.id == 1 || randomInterest.id == 2 || randomInterest.id == 3 || randomInterest.id == 7){
            let thing = things[Math.floor(Math.random() * things.length)];
            let thing_desc = "";
            if(thing.plural)
                thing_desc = thing.plural.toLowerCase();
            else
                thing_desc = thing.name.toLowerCase();
            randomInterest.description = randomInterest.description.replace("THING", thing_desc);
            trait_array.push(randomInterest);
        }  //allergic to
        else if(randomInterest.id == 4){
            let allergy = allergies[Math.floor(Math.random() * allergies.length)];
            randomInterest.description = randomInterest.description.replace("THING", allergy.plural.toLowerCase());
            trait_array.push(randomInterest);
        }   
        //wears or inherited
        else if(randomInterest.id == 6){
            let items = data.parent_one.items.concat(data.parent_two.items);
            let maxValue = 0;
            let tempItem = {};
            for(i in items)
                if(items[i].cost > maxValue)
                    tempItem = items[i];
            if(tempItem = {}){
                tempItem = getRandomItem();
            }   
            randomInterest.description = randomInterest.description.replace("THIS", tempItem.name.toLowerCase());
            trait_array.push(randomInterest);
            if(!data.extra_items){
                data.extra_items = [];
                data.extra_items.push(tempItem);
            }
           
        }
    }
    for(let a = 0; a < trait_quantity; a++){
        let randomTrait = traitCopy[Math.floor(Math.random() * traitCopy.length)];
        randomTrait.description = randomTrait.description.replace("NAME", data.first_name);
        traitCopy = traitCopy.filter(trait => trait.id !== randomTrait.id);
        trait_array.push(randomTrait);
    }
    return trait_array;
}

function getRandomAge(race, subrace){
    let minAge = races[race].age_min;
    let maxAge = races[race].age_max;
    if(subrace){
        minAge = (races[subrace].age_min + minAge) / 2
        maxAge = (races[subrace].age_max + maxAge) / 2
    }
    let tempAge = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
    if(Math.floor(Math.random() * 100) <= 85){
        tempAge -= Math.floor(Math.random() * (minAge) + 10);
        tempAge = Math.max(tempAge, minAge);
    }
    return tempAge;
}

function getParentName(parent, surname){
    let name_race_id = parent.race;
    let surname_race_id = parent.race;
    let gender_name_id = parent.gender;
    if(parent.gender == 2)
        Math.floor(Math.random() * 100) > 50 ? gender_name_id = 0 : gender_name_id = 1;
    let surname_options = names[surname_race_id][2];
    let name_options = names[name_race_id][gender_name_id];
    let firstName = name_options[Math.floor(Math.random() * name_options.length)].replace(/[^a-zA-Z ]/g, "")
    let surName = surname ? surname : surname_options[Math.floor(Math.random() * surname_options.length)].replace(/[^a-zA-Z ]/g, "");
    return firstName + " " + surName;
}

function getRandomName(data, race, subrace, gender){
    let name_race_id = race;
    let surname_race_id = race;
    let gender_name_id = 0;
    if(subrace){
        name_race_id = Math.floor(Math.random() * 100) > SUBRACE_NAME_CHANCE ? name_race_id = name_race_id : name_race_id = subrace;
        surname_race_id = Math.floor(Math.random() * 100) > SUBRACE_NAME_CHANCE ? surname_race_id = surname_race_id : surname_race_id = subrace;
    }
    if(gender == 2)
        Math.floor(Math.random() * 100) > 50 ? gender_name_id = 0 : gender_name_id = 1;
    else
        gender_name_id = gender;
    let surname_options = names[surname_race_id][2];
    let name_options = names[name_race_id][gender_name_id];
    if(!data.first_name)
        data.first_name =  name_options[Math.floor(Math.random() * name_options.length)].replace(/[^a-zA-Z ]/g, "");
    if(!data.surname)
        data.surname = surname_options[Math.floor(Math.random() * surname_options.length)].replace(/[^a-zA-Z ]/g, "");
}
function getRandomRace(data){
    data.race = Math.floor(Math.random() * races.length);
}

function getRandomSecondaryRace(data){
    if(Math.floor(Math.random() * 100) < ORIGIN_CHANCE){
   // if(Math.floor(Math.random() * 100) < 111){ 
        //let origin = origins.find(obj => obj.id === 2);
        let origin = origins[Math.floor(Math.random() * origins.length)];
        if(origin.id == 9){ //fear for lycanthrope
            data.origin_extra = Math.floor(Math.random() * 3);
        }else if(origin.id == 3){
            let random_race;
             do {
                random_race = Math.floor(Math.random() * races.length);
            } while (random_race === data.race);  
            data.subtype = races.find(obj => obj.id === random_race).id;
            data.origin_extra = races.find(obj => obj.id === random_race).module_id;
        }
        if(origin.id == 2 || origin.id == 5){
            let plane = planes[Math.floor(Math.random() * planes.length)];
            data.origin_type = plane;
            if(origin.id == 5){//extraplnar
                data.subtype = plane.id; //which plane?
                data.origin_extra = plane.module_id;
            }else{
                data.origin_extra = planes[Math.floor(Math.random() * planes.length)].module_id;
            }
        }
        data.origin = origin;
        return;
    }
}

function getRandomGender(data){
    const random = Math.floor(Math.random() * 10);
    if(random < 5)
        data.gender = 0;
    else if(random < 9)
        data.gender = 1;
    else
        data.gender = 2;
}

function getAgeDescription(race, age, data){
    const ageSpan = race.age_max - race.age_min;
    const quarterLife = race.age_min + ageSpan * 0.45;
    const midLife = race.age_min + ageSpan * 0.6;
    const threeQuarterLife = race.age_min + ageSpan * 0.90;
    if (age === race.age_min) {
        data.temp_age = 0;
        return "a " + age +" year old young adult";
    } else if (age < quarterLife) {
        data.temp_age = 1;
        return "a " + age +" year old adult";
    } else if (age < midLife) {
        data.temp_age = 2;
        return "a " + age +" year old middle aged";
    } else if (age < threeQuarterLife) {
        data.health -= 2;
        data.temp_age = 3;
        return "an " + age +" year old elder";
    } else {
        data.health -= 5;
        data.temp_age = 4;
        return "an " + age +" year old ancient ";
    }
}


let weaponMap = new Map([["l1hs",getItemById(259)],["l1hb", getItemById(258)],["l1hp", getItemById(260)],["h1hs",getItemById(261)],["h1hb", getItemById(262)],["h1hp", getItemById(263)],["l2hs",getItemById(265)],["l2hb", getItemById(264)],["l2hp", getItemById(266)],["h2hs",getItemById(268)],["h2hb", getItemById(267)],["h2shp", getItemById(269)]]);

let treatments =  ["a dusted copper treatment of fairly low quality barely containing the muted power of the core", "a treatment of iron dust to seal the power", "a treatment with powdered silver", "a treatment containing specks of electrum dust", "a treatment containing of powdered gold", "an elaborate treatment of powdered platinum", "an expertly executed treatment made of powdered aetherium"]

let light1hs = ["short sword", "scimitar", "gladius", "falcata"];
let light2hs = ["twinblade", "double-edged longsword", "curved longblade", "scythe", "glaive"];
let light1hb = ["light mace","staff","cudgel"];
let light2hb = ["gnarled staff", "bo staff", "long flail", "quarterstaff"];
let light1hp = ["dagger", "stiletto", "dirk"];
let light2hp = ["short spear", "light pike", "swordstaff"];
let heavy1hs = ["broad sword", "long sword", "bastard sword"];
let heavy2hs = ["greatsword", "claymore", "greataxe", "halberd", "heavy glaive"];
let heavy1hb = ["iron club", "battle mace", "spiked morning star", "reinforced cudgel"];
let heavy2hb = ["greathammer", "warhammer"];
let heavy1hp = ["spear", "trident", "warpick"];
let heavy2hp = ["war spear", "pike", "warlance"];


let weaponTypes = [light1hs, light2hs, heavy1hs, heavy2hs, light1hb, light2hb, heavy1hb, heavy2hb, light1hp, light2hp, heavy1hp, heavy2hp];


let gemstones = [
    [
        ["Quartz", "A common crystal that is usually white or clear with a glass-like appearance.", 5, 0.1],
        ["Turquoise", "A blue to green mineral, often used in jewelry for its unique, vibrant hue.", 5, 0.1],
        ["Hematite", "A shiny, dark gray mineral, often polished for use in jewelry and decoration.", 5, 0.1],
        ["Malachite", "A bright green mineral with distinctive dark green banding, used in various decorative items.", 5, 0.1],
        ["Amethyst", "A purple variety of quartz, known for its violet color and often used in jewelry.", 5, 0.1]
    ],
    [
        ["Opal", "A gemstone with a mix of shimmering colors, often containing specks of green, blue, orange, and red.", 20, 0.1],
        ["Azurite", "A deep blue mineral, commonly used in jewelry and ornamentation for its striking blue color.", 20, 0.1],
        ["Lapis Lazuli", "A semi-precious stone known for its solid deep blue color, often with flecks of pyrite.", 20, 0.1],
        ["Obsidian", "A dark, glass-like volcanic rock, typically black in color and very smooth.", 20, 0.1],
        ["Agate", "A type of quartz available in a variety of colors, often found with stripes or bands of color.", 20, 0.1]
    ],
    [
        ["Bloodstone", "A dark green gem with red spots resembling drops of blood.", 50, 0.1],
        ["Jasper", "An opaque gemstone, often found in red, yellow, or brown, known for its grainy appearance.", 50, 0.1],
        ["Moonstone", "A translucent stone with a white, blue, or silver sheen, reminiscent of moonlight.", 50, 0.1],
        ["Onyx", "A smooth, black stone, often with white bands, known for its glossy finish.", 50, 0.1],
        ["Peridot", "A bright green gemstone, known for its clear, glassy appearance.", 50, 0.1],
        ["Chalcedony", "A form of quartz in milky or grayish-blue, known for its waxy luster.", 50, 0.1],
        ["Citrine", "A pale yellow to brownish orange variety of quartz, resembling the citrus fruit.", 50, 0.1],
        ["Carnelian", "A reddish-brown stone, often used in jewelry for its warm, deep color.", 50, 0.1]
    ],
    [
        ["Amber", "A golden to yellow-brown gem, often transparent, made from fossilized tree resin.", 100, 0.1],
        ["Garnet", "A deep red gemstone, known for its glass-like luster and clarity.", 100, 0.1],
        ["Amethyst", "A purple variety of quartz, ranging from light lavender to deep violet.", 100, 0.1],
        ["Jade", "A green gemstone, prized for its smooth texture and rich, vibrant color.", 100, 0.1],
        ["Pearl", "A smooth, round gem formed within the shells of certain mollusks, typically white or cream-colored.", 100, 0.1]
    ],
    [
        ["Black Pearl", "A rare and lustrous gem, this pearl features a dark, iridescent color, often with green or blue overtones.", 300, 0.1],
        ["Topaz", "A gemstone available in a variety of colors, known for its brilliance and clarity. Often found in yellow, blue, and clear forms.", 300, 0.1],
        ["Aquamarine", "A light blue or turquoise gemstone, reminiscent of sea water, valued for its clarity and deep ocean-like hues.", 300, 0.1],
        ["Alexandrite", "A rare and valuable gem that changes color from green in daylight to red in incandescent light, prized for its unique optical properties.", 300, 0.1]
    ],
    [
        ["Emerald", "A rich green gemstone, valued for its vibrant color and rarity.", 500, 0.1],
        ["Opal", "A gem with a play of iridescent colors, displaying a spectrum of hues within.", 500, 0.1],
        ["Sapphire", "A deep blue gemstone, known for its hardness and luster, second only to diamond.", 500, 0.1],
        ["Ruby", "A gemstone of a deep red color, highly prized for its hardness and vivid hue.", 500, 0.1], 
        ["Diamond", "The hardest and one of the most valuable gemstones, known for its unparalleled clarity and brilliance.", 500, 0.1]
    ],[
        ["Diamond", "The hardest and one of the most valuable gemstones, known for its unparalleled clarity and brilliance.", 800, 0.1],
        ["Sky Emerald", "A rare variant of emerald with a lighter, sky-blue hue, combining the qualities of emeralds and sapphires.", 800, 0.1],
        ["Flame Emerald", "An emerald with fiery red and orange inclusions, giving it a unique, blazing appearance.", 800, 0.1],
        ["Star Ruby", "A special type of ruby displaying a star-like pattern of reflected light known as asterism.", 800, 0.1]
    ],[
        ["Blue Diamond", "A diamond with a rare natural blue color, highly sought after for its unique beauty and rarity.", 1000, 0.1],
        ["Fire Opal", "An opal with a bright, fiery coloration, ranging from warm yellows to rich reds.", 1000, 0.1],
        ["Black Diamond", "An extremely rare diamond with a dark, opaque color and a unique, enigmatic appearance.", 1000, 0.1]
    ]];



//generateWeapon(weaponMap.get("l1hs"));


let questObj = {

}


function generateQuest(){




}


function generateWeapon(weapon){
    let tier = Math.floor(Math.random() * 4);  //0-4
    let subquality = Math.floor(Math.random() * 10);
    let baseDescription = "";
    weapon.prompt = "";


    let type = getRandomInArray(weaponTypes);
    let weaponType = getRandomInArray(type);
 
    //calculate base stuff
    switch(tier){
        case 0: // no tier
            if(subquality >= 8){
                weapon.primary_damage_bonus += 2;
                baseDescription = "A finely honed weapon, sharper and more durable than its ordinary counterparts"
            }else if(subquality < 8 && subquality >= 5){
                weapon.primary_damage_bonus += 1;
                baseDescription = "A solidly made weapon, offering reliable performance in battle"
            }else{
                baseDescription = "A standard weapon, unremarkable but dependable"
            }
        break;
        case 1: // t1
            if(subquality >= 8){
                weapon.attack_bonus += 1;
                weapon.primary_damage_bonus += 2;
                baseDescription = "An expertly crafted weapon, infused with a subtle magic to enhance its lethality"
            }else if(subquality < 8 && subquality >= 5){
                weapon.attack_bonus += 1;
                weapon.primary_damage_bonus += 1;
                baseDescription = "A battle-tested weapon, bearing enchantments for balanced attack and damage"
            }else{
                weapon.attack_bonus += 1;
                baseDescription = "A reliable weapon, modestly enchanted to provide a slight edge in combat"
            }
            break;
        case 2: // t2
            if(subquality >= 8){
                weapon.attack_bonus += 2;
                weapon.primary_damage_bonus += 2;
                baseDescription = "A superior weapon, glowing faintly with powerful enchantments for both accuracy and damage"
            }else if(subquality < 8 && subquality >= 5){
                weapon.attack_bonus += 2;
                weapon.primary_damage_bonus += 1;
                baseDescription = "A formidable weapon, its aura of enchantment enhancing the wielder's precision and strength"
            }else{
                weapon.attack_bonus += 2;
                baseDescription = "A weapon of great potential, its enchantments finely tuned for increased attack prowess"
            }
            break;
        case 3: // t3
            if(subquality >= 8){
                weapon.attack_bonus += 3;
                weapon.primary_damage_bonus += 3;
                baseDescription = "An exquisite weapon, radiating with potent magic, a masterpiece of attack and damage enhancement"
            }else if(subquality < 8 && subquality >= 5){
                weapon.attack_bonus += 3;
                weapon.primary_damage_bonus += 2;
                baseDescription = "A majestic weapon, its powerful enchantments significantly boosting attack capabilities"
            }else{
                weapon.attack_bonus += 3;
                weapon.primary_damage_bonus += 1;
                baseDescription = "A weapon of extraordinary make, its enchantments focused on maximizing attack efficiency"
            }
    }

    baseDescription = baseDescription.replace("weapon", weaponType)

    //chance of magic weapojn
    if(Math.floor(Math.random() * 100) > 2){
        switch(tier){
            case 0:
                weapon.core_id = 0;
                if(isAbovePercent(60))
                    weapon.treatment_id = 1;
                else
                    weapon.treatment_id = 0;
                break;
            case 1:
                if(isAbovePercent(80))
                    weapon.core_id = 3;
                else
                    weapon.core_id = 2;
                if(isAbovePercent(60))
                    weapon.treatment_id = 2;
                else
                    weapon.treatment_id = 1;
                break;
            case 2:
                if(isAbovePercent(80))
                    weapon.core_id = 5;
                else
                    weapon.core_id = 4;
                if(isAbovePercent(60))
                    weapon.treatment_id = 3;
                else
                    weapon.treatment_id = 4;
                break;
            case 3:
                if(isAbovePercent(80))
                    weapon.core_id = 7;
                else
                    weapon.core_id = 6;
                if(isAbovePercent(60))
                    weapon.treatment_id = 6;
                else
                    weapon.treatment_id = 5;
                break;
        }
        weapon.prompt += baseDescription ;
        if(weapon.core_id != 10){
            let gem = getRandomInArray(gemstones[weapon.core_id]);
            //console.log(gem[0], treatments[weapon.treatment_id], weapon.core_id, weapon.treatment_id);
            weapon.prompt += ` containing a ${gem[0].toLowerCase()}.`;
        } 
    }

    let totalPrompt = "You are going to write a 4 sentence history about the legend of a  weapon found in a TTRPG. Do not name the weapon, and describe where the gemstone is located on the weapon. Here is a brief description:" + weapon.prompt;
    console.log(totalPrompt);
    getWeaponDescription(totalPrompt);

}

function getRandomInArray(array){
    return array[Math.floor(Math.random() * array.length)];
}

function isAbovePercent(percent){
    if(Math.floor(Math.random() * 100) > percent)
        return true;
    return false;
}

module.exports.getRandom = getRandom;
module.exports.generateBiography = generateBiography;
