/*
    Going back to making open source projects, I think my code has improved a ton since I made IslandAds. 
    Commissioned by Noki#1939, **if you'd like to have something completed join discord.gg/callie**
*/

const colors = require('colors');

console.log(`
 ${` ____   _____`.brightCyan} 
 ${`|  _ \ / ____|`.brightCyan}
 ${`| |_) | | `.brightMagenta}     
 ${`|  _ <| | `.white}     
 ${`| |_) | |____`.brightMagenta} 
 ${`|____/ \______|`.brightCyan}
${` Basic's Commissions | discord.gg/callie`.green}
`)

const fs = require('fs');
const path = require('path');

const delay = ms => new Promise(res => setTimeout(res, ms));

//-----
const rblx_lib = require('./subfiles/rblx_lib.js')
//-----

var config; 
var accounts = [];

// functions
global.properoutput = function(message, err, secondary){
    let time = (new Date()).toLocaleString('en-US')
    console.log(((err==true)?`[${time}] | ${(secondary==true)?"^    ":""}`.red:`[${time}] | ${(secondary==true)?"^    ":""}`.gray)+message)
};

async function tryAccount(cookie){
    let accountInfo = await rblx_lib.auth_account(cookie); // {"id":643454786,"name":"BoysicVariable","displayName":"Basic"}
    if (accountInfo==null) {properoutput(`Failed to authenticate cookie ${config.accounts.indexOf(cookie)}`.red, true); return}

    let inventory = await rblx_lib.get_inventory(accountInfo.id); // [{userAssetId: 0, name: '', assetId: 0, rap: 0}]

    return {userInfo: accountInfo, items: inventory, cookie: cookie}
};
//

properoutput("Grabbing your config".yellow);
try{
    config = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), './config.json'), {encoding: 'utf-8'}));
}catch(err){
    properoutput(`Failed to collect your config, please check it's validity\n${err}`.red, true, true);
}

while (config==null){};
properoutput('Got your config'.green, false, true);

properoutput('Setting up the bot'.yellow);
new Promise(async () => {
    for (cookie of config.accounts){
        let res = await tryAccount(cookie);
        if (res!=null) {
            properoutput(`Authenticated ${res.userInfo.name} [${res.items.length} item(s)]`.green, false, true)
            accounts.push(res)
        };
    }

    new Promise(async () => {
        // account updater
        while (true){
            await delay(config.inventory_update_interval*1000)

            for(var i = 0; i < accounts.length; i++){
                let currentInfo = accounts[i]; if (currentInfo==null) continue;
                let newInfo = await tryAccount(currentInfo.cookie)

                if (newInfo!=null) accounts[i]=newInfo; else accounts.splice(i, 1); // no idea if the array will do something weird 
            }
        }
    })

    // resell/relist bot (I already named the project resellbot please)
    while (true){
        await delay(config.selling.check_interval*1000)

        for (account of accounts){
            if (account.items.length==0) continue;

            var listed = [];

            for(var i = 0; i < account.items.length; i++){
                let item = account.items[i]; if (item==null) continue;
                if (listed.indexOf(item.assetId)>0) continue;

                let scrapedInfo = await rblx_lib.scrape_itemData(item.assetId, account.cookie)
                if (scrapedInfo==null) break; // not sure if it would ever return as null but, if a cookie dies or something it'll just break and give the acc updater a chance later

                if (scrapedInfo.ownershipStatus!=true) {account.items.splice(i, 1); continue}; // still no idea if the array will do something weird 
                if (scrapedInfo.sellerId==account.userInfo.id) {listed.push(item.assetId); continue};

                // I'm not going to make a thread worker for this because Noki wanted low ram usage and it would be another process so
                if ((item.rap-config.selling.sellUntil_X_UnderRap) > scrapedInfo.currentPrice-config.selling.max_increments){
                    // I'm so sorry for what I'm about to do
                    if ((item.rap-config.selling.sellUntil_X_UnderRap) > scrapedInfo.currentPrice-1) {continue}

                    // this is what I'm sorry about, didn't want to spend so much time thinking of an AMAZING equation
                    for(var i = 0; i < config.selling.max_increments; i++) if ((item.rap-config.selling.sellUntil_X_UnderRap) < scrapedInfo.currentPrice-(config.selling.max_increments-i)) {
                        await rblx_lib.setPrice(item.assetId, item.userAssetId, scrapedInfo.currentPrice-config.selling.max_increments, cookie)
                        break
                    }
                }else await rblx_lib.setPrice(item.assetId, item.userAssetId, scrapedInfo.currentPrice-config.selling.max_increments, cookie)
            }
        }
    }
})