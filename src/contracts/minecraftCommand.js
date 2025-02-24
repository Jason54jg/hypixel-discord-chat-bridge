const { splitMessage, delay, generateID } = require("./helperFunctions.js");
const config = require("../../config.json");

class minecraftCommand {
  /** @param {import("minecraft-protocol").Client} minecraft */
  constructor(minecraft) {
    this.minecraft = minecraft;
    this.officer = false;
  }

  /**
   * Returns the arguments of a message.
   * @param {string} message
   * @returns {string[]}
   * */
  getArgs(message) {
    const args = message.split(" ");

    args.shift();

    return args;
  }

  /**
   * Sends a message in the Minecraft chat.
   * @param {string} message
   * @returns
   */
  async send(message) {
    if (!bot?._client?.chat) {
      return;
    }

    if (message.length > 256) {
      const messages = splitMessage(message, 256);
      for (const msg of messages) {
        await delay(1000);
        await this.send(msg);
      }
      return;
    }

    try {
      const sendMessage = async () => {
        return /** @type {Promise<void>} */ (
          new Promise((resolve, reject) => {
            const listener = async (/** @type {{ toString: () => any; }} */ msg) => {
              const msgStr = msg.toString();

              if (msgStr.includes("You are sending commands too fast!") && !msgStr.includes(":")) {
                bot.removeListener("message", listener);
                reject(new Error("rate-limited"));
              }

              if (msgStr.includes("You cannot say the same message twice!") && !msgStr.includes(":")) {
                bot.removeListener("message", listener);
                reject(new Error("duplicate-message"));
              }
            };

            bot.once("message", listener);

            bot.chat(`/${this.officer ? "oc" : "gc"} ${message}`);

            setTimeout(() => {
              bot.removeListener("message", listener);
              resolve();
            }, 500);
          })
        );
      };

      for (let i = 0; i < 5; i++) {
        try {
          await sendMessage();
          return;
        } catch (error) {
          // @ts-ignore
          if (error.message === "rate-limited") {
            if (i === 4) {
              this.send("Command failed to send message after 5 attempts. Please try again later.");
              return;
            }
            await delay(2000);
            continue;
          }

          // @ts-ignore
          if (error.message === "duplicate-message") {
            await delay(100);
            const randomId = generateID(config.minecraft.bot.messageRepeatBypassLength);
            const maxLength = 256 - randomId.length - 3; // -3 for space
            message = `${message.substring(0, maxLength)} - ${randomId}`;
            continue;
          }
          throw error;
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  /**
   * Executes the command.
   * @param {string} player
   * @param {string} message
   */
  onCommand(player, message) {
    throw new Error("Command onCommand method is not implemented yet!");
  }
}

module.exports = minecraftCommand;
