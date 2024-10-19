import { pathGen } from "../utils/common-utils.ts";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { ISSHandler } from "./ISSHandler.js";
import { Select } from "https://deno.land/x/cliffy@v0.25.7/prompt/mod.ts";
import { selectors } from "../utils/cli-seelctors.ts";
import { warningLog } from "../utils/common-utils.ts";
import { appCloseKeyEvtWrapper } from "../event/keypress-event.ts";
import { TSPHandler } from "./TSPHandler.js";
import { UABE_BUSSID } from "../enum/app-enums.ts";

/**
 * CLIHandler is responsible for initializing the command-line interface
 * by checking for necessary assets and prompting the user to select
 * a handler based on their input.
 */
export class CLIHandler {
  private assetsDir: string[] | null = null;

  /**
   * Creates an instance of CLIHandler.
   * Initializes the assets directory and checks for the presence of assets.
   * If no assets are found, logs a warning and closes the application.
   */
  constructor() {
    const assetsDir = pathGen("assets");

    if (!existsSync(assetsDir)) {
      mkdirSync(assetsDir);
    }
    this.assetsDir = readdirSync(assetsDir);

    if (!this.assetsDir ||this.assetsDir.length < 1) {
      warningLog("no base assets found");
      appCloseKeyEvtWrapper();
      return;
    }
    this.initCLIHandler();
  }

  /**
   * Initializes the CLI handler by prompting the user for input.
   * Based on the user's selection, it instantiates either the ISSHandler
   * or TSPHandler.
   * @private
   * @returns {Promise<void>}
   */
  private async initCLIHandler(): Promise<void> {
    const rootAns = await Select.prompt(selectors[0]);
    
    if (rootAns === UABE_BUSSID.Prompt.IncreaseSkinSlots) {
      new ISSHandler(this.assetsDir!);
    } else if (rootAns === UABE_BUSSID.Prompt.TrafficSpawn) {
      new TSPHandler(this.assetsDir!);
    }
  }
}