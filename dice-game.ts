"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
var prompt = require("prompt-sync")();
function parseDiceArgs(args) {
    if (args.length < 3) {
        throw new Error("❌ Please provide at least 3 dice sets.\n👉 Example: node dice-game.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3");
    }
    return args.map(function (arg, index) {
        var faces = arg.split(",").map(function (f) {
            var num = Number(f.trim());
            if (!Number.isInteger(num)) {
                throw new Error("\u274C Dice ".concat(index + 1, " includes non-integer values.\n\uD83D\uDC49 Use only numbers like: 1,2,3,4,5,6"));
            }
            return num;
        });
        if (faces.length === 0)
            throw new Error("\u274C Dice ".concat(index + 1, " has no faces."));
        return faces;
    });
}
function fairRandomRoll(dice) {
    var key = crypto.randomBytes(32).toString("hex");
    var rollIndex = crypto.randomInt(0, dice.length);
    var roll = dice[rollIndex];
    var proof = crypto.createHmac("sha256", key).update(roll.toString()).digest("hex");
    return { roll: roll, proof: proof, key: key };
}
function showMenu(diceSet) {
    console.log("\n🎲 Dice options:");
    diceSet.forEach(function (dice, i) { return console.log("  [".concat(i, "] ").concat(dice.join(", "))); });
    console.log("  [H] Help\n  [X] Exit");
}
function showHelp() {
    console.log("\n📘 Instructions:");
    console.log("- Select a dice using its number.");
    console.log("- Rolls are proven fair with HMAC.");
    console.log("- Highest roll wins.");
}
function playGame(diceSet) {
    console.log("\n🧮 Determining who goes first using HMAC...");
    var starter = fairRandomRoll([0, 1]);
    var starterText = starter.roll === 0 ? "🧍 You start!" : "💻 Computer starts!";
    console.log("\uD83D\uDD10 Commit Proof: ".concat(starter.proof));
    console.log("\uD83D\uDDDD\uFE0F Reveal Key: ".concat(starter.key));
    console.log("".concat(starterText, "\n"));
    var userDice = null;
    while (!userDice) {
        showMenu(diceSet);
        var input = prompt("Your choice: ").trim().toUpperCase();
        if (input === "X")
            return console.log("👋 Exiting. Bye!");
        if (input === "H") {
            showHelp();
            continue;
        }
        var index = Number(input);
        if (!Number.isInteger(index) || index < 0 || index >= diceSet.length) {
            console.log("⚠️ Invalid choice. Try again.");
            continue;
        }
        userDice = diceSet[index];
    }
    var compDice = diceSet[Math.floor(Math.random() * diceSet.length)];
    if (userDice === compDice) {
        var remaining = diceSet.filter(function (d) { return d !== userDice; });
        compDice = remaining[Math.floor(Math.random() * remaining.length)];
    }
    var userRoll = fairRandomRoll(userDice);
    var compRoll = fairRandomRoll(compDice);
    console.log("\n\uD83E\uDDCD Your roll: ".concat(userRoll.roll));
    console.log("\uD83D\uDD10 Proof: ".concat(userRoll.proof));
    console.log("\uD83D\uDDDD\uFE0F Key: ".concat(userRoll.key));
    console.log("\n\uD83D\uDCBB Computer roll: ".concat(compRoll.roll));
    console.log("\uD83D\uDD10 Proof: ".concat(compRoll.proof));
    console.log("\uD83D\uDDDD\uFE0F Key: ".concat(compRoll.key));
    var winner = userRoll.roll > compRoll.roll ? "🏆 You win!" :
        userRoll.roll < compRoll.roll ? "❌ Computer wins!" :
            "🤝 It's a tie!";
    console.log("\n".concat(winner));
}
function main() {
    try {
        var args = process.argv.slice(2);
        var diceSet = parseDiceArgs(args);
        playGame(diceSet);
    }
    catch (error) {
        console.error(error.message);
    }
}
main();
