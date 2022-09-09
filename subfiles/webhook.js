const fetch = require("node-fetch");  

var webhook=true;

const get_item_image = async function(id){
    var image_url; var trys = 0;
    while (image_url==null && trys<=5){
        await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${id}&size=420x420&format=Png&isCircular=false`, {headers: {'Content-type': 'application/json'}}).then(res => res.json()).then(json => image_url=json.data[0].imageUrl).catch(() => {
            trys++
        });
    }
    if (image_url==null) {properoutput(`Failed to get item image for ${id}\n${err}`.red, true); return 'https://cdn.discordapp.com/attachments/616460580991008771/1016848130442006639/unknown.png'}
    return image_url
}

async function checkWebhook(url){
    await fetch(url, {
        method: "POST", 
        headers: {'Content-type': 'application/json'}, 
        body: JSON.stringify(
            {
                username: "PWB",
                avatar_url: "https://media.discordapp.net/attachments/616460506231865357/827917363969654784/Island_Logo_2.png",
                content: `Basic's price war bot connected to your webhook | Be sure to check out discord.gg/callie`
            }
        )
    }).then((res) => {
        if (res==null || res.status!=204) {
            properoutput(`Failed to connect to webhook your webhook. If you believe this is an error try getting your Discord webhook URL again, PWB will continue to list your items anyways!`.red, true)
            webhook=false;
        }else webhook=url;
    }).catch(err => {
        properoutput(`Failed to connect to webhook your webhook. If you believe this is an error try getting your Discord webhook URL again, PWB will continue to list your items anyways!`.red, true)
        webhook=false;
    });
}

async function postSale(saleData){
    if (webhook==false) {properoutput(`Sold ${saleData.details.name} for ${saleData.currency.amount}`.green); return};

    let options = {
        username: "PWB",
        avatar_url: "https://media.discordapp.net/attachments/616460506231865357/827917363969654784/Island_Logo_2.png",
        embeds: [
            {
                "type": "rich",
                "title": "***"+saleData.details.name+"***",
                "author": {
                    "name": `PWB`,
                    "icon_url": `https://media.discordapp.net/attachments/616460506231865357/827917363969654784/Island_Logo_2.png`
                },
                "thumbnail": {
                    "url": await get_item_image(saleData.details.id)
                },
                "fields": [
                    {
                        "name": `Item 💎:`,
                        "value": `> **Value:** ${rolimonsValues[saleData.details.id][4]}\n> **ID:** ${saleData.details.id}\n> **Proj?:** ${rolimonsValues[saleData.details.id][7]==1?"✅":"❌"}`,
                        "inline": true
                    },
                    {
                        "name": `Sale Data 📈:`,
                        "value": `> **Robux Gain:** ${saleData.currency.amount}\n> **User:** ${saleData.agent.name}`,
                        "inline": true
                    }
                ],
                "footer": {
                    "icon_url": `https://media.discordapp.net/attachments/616460506231865357/827917363969654784/Island_Logo_2.png`,
                    "text": `discord.gg/callie`
                },
                "timestamp": new Date(),
                "url": `https://www.roblox.com/catalog/${saleData.details.id}/`
            }
        ]
    }

    var success; var trys=0;
    while (success==null && trys<=5){
        await fetch(webhook, {method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify(options)}).then(() => success=true).catch(err => {
            trys++
            properoutput(`Failed to post deal to webhook\n${err}`.red, true)
        });
    }
}

module.exports = {postSale, checkWebhook}