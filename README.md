# network-handler
> By Burak and CptHenri

This is a NodeJS implementation of network protocols for Habbo Unity client.
Further features are being added to have more control over the client.
**Feel free to PR, I'll take a look at it!**

## How globally it works
You can either use a web server and open test.html or use the bot.js script.
I'm not working much on the .html version of the script, don't expect me to update it frequently.

This project needs NodeJS (tested on v18).

Remember to run `npm install` and, in case you're using test.html `npm run build` to browserify the source.

Once the bot is connected, you can send him private messages to execute some commands I made, take a look [here](http:/https://github.com/TheRevenge/network-protocol/blob/main/src/Messages/Incoming/FriendList/MessengerNewConsoleMessageEvent.js/ "here")
## Using bot.js
I made 3 different connection methods:
### Using a SSO ticket
`node bot.js bot.sso <sso>`
### Using account credentials
`node bot.js bot.email <email> bot.password <password> bot.username <username>`
### Using mutliple client method
`node bot.js bot.launchList <pathToFile>`
You'll find an exemple of launchList file [here](http:/https://github.com/TheRevenge/network-protocol/blob/main/botLaunchList.example.json/ "here")

## Using test.html
Honestly, figure it out. Too lazy to explain how that worked, ask Burak