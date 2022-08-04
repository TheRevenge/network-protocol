const request = require('request');
const fs = require('fs');
const path = require("path");

const Util = require("../Util/Util");

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});


class LoginHelper {
    email;
    password;
    hotel;
    cookies;
    fingerprint;
    accountsList;

    #currentAvatarName;
    #ticketURL;
    #loginURL;
    #fetchAvatarURL;
    #selectAvatarURL;

    constructor(hotel, email, password) {
        this.hotel = hotel;
        this.email = email
        this.password = password;

        // Retrieve account data from accounts.json
        const accountsList = require(path.join(__dirname, "/../../accounts.json"));
        const account = accountsList[email];
        if (account) {
            console.log("[LOGIN] Account \"" + email + "\" found in accounts.json");
            this.cookies = account.cookies;
            this.fingerprint = account.fingerprint;
        } else {
            console.log("[LOGIN] Account \"" + email + "\" not found in accounts.json");
            this.cookies = [];
            this.fingerprint = Util.randomHexString(32);
        }

        this.#ticketURL = "https://www.habbo." + hotel + "/api/client/clientnative/url";
        this.#loginURL = "https://www.habbo." + hotel + "/api/public/authentication/login";
        this.#fetchAvatarURL = "https://www.habbo." + hotel + "/api/user/avatars";
        this.#selectAvatarURL = "https://www.habbo." + hotel + "/api/user/avatars/select";
    }

    #login(captchaToken, callback) {
        const options = {
            uri: this.#loginURL,
            method: "POST",
            headers: this.#generateHeaders(),
            json: {email: this.email, password: this.password, captchaToken: captchaToken},
        }

        console.log("[Login] Logging in as " + this.email + "...");
        request(options, (error, response, body) => {
            if (!body) return callback(false);
            
            switch (body.message) {
                case "invalid-captcha":
                    console.log("[LOGIN] Captcha required/invalid, visit https://www.habbo.fr/api/public/captcha and once solve, input the URL in the console");
                    readline.question("[LOGIN] Captcha URL: ", (captchaUrl) => {
                        captchaToken = captchaUrl.split("?token=")[1];
                        console.log("[LOGIN] Retrying with captcha token...");
                        this.#login(captchaToken, callback);
                    });
                    break;
            
                case "login.invalid_password":
                    console.log("[LOGIN] Incorrect email/password for " + this.email);
                    callback(false);
                    break;

                default:
                    if (body.name) {
                        console.log("[LOGIN] Successfully logged in as " + this.email);

                        if (response.headers["set-cookie"]) {
                            const cookiesRaw = response.headers["set-cookie"];
                            
                            const sessionIdIndex = cookiesRaw.findIndex(cookie => cookie.includes("session.id")) ;
                            const browserTokenIndex = cookiesRaw.findIndex(cookie => cookie.includes("browser_token"));
                            
                            // Ugly but effective
                            if (sessionIdIndex !== -1) {
                                console.log("[LOGIN] Renewing session.id cookie for " + this.email + "...");
                                const localCookieIndex = this.cookies.find(cookie => cookie.includes("session.id")) || this.cookies.length;
                                this.cookies[localCookieIndex] = cookiesRaw[sessionIdIndex].split(";")[0];
                            }
                            if (browserTokenIndex !== -1) {
                                console.log("[LOGIN] Renewing browser_token cookie for " + this.email+ "...");
                                const localCookieIndex = this.cookies.find(cookie => cookie.includes("browser_token")) || this.cookies.length;
                                this.cookies[localCookieIndex] = cookiesRaw[browserTokenIndex].split(";")[0];
                            }
                        }

                        this.#currentAvatarName = body.name;
                        callback(true);
                    } else {
                        console.log("[LOGIN] Invalid email/password for " + this.email);
                        callback(false);
                    }
                    break;
            }
        });
    }

    #fetchTicket(callback) {
        const options = {
            uri: this.#ticketURL,
            method: "POST",
            headers: this.#generateHeaders()
        }

        console.log("[LOGIN] Fetching ticket for \"" + this.#currentAvatarName + "\"...");
        request(options, (error, response, body) => {
            if (!body) {
                console.log("[LOGIN] Uknown error fetching ticket for \"" + this.#currentAvatarName + "\"");
                return callback(false);
            }

            body = JSON.parse(body);

            if (body.error) {
                console.log("[LOGIN] Error fetching ticket for \"" + this.#currentAvatarName + "\": " + body.message);
                callback(false);
            } else {
                console.log("[LOGIN] All done for " + this.#currentAvatarName);
                callback(body.ticket);
            }
        });
    }

    #selectAvatar(username, callback) {
        let options = {
            uri: this.#fetchAvatarURL,
            method: "GET",
            headers: this.#generateHeaders()
        }

        request(options, (error, response, body) => {
            let avatars = JSON.parse(body);
            let avatar = avatars.find(avatar => avatar.name === username);
            if (avatar) {
                options = {
                    uri: this.#selectAvatarURL,
                    method: "POST",
                    headers: this.#generateHeaders(),
                    json: avatar
                }

                request(options, (error, response, body) => {
                    this.#currentAvatarName = username;
                    callback(true);
                });
            } else {
                console.log("[LOGIN] Avatar \"" + username + "\" not found");
                callback(false);
            }
        });
    }

    #generateHeaders() {
        return {
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-habbo-fingerprint": this.fingerprint,
            'access-control-allow-credentials': 'true',
            "Referer": "https://www.habbo.fr/",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
            "Cookie": this.cookies.join(";"),
            'Connection': 'keep-alive',
        }
    }

    #saveAccount() {
        let accountsList = require(path.join(__dirname, "/../../accounts.json"));
        let account = accountsList[this.email] || {};
        let avatars = account.avatars || [];

        if (!avatars.includes(this.#currentAvatarName)) avatars.push(this.#currentAvatarName);
        account = {
            email: this.email,
            password: this.password,
            cookies: this.cookies,
            fingerprint: this.fingerprint,
            avatars: avatars
        }
        accountsList[this.email] = account;
        
        console.log("[LOGIN] Saving account data for " + this.email + "...");

        try {
            fs.writeFileSync(path.join(__dirname, "/../../accounts.json"), JSON.stringify(accountsList), "utf-8");
        } catch (error) {
            console.warn("[LOGIN] Warning: Couldn't save data for " + this.email + ": " + error);
        }
    }

    getSimpleTicket(avatarName, callback) {
        this.#login("", (success) => {
            if (!success) return callback(false);

            if (this.#currentAvatarName !== avatarName) {
                this.#selectAvatar(avatarName, (success) => {
                    if (!success) return callback(false);

                    this.#fetchTicket(callback);
                    this.#saveAccount();
                });
            } else {
                this.#fetchTicket(callback);
                this.#saveAccount();
            }
        });
    }

    getMultipleTicket(avatarList, callback) {
        let ticketList = [];

        this.#login("", (success) => {
            if (!success) return callback(false);

            avatarList.forEach(avatarName => {
                if (!success) return callback(false);

                if (this.#currentAvatarName !== avatarName) {
                    this.#selectAvatar(avatarName, (success) => {
                        if (!success) return callback(false);

                        this.#fetchTicket((ticket) => {
                            ticketList.push(ticket);
                            if (ticketList.length === avatarList.length) callback(ticketList);
                        });
                        this.#saveAccount();
                    });
                } else {
                    this.#fetchTicket((ticket) => {
                        ticketList.push(ticket);
                        if (ticketList.length === avatarList.length) callback(ticketList);
                    });
                    this.#saveAccount();
                }
            });
        });
    }
}

module.exports = LoginHelper;