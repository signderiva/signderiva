#!/usr/bin/env node
"use strict";

const fs = require('fs');
const program = require('subcommander');
const signderiva = require("../index");

const defaultSignderivaPath = process.env['HOME']+"/.signderiva"

program.option('path', {
	abbr: 'p',
	desc: 'Set keys path',
	default: defaultSignderivaPath
})

require("./commands/chest");

// version command
program.command('version', {
	desc: 'Current version',
	callback: function () {
		console.log(' signderiva - Mining & Processing v' + signderiva.version + ' (c) 2018-2020 - Michael Vergoz');
	},
});

program.parse();
