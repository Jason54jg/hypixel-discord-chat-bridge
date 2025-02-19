const minecraftCommand = require("../../contracts/minecraftCommand.js");
const config = require("../../../config.json");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const getAnswer = (message) => {
  if (message.includes(config.minecraft.bot.messageFormat)) {
    return message.split(config.minecraft.bot.messageFormat)[1].trim();
  }

  return message.split(": ")[1];
};

const getUsername = (message) => {
  const match = message.match(
    /^(?:(?:\[(?<rank>[^\]]+)\] )?(?:(?<username>\w+)(?: \[(?<guildRank>[^\]]+)\])?: )?)?(?<message>.+)$/
  );

  if (!match) {
    return null;
  }

  return match.groups.username;
};

class QuickMathsCommand extends minecraftCommand {
  constructor(minecraft) {
    super(minecraft);

    this.name = "quickmaths";
    this.aliases = ["qm"];
    this.description = "Solve the equation in less than 10 seconds! Test your math skills!";
    this.options = [];
  }

  async onCommand(username, message) {
    try {
      const userUsername = username;
      const operands = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
      const operators = ["+", "-", "*"];
      const operator = operators[Math.floor(Math.random() * operators.length)];

      const equation = `${operands[0]} ${operator} ${operands[1]}`;
      const answer = eval(operands.join(operator));
      const headStart = 250;

      this.send(`${username} What is ${equation}?`);
      await delay(headStart);

      const startTime = Date.now();
      let answered = false;

      const listener = (username, message) => {
        if (getAnswer(message) !== answer.toString()) {
          return;
        }

        answered = true;
        this.send(`${getUsername(message)} Correct! It took you ${(Date.now() - startTime).toLocaleString()}ms`);
        bot.removeListener("chat", listener);
      };

      bot.on("chat", listener);

      setTimeout(() => {
        bot.removeListener("chat", listener);

        if (!answered) {
          this.send(`${userUsername} Time's up! The answer was ${answer}`);
        }
      }, 10000);
    } catch (error) {
      this.send(`${username} [ERROR] ${error || "Something went wrong.."}`);
    }
  }
}

module.exports = QuickMathsCommand;
