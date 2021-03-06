#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var restler = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
// var URL_DEFAULT = "http://boiling-crag-9628.herokuapp.com/";
var URL_DEFAULT = null;


var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkString = function(htmlString, checksFile){
    $ = cheerio.load(htmlString);
    var checks = loadChecks(checksFile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
}

var logCheckResult = function (result){
	var outJson = JSON.stringify(result, null, 4);
	console.log(outJson);
}

var checkURL = function(url, checksfile) {
    var instr = url.toString();
    var requestResult = restler.get(instr).on( "complete", function (result) {
      if(result  instanceof Error){
	console.log("%s not loadable: Error:\n%s \n Exiting.", instr, result.message );
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
      }
      else{
	out = checkString(result, checksfile)
	logCheckResult(out);
      }
    });
};

var checkHtmlFile = function(htmlfile, checksfile) {
    var fileContents = fs.readFileSync(htmlfile);
    return checkString(fileContents, checksfile)
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <URL>', 'URL to page')
        .parse(process.argv);
    var checkJson;
    if(program.url !== undefined ){
      // do something
      checkURL(program.url, program.checks)
    }
    else{
      var checkJson = checkHtmlFile(program.file, program.checks);
      logCheckResult(checkJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
