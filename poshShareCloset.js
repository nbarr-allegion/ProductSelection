let shares = [];
let triggerNotification = false;
$("div.col-x12.col-l6.col-s8 .tile").each(function () {
    let icon = $(this).find(".covershot-con i");
    if (icon.length === 0) {
        shares.push($(this).attr("id"))
    }
});

function clickShareButton() {
    for (let i = 0; i < shares.length; i++) {
        setTimeout(function () {
            if (shares[i] != null && shares[i] !== "") {
                $("a.pm-followers-share-link").attr("href", "/listing/share?post_id=" + shares[i]);
                $("a.pm-followers-share-link").click();

            }
        }, i * 5000);
    }
}

for (let i = 0; i < 3000; i++) {
    setTimeout(function () {
        clickShareButton();
    }, i * shares.length * 5000)
}


function clickcaptcha() {
    if ($("#captcha-popup").length != 0) {
        if ($("#captcha-popup").hasClass("in")) {
            $(".recaptcha-checkbox-checkmark").click();
        }
    }
    $(".recaptcha-checkbox-checkmark").click();
    document.querySelector(".recaptcha-checkbox-checkmark").click();
}

function dealWithCaptcha() {
    if (!triggerNotification) {
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
$(document).ajaxError(function (event, request, settings) {
    dealWithCaptcha();
});
/*
javascript:(function(){let shares=[],triggerNotification=!1;function clickShareButton(){for(let t=0;t<shares.length;t++)setTimeout(function(){null!=shares[t]&&""!==shares[t]&&($("a.pm-followers-share-link").attr("href","/listing/share?post_id="+shares[t]),$("a.pm-followers-share-link").click())},5e3*t)}$("div.col-x12.col-l6.col-s8 .tile").each(function(){0===$(this).find(".covershot-con i").length&&shares.push($(this).attr("id"))});for(let t=0;t<3e3;t++)setTimeout(function(){clickShareButton()},t*shares.length*5e3);function clickcaptcha(){0!=$("#captcha-popup").length&&$("#captcha-popup").hasClass("in")&&$(".recaptcha-checkbox-checkmark").click(),$(".recaptcha-checkbox-checkmark").click(),document.querySelector(".recaptcha-checkbox-checkmark").click()}function dealWithCaptcha(){if(!triggerNotification){if("granted"!==Notification.permission)Notification.requestPermission();else{new Notification("Captcha Has Appeared!",{icon:"https://d2zlsagv0ouax1.cloudfront.net/assets/v3/logo@2x-6003c7f00d83f4df697830d18bdcf167.png",body:"Go to posh and deal with it",silent:!1,vibrate:!0}).onshow=function(){let t=new Audio("http://soundbible.com/mp3/Bobwhite Quail-SoundBible.com-1782515847.mp3");t.volume=1,t.play()}}triggerNotification=!0,setTimeout(function(){triggerNotification=!1},18e4)}clickcaptcha()}window.onerror=function(t,i,c,e,o){dealWithCaptcha()},$(document).ajaxError(function(t,i,c){dealWithCaptcha()});})();
*/
