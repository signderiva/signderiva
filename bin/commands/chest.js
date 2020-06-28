const fs = require('fs');
const program = require('subcommander');

const signderiva = require("../../index")
const kernel = require("@signderiva/lib-kernel");
const utils = require("../../lib/utils")
const QRCode = require("qrcode")
const Table = require('cli-table');
const inquirer = require('inquirer');
const { end } = require('subcommander');

function debug() { }

const defaultSignderivaPath = process.env['HOME'] + "/.signderiva"

function retrieveChest(options) {
  const ret = {}

  // initial signderiva
  ret.device = new signderiva.device(null, {})
  ret.dir = `${options.path}/chests`
  ret.filename = `${ret.dir}/${options[0]}.json`

  try {
    const data = fs.readFileSync(ret.filename, "utf8")
    ret.json = JSON.parse(data)
    ret.chest = new kernel.chest(ret.device, ret.json.name);

    ret.chest.unpack(ret.json)
  } catch (e) {
    ret.device.error(`Can not read chest ${options[0]}: ${e.message}`)
    process.exit(-1)
  }

  return (ret)
}

// confirm
function askPassword(cb) {
  var pass
  var questions = [
    {
      type: 'input',
      name: 'name',
      message: "Define a name identifier",
      default: "User Defined Password"
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password',
      validate: function (input) {
        if (input.length < 8) return ("Password too short")
        pass = input;
        return (true)
      }
    },
    {
      type: 'password',
      name: 'confirm',
      message: 'Confirm Password',
      validate: function (input) {
        if (input !== pass) return ("Password does not match")
        return (true)
      }
    }
  ];

  inquirer.prompt(questions).then(cb);
}

// confirm
function unlockChest(env, cb) {
  var questions = [
    {
      type: 'password',
      name: 'password',
      message: "Type a chest password"
    }
  ];

  inquirer.prompt(questions).then(data => {
    const ret = env.chest.open(data.password)
    if (ret !== true) {
      env.device.error(ret)
      return;
    }
    cb(data)
  });
}

function confirmWrite(env, filename, cb) {
  var questions = [
    {
      type: 'confirm',
      name: 'write',
      message: `Write chest to ${filename}`,
      default: true
    },
  ];

  inquirer.prompt(questions).then(data => {
    if (data.write === true) {
      utils.mkdirDeep(filename);

      env.device.info(`Chest is stored in ${filename}`)

      fs.writeFile(filename, JSON.stringify(env.chest.pack(), null, 4), { mode: 0o600 }, (err) => {
        if (err) {
          lpc.error("Error writing " + filename + ": " + err);
          process.exit(-1);
        }
        cb()
      })
    }
  });
}

const pkey = program.command('chest', {
  desc: 'Manage local chest'
});

pkey.command('list', {
  desc: 'Show list of chest',
  callback: function (options) {
    const dir = `${options.path}/chests`

    // instantiate
    const table = new Table({
      head: ['ID', 'Name', 'Locked', 'Passwords', 'Fingerprint'],
    });

    const files = fs.readdirSync(dir)
    for (var a in files) {
      const file = files[a]
      const filename = `${dir}/${file}`
      try {
        const data = fs.readFileSync(filename, "utf8")
        const json = JSON.parse(data)
        json.locked = "locked" in json ? json.locked : true;
        table.push([json.id, json.name, json.locked, json.passwords.length, json.keys.fp])
      } catch (e) { }
    }

    console.log(table.toString());
  },
})

pkey.command('info', {
  desc: 'Get chest informations',
  callback: function (options) {
    const env = retrieveChest(options)
    console.pretty(env.json)
  }
})

pkey.command('rename', {
  desc: 'Rename a chest',
  callback: function (options) {
    const env = retrieveChest(options)

    var questions = [
      {
        type: 'input',
        name: 'name',
        message: "New name",
        default: env.json.name
      },
    ]

    inquirer.prompt(questions).then(answers => {
      env.json.name = answers.name
      env.device.info(`Chest is stored in ${env.filename}`)
      fs.writeFile(env.filename, JSON.stringify(env.json, null, 4), { mode: 0o600 }, (err) => {
        if (err) {
          env.device.error("Error writing " + env.filename + ": " + err);
          process.exit(-1);
        }
        env.device.success("Write completed! Key Added");
      })
    });
  }
})

