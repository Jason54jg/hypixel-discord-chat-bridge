const minecraftCommand = require("../../contracts/minecraftCommand.js");
const axios = require("axios");

class DinosaurCommand extends minecraftCommand {
  constructor(minecraft) {
    super(minecraft);

    this.name = "dinosaur";
    this.aliases = ["dino"];
    this.description = "Random image of a dinosaur.";
    this.options = [];
  }

  async onCommand(username, message) {
    // CREDITS: by @Kathund (https://github.com/Kathund)
    try {
      const { data, status } = await axios.get("https://imgs.kath.lol/dinosaur");
      if (status !== 200) {
        throw "An error occured while fetching the image. Please try again later.";
      }

      if (data === undefined) {
        throw "An error occured while fetching the image. Please try again later.";
      }

      imgurUrl = data.url;
      this.send("Funny dino: Check Discord Bridge for image.");
    } catch (error) {
      this.send(`[ERROR] ${error}`);
    }
  }
}

module.exports = DinosaurCommand;
