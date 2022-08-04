const request = require('request');

const Util = require("../Util/Util");

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});


class LoginHelper {
    hotel = "";

    #currentName;
    #cookies;
    #fingerprint;

    #ticketURL;
    #loginURL;
    #fetchAvatarURL;
    #selectAvatarURL;

    constructor(hotel) {
        this.hotel = hotel;

        this.#ticketURL = "https://www.habbo." + hotel + "/api/client/clientnative/url";
        this.#loginURL = "https://www.habbo." + hotel + "/api/public/authentication/login";
        this.#fetchAvatarURL = "https://www.habbo." + hotel + "/api/user/avatars";
        this.#selectAvatarURL = "https://www.habbo." + hotel + "/api/user/avatars/select";

        this.#fingerprint = Util.randomHexString(32);
    }

    #login(email, password, captchaToken, callback) {
        const options = {
            uri: this.#loginURL,
            method: "POST",
            headers: this.#generateHeaders(),
            json: {email: email, password: password, captchaToken: captchaToken},
        }

        console.log("[Login] Logging in as " + email + "...");
        request(options, (error, response, body) => {
            if (!body) return callback(false);
            
            switch (body.message) {
                case "invalid-captcha":
                    console.log("[LOGIN] Captcha required/invalid, visit https://www.habbo.fr/api/public/captcha and once solve, input the URL in the console");
                    readline.question("[LOGIN] Captcha URL: ", (captchaUrl) => {
                        captchaToken = captchaUrl.split("?token=")[1];
                        console.log("[LOGIN] Retrying with captcha token...");
                        this.#login(email, password, captchaToken, callback);
                    });
                    break;
            
                case "login.invalid_password":
                    console.log("[LOGIN] Incorrect email/password for " + email);
                    callback(false);
                default:
                    if (body.name) {
                        console.log("[LOGIN] Successfully logged in as " + email);
                        let cookiesRaw = response.headers["set-cookie"];
                        let cookies = "";
                        cookiesRaw.forEach(cookieRaw => {
                            cookies += cookieRaw.split(";")[0] + ";";
                        });

                        this.#currentName = body.name;
                        this.#cookies = cookies;
                        callback(true);
                    } else {
                        console.log("[LOGIN] Invalid email/password for " + email);
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

        console.log("[LOGIN] Fetching ticket for " + this.#currentName + "...");
        request(options, (error, response, body) => {
            if (!body) {
                console.log("[LOGIN] Uknown error fetching ticket");
                return callback(false);
            }

            body = JSON.parse(body);

            if (body.error) {
                console.log("[LOGIN] Error fetching ticket: " + body.message);
                callback(false);
            } else {
                console.log("[LOGIN] All done for " + this.#currentName);
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
                    this.#currentName = username;
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
            "x-habbo-fingerprint": this.#fingerprint,
            'access-control-allow-credentials': 'true',
            "Referer": "https://www.habbo.fr/",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
            "Cookie": this.#cookies,
            'Connection': 'keep-alive',
        }
    }

    getSimpleTicket(email, password, avatarName, callback) {
        this.#login(email, password, "", (success) => {
            if (!success) return callback(false);

            if (this.#currentName !== avatarName) {
                this.#selectAvatar(avatarName, (success) => {
                    if (!success) return callback(false);

                    this.#fetchTicket(callback);
                });
            } else {
                this.#fetchTicket(callback);
            }
        });
    }

    getMultipleTicket() {

    }
}

module.exports = LoginHelper;