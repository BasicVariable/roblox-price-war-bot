# Notes

This bot DOESNT use rolimons.com for prices and only Roblox's recent average price, if you have valued items you'd like to price war use with caution.

If you have a suggestion make one in my discord server (discord.gg/callie)

Going back to making open source projects, I think my code has improved a ton since I made IslandAds. 
Commissioned by Noki#1939, made by Basic#2142. 

**If you'd like to have something completed join discord.gg/callie**

# Installation / Usage

Running the bot can be very simple:

you can either use the EXE (the "built" version) of this bot in that's in RPWB.zip

or

1. Install node.js through https://nodejs.org/en/
2. Download the source
3. Open command prompt in the directory of index.js
4. Run this command: 
```npm install```
5. Run this command:
```node index.js```

# Documentation

```
:: accounts ::
A list (array) of cookies you want the bot to look through for limiteds to sell for Robux
"accounts": ["cookie", "cookie", "cookie"]

selling > :: check_interval ::
The number of seconds the bot will wait before starting the price war-ing process again

selling > :: max_increments ::
The max amount of Robux the bot will lower an item's best price to counter someone's best price

selling > :: sellUntil_X_UnderRap ::
How low the best price can go under an item's RAP (recent average price)

:: account_update_interval ::
The amount of time, in seconds, the bot will wait before refreshing all your accounts inventories/information
```
