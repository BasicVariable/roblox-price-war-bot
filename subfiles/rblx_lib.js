/*
    Boy crazy? no. While loop crazy
*/
const fetch = require("node-fetch");  
const delay = ms => new Promise(res => setTimeout(res, ms));

const fetchTimeout = (url, ms, { signal, ...options } = {}) => {
    const controller = new AbortController();
    const promise = fetch(url, { signal: controller.signal, ...options });
    const timeout = setTimeout(() => controller.abort(), ms);
    return promise.finally(() => clearTimeout(timeout));
};

async function get_values(){
    var trys=0
    while (trys<=4){
        let res = await fetchTimeout(`https://www.rolimons.com/itemapi/itemdetails`, 20000, {
            headers: {'content-type': 'application/json;charset=UTF-8'}
        }).catch((err) => properoutput(`Failed to connect to /itemdetails\n${err}`.red, true));
        if (res==null || res.status!=200) {await delay(5000); trys++; continue};

        var json = await res.json();

        if (json['success']!=true) {await delay(5000); trys++; continue};
        if (global['rolimonsValues']==null) {return json.items}; // checks if it's the first time making the req

        // pretty meh lpp check but, I can't really host a server to make a rap db and then avg rap since this is free-
        for (id in json.items){
            let item = json.items[id]

            if (item[3]>-1) continue; // checks if it's valued

            // if it decreases by 40%+ it'll use the old value
            if ((item[4]-rolimonsValues[id][4])/rolimonsValues[id][4]<=-0.40) json.items[id]=rolimonsValues[id];
        }

        return json.items;
    };
}

async function auth_account(cookie){
    var trys=0
    while (trys<=3){
        let res = await fetchTimeout("https://users.roblox.com/v1/users/authenticated", 20000, {
            headers: {'Content-Type': 'application/json',"cookie": ".ROBLOSECURITY="+cookie}
        }).catch((err) => properoutput(`Failed to connect to /authenticated\n${err}`.red, true));
        if (res==null || res.status!=200) {trys++; continue};

        return await res.json();
    };
}

async function get_inventory(userId){
    var cursor=""; var checks=0; var fixed_inv=[]
    // You're just gonna have to wait for your first FIVE HUNDRED items to sell SICKO
    while (cursor!=null && checks<=5) {
        let res = await fetchTimeout(`https://inventory.roblox.com/v1/users/${userId}/assets/collectibles?sortOrder=Asc&limit=100${cursor}`, 20000, {
            headers: {'Content-Type': 'application/json'}
        }).catch((err) => properoutput(`Failed to connect to /collectibles\n${err}`.red, true));
        // if this has issues with it getting stuck on one acc in the future I'll add a check for it :eyeroll:
        if (res==null || res.status!=200) {await delay(5000); continue}; 

        let json = await res.json(); 
        await json.data.forEach(item => fixed_inv.push({userAssetId: item.userAssetId, name: item.name, assetId: item.assetId, rap: (global['rolimonsValues']!=null)?rolimonsValues[item.assetId][4]:item.recentAveragePrice}));

        if (json.nextPageCursor==null) {cursor=null; continue};
        cursor=`&cursor=${json.nextPageCursor}`;
    }

    return fixed_inv;
}

async function scrape_itemData(itemId, cookie){
    var trys=0
    while (trys<=4){
        let res = await fetchTimeout(`https://www.roblox.com/catalog/${itemId}`, 20000, {headers: {"cookie": ".ROBLOSECURITY="+cookie}}).catch((err) => properoutput(`Failed to connect to /catalog\n${err}`.red, true));;
        if (res==null || res.status!=200) {await delay(1500); continue}; 

        let text = await res.text();
        //---
        var price = parseInt((await text.split(`data-expected-price="`)[1].split('"')[0]).replace(/[^0-9.]/g,""));
        var sellerId = parseInt((await text.split(`data-expected-seller-id="`)[1].split('"')[0]).replace(/[^0-9.]/g,""));
        var ownsItem = text.includes(`<span class="icon-checkmark-white-bold"></span>`)
        //---
        if (price == null || sellerId == null || ownsItem == null){await delay(1500); continue};

        return {currentPrice: price, currentSeller: sellerId, ownershipStatus: ownsItem}
    };
}

const get_csrfToken = async function(cookie){
    var trys=0
    while (trys<=4){
        let res = await fetchTimeout("https://auth.roblox.com/v1/xbox/disconnect", 20000, {
            method: "POST",
            headers: {'content-type': 'application/json;charset=UTF-8',"cookie": ".ROBLOSECURITY="+cookie}
        }).catch((err) => properoutput(`Failed to connect to /disconnect\n${err}`.red, true));

        let token = await res.headers.get("x-csrf-token");
        if (token==null) {await delay(5000); trys++; continue}

        return token;
    };
}

async function setPrice(itemId, uaid, price, cookie){
    var trys=0
    while (trys<=4){
        let res = await fetchTimeout(`https://economy.roblox.com/v1/assets/${itemId}/resellable-copies/${uaid}`, 20000, {
            method: 'PATCH',
            body: JSON.stringify({price: price}),
            headers: {'content-type': 'application/json;charset=UTF-8', "cookie": ".ROBLOSECURITY="+cookie, "x-csrf-token": await get_csrfToken(cookie)}
        }).catch((err) => properoutput(`Failed to connect to /resellable-copies\n${err}`.red, true));
        if (res==null || res.status!=200) {await delay(5000); trys++; continue}; // don't know the ratelimit sorry

        break;
    }

    properoutput(`Listed ${itemId}/${uaid} for ${price}`.yellow)
}

async function getRecentSales(cookie, userId, lastCheck){
    var trys=0
    while (trys<=4){
        let res = await fetchTimeout(`https://economy.roblox.com/v2/users/${userId}/transactions?transactionType=Sale&limit=20`, 20000, {
            headers: {'content-type': 'application/json;charset=UTF-8', "cookie": ".ROBLOSECURITY="+cookie}
        }).catch((err) => properoutput(`Failed to connect to /transactions\n${err}`.red, true));
        if (res==null || res.status!=200) {await delay(10000); trys++; continue}; // dk the ratelimit


        let fixedJson = await (await res.json()).filter(sale => rolimonsValues[sale.details.id]!=null); // Gets all the limited ones (await hell)
        let newestSales = fixedJson.filter(sale => (new Date(sale.created)).getTime() >= lastCheck); // Gets all sales that happened after the last check

        return newestSales
    }
}

module.exports = {auth_account, get_inventory, scrape_itemData, setPrice, get_values, getRecentSales}
