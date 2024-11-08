import { writeFileSync } from "node:fs";
import FileHandler from "../classes/FileHandler.ts";
import HexHandler from "../classes/HexHandler.ts";
import {
  asciiToHexBytes,
  errorLog,
  getCompactDateTime,
  pathGen,
} from "../utils/common-utils.ts";
import type { BaseAssets } from "../types/ISSHandler-custom.ts";

const busHD_01Alias = "BusHD_01";
let baseAssets: BaseAssets = {
  mono: null,
  obj: null,
  skin: null,
  skinAlias: null,
  quantity: 0,
};

let trafficMono = "";

// Listen for messages from the parent thread
self.onmessage = (event) => {
  try {
    baseAssets = event.data;
    for (let i = 0; i < baseAssets.quantity; i++) {
      const fileIndex = (i + 1).toString().padStart(2, "0");
      manipulateFiles(fileIndex);
    }
    writeFileSync(
      pathGen("output", `${getCompactDateTime()}.txt`),
      trafficMono,
    );
    self.postMessage("done");
    // deno-lint-ignore no-explicit-any
  } catch (error: any) {
    errorLog({
      error: error,
      msg: `\n ${error.message}`,
    });
    self.postMessage("error");
  }
};

/**
 * Manipulates the Mono, Object, and Skin files based on the provided index string.
 * @param {string} indexStr - The index string for the current file iteration.
 */
const manipulateFiles = (indexStr: string) => {
  manipulateMono(indexStr);
  manipulateObj(indexStr);
  manipulateSkin(indexStr);
};

/**
 * Manipulates the Mono file based on the provided index string.
 * @param {string} indexStr - The index string for the current file iteration.
 * @throws Will log an error if the manipulation fails.
 */
const manipulateMono = (indexStr: string) => {
  try {
    const newObjDep = baseAssets.obj!.slice(0, 30) + indexStr;
    const newMonoFile = baseAssets.mono!.slice(0, 30) + indexStr;

    trafficMono = trafficMono + `${newMonoFile}\n`;

    const fileIns = new FileHandler({
      inputPath: pathGen("assets", baseAssets.mono!),
      outPath: pathGen("output", newMonoFile),
    });

    const hexIns = new HexHandler(fileIns.buffer!);
    const objDepOffset = hexIns.findIndex(asciiToHexBytes(baseAssets.obj!));
    const monoAliasOffset = hexIns.findIndex(
      asciiToHexBytes(busHD_01Alias),
    );

    // Modify file dependencies and aliases
    hexIns.replaceBytes(objDepOffset[0].start, asciiToHexBytes(newObjDep));
    hexIns.replaceBytes(
      monoAliasOffset[0].start,
      asciiToHexBytes(`BusHD_${indexStr}`),
    );

    fileIns.writeBuffer();
  } catch (_) {
    throw new Error(`Error manipulating Mono file for index ${indexStr}:`);
  }
};

/**
 * Manipulates the Object file based on the provided index string.
 * @param {string} indexStr - The index string for the current file iteration.
 * @throws Will log an error if the manipulation fails.
 */
const manipulateObj = (indexStr: string) => {
  try {
    const newMonoDep = baseAssets.mono!.slice(0, 30) + indexStr;
    const newSkinDep = baseAssets.skin!.slice(0, 30) + indexStr;
    const newObjFile = baseAssets.obj!.slice(0, 30) + indexStr;

    const fileIns = new FileHandler({
      inputPath: pathGen("assets", baseAssets.obj!),
      outPath: pathGen("output", newObjFile),
    });

    const hexIns = new HexHandler(fileIns.buffer!);
    const monoDepOffset = hexIns.findIndex(
      asciiToHexBytes(baseAssets.mono!),
    );
    const skinDepOffset = hexIns.findIndex(
      asciiToHexBytes(baseAssets.skin!),
    );
    const monoAliasOffset = hexIns.findIndex(
      asciiToHexBytes(busHD_01Alias),
    );

    // Modify file dependencies and aliases
    hexIns.replaceBytes(
      skinDepOffset[0].start,
      asciiToHexBytes(newSkinDep),
    );
    hexIns.replaceBytes(
      monoDepOffset[0].start,
      asciiToHexBytes(newMonoDep),
    );
    hexIns.replaceBytes(
      monoAliasOffset[0].start,
      asciiToHexBytes(`BusHD_${indexStr}`),
    );

    fileIns.writeBuffer();
  } catch (_) {
    throw new Error(`Error manipulating Object file for index ${indexStr}:`);
  }
};

/**
 * Manipulates the Skin file based on the provided index string.
 * @param {string} indexStr - The index string for the current file iteration.
 * @throws Will log an error if the manipulation fails.
 */
const manipulateSkin = (indexStr: string) => {
  try {
    const newSkinFile = baseAssets.skin!.slice(0, 30) + indexStr;

    const fileIns = new FileHandler({
      inputPath: pathGen("assets", baseAssets.skin!),
      outPath: pathGen("output", newSkinFile),
    });

    const hexIns = new HexHandler(fileIns.buffer!);
    const skinAliasOffset = hexIns.findIndex(
      asciiToHexBytes(baseAssets.skinAlias!),
    );
    const newSkinAlias = `${baseAssets.skinAlias!.slice(0, -2)}${indexStr}`;

    // Modify Skin Alias in Mat and Tex
    hexIns.replaceBytes(
      skinAliasOffset[0].start,
      asciiToHexBytes(newSkinAlias),
    );
    hexIns.replaceBytes(
      skinAliasOffset[1].start,
      asciiToHexBytes(newSkinAlias),
    );

    fileIns.writeBuffer();
  } catch (_) {
    throw new Error(`Error manipulating Skin file for index ${indexStr}:`);
  }
};
