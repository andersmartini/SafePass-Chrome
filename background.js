"use strict"

chrome.extension.onRequest.addListener(function(req, sender, res){
    switch (req.method) {
        case "getHash":
            res(createHash(req.domain));
            break;
        case "signUp":

            break;
        case 'login':
            
        default:
        break;
    }
})

/*************************  UTILS  ***********************************/
//extract interesting part of url, the part before '.com', '.org' etc..
function parseHost(url){
    var host = tldjs.getDomain(url);
    var psfx = tldjs.getPublicSuffix(url);
    host = host.replace(psfx,'');
    return host;
}

//run hashingalgorighm {times} times.

function rehash(times, obj){
    var newObj = new jsSHA('SHA-512', 'TEXT');
    newObj.update(obj.getHash("B64"));
    if(times <= 0){
        return newObj.getHash("B64");
    }
    return rehash(times-1, newObj);
}








/***************************Dummies****************************/

//dummy implementation, needs to be initialized with intialize() !
var createHash = function(){
    return {ok:false, err:"Not initialized!"};
}

//dummy implementation needs to be initialized with connectSecrets()! 
var getSecrets = function(){
    return "not yet initialized!"
}






/*********************************INITIALIZERS************************************/


//sets createHash to a function accepting a domain, mixing that domain with the password passed into initialize()

function initialize(localPass, serverPass){

    //enforce uniqueness and length on localPass, and login to server.
    if( (localPass.length<6 && login(serverPass)) || localPass===serverPass){
        return{ok:false, err:"couldn't log in, verify your passwords"}
    }

    createHash = function (domain){
        if (localPass.length >1){
            var domain = parseHost(domain);
            //Create and update a hashobject
            var shaObj = new jsSHA('SHA-512', "TEXT");
            shaObj.update(domain);
            shaObj.update(localPass);
            //Shorten the output in case someone has microsoft accounts (they allow max 16chars)
            var final =rehash(500, shaObj).substring(0,15);
            return{ok:true, hash:final};
        } else {
            return{ok:false, err:"Pass not set!"};
        }
    }
}



/*  
*   login towards server, 
*   this basicly just checks that [serverPass] and [username] is correct
*   credentialls will still have to be sent with each request.
*
*   consider adding some cookie-like mechanism unless extension-specific cookies are a thing in chrome
*   to avoid this unnesscary passing of credentials - its Risky!
*/
function login(user, pass, res){

    var xhr =new XMLHttpRequest();
    xhr.open('POST', 'http://pass-safe.herokuapp.com/login', true);
    xhr.withCredentials = true;
    xhr.body.user = user;
    xhr.body.password = pass;
    xhr.onreadystatechange = function(response){
        if(response.ok){
            connectSecrets(user, pass);
            return true;
        }
        return false;
    }
}




//initializes adapter getSecrets with SafePass server credentials
function connectSecrets(user, pass){
    //getSecrets promises a Secret for the given domain. 
    getSecrets = function(domain){
        return new Promise(function(resolve, reject){
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `/http://pass-safe.herokuapp.com/Secret/${domain}`, true);
            xhr.withCredentials=true;
            xhr.body.user = user;
            xhr.body.pass = pass;
            xhr.onreadystatechange = function(response){
                response = JSON.parse(response);
                if(response.ok){
                    resolve(response.Secret);
                }
            }
        })
    }
}


//ensure compatability at all sites.
//lower actual security of generated passwords in case they dont fullfill "security requirements" on target sites
function ensureSymbols(pass){
    /*
    to Be implemented
    check final cropped password to make sure it has at least 1
        - lowercase letter
        - UpperCase Letter
        - Number
        - symbol, such as !"#¤%&/()=?

    ïf it misses any of the above, replace first char(s) with a default char of the missing type

    */
}