const password = pkey.command('password', {
  desc: 'Manage chest passwords'
});

password.command('list', {
  desc: 'List all passwords attached to the chest',
  callback: function (options) {
    const env = retrieveChest(options)
    // instantiate
    const table = new Table({
      head: ['ID', 'Name', 'Initial Vector', 'Fingerprint'],
    });
    for (var a in env.chest.passwords) {
      const pass = env.chest.passwords[a]
      if (pass) table.push([pass.id, pass.name, pass.iv, pass.fp])
    }
    console.log(table.toString());
  }
})

password.command('add', {
  desc: 'Add password to the chest',
  callback: function (options) {
    const env = retrieveChest(options)
    unlockChest(env, data => {
      askPassword((data) => {
        env.chest.addPassword(data.password, data.name)
        const filename = `${options.path}/chests/${env.chest.id}.json`
        confirmWrite(env, filename, () => {
          env.device.success("Password added to chest " + options[0])
        })
      })
    })
  }
})

password.command('identify', {
  desc: 'Identify password slot in the chest',
  callback: function (options) {
    const env = retrieveChest(options)
    unlockChest(env, data => {
      env.device.info(`Here is information about the unlocked key ${options[0]}`)
      console.log(env.chest.current)
    })
  }
})

password.command('unlock', {
  desc: 'Unlock password layer of the chest',
  callback: function (options) {
    const env = retrieveChest(options)
    if (env.chest.locked === false) {
      env.device.warning(`Chest already unlocked`)
      process.exit(0)
    }
    unlockChest(env, data => {
      env.chest.unlock()
      const filename = `${options.path}/chests/${env.chest.id}.json`
      confirmWrite(env, filename, () => {
        env.device.success(`Unlocking chest ${options[0]}`)
      })
    })
  }
})

password.command('lock', {
  desc: 'Activate lock password layer on the chest',
  callback: function (options) {
    const env = retrieveChest(options)
    if (env.chest.locked === true) {
      env.device.warning(`Chest already locked`)
      process.exit(0)
    }
    unlockChest(env, data => {
      env.chest.lock()
      const filename = `${options.path}/chests/${env.chest.id}.json`
      confirmWrite(env, filename, () => {
        env.device.success(`Unlocking chest ${options[0]}`)
      })
    })
  }
})

password.command('remove', {
  desc: 'Remove password slot in the chest',
  callback: function (options) {
    const env = retrieveChest(options)

    const ret = env.chest.removePassword(options[1])
    if (ret !== true) {
      env.device.error(ret)
      process.exit(-1)
    }

    const filename = `${options.path}/chests/${env.chest.id}.json`
    confirmWrite(env, filename, () => {
      env.device.success(`Password ${options[1]} from chest ${options[0]}`)
    })
  }
})

pkey.command('generate', {
  desc: 'Generate Private Signderiva Keys',
  callback: function (options) {
    // initial signderiva
    const lpc = new signderiva.device(null, {})

    const config = {
      passwords: []
    }

    var questions = [
      {
        type: 'input',
        name: 'name',
        message: "Set a chest name",
        default: "CLI Chest"
      },
    ]

    inquirer.prompt(questions).then(answers => {
      config.name = answers.name;
      newPassword(true)
    });

    function newPassword(def) {
      var questions = [
        {
          type: 'confirm',
          name: 'add',
          message: "Add password ?",
          default: def
        },
      ];

      inquirer.prompt(questions).then(data => {
        if (data.add === true) {
          askPassword((data) => {
            config.passwords.push(data)
            newPassword(false)
          })
        }
        else generate()
      });
    }

    function generate() {
      const key = new kernel.chest(lpc, config.name);
      const backup = key.initialize();

      QRCode.toString(backup, { type: 'terminal' }, function (err, data) {
        console.log(data)
      })

      lpc.success(`Your backup key is: ${backup}`)

      for (var a in config.passwords) {
        const password = config.passwords[a]
        lpc.info(`Adding key: ${password.name}`)
        key.addPassword(password.password, password.name)
      }

      const filename = `${options.path}/chests/${key.id}.json`
      confirmWrite({ device: lpc, chest: key }, filename, () => {

      })
    }
  },
})