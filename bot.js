console.log("  _  _      _    _         _   ", "\n", "| || |__ _| |__| |__  ___| |_ ", "\n", "| __ / _` | '_ \\ '_ \\/ _ \\  _|", "\n", "|_||_\\__,_|_.__/_.__/\\___/\\__|", "\n");

const args = process.argv.splice(2);
if (args.length < 1) {
    console.log("Usage: node test.js <hotel> [<sso>]");
    console.log("Example: node test.js fr hhfr.abcdefg-1234-abcd-1234-abcdefghijk-12345678.V4");
    process.exit(1);
}

process.stdout.write("⏳ Loading required libs... ");
const { JSDOM } = require("jsdom");
const dom = new JSDOM(`<!DOCTYPE html><p>Bot test</p>`);
window = dom.window;

const Client = require("./src/Client.js");
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("✅");

if (args.length == 1) {
    readline.question("🔐 Enter your SSO ticket: ", (sso) => {
        process.stdout.write("⏳ Starting the bot... ");

        let bot = new Client(args[0], sso.replace("hhfr.", ""));
        bot.connect();

        console.log("✅");
    });
}else {
    process.stdout.write("⏳ Starting the bot... ");
    
    let bot = new Client(args[0], args[1].replace("hhfr.", ""));
    bot.connect();

    console.log("✅");
}