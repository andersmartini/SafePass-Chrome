$(function(){

    //Standard login-form
    $(document).on("submit", "#loginForm",function(event){
        var req = {};
        req.user = event.form.username.value();
        req.serverPass = event.form.serverPass.value();
        req.localPass = event.form.localPass.value();
        req.method = "login";
        chrome.extension.sendRequest(req, function(res){
            if(res.ok){

            }
        })
    })


    $(document).on("submit", "#signupForm", function(event){
        if(!event.form.serverPass.value()===event.form.serverPassVerif.value() && !event.form.localPass.value() === event.form.localPassVerif() ){
            //A typo has been made! stop this madness!
            window.alert("Passwords do not match!");
            return;
        }

        var req = {};
        req.username = event.form.username.value();
        req.serverPass = event.form.serverPass.value();
        req.localPass = event.form.localPass.value();

        req.method = "signUp";

        chrome.extension.sendRequest(req, function(res){

        })

    })















