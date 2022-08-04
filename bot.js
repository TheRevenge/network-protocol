console.log("  _  _      _    _         _   ", "\n", "| || |__ _| |__| |__  ___| |_ ", "\n", "| __ / _` | '_ \\ '_ \\/ _ \\  _|", "\n", "|_||_\\__,_|_.__/_.__/\\___/\\__|", "\n");

const args = process.argv.splice(2);
if (args.length <= 1) {
    console.log("Usage: node bot.js <hotel> [options]");
    console.log("Options:");
    console.log(" == SSO ticket method ==");
    console.log("  bot.sso <ssoticket> Provide a valid SSO ticket to login with");
    console.log("  Example: node bot.js fr bot.sso hhfr.abcdefg-1234-abcd-1234-abcdefghijk-12345678.V4");
    console.log("\n == Simple login method (could need captcha validation) ==");
    console.log("  bot.email <email> Your account email");
    console.log("  bot.password <password> Your account password");
    console.log("  bot.username <username> The username of the avatar you want to use");
    console.log("  Example: node bot.js fr bot.email youremail@gmail.com bot.password yourpassword bot.username yourusername");
    console.log("\n == Multiple login method (could need captcha validation) ==");
    console.log("  bot.launchList <filepath> File path containing your account credentials");
    process.exit(1);
}

process.stdout.write("⏳ Loading required libs... ");
const { JSDOM } = require("jsdom");
const dom = new JSDOM(`<!DOCTYPE html><p>Bot test</p>`);
window = dom.window;

const Client = require("./src/Client.js");
const LoginHelper = require("./src/Login/LoginHelper.js");
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
const path = require("path");

console.log("✅");

let botList = [];
switch (args[1]) {
    case "bot.sso":
        readline.question("🔐 Enter your SSO ticket: ", (sso) => {
            process.stdout.write("⏳ Starting the bot... ");
    
            let bot = new Client(args[0], sso.replace("hhfr.", ""));
            bot.connect();
            botList.push(bot);
    
            console.log("✅");
        });
        break;
    case "bot.launchList":
        try {
            const launchList = require(path.join(__dirname, args[2]));

            console.log("⚠️ WARNING: Launching to many accounts at once can result in a request rate limitation/freeze \n or worse, an automatic ban from Habbo.");
            readline.question("❓ Continue? (y/n): ", (answer) => {
                if (answer.toLowerCase().includes('n')) process.exit(1);

                launchList.forEach(account => {
                    const login = new LoginHelper(args[0], account.email, account.password);
                    login.getMultipleTicket(account.avatars, (ticketList) => {
                        ticketList.forEach(async (ticket, index) => {
                            if (!ticket) {
                                console.log(`⚠️ Failed to get ticket for ${account.avatars[index]} \n That bot won't be launched.`);
                            } else {
                                console.log(`⏳ Starting the bot "${account.avatars[index]}"...`);
                                let bot = new Client(args[0], ticket);
                                await bot.connect();
                                botList.push(bot);
                                console.log(`✅ Bot ${account.avatars[index]} started`);
                            }
                        });
                    });
                });
            });
        } catch (error) {
            console.log("⚠️ Error while loading launch list: " + error);
            process.exit(1);
        }
        break;
    default:
        if (args.length < 7) {
            console.log("⚠️ Not enough arguments");
            process.exit(1);
        }

        const email = args[args.indexOf("bot.email") + 1];
        const password = args[args.indexOf("bot.password") + 1];
        const username = args[args.indexOf("bot.username") + 1];

        const login = new LoginHelper(args[0], email, password);
        login.getSimpleTicket(username, (ticket) => {
            if (!ticket) {
                console.log("⚠️ Failed to get ticket");
                process.exit(1);
            }
    
            process.stdout.write("⏳ Starting the bot... ");
    
            bot = new Client(args[0], ticket.replace("hhfr.", ""));
            bot.connect();
    
            console.log("✅");
        });
}