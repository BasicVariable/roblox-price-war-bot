/*
    Boy crazy? no. While loop crazy
*/
const fetch = require("node-fetch");  
const delay = ms => new Promise(res => setTimeout(res, ms));

async function auth_account(cookie){
    var json; var trys=0
    while (json==null && trys<=3){
        let res = await fetch("https://users.roblox.com/v1/users/authenticated", {
            headers: {'Content-Type': 'application/json',"cookie": ".ROBLOSECURITY="+cookie}
        }).catch((err) => properoutput(`Failed to connect to /authenticated\n${err}`.red, true));
        if (res.status!=200) {trys++; continue};
        json=await res.json();
    }

    return json;
}

async function get_inventory(userId){
    var cursor=""; var checks=0; var fixed_inv=[]
    // You're just gonna have to wait for your first FIVE HUNDRED items to sell SICKO
    while (cursor!=null && checks<=5) {
        let res = await fetch(`https://inventory.roblox.com/v1/users/${userId}/assets/collectibles?sortOrder=Asc&limit=100${cursor}`, {
            headers: {'Content-Type': 'application/json'}
        }).catch((err) => properoutput(`Failed to connect to /collectibles\n${err}`.red, true));
        // if this has issues with it getting stuck on one acc in the future I'll add a check for it :eyeroll:
        if (res.status!=200) {await delay(5000); continue}; 

        let json = await res.json(); 
        await json.data.forEach(item => fixed_inv.push({userAssetId: item.userAssetId, name: item.name, assetId: item.assetId, rap: item.recentAveragePrice}));

        if (json.nextPageCursor==null) {cursor=null; continue};
        cursor=`&cursor=${json.nextPageCursor}`;
    }

    return fixed_inv;
}

async function scrape_itemData(itemId, cookie){
    var fixedData; var trys=0
    while (fixedData==null && trys<=4){
        let res = await fetch(`https://www.roblox.com/catalog/${itemId}`, {headers: {"cookie": ".ROBLOSECURITY="+cookie}}).catch((err) => properoutput(`Failed to connect to /catalog\n${err}`.red, true));;
        if (res.status!=200) {await delay(1500); continue}; 

        let text = await res.text();
        //---
        var price = parseInt(await text.split(`data-expected-price="`)[1].split('"')[0]);
        var sellerId = parseInt(await text.split(`data-expected-seller-id="`)[1].split('"')[0]);
        var ownsItem = text.includes(`<span class="icon-checkmark-white-bold"></span>`)
        //---

        fixedData={currentPrice: price, currentSeller: sellerId, ownershipStatus: ownsItem}
    }

    return fixedData;
}

const get_csrfToken = async function(cookie){
    var token; var trys=0;
    while (token==null && trys<=4){
        let res = await fetch("https://auth.roblox.com/v1/xbox/disconnect", {
            method: "POST",
            headers: {'content-type': 'application/json;charset=UTF-8',"cookie": ".ROBLOSECURITY="+cookie}
        }).catch((err) => properoutput(`Failed to connect to /disconnect\n${err}`.red, true));
        token = await res.headers.get("x-csrf-token");
        if (token==null) {await delay(5000); trys++; continue}
    }
    
    return token;
}

async function setPrice(itemId, uaid, price, cookie){
    var trys=0;
    while (trys<=4){
        let res = await fetch(`https://economy.roblox.com/v1/assets/${itemId}/resellable-copies/${uaid}`, {
            method: 'PATCH',
            body: JSON.stringify({price: price}),
            headers: {'content-type': 'application/json;charset=UTF-8', "cookie": ".ROBLOSECURITY="+cookie, "x-csrf-token": await get_csrfToken(cookie)}
        }).catch((err) => properoutput(`Failed to connect to /resellable-copies\n${err}`.red, true));
        if (res.status!=200) {await delay(5000); trys++; continue}; // don't know the ratelimit sorry

        break;
    }

    properoutput(`Listed ${itemId}/${uaid} for ${price}`.green)
}

module.exports = {auth_account, get_inventory, scrape_itemData, setPrice}