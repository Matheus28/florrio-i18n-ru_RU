// This will launch the live game with the current translation
const path = require("path");
const fs = require("fs/promises");
const child_process = require("child_process");
const start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');

const DEBUG = true;

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
        let contents = await fs.readFile(name, "utf8");
        if(f == "changelog.txt"){
            changelogContents = contents;
            return "";
        }else{
            return contents;
        }
    }))).join("\n");

    // Make it just a little smaller
    langContents = langContents.replace(/\n\n/g, "\n");
    
    let url = JSON.stringify({ "lang": langContents, "changelog": changelogContents });
    
    let serverURL = DEBUG ? "http://localhost:3444/langTest" : "https://langtest.florr.io/langTest";
    
    let shortURL = (await (await fetch(serverURL, { method: "POST", body: url, headers: { "Content-Type": "application/json" } })).json())["id"];
    shortURL = serverURL + "?id=" + shortURL;
    if(process.env["GITHUB_ACTIONS"]){
        console.log("Visit " + shortURL + " to test the translation");
    }else{
        require('child_process').exec(start + ' ' + shortURL + '');
    }
})().catch(function(e){
    console.error(e);
    process.exit(1);
});
