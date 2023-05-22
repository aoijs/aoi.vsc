const fs = require('fs');
console.log({text:fs.readFileSync(__dirname+"/prism.js", "utf8")});