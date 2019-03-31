let shares = [];
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
        }, i * 8000);
    }
}

for (let i = 0; i < 1000; i++) {
    setTimeout(function () {
        clickShareButton();
    }, i * shares.length * 8000)
}




