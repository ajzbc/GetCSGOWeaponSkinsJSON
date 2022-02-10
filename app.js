const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

let output = {
    updated_at: Date.now(),
    skins: [],
};

async function scrapeCollection(id) {
    try {
        const { data } = await axios.get(`https://csgo.exchange/collection/view/${id}`);
        const $ = cheerio.load(data);

        const collection = $("h1").text();

        // not needed
        // const tag = $(".btnLink").attr("id");

        // weapon types
        let category = {
            Normal: false,
            StatTrak: false,
            Souvenir: false,
        };

        $(".contentPrep > div:nth-child(2) > div > ul > li > label").each(function () {
            category[$(this).text()] = true;
        });

        $(".weaponCollection > div").each(function (i, item) {
            output.skins.push({
                name: $(item).attr("data-name"),
                quality: $(item).attr("data-quality"),
                max_wear: parseFloat($(item).attr("data-maxwear")),
                min_wear: parseFloat($(item).attr("data-minwear")),
                collection: collection,
                category: category,
            });

            // removed because some items don't have images
            // img from background-image removing url()
            // const img = $(item)
            //     .find("div.rItem > div.imgItem")
            //     .css("background-image")
            //     .match(/\((.*?)\)/)[1];
        });

        console.log(id);
    } catch (err) {
        console.error(err);
    }
}

async function getSkins() {
    // load collection page
    const { data } = await axios.get("https://csgo.exchange/collection");
    const $ = cheerio.load(data);

    // number of collections
    const collection_count = $(".vItem").length;

    // array of collection IDs [1..n]
    const collection_IDs = Array.from({ length: collection_count }, (_, i) => i + 1);

    // scrape each collection
    const promises = collection_IDs.map(scrapeCollection);

    // write to json when done
    await Promise.all(promises);
    console.log("Done!");
    fs.writeFileSync("output.json", JSON.stringify(output));
}

getSkins();
