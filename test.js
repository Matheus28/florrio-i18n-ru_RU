// This will launch the live game with the current translation
const path = require("path");
const fs = require("fs/promises");
const child_process = require("child_process");
const start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');


let txtFile = process.argv[2];
if(!txtFile || !txtFile.endsWith(".txt")){
    console.error("You must have a .txt file selected before hitting run");
    process.exit(1);
}


(async function(){
    let langDir = path.dirname(txtFile);
    let changelogContents = "";
    
    let langContents = (await Promise.all((await fs.readdir(langDir)).map(async function(f){
        if(!f.endsWith(".txt")) return "";

        let name = path.join(langDir, f);
        let contents = fs.readFile(name, "utf8");
        if(f == "changelog.txt"){
            changelogContents = contents;
            return "";
        }else{
            return contents;
        }
    }))).join("\n");

    // Make it just a little smaller
    langContents = langContents.replace(/\n\n/g, "\n");
    
    let url = Buffer.from(JSON.stringify({ "lang": langContents, "changelog": changelogContents })).toString("base64");
    require('child_process').exec(start + ' "' + url + '"');
})().catch(function(e){
    console.error(e);
    process.exit(1);
});