"use strict"

chrome.extension.onRequest.addListener(function(request, sender, respond){
    switch (request.method) {
        case "getHash":
            createHash(request)
                .then(respond, respond);
            break;

        case "signUp":
            createUser(request)
                .then(initialize)
                .then(createHash)
                .then(respond,respond);
            break;
        case 'login':
            login(request)
                .then(initialize)
                .then(respond,respond);           
            break;

        default:
        respond({ok:false, err:"Invalid Method"});
        break;
    }
})

/*************************** Dummies ****************************/
//  These funcions will be swapped for better ones when logged in!    
//                   se [initializers] below! 

//Actual implementation nested in initialize (see line 106)
var createHash = function(request){
    return new Promise(function(resolve, reject){
        response = {ok:false, err:"Must Log In First!"}
        reject(response);
    })
}

//Actual implementation nested inside conneccSecrets (see line 134)
var getSecrets = function(request){
    return new Promise(function(resolve, reject){
        response = {ok:false, err:"Must Log In First!"}
        reject(response);
    })
}




/*************************  UTILS  ***********************************/

//extract interesting part of url, the part before '.com', '.org' etc..
// mail.google.com returns "google", while login.portal.office.microsoft.com returns "microsoft"
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

//ensure compatability at all sites.
//lower actual security of generated passwords in case they dont fullfill "security requirements" on target sites
function ensureSymbols(pass){
    /*
    to Be implemented/7
    check final cropped password to make sure it has at least 1
        - lowercase letter
        - UpperCase Letter
        - Number
        - symbol, such as !"#¤%&/()=?

    ïf it misses any of the above, replace first char(s) with a default char of the missing type

    */
}




/*********************************INITIALIZERS************************************/


//sets createHash to a function accepting a domain, mixing that domain with the password passed into initialize()

function initialize(request){
    return new Promise(function(resolve, reject){

        //enforce uniqueness and length on request.localPass, and login to server.
        if( (request.localPass.length<6 && login(request.serverPass)) || request.localPass===request.serverPass){
            request.err = "couldn't log in, verify your passwords"
            return reject(request);
        }
        connectSecrets(request);
        createHash = function (request){
            return new Promise(function(resolve, reject){
                var domain = parseHost(request.domain);
                //Create and update a hashobject
                var shaObj = new jsSHA('SHA-512', "TEXT");
                shaObj.update(request.domain);
                shaObj.update(request.Secret)
                shaObj.update(localPass);
                //Shorten the output in case someone has microsoft accounts (they allow max 16chars)
                var final =rehash(500, shaObj).substring(0,15);
                const response = {ok:true, hash:final};
                return resolve(response);
                
            })
        }
    })
}





//initializes adapter getSecrets with SafePass server credentials
function connectSecrets(request){
    const serverPass = request.serverPass;
    const userName = request.username
    //getSecrets promises a Secret for the given domain. 
    getSecrets = function(request){
        return new Promise(function(resolve, reject){
            const domain = parseHost(request.domain)
            const xhr = new XMLHttprequestuest();
            xhr.open('POST', '/http://pass-safe.herokuapp.com/Secret/'+domain, true);
            xhr.withCredentials=true;
            xhr.body.user = username;
            xhr.body.pass = serverPass;
            xhr.onreadystatechange = function(response){
                response = JSON.parse(response);
                if(response.ok){
                    request.secret = response.Secret;
                    return resolve(request);
                }
                reject(request);
            }
        })
    }
}



/******************************* Remote Operations *************************************/

function createUser(request){
    return new Promise(function(resolve,reject){
        const xhr = new XMLHttprequestuest();
        xhr.open('POST','/http://pass-safe.herokuapp.com/signup');
        xhr.withCredentials=true;
        xhr.body.username = request.username;
        xhr.body.password = request.serverPass;
        xhr.onreadystatechange = function(response) {
            response = JSON.parse(response);
            if(response.ok){
                return resolve(request);
            }
            request.err = response.err
            reject(request);
        }

    })
}

/*  *******************************************************************************
*   login towards server, 
*   this basicly just checks that [serverPass] and [username] is correct
*   credentialls will still have to be sent with each request.
*
*   consider adding some cookie-like mechanism unless extension-specific cookies are a thing in chrome
*   to avoid this unnesscary passing of credentials - its Risky!  */

function login(request){
    return new Promise(function(resolve, reject){    
        var xhr =new XMLHttpRequest();
        xhr.open('POST', 'http://pass-safe.herokuapp.com/login', true);
        xhr.withCredentials = true;
        xhr.body.user = request.username;
        xhr.body.password = request.serverPass; 
        xhr.onreadystatechange = function(response){
            if(response.ok){
                connectSecrets(request);
                return resolve(request);
            }
            return reject(request);
    }
    })
}

