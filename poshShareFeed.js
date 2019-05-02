let shares = [];
let triggerNotification = false;

$("div.col-x12.col-l6.col-s8 .tile").each(function () {
    let icon = $(this).find(".covershot-con i")
    if (icon.length === 0) {
        shares.push($(this).attr("id"))
    }
});
for (let i = 0; i < shares.length; i++) {
    setTimeout(function () {
        if (shares[i] != null && shares[i] !== "") {

            $("a.pm-followers-share-link").attr("href", "/listing/share?post_id=" + shares[i]);
            $("a.pm-followers-share-link").click();
        }
    }, i * 2000);
}
setTimeout(function () {
    let audio = new Audio('https://interactive-examples.mdn.mozilla.net/media/examples/t-rex-roar.mp3');
    audio.play();
}, shares.length * 2000);
let time = (shares.length * 2) / 60;
console.log("Number of items to share: " + shares.length + "\nTime to completion: " + time + " minutes.");




function clickcaptcha() {
    if($("#captcha-popup").length != 0){
        if($("#captcha-popup").hasClass("in")){
            $(".recaptcha-checkbox-checkmark").click();
        }
    }
    $(".recaptcha-checkbox-checkmark").click();
    document.querySelector(".recaptcha-checkbox-checkmark").click();
}

function dealWithCaptcha() {
    if(!triggerNotification){
        if (Notification.permission !== "granted")
            Notification.requestPermission();
        else {
            let notification = new Notification('Captcha Has Appeared!', {
                icon: 'https://d2zlsagv0ouax1.cloudfront.net/assets/v3/logo@2x-6003c7f00d83f4df697830d18bdcf167.png',
                body: "Go to posh and deal with it",
                silent: false,
                vibrate: true,
            });
            notification.onshow = function () {
                let audio = new Audio('http://soundbible.com/mp3/Bobwhite Quail-SoundBible.com-1782515847.mp3');
                audio.volume = 1;
                audio.play();
            }
        }
        triggerNotification = true;
        setTimeout(function () {
            triggerNotification = false;
        }, 180000)
    }
    clickcaptcha();
}

window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
    dealWithCaptcha();

};
$(document).ajaxError(function( event, request, settings ) {
    dealWithCaptcha();
});


/*
javascript:(function(){let shares=[],triggerNotification=!1;$("div.col-x12.col-l6.col-s8 .tile").each(function(){0===$(this).find(".covershot-con i").length&&shares.push($(this).attr("id"))});for(let e=0;e<shares.length;e++)setTimeout(function(){null!=shares[e]&&""!==shares[e]&&($("a.pm-followers-share-link").attr("href","/listing/share?post_id="+shares[e]),$("a.pm-followers-share-link").click())},2e3*e);setTimeout(function(){new Audio("https://interactive-examples.mdn.mozilla.net/media/examples/t-rex-roar.mp3").play()},2e3*shares.length);let time=2*shares.length/60;function clickcaptcha(){0!=$("#captcha-popup").length&&$("#captcha-popup").hasClass("in")&&$(".recaptcha-checkbox-checkmark").click(),$(".recaptcha-checkbox-checkmark").click(),document.querySelector(".recaptcha-checkbox-checkmark").click()}function dealWithCaptcha(){if(!triggerNotification){if("granted"!==Notification.permission)Notification.requestPermission();else{new Notification("Captcha Has Appeared!",{icon:"https://d2zlsagv0ouax1.cloudfront.net/assets/v3/logo@2x-6003c7f00d83f4df697830d18bdcf167.png",body:"Go to posh and deal with it",silent:!1,vibrate:!0}).onshow=function(){let e=new Audio("http://soundbible.com/mp3/Bobwhite Quail-SoundBible.com-1782515847.mp3");e.volume=1,e.play()}}triggerNotification=!0,setTimeout(function(){triggerNotification=!1},18e4)}clickcaptcha()}console.log("Number of items to share: "+shares.length+"\nTime to completion: "+time+" minutes."),window.onerror=function(e,t,i,o,c){dealWithCaptcha()},$(document).ajaxError(function(e,t,i){dealWithCaptcha()});});
*/
