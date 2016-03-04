var hotkey =60; //default hotkey '>'
var hotkey2 = 62 // default alternative hotkey, for changing passwords '<'
$(function(){

    $(document).on("keypress","input[type=password]", function(event){
        if(event.keyCode==hotkey ){
            var that = $(this);
            chrome.extension.sendRequest({method:"getHash",domain:window.location.hostname }, function(res){
                if(res.status == "ok"){
                    that.val(res.hash);
                }else{
                    alert("Please login to SafePass!")
                }
            })

        }
    })

 




/* Functionality to use custom hotkey, currently not working so taking out of implementation for now


    $(document).on("focus", "input[type=password]",function(e){
        chrome.extension.sendRequest({method:"getHotkey"},function(res){
            if(typeof(res.hotkey)=='number'){
                hotkey = res.hotkey;
            }
            if(typeof(res.hotkey2)=='number'){
                hotkey2= res.hotkey2;
            }
        })
    })

*/

})
