//image enlargement click
$("body").on("click", ".productCarousel img", function () {
    let src = $(this).attr('src').replace(/\/jcr.*/, "");
    $(".productModalImg").attr('src', src);
    $("#product-modal").modal();
});
//get possible finishes per handing
let rhToHide = [];
let lhToHide = [];
for (let i = 1; i < 19; i++) {
    if (productHandings["lhlink" + i].length === 0) {
        lhToHide.push(i);
    }
    if (productHandings["rhlink" + i].length === 0) {
        rhToHide.push(i);
    }
}
//hide handings if no finishes
if (lhToHide.length === 18) {
    $(".leftHandOption").hide().removeClass("selected");
    $(".rightHandOption").addClass("selected");
}
if (rhToHide.length === 18) {
    $(".rightHandOption").hide().removeClass("selected");
}

function hideOrShowFinishesBasedOnHanding() {
    $(".alle-finish-carousel a[data-finish-number]").show();
    if ($(".leftHandOption").hasClass("selected")) {
        for (let i = 0; i < lhToHide.length; i++) {
            $(".alle-finish-carousel a[data-finish-number='choice" + lhToHide[i] + "']").hide();
        }
    } else if ($(".rightHandOption").hasClass("selected")) {
        for (let i = 0; i < rhToHide.length; i++) {
            $(".alle-finish-carousel a[data-finish-number='choice" + rhToHide[i] + "']").hide();
        }
    }
    $(".alle-finish-carousel a:first:visible").find("img").click();
}

function resetCarousel(handingOption) {
    let carouselImgs = $(".productCarousel .carousel-inner");
    let carouselIndicators = $(".productCarousel .alle-core-crsl-indicator");
    let finishnum = handingOption.replace(/.*link/, "");
    carouselImgs.empty();
    carouselIndicators.empty();
    let carouselContent = "";
    let indicatorsContent = "";
    for (let i = 0; i < productHandings[handingOption].length; i++) {
        if (i === 0) {
            carouselContent += "<div class='item item-" + i + " active'><img src='" + productHandings[handingOption][i] + "/jcr:content/renditions/cq5dam.thumbnail.319.319.png' style='width: auto !important;'/></div>";
            indicatorsContent += "<li data-target=\"#homepage-carousel\" data-slide-to=\"" + i + "\" class=\"active\"></li>"
        } else {
            carouselContent += "<div class='item item-" + i + "'><img src='" + productHandings[handingOption][i] + "/jcr:content/renditions/cq5dam.thumbnail.319.319.png' style='width: auto !important;'/></div>";
            indicatorsContent += "<li data-target=\"#homepage-carousel\" data-slide-to=\"" + i + "\" class=\"\"></li>"
        }
    }

    $(".alle-product-sku").text(productHandings["associatedID" + finishnum]);
    carouselImgs.html(carouselContent);
    carouselIndicators.html(indicatorsContent);
}


//hide or show finishes based on available finishes per handing
$(".leftHandOption").click(function () {
    $(this).addClass("selected");
    $(".rightHandOption").removeClass("selected");
    hideOrShowFinishesBasedOnHanding();
});
$(".rightHandOption").click(function () {
    $(this).addClass("selected");
    $(".leftHandOption").removeClass("selected");
    hideOrShowFinishesBasedOnHanding();
});
//change sku and carousel images on finish img click
$(".finishImg").click(function () {
    $(".finishImg").removeClass("selected");
    $(this).addClass("selected");
    let choice = $(this).parent().attr("data-finish-number").replace("choice", "");
    let thisurl = $(this).attr("src").replace(/\/jcr.*/, "");
    $(".squareImg img").attr("src", thisurl + "/jcr:content/renditions/cq5dam.thumbnail.48.48.png");
    if ($(".leftHandOption").hasClass("selected")) {
        resetCarousel("lhlink" + choice);
    } else {
        resetCarousel("rhlink" + choice);
    }

});


function resetToolTipOfMainImg() {
    let mainTitle = $(".replaceImg").attr("title");
    if (mainTitle != undefined || mainTitle != "" || mainTitle != null) {
        $(".replaceImg").attr("title", mainTitle.replace(/.*finishes\//g, "").replace(/.jpg|.jpeg|.png|-/g, " "));
    }
}

$(document).ready(function () {
    $(".finishImg").each(function () {
        let title = $(this).attr("title");
        if (title != undefined || title != "" || title != null) {
            $(this).attr("title", title.replace(/.*finishes\//g, "").replace(/.jpg|.jpeg|.png|-/g, " "));
        }
    });
    resetToolTipOfMainImg();
    $('[data-toggle="tooltip"]').tooltip();
});
