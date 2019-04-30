let shares = [];
$("div.col-x12.col-l6.col-s8 .tile").each(function () {
    let icon = $(this).find(".covershot-con i")
    if (icon.length === 0) {
        shares.push($(this).attr("id"))
    }
});
for (let i = 0; i < shares.length; i++) {
    setTimeout(function () {
        if (shares[i] != null && shares[i] !== "") {
            if($("#captcha-popup").length != 0){
                if($("#captcha-popup").hasClass("in")){
                    $(".recaptcha-checkbox-checkmark").click();
                }
            }
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
