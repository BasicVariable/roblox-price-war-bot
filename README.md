# Notes

**Reminder: If you have valued items you want to price war, set 'use_Rolimons' to true in the config**

If you have a suggestion, for my code or a feature, make one in my discord server (discord.gg/callie)

Going back to making open source projects, I think my code has improved a ton since I made IslandAds. 
Commissioned by Noki#1939, made by Basic#2142. 

**If you'd like to have something commissioned join discord.gg/callie and make a ticket**

# Installation / Usage

Running the bot can be very simple:

1. Install node.js through https://nodejs.org/en/
2. Download the source
3. Open a command prompt window in the directory of the 'index.js' file
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

:: use_Rolimons ::
Enabling this, by setting it to true, will make the bot use Rolimon's values when price war-ing instead of just RAP

:: account_update_interval ::
The amount of time, in seconds, the bot will wait before refreshing all your accounts inventories/information
```
