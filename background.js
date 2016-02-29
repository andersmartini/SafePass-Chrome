"use strict"

chrome.extension.onRequest.addListener(function(req, sender, res){
    switch (req.method) {
        case "getHash":
            res(createHash(req.domain));
            break;
        case "getAltHash":
            res(createHash(req.domain));
            break;

        case "setPwd":
            createHash = initialize(req.pwd);
            res({status:"ok"});
            break;
        case "setAltPwd":
            altpwd = req.pwd;
            res({status:"ok"});
            break;
        case "setHotkey":
            chrome.storage.sync.set({"hotkey":req.hotkey},function(){
                res({status:"ok"})
            });
            break;
        case "setAltHotKey":
            chrome.storage.sync.set({"altHotkey":req.hotkey},function(){
                res({status:"ok"})
            });
            break;
        case "getHotkey":
            chrome.storage.sync.get("hotkey",function(k){
                res({hotkey:k});
            })
            break;
        case "getAltHotkey":
            chrome.storage.sync.get("altHotkey",function(k){
                res({hotkey:k});
            })
            break;
        default:
        break;
    }
})
function parseHost(url){
    var host = tldjs.getDomain(url);
    var psfx = tldjs.getPublicSuffix(url);
    host = host.replace(psfx,'');
    return host;
}

function rehash(times, obj){
    var newObj = new jsSHA('SHA-512', 'TEXT');
    newObj.update(obj.getHash("B64"));
    if(times <= 0){
        return newObj.getHash("B64");
    }
    return rehash(times-1, newObj);
}
var createHash = function(){
    return {status:"err", msg:"Not initialized!"};
}

function initialize(pass){
    return function (domain){
        if (pass.length >1){
            var domain = parseHost(domain);
            //Create and update a hashobject
            var shaObj = new jsSHA('SHA-512', "TEXT");
            shaObj.update(domain);
            shaObj.update(pass);
            //Shorten the output in case someone has microsoft accounts (they allow max 16chars)
            var final =rehash(500, shaObj).substring(0,15);
            return{status:"ok", hash:final};
        } else {
            return{status:"err", msg:"Pass not set!"};
        }
    }
}
