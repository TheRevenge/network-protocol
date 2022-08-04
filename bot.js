console.log("  _  _      _    _         _   ", "\n", "| || |__ _| |__| |__  ___| |_ ", "\n", "| __ / _` | '_ \\ '_ \\/ _ \\  _|", "\n", "|_||_\\__,_|_.__/_.__/\\___/\\__|", "\n");

const args = process.argv.splice(2);
if (args.length <= 1) {
    console.log("Usage: node bot.js <hotel> [options]");
    console.log("Options:");
    console.log(" == SSO ticket method ==");
    console.log("  bot.sso <ssoticket> Provide a valid SSO ticket to login with");
    console.log("  Example: node bot.js fr sso hhfr.abcdefg-1234-abcd-1234-abcdefghijk-12345678.V4");
    console.log("\n == Simple login method (could need captcha validation) ==");
    console.log("  bot.email <email> Your account email");
    console.log("  bot.password <password> Your account password");
    console.log("  bot.username <username> The username of the avatar you want to use");
    console.log("  Example: node bot.js fr email youremail@gmail.com password yourpassword username yourusername");
    //console.log("\n == Multiple login method (could need captcha validation) ==");
    //console.log("  bot.credsFile <file> File containing your account credentials");
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

console.log("✅");

let bot;
switch (args[1]) {
    case "bot.sso":
        readline.question("🔐 Enter your SSO ticket: ", (sso) => {
            process.stdout.write("⏳ Starting the bot... ");
    
            bot = new Client(args[0], sso.replace("hhfr.", ""));
            bot.connect();
    
            console.log("✅");
        });
    break;
    case "bot.credsFile":
        console.log("🛠 Sorry, this feature is not yet implemented");
        process.exit(1);
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