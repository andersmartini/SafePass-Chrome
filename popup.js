$(function(){

    //Standard login-form
    $(document).on("click", "#submit",function(e){
        var alt = Boolean($("#alt").val());
        var method = alt? "setAltPwd":"setPwd";
        var key = alt? "getAltHotkey":"getHotkey";

        if($("#password").val() ==$("#verification").val()){
            chrome.extension.sendRequest({method:method, pwd:$("#password").val()}, function(res){
                if(res.ok) $("#msg").text("Welcome!").css("color","green")
            })
        }else{
            $("#msg").text("Passwords does not match!").css("color", "red");
        }
    })
    // Update the hotkey
    $(document).on("keypress", "#hotkey", function(e){
        var alt = Boolean($("#alt").val());
        var method = alt? "setAltHotkey":"setHotkey";
        var key = e.keyCode;
        chrome.extension.sendRequest({method:method, hotkey:key},function(res){
            
            if(res.ok){
                $("#changeHotkey").val(String.fromCharCode(key));
            }
            else {
                $("#msg").text(res.err).css("color", "red");
            }
        })
    })
    //Switch to alternate settings, for setting new passwords n such.
    $("#altBtn").click(function(){
        var alt = !Boolean($("#alt").val());
        $("#alt").val(alt);
        var header = alt? "Type your New Password" : "Type your Password";


    })
})
