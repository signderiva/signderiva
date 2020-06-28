
const fs = require("fs");

module.exports = {
	mkdirDeep: function(dir) {
		var stage = '';
		var tab = dir.split("/");
		tab.pop();

		for(var a = 1; a<tab.length; a++) {
			stage += '/'+tab[a];
			try  {
				try {
					var fss = fs.statSync(stage);
				} catch(a) {
					fs.mkdirSync(stage);
				}
			}
			catch(e) {
				console.error('* Error: can not create '+dir);
				process.exit(0);
			}
		}
		return(true);
	},

	scorePassword: function(pass) {
		var score = 0;
		if(!pass)
		return score;

		// award every unique letter until 5 repetitions
		var letters = new Object();
		for (var i=0; i<pass.length; i++) {
			letters[pass[i]] = (letters[pass[i]] || 0) + 1;
			score += 5.0 / letters[pass[i]];
		}

		// bonus points for mixing it up
		var variations = {
			digits: /\d/.test(pass),
			lower: /[a-z]/.test(pass),
			upper: /[A-Z]/.test(pass),
			nonWords: /\W/.test(pass),
		}

		variationCount = 0;
		for (var check in variations) {
			variationCount += (variations[check] == true) ? 1 : 0;
		}
		score += (variationCount - 1) * 10;

		return parseInt(score);
	},
	checkPassStrength: function(pass) {
		var score = scorePassword(pass);
		if (score > 80)
			return "strong";
		if (score > 60)
			return "good";
		if (score >= 30)
			return "weak";
		return "weak";
  },
  
	// printable: function(data, type) {
	// 	var src = new Buffer(JSON.stringify(data)).toString("base64");
	// 	var dst = '';
	// 	for(var a=0,b=0; a<src.length; a++, b++) {
	// 		dst += src[a];
	// 		if(b==config.base64col) {
	// 			dst += "\n";
	// 			b=0;
	// 		}
	// 	}
	// 	var pd = '----------- '+type+' -----------\n'+
	// 		dst+
	// 		'\n----------- END OF '+type+' -----------\n'
	// 	return(pd);
	// }

}
