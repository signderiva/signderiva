/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                         *
 * SIGNDERIVA CONFIDENTIAL                                                 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - *
 *                                                                         *
 *  2018-2019 - Michael VERGOZ                                             *
 *  All Rights Reserved.                                                   *
 *                                                                         *
 * NOTICE:  All information contained herein is, and remains               *
 * the property of Signderiva and its suppliers,                           *
 * if any.  The intellectual and technical concepts contained              *
 * herein are proprietary to Signderiva                                    *
 * and its suppliers and may be covered by U.S. and Foreign Patents,       *
 * patents in process, and are protected by trade secret or copyright law. *
 * from Signderiva.                                                        *
 * is strictly forbidden unless prior written permission is obtained       *
 * Dissemination of this information or reproduction of this material      *
 *                                                                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

const fs = require("fs");

const prettyjson = require('prettyjson');

const device = require("./device/nodejs");

// for debugging
if (!console.pretty) {
  console.pretty = function (data) {
    console.log(prettyjson.render(data));
  }
}

const pack = require("./package.json")

module.exports = {
  version: pack.version,
  device,

  // cache: _dCache,
  // inet: _dInet,
  // localKeys: _dLocalKeys,

  ring0: function (options, onReady) {
    const memory = { config: {} };

    memory.device = new _dDevice(memory);

    // memory.localKeys = new _dLocalKeys(memory);

    // memory.localKeys.load(options.keysfile, () => {

    // 	memory.localKeys.get(options.key, (key) => {
    // 		if(!key) {
    // 			console.log("Can not find key "+options.key);
    // 			process.exit(-1);
    // 		}

    // 		// plant main key
    // 		memory.config.key = key;

    // 		memory.device.info("Signderiva NodeJS ring0 loaded");
    // 		onReady(memory)
    // 	})
    // })

    memory.device.info("Signderiva NodeJS ring0 loaded");
    onReady(memory)
  },

  ring1: function (memory, file, onBoot) {
    memory.onBoot = onBoot

    // try to load local memory
    fs.readFile(file, (err, code) => {
      memory.device.info("Signderiva NodeJS ring1 loaded");
      if (err) code = ''
      memory.device.boot(memory, code.toString())
    })
  }
}
