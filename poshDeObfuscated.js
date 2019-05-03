'use strict';

/**
 * @param {!Function} fn
 * @return {undefined}
 */
function domReady(fn) {
    if (document.readyState != "loading") {
        fn();
    } else {
        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            document.attachEvent("onreadystatechange", function () {
                if (document.readyState != "loading") {
                    fn();
                }
            });
        }
    }
}

/**
 * @return {undefined}
 */
function pmInit() {
    try {
        $.ajaxPrefilter(function (lessEx, b, xhr) {
            if (lessEx.type.toLowerCase() === "post") {
                xhr.setRequestHeader("X-CSRF-Token", utils.getCsrfToken()["X-CSRF-Token"]);
            }
        });
    } catch (a) {
    }
    pm.textAreaGrow.init();
    $.each($("[data-scroll-sticky]"), function (a, b) {
        var c = $(b);
        /** @type {number} */
        var topPos = 0;
        if (c.data("offset-auto")) {
            topPos = c.offset().top;
        } else {
            if (c.data("offset")) {
                topPos = c.data("offset");
            } else {
                if (c.data("offset-element")) {
                    topPos = $(c.data("offset-element")).height();
                }
            }
        }
        c.stick_in_parent({
            offset_top: topPos
        });
    });
    $(document).on("hidden.bs.modal", "[data-remove=modal]", function (a) {
        return $(this).remove();
    });
    $.each($("[data-pageless='true']"), function (a, b) {
        var c = $(b);
        var id = $(window);
        if ($(b).data("scroll-element")) {
            id = $($(b).data("scroll-element"));
        }
        c.scrollPagination({
            contentPage: window.href,
            contentData: {
                max_id: c.data("max-id")
            },
            scrollTarget: id,
            heightOffset: 300,
            beforeLoad: function () {
            },
            afterLoad: function (fn, list) {
            }
        });
    });
    if (pm.settings.autoCompleteEnabled) {
        $.each($("[data-search]"), function (a, b) {
            pm.search.autoComplete.init(".search-entry");
        });
    }
    pm.header.initCommonHeader();
    if (utils.isMobileDevice.any()) {
        pm.header.initMobileHeader();
    } else {
        pm.header.initDesktopHeader();
    }
    pm.experiences.initExperiences();
    try {
        if (pm.userInfo.isLoggedIn()) {
            pm.userNotifications.setLastActiveTime();
            if (pm.userNotifications.getNotificationCount() > 0) {
                pm.userNotifications.showNotificationCountInNav();
            } else {
                if (pm.userNotifications.getNotificationCount() == -1) {
                    pm.userNotifications.notificationFetch();
                }
            }
            pm.userNotifications.setTimeOutCall();
            $("body").on("click", function () {
                pm.userNotifications.setLastActiveTime();
                pm.userNotifications.setTimeOutCall();
            });
            $.jStorage.listenKeyChange("li_notification_count", function () {
                pm.userNotifications.showNotificationCountInNav();
            });
        }
    } catch (b) {
    }
    try {
        pm.userNotifications.syncNotificationsStorage();
        if (pm.userNotifications.getNotificationCount() > 0) {
            pm.userNotifications.showNotificationCountInNav();
        }
    } catch (b) {
    }
    if ($("[data-social-action='true']").length > 0) {
        pm.listings.initListingActions();
        pm.comments.initComments();
    }
    if ($("[data-grid-social-action='true']").length > 0) {
        pm.listings.initToggleLikes("grid");
        pm.listings.initShare("main", ".listing-actions-con .share");
        pm.listings.initFollowUnfollow();
        pm.backButtonCache.restore();
    }
    if ($("[data-brand-share='true']").length > 0) {
        sp.brand.brand_share("#brand-share-popup");
    }
    if ($("[data-user-action='true']").length > 0) {
        pm.user.initUserActions();
    }
    pm.brands.initBrandActions();
    $(".install-app").on("click", function (a) {
        if (utils.isMobileDevice.Android()) {
            window.location = pm.routes.androidPlayStorePath();
        } else {
            if (utils.isMobileDevice.iOS()) {
                window.location = pm.routes.iosItunesStorePath();
            }
        }
        return;
    });
    $(".open-app-or-store").on("click", function () {
        var http_url = $(this).data("branch-url");
        if (http_url) {
            window.location = http_url;
            return;
        }
        var tools_url = $(this).data("open-app-url");
        pm.openAppOrStore.handleOpenApp(event, tools_url);
    });
    $(".app-store-entry").on("click", function (event) {
        event.preventDefault();
        if (utils.isBranchTracked()) {
            if (utils.isMobileDevice.Android()) {
                window.location = pm.routes.androidPlayStorePath();
            } else {
                if (utils.isMobileDevice.iOS()) {
                    window.location = pm.routes.iosItunesStorePath();
                }
            }
        } else {
            window.location = $(this).data("url");
        }
    });
    var element = utils.getUrlParams(window.location.href);
    if (element.open_app && element.open_app == "true" && element.app_link) {
        /** @type {string} */
        var path = decodeURIComponent(element.app_link);
        if (utils.isMobileDevice.iOS()) {
            window.location = pm.routes.iosAppPath(path);
        } else {
            if (utils.isMobileDevice.Android()) {
                window.location = pm.routes.openAndroidAppOrStore(path);
            }
        }
    }
    if (element.br_t || element._branch_match_id) {
        utils.setBranchTracked();
    }
    $("footer .sec-header").on("click", function (event) {
        event.currentTarget.lastChild.classList.toggle("plus");
        event.currentTarget.nextSibling.classList.toggle("hide");
    });
    $("#m-open-filter").on("click", function (a) {
        $("#mfilter-overlay").toggleClass("hide");
    });
    if (!pm.userInfo.isLoggedIn()) {
        sp.initFacebookLib();
        sp.initGoogleLib();
        sp.fbGoogleSignUpInit();
        $("body").on("click", ".fb-login", function (i) {
            sp.loginUsingFb("#fb-auth-form", i);
        });
    }
    pm.flashMessage.initialPush();
    if ($("#bnc-pxl").length > 0) {
        utils.setBranchTracked();
    }
    if ($("#pixel-listing-view").length > 0) {
        var item = $("#pixel-listing-view").data("postId");
        var newCartItems = $("#pixel-listing-view").data("postPrice");
        var quantity = $("#pixel-listing-view").data("postCategory");
        var child = $("#pixel-listing-view").data("postBrand");
        var realVal = $("#pixel-listing-view").data("postCurrency");
        var pass = $("#pixel-listing-view").data("postCreatorid");
        allPixel.listingView(item, quantity, child, newCartItems, realVal, pass);
        $("#new-offer-modal [type=submit], #buy_now").click(function () {
            allPixel.addToCart(item, newCartItems, quantity, child, realVal);
        });
    }
    $(".floating-banner .close").on("touchend", function (event) {
        event.preventDefault();
        utils.setCookie("hd-bnr", true, pm.settings.bannerHideTime);
        $(event.target).parent().hide();
    });
    pm.initSignupPop();
    pm.initOfferPop();
    if ($(".bundle-style-card-con").length > 0 || $(".user-bundle").data("bundleV3")) {
        pm.bundleV3.initBundleV3Actions();
        pm.listings.initShare("main", ".social-actions .share");
        pm.comments.initComments();
    } else {
        if ($(".bundle-likes").data("addToBundleV3")) {
            pm.bundleV3.initBundleV3AddToBundle();
        }
    }
    if (pm.pageInfo && (pm.pageInfo.gaPageType === "Review Listings" || pm.pageInfo.gaPageType === "Listing Details")) {
        pm.listing_moderation.initListingModeration();
    }
    if (pm.userInfo.isLoggedIn() && utils.getUrlParams(window.location.href).just_in_closet) {
        pm.highlightListing.initHighlightListingActions();
    }
    $(document).on("show-captcha-popup", function (a, utteranceLine) {
        return document.getElementById("captcha-popup") ? ($("#captcha-form").find("input[name=restricted_action]").val(utteranceLine), $("#captcha-popup").modal("show")) : $.get(pm.routes.captchaModal, {}, function (a, canCreateDiscussions, isSlidingUp) {
            return $(a.html).appendTo("main"), $("#captcha-form").find("input[name=restricted_action]").val(utteranceLine);
        }, "json"), pm.yaq.push({
            eventType: "captcha",
            data: {
                ra: utteranceLine,
                uid: pm.userInfo.userId(),
                ev: "presented",
                app: "web"
            }
        });
    });
    recentItemsObj.initRecentItems();
    $(document).on("remoteAction:error", function (a, data) {
        if (data.responseJSON && data.responseJSON.error && (data.responseJSON.error.error_type === "SuspectedBotError" || data.responseJSON.error.error_type === "SuspectedBotErrorV2")) {
            $(document).trigger("show-captcha-popup", [data.responseJSON.restricted_action]);
        }
    });
    $(".scroll-to-top").click(function (event) {
        event.preventDefault();
        (function resizeHandler() {
            /** @type {number} */
            var duration = document.documentElement.scrollTop || document.body.scrollTop;
            if (duration > 0) {
                window.requestAnimationFrame(resizeHandler);
                window.scrollTo(0, duration - duration / 5);
            }
        })();
    });
    $(window).scroll(function () {
        var a = $(document).scrollTop();
        if (a > 800) {
            $(".scroll-to-top").removeClass("hide");
        } else {
            if (a <= 800) {
                $(".scroll-to-top").addClass("hide");
            }
        }
    });
    if (utils.isMobileDevice.any()) {
        var thread_rows = $("[data-swipe-carousel=true] .carousel-inner");
        /** @type {!Array} */
        var modifies = [];
        thread_rows.each(function (c, summary) {
            modifies[c] = new Hammer(summary);
            modifies[c].on("swipeleft", function (jEvent) {
                $(jEvent.target).closest("[data-swipe-carousel=true]").carousel("next");
            });
            modifies[c].on("swiperight", function (jEvent) {
                $(jEvent.target).closest("[data-swipe-carousel=true]").carousel("prev");
            });
        });
        $("[data-swipe-carousel=true]").on("indicator-updated", function (event) {
            pm.listings.indicatorOffScreen($(event.currentTarget).find(".carousel-indicators"));
        });
    }
    $(document).on("click", ".description-header .arrow-con", function (event) {
        $arrowAction = $(event.currentTarget);
        $arrowAction.find(".arrow").toggleClass("up").toggleClass("down");
        if ($arrowAction.parent().hasClass("popular-item-list")) {
            $arrowAction.prev().children("li").toggleClass("scrolled");
        }
    });
    $(document).on("click", ".description-header .toggle-switch", function (event) {
        $arrowAction = $(event.currentTarget);
        $arrowAction.toggleClass("plus");
        $arrowAction.prev().toggleClass("full");
    });
    $(document).on("click", ".footer-description", function (event) {
        $(event.currentTarget).children(".description").toggleClass("full");
    });
    $(document).on("click", ".download-banner-close", function (a) {
        $(".download-app-text").remove();
    });
    $(document).on("remoteAction", "#new_visitor_phone_number_form", function (a, SMessage) {
        if (SMessage.success) {
            $(".download-app-text-form").remove();
            $(".slide-banner").addClass("opened");
            $(".download-app-text").addClass("closed");
        } else {
            $("#visitor_phone_number_form_phone_number").addClass("error");
        }
    });
    $(window).resize(function (a) {
        utils.stickFooterToBottom();
    });
    utils.stickFooterToBottom();
    if (pm.pageInfo.gaPageType == "Party") {
        pm.party.initParty();
    }
    if ($(["data-mft-required"].length > 0)) {
        pm.twoFactorAuth.initTwoFactorAuth();
    }
    $("body").on("keydown", "#change-phone-number input#phone_number_form_phone_number , .phone-number-field", function (event) {
        $("#visitor_phone_number_form_phone_number").removeClass("error");
        pm.validate.clearFormErrors("new_visitor_phone_number_form");
        var e = event.keyCode || event.which || event.charCode || 0;
        var field = $(this);
        /** @type {number} */
        var len = 3;
        return e != 37 && e != 39 && this.selectionStart < len || this.selectionStart == len && (e == 8 || e == 13) ? false : (e !== 8 && e !== 9 && (field.val().length === 6 && field.val(field.val() + ")"), field.val().length === 7 && field.val(field.val() + " "), field.val().length === 11 && field.val(field.val() + "-")), e == 8 || e == 13 || e == 9 || e == 46 || e >= 48 && e <= 57 || e >= 96 && e <= 105);
    });
    $("body").on("focus click", "#change-phone-number input#phone_number_form_phone_number , .phone-number-field", function () {
        var inputel = $(this);
        if (inputel.val().length === 0 || inputel.val().match(/[xX]/g)) {
            inputel.val("+1(");
        } else {
            var encodedPW = inputel.val();
            inputel.val("").val(encodedPW);
        }
    });
    $("#change-phone-number input#phone_number_form_phone_number, .phone-number-field").blur(function () {
        var inputel = $(this);
        if (inputel.val() === "+1(") {
            inputel.val("");
        }
    });
    $("body").on("click", "[data-dismiss-banner]", function (event) {
        event.preventDefault();
        var detailViewItem = $($(this).attr("target"));
        if (detailViewItem) {
            detailViewItem.addClass("f-hide");
        }
    });
    $("body").on("click", "a[data-js-href]", function (event) {
        event.preventDefault();
        var http_url = event.currentTarget.dataset.jsHref;
        if (http_url) {
            window.location = http_url;
        }
    });
    if (!utils.isBot()) {
        pm.lazyLoad.initLazyLoad();
    }
    if (window.location.href.indexOf("default_smr") > -1) {
        pm.flashMessage.push({
            text: "Style request sent",
            duration: 5e3
        });
        window.history.pushState("feedPage", "Feed", "/feed");
    }
}

Array.prototype.fill || Object.defineProperty(Array.prototype, "fill", {
    value: function (val) {
        if (this == null) {
            throw new TypeError("this is null or not defined");
        }
        /** @type {!Object} */
        var obj = Object(this);
        /** @type {number} */
        var length = obj.length >>> 0;
        var start = arguments[1];
        /** @type {number} */
        var relativeStart = start >> 0;
        /** @type {number} */
        var f = relativeStart < 0 ? Math.max(length + relativeStart, 0) : Math.min(relativeStart, length);
        var end = arguments[2];
        /** @type {number} */
        var index = end === undefined ? length : end >> 0;
        /** @type {number} */
        var end_flight_idx = index < 0 ? Math.max(length + index, 0) : Math.min(index, length);
        for (; f < end_flight_idx;) {
            /** @type {string} */
            obj[f] = val;
            f++;
        }
        return obj;
    }
}), +function ($) {
    /**
     * @return {?}
     */
    function transitionEnd() {
        /** @type {!Element} */
        var el = document.createElement("bootstrap");
        var transEndEventNames = {
            WebkitTransition: "webkitTransitionEnd",
            MozTransition: "transitionend",
            OTransition: "oTransitionEnd otransitionend",
            transition: "transitionend"
        };
        var name;
        for (name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }
        return false;
    }

    "use strict";
    /**
     * @param {number} duration
     * @return {?}
     */
    $.fn.emulateTransitionEnd = function (duration) {
        /** @type {boolean} */
        var c = false;
        var unloadedImgElement = this;
        $(this).one("bsTransitionEnd", function () {
            /** @type {boolean} */
            c = true;
        });
        /**
         * @return {undefined}
         */
        var callback = function () {
            if (!c) {
                $(unloadedImgElement).trigger($.support.transition.end);
            }
        };
        return setTimeout(callback, duration), this;
    };
    $(function () {
        $.support.transition = transitionEnd();
        if (!$.support.transition) {
            return;
        }
        $.event.special.bsTransitionEnd = {
            bindType: $.support.transition.end,
            delegateType: $.support.transition.end,
            handle: function (event) {
                if ($(event.target).is(this)) {
                    return event.handleObj.handler.apply(this, arguments);
                }
            }
        };
    });
}(jQuery), !function ($) {
    /**
     * @param {?} element
     * @param {!Object} options
     * @return {undefined}
     */
    var Carousel = function (element, options) {
        this.$element = $(element);
        this.$indicators = this.$element.find(".carousel-indicators");
        /** @type {!Object} */
        this.options = options;
        if (this.options.pause == "hover") {
            this.$element.on("mouseenter", $.proxy(this.pause, this)).on("mouseleave", $.proxy(this.cycle, this));
        }
    };
    Carousel.prototype = {
        cycle: function (options) {
            return options || (this.paused = false), this.interval && clearInterval(this.interval), this.options.interval && !this.paused && (this.interval = setInterval($.proxy(this.next, this), this.options.interval)), this;
        },
        getActiveIndex: function () {
            return this.$active = this.$element.find(".item.active"), this.$items = this.$active.parent().children(), this.$items.index(this.$active);
        },
        to: function (index) {
            var activeIndex = this.getActiveIndex();
            var d = this;
            if (index > this.$items.length - 1 || index < 0) {
                return;
            }
            return this.sliding ? this.$element.one("slid", function () {
                d.to(index);
            }) : activeIndex == index ? this.pause().cycle() : this.slide(index > activeIndex ? "next" : "prev", $(this.$items[index]));
        },
        pause: function (promisedResponse) {
            return promisedResponse || (this.paused = true), this.$element.find(".next, .prev").length && $.support.transition.end && (this.$element.trigger($.support.transition.end), this.cycle(true)), clearInterval(this.interval), this.interval = null, this;
        },
        next: function () {
            if (this.sliding) {
                return;
            }
            return this.slide("next");
        },
        prev: function () {
            if (this.sliding) {
                return;
            }
            return this.slide("prev");
        },
        slide: function (type, next) {
            var $active = this.$element.find(".item.active");
            var $next = next || $active[type]();
            var isCycling = this.interval;
            /** @type {string} */
            var direction = type == "next" ? "left" : "right";
            /** @type {string} */
            var fallback = type == "next" ? "first" : "last";
            var that = this;
            var e;
            /** @type {boolean} */
            this.sliding = true;
            if (isCycling) {
                this.pause();
            }
            $next = $next.length ? $next : this.$element.find(".item")[fallback]();
            e = $.Event("slide", {
                relatedTarget: $next[0],
                direction: direction
            });
            if ($next.hasClass("active")) {
                return;
            }
            if (this.$indicators.length) {
                this.$indicators.find(".active").removeClass("active");
                this.$element.one("slid", function () {
                    var formsearch = $(that.$indicators.children()[that.getActiveIndex()]);
                    if (formsearch) {
                        formsearch.addClass("active");
                    }
                    $(this).trigger("indicator-updated");
                });
            }
            if ($.support.transition && this.$element.hasClass("slide")) {
                this.$element.trigger(e);
                if (e.isDefaultPrevented()) {
                    return;
                }
                $next.addClass(type);
                $next[0].offsetWidth;
                $active.addClass(direction);
                $next.addClass(direction);
                this.$element.one($.support.transition.end, function () {
                    $next.removeClass([type, direction].join(" ")).addClass("active");
                    $active.removeClass(["active", direction].join(" "));
                    /** @type {boolean} */
                    that.sliding = false;
                    setTimeout(function () {
                        that.$element.trigger("slid");
                    }, 0);
                });
            } else {
                this.$element.trigger(e);
                if (e.isDefaultPrevented()) {
                    return;
                }
                $active.removeClass("active");
                $next.addClass("active");
                /** @type {boolean} */
                this.sliding = false;
                this.$element.trigger("slid");
            }
            return isCycling && this.cycle(), this;
        }
    };
    var old = $.fn.carousel;
    /**
     * @param {string} options
     * @return {?}
     */
    $.fn.carousel = function (options) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data("carousel");
            var opts = $.extend({}, $.fn.carousel.defaults, typeof options == "object" && options);
            var id = typeof options == "string" ? options : opts.slide;
            if (!data) {
                $this.data("carousel", data = new Carousel(this, opts));
            }
            if (typeof options == "number") {
                data.to(options);
            } else {
                if (id) {
                    data[id]();
                } else {
                    if (opts.interval) {
                        data.pause().cycle();
                    }
                }
            }
        });
    };
    $.fn.carousel.defaults = {
        interval: 5e3,
        pause: "hover"
    };
    /** @type {function(?, !Object): undefined} */
    $.fn.carousel.Constructor = Carousel;
    /**
     * @return {?}
     */
    $.fn.carousel.noConflict = function () {
        return $.fn.carousel = old, this;
    };
    $(document).on("click.carousel.data-api", "[data-slide], [data-slide-to]", function (event) {
        var $this = $(this);
        var href;
        var $target = $($this.attr("data-target") || (href = $this.attr("href")) && href.replace(/.*(?=#[^\s]+$)/, ""));
        var options = $.extend({}, $target.data(), $this.data());
        var slideIndex;
        $target.carousel(options);
        if (slideIndex = $this.attr("data-slide-to")) {
            $target.data("carousel").pause().to(slideIndex).cycle();
        }
        event.preventDefault();
    });
}(window.jQuery);
if (typeof $ == "undefined") {
    throw new Error("Bootstrap's JavaScript requires jQuery");
}
+function (jQuery) {
    var b = jQuery.fn.jquery.split(" ")[0].split(".");
    if (b[0] < 2 && b[1] < 9 || b[0] == 1 && b[1] == 9 && b[2] < 1 || b[0] > 3) {
        throw new Error("Bootstrap's JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4");
    }
}($), function (window, factory) {
    "use strict";
    if (typeof module != "undefined" && module.exports) {
        module.exports = factory(require("jquery"));
    } else {
        if (typeof define == "function" && define.amd) {
            define(["jquery"], function (jQuery) {
                return factory(jQuery);
            });
        } else {
            factory(window.jQuery);
        }
    }
}(this, function ($) {
    /**
     * @param {?} element
     * @param {?} options
     * @return {undefined}
     */
    var Typeahead = function (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Typeahead.defaults, options);
        this.matcher = this.options.matcher || this.matcher;
        this.sorter = this.options.sorter || this.sorter;
        this.select = this.options.select || this.select;
        /** @type {boolean} */
        this.autoSelect = typeof this.options.autoSelect == "boolean" ? this.options.autoSelect : true;
        this.highlighter = this.options.highlighter || this.highlighter;
        this.render = this.options.render || this.render;
        this.updater = this.options.updater || this.updater;
        this.displayText = this.options.displayText || this.displayText;
        this.source = this.options.source;
        this.delay = this.options.delay;
        this.$menu = $(this.options.menu);
        this.$appendTo = this.options.appendTo ? $(this.options.appendTo) : null;
        /** @type {boolean} */
        this.fitToElement = typeof this.options.fitToElement == "boolean" ? this.options.fitToElement : false;
        /** @type {boolean} */
        this.shown = false;
        this.listen();
        this.showHintOnFocus = typeof this.options.showHintOnFocus == "boolean" || this.options.showHintOnFocus === "all" ? this.options.showHintOnFocus : false;
        this.afterSelect = this.options.afterSelect;
        /** @type {boolean} */
        this.addItem = false;
        this.value = this.$element.val() || this.$element.text();
    };
    Typeahead.prototype = {
        constructor: Typeahead,
        select: function () {
            var val = this.$menu.find(".active").data("value");
            this.$element.data("active", val);
            if (this.autoSelect || val) {
                var newVal = this.updater(val);
                if (!newVal) {
                    /** @type {string} */
                    newVal = "";
                }
                this.$element.val(this.displayText(newVal) || newVal).text(this.displayText(newVal) || newVal).change();
                this.afterSelect(newVal);
            }
            return this.hide();
        },
        updater: function (value) {
            return value;
        },
        setSource: function (source) {
            /** @type {!File} */
            this.source = source;
        },
        show: function () {
            var pos = $.extend({}, this.$element.position(), {
                height: this.$element[0].offsetHeight
            });
            var scrollHeight = typeof this.options.scrollHeight == "function" ? this.options.scrollHeight.call() : this.options.scrollHeight;
            var element;
            if (this.shown) {
                element = this.$menu;
            } else {
                if (this.$appendTo) {
                    element = this.$menu.appendTo(this.$appendTo);
                    this.hasSameParent = this.$appendTo.is(this.$element.parent());
                } else {
                    element = this.$menu.insertAfter(this.$element);
                    /** @type {boolean} */
                    this.hasSameParent = true;
                }
            }
            if (!this.hasSameParent) {
                element.css("position", "fixed");
                var rect = this.$element.offset();
                pos.top = rect.top;
                pos.left = rect.left;
            }
            var dropup = $(element).parent().hasClass("dropup");
            var newTop = dropup ? "auto" : pos.top + pos.height + scrollHeight;
            var right = $(element).hasClass("dropdown-menu-right");
            var newLeft = right ? "auto" : pos.left;
            return element.css({
                top: newTop,
                left: newLeft
            }).show(), this.options.fitToElement === true && element.css("width", this.$element.outerWidth() + "px"), this.shown = true, this;
        },
        hide: function () {
            return this.$menu.hide(), this.shown = false, this;
        },
        lookup: function (query) {
            var c;
            if (typeof query != "undefined" && query !== null) {
                /** @type {string} */
                this.query = query;
            } else {
                this.query = this.$element.val() || this.$element.text() || "";
            }
            if (this.query.length < this.options.minLength && !this.options.showHintOnFocus) {
                return this.shown ? this.hide() : this;
            }
            var worker = $.proxy(function () {
                if ($.isFunction(this.source)) {
                    this.source(this.query, $.proxy(this.process, this));
                } else {
                    if (this.source) {
                        this.process(this.source);
                    }
                }
            }, this);
            clearTimeout(this.lookupWorker);
            /** @type {number} */
            this.lookupWorker = setTimeout(worker, this.delay);
        },
        process: function (items) {
            var obj = this;
            return items = $.grep(items, function (item) {
                return obj.matcher(item);
            }), items = this.sorter(items), !items.length && !this.options.addItem ? this.shown ? this.hide() : this : (items.length > 0 ? this.$element.data("active", items[0]) : this.$element.data("active", null), this.options.addItem && items.push(this.options.addItem), this.options.items == "all" ? this.render(items).show() : this.render(items.slice(0, this.options.items)).show());
        },
        matcher: function (item) {
            var it = this.displayText(item);
            return ~it.toLowerCase().indexOf(this.query.toLowerCase());
        },
        sorter: function (items) {
            /** @type {!Array} */
            var b = [];
            /** @type {!Array} */
            var c = [];
            /** @type {!Array} */
            var d = [];
            var item;
            for (; item = items.shift();) {
                var it = this.displayText(item);
                if (it.toLowerCase().indexOf(this.query.toLowerCase())) {
                    if (~it.indexOf(this.query)) {
                        c.push(item);
                    } else {
                        d.push(item);
                    }
                } else {
                    b.push(item);
                }
            }
            return b.concat(c, d);
        },
        highlighter: function (item) {
            var el = $("<div></div>");
            var query = this.query;
            var i = item.toLowerCase().indexOf(query.toLowerCase());
            var len = query.length;
            var code;
            var data;
            var _btnExport;
            var rgbdata;
            if (len === 0) {
                return el.text(item).html();
            }
            for (; i > -1;) {
                code = item.substr(0, i);
                data = item.substr(i, len);
                _btnExport = item.substr(i + len);
                rgbdata = $("<strong></strong>").text(data);
                el.append(document.createTextNode(code)).append(rgbdata);
                item = _btnExport;
                i = item.toLowerCase().indexOf(query.toLowerCase());
            }
            return el.append(document.createTextNode(item)).html();
        },
        render: function (items) {
            var that = this;
            var self = this;
            /** @type {boolean} */
            var activeFound = false;
            /** @type {!Array} */
            var data = [];
            var i = that.options.separator;
            return $.each(items, function (index, nodes) {
                if (index > 0 && nodes[i] !== items[index - 1][i]) {
                    data.push({
                        __type: "divider"
                    });
                }
                if (nodes[i] && (index === 0 || nodes[i] !== items[index - 1][i])) {
                    data.push({
                        __type: "category",
                        name: nodes[i]
                    });
                }
                data.push(nodes);
            }), items = $(data).map(function (element, item) {
                if ((item.__type || false) == "category") {
                    return $(that.options.headerHtml).text(item.name)[0];
                }
                if ((item.__type || false) == "divider") {
                    return $(that.options.headerDivider)[0];
                }
                var text = self.displayText(item);
                return element = $(that.options.item).data("value", item), element.find("a").html(that.highlighter(text, item)), text == self.$element.val() && (element.addClass("active"), self.$element.data("active", item), activeFound = true), element[0];
            }), this.autoSelect && !activeFound && (items.filter(":not(.dropdown-header)").first().addClass("active"), this.$element.data("active", items.first().data("value"))), this.$menu.html(items), this;
        },
        displayText: function (value) {
            return typeof value != "undefined" && typeof value.name != "undefined" ? value.name : value;
        },
        next: function (elem) {
            var active = this.$menu.find(".active").removeClass("active");
            var currentPageLink = active.next();
            if (!currentPageLink.length) {
                currentPageLink = $(this.$menu.find("li")[0]);
            }
            currentPageLink.addClass("active");
        },
        prev: function (selector) {
            var $tab = this.$menu.find(".active").removeClass("active");
            var currentPageLink = $tab.prev();
            if (!currentPageLink.length) {
                currentPageLink = this.$menu.find("li").last();
            }
            currentPageLink.addClass("active");
        },
        listen: function () {
            this.$element.on("focus", $.proxy(this.focus, this)).on("blur", $.proxy(this.blur, this)).on("keypress", $.proxy(this.keypress, this)).on("input", $.proxy(this.input, this)).on("keyup", $.proxy(this.keyup, this));
            if (this.eventSupported("keydown")) {
                this.$element.on("keydown", $.proxy(this.keydown, this));
            }
            this.$menu.on("click", $.proxy(this.click, this)).on("mouseenter", "li", $.proxy(this.mouseenter, this)).on("mouseleave", "li", $.proxy(this.mouseleave, this)).on("mousedown", $.proxy(this.mousedown, this));
        },
        destroy: function () {
            this.$element.data("typeahead", null);
            this.$element.data("active", null);
            this.$element.off("focus").off("blur").off("keypress").off("input").off("keyup");
            if (this.eventSupported("keydown")) {
                this.$element.off("keydown");
            }
            this.$menu.remove();
            /** @type {boolean} */
            this.destroyed = true;
        },
        eventSupported: function (eventName) {
            /** @type {boolean} */
            var isSupported = eventName in this.$element;
            return isSupported || (this.$element.setAttribute(eventName, "return;"), isSupported = typeof this.$element[eventName] == "function"), isSupported;
        },
        move: function (event) {
            if (!this.shown) {
                return;
            }
            switch (event.keyCode) {
                case 9:
                case 13:
                case 27:
                    event.preventDefault();
                    break;
                case 38:
                    if (event.shiftKey) {
                        return;
                    }
                    event.preventDefault();
                    this.prev();
                    break;
                case 40:
                    if (event.shiftKey) {
                        return;
                    }
                    event.preventDefault();
                    this.next();
            }
        },
        keydown: function (e) {
            /** @type {number} */
            this.suppressKeyPressRepeat = ~$.inArray(e.keyCode, [40, 38, 9, 13, 27]);
            if (!this.shown && e.keyCode == 40) {
                this.lookup();
            } else {
                this.move(e);
            }
        },
        keypress: function (e) {
            if (this.suppressKeyPressRepeat) {
                return;
            }
            this.move(e);
        },
        input: function (a100124540047022_name) {
            var value = this.$element.val() || this.$element.text();
            if (this.value !== value) {
                this.value = value;
                this.lookup();
            }
        },
        keyup: function (event) {
            if (this.destroyed) {
                return;
            }
            switch (event.keyCode) {
                case 40:
                case 38:
                case 16:
                case 17:
                case 18:
                    break;
                case 9:
                case 13:
                    if (!this.shown) {
                        return;
                    }
                    this.select();
                    break;
                case 27:
                    if (!this.shown) {
                        return;
                    }
                    this.hide();
            }
        },
        focus: function (needsMoreTime) {
            if (!this.focused) {
                /** @type {boolean} */
                this.focused = true;
                if (this.options.showHintOnFocus && this.skipShowHintOnFocus !== true) {
                    if (this.options.showHintOnFocus === "all") {
                        this.lookup("");
                    } else {
                        this.lookup();
                    }
                }
            }
            if (this.skipShowHintOnFocus) {
                /** @type {boolean} */
                this.skipShowHintOnFocus = false;
            }
        },
        blur: function (__size2) {
            if (!this.mousedover && !this.mouseddown && this.shown) {
                this.hide();
                /** @type {boolean} */
                this.focused = false;
            } else {
                if (this.mouseddown) {
                    /** @type {boolean} */
                    this.skipShowHintOnFocus = true;
                    this.$element.focus();
                    /** @type {boolean} */
                    this.mouseddown = false;
                }
            }
        },
        click: function (key) {
            key.preventDefault();
            /** @type {boolean} */
            this.skipShowHintOnFocus = true;
            this.select();
            this.$element.focus();
            this.hide();
        },
        mouseenter: function (event) {
            /** @type {boolean} */
            this.mousedover = true;
            this.$menu.find(".active").removeClass("active");
            $(event.currentTarget).addClass("active");
        },
        mouseleave: function (event) {
            /** @type {boolean} */
            this.mousedover = false;
            if (!this.focused && this.shown) {
                this.hide();
            }
        },
        mousedown: function (elem) {
            /** @type {boolean} */
            this.mouseddown = true;
            this.$menu.one("mouseup", function (a) {
                /** @type {boolean} */
                this.mouseddown = false;
            }.bind(this));
        }
    };
    var old = $.fn.typeahead;
    /**
     * @param {string} option
     * @return {?}
     */
    $.fn.typeahead = function (option) {
        /** @type {!Arguments} */
        var _arguments = arguments;
        return typeof option == "string" && option == "getActive" ? this.data("active") : this.each(function () {
            var $this = $(this);
            var data = $this.data("typeahead");
            var options = typeof option == "object" && option;
            if (!data) {
                $this.data("typeahead", data = new Typeahead(this, options));
            }
            if (typeof option == "string" && data[option]) {
                if (_arguments.length > 1) {
                    data[option].apply(data, Array.prototype.slice.call(_arguments, 1));
                } else {
                    data[option]();
                }
            }
        });
    };
    Typeahead.defaults = {
        source: [],
        items: 8,
        menu: '<ul class="typeahead dropdown-menu" role="listbox"></ul>',
        item: '<li><a class="dropdown-item" href="#" role="option"></a></li>',
        minLength: 1,
        scrollHeight: 0,
        autoSelect: true,
        afterSelect: $.noop,
        addItem: false,
        delay: 0,
        separator: "category",
        headerHtml: '<li class="dropdown-header"></li>',
        headerDivider: '<li class="divider" role="separator"></li>'
    };
    /** @type {function(?, ?): undefined} */
    $.fn.typeahead.Constructor = Typeahead;
    /**
     * @return {?}
     */
    $.fn.typeahead.noConflict = function () {
        return $.fn.typeahead = old, this;
    };
    $(document).on("focus.typeahead.data-api", '[data-provide="typeahead"]', function (b) {
        var $input = $(this);
        if ($input.data("typeahead")) {
            return;
        }
        $input.typeahead($input.data());
    });
}), +function ($) {
    /**
     * @param {!Object} $this
     * @return {?}
     */
    function getParent($this) {
        var selector = $this.attr("data-target");
        if (!selector) {
            selector = $this.attr("href");
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, "");
        }
        var $parent = selector && $(selector);
        return $parent && $parent.length ? $parent : $this.parent();
    }

    /**
     * @param {!Object} e
     * @return {undefined}
     */
    function clearMenus(e) {
        if (e && e.which === 3) {
            return;
        }
        $(liToRemove).remove();
        $(c).each(function () {
            var $this = $(this);
            var $parent = getParent($this);
            var relatedTarget = {
                relatedTarget: this
            };
            if (!$parent.hasClass("open")) {
                return;
            }
            if (e && e.type == "click" && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) {
                return;
            }
            $parent.trigger(e = $.Event("hide.bs.dropdown", relatedTarget));
            if (e.isDefaultPrevented()) {
                return;
            }
            $this.attr("aria-expanded", "false");
            $parent.removeClass("open").trigger($.Event("hidden.bs.dropdown", relatedTarget));
        });
    }

    /**
     * @param {string} option
     * @return {?}
     */
    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data("bs.dropdown");
            if (!data) {
                $this.data("bs.dropdown", data = new Dropdown(this));
            }
            if (typeof option == "string") {
                data[option].call($this);
            }
        });
    }

    "use strict";
    /** @type {string} */
    var liToRemove = ".dropdown-backdrop";
    /** @type {string} */
    var c = '[data-toggle="dropdown"]';
    /**
     * @param {?} el
     * @return {undefined}
     */
    var Dropdown = function (el) {
        $(el).on("click.bs.dropdown", this.toggle);
    };
    /** @type {string} */
    Dropdown.VERSION = "3.3.7";
    /**
     * @param {!Object} e
     * @return {?}
     */
    Dropdown.prototype.toggle = function (e) {
        var $this = $(this);
        if ($this.is(".disabled, :disabled")) {
            return;
        }
        var $parent = getParent($this);
        var isActive = $parent.hasClass("open");
        clearMenus();
        if (!isActive) {
            if ("ontouchstart" in document.documentElement && !$parent.closest(".navbar-nav").length) {
                $(document.createElement("div")).addClass("dropdown-backdrop").insertAfter($(this)).on("click", clearMenus);
            }
            var relatedTarget = {
                relatedTarget: this
            };
            $parent.trigger(e = $.Event("show.bs.dropdown", relatedTarget));
            if (e.isDefaultPrevented()) {
                return;
            }
            $this.trigger("focus").attr("aria-expanded", "true");
            $parent.toggleClass("open").trigger($.Event("shown.bs.dropdown", relatedTarget));
        }
        return false;
    };
    /**
     * @param {!Event} e
     * @return {?}
     */
    Dropdown.prototype.keydown = function (e) {
        if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) {
            return;
        }
        var $this = $(this);
        e.preventDefault();
        e.stopPropagation();
        if ($this.is(".disabled, :disabled")) {
            return;
        }
        var $parent = getParent($this);
        var isActive = $parent.hasClass("open");
        if (!isActive && e.which != 27 || isActive && e.which == 27) {
            return e.which == 27 && $parent.find(c).trigger("focus"), $this.trigger("click");
        }
        /** @type {string} */
        var desc = " li:not(.disabled):visible a";
        var i = $parent.find(".dropdown-menu" + desc);
        if (!i.length) {
            return;
        }
        var j = i.index(e.target);
        if (e.which == 38 && j > 0) {
            j--;
        }
        if (e.which == 40 && j < i.length - 1) {
            j++;
        }
        if (!~j) {
            /** @type {number} */
            j = 0;
        }
        i.eq(j).trigger("focus");
    };
    var old = $.fn.dropdown;
    /** @type {function(string): ?} */
    $.fn.dropdown = Plugin;
    /** @type {function(?): undefined} */
    $.fn.dropdown.Constructor = Dropdown;
    /**
     * @return {?}
     */
    $.fn.dropdown.noConflict = function () {
        return $.fn.dropdown = old, this;
    };
    $(document).on("click.bs.dropdown.data-api", clearMenus).on("click.bs.dropdown.data-api", ".dropdown form", function (event) {
        event.stopPropagation();
    }).on("click.bs.dropdown.data-api", c, Dropdown.prototype.toggle).on("keydown.bs.dropdown.data-api", c, Dropdown.prototype.keydown).on("keydown.bs.dropdown.data-api", ".dropdown-menu", Dropdown.prototype.keydown);
}($), +function ($) {
    /**
     * @param {string} option
     * @param {!Object} _relatedTarget
     * @return {?}
     */
    function Plugin(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data("bs.modal");
            var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == "object" && option);
            if (!data) {
                $this.data("bs.modal", data = new Modal(this, options));
            }
            if (typeof option == "string") {
                data[option](_relatedTarget);
            } else {
                if (options.show) {
                    data.show(_relatedTarget);
                }
            }
        });
    }

    "use strict";
    /**
     * @param {?} element
     * @param {!Object} options
     * @return {undefined}
     */
    var Modal = function (element, options) {
        /** @type {!Object} */
        this.options = options;
        this.$body = $(document.body);
        this.$element = $(element);
        this.$dialog = this.$element.find(".modal-dialog");
        /** @type {null} */
        this.$backdrop = null;
        /** @type {null} */
        this.isShown = null;
        /** @type {null} */
        this.originalBodyPad = null;
        /** @type {number} */
        this.scrollbarWidth = 0;
        /** @type {boolean} */
        this.ignoreBackdropClick = false;
        if (this.options.remote) {
            this.$element.find(".modal-content").load(this.options.remote, $.proxy(function () {
                this.$element.trigger("loaded.bs.modal");
            }, this));
        }
    };
    /** @type {string} */
    Modal.VERSION = "3.3.7";
    /** @type {number} */
    Modal.TRANSITION_DURATION = 300;
    /** @type {number} */
    Modal.BACKDROP_TRANSITION_DURATION = 150;
    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    };
    /**
     * @param {string} _relatedTarget
     * @return {?}
     */
    Modal.prototype.toggle = function (_relatedTarget) {
        return this.isShown ? this.hide() : this.show(_relatedTarget);
    };
    /**
     * @param {!Object} _relatedTarget
     * @return {undefined}
     */
    Modal.prototype.show = function (_relatedTarget) {
        var that = this;
        var dragStartEvent = $.Event("show.bs.modal", {
            relatedTarget: _relatedTarget
        });
        this.$element.trigger(dragStartEvent);
        if (this.isShown || dragStartEvent.isDefaultPrevented()) {
            return;
        }
        /** @type {boolean} */
        this.isShown = true;
        this.checkScrollbar();
        this.setScrollbar();
        this.$body.addClass("modal-open");
        this.escape();
        this.resize();
        this.$element.on("click.dismiss.bs.modal", '[data-dismiss="modal"]', $.proxy(this.hide, this));
        this.$dialog.on("mousedown.dismiss.bs.modal", function () {
            that.$element.one("mouseup.dismiss.bs.modal", function (jEvent) {
                if ($(jEvent.target).is(that.$element)) {
                    /** @type {boolean} */
                    that.ignoreBackdropClick = true;
                }
            });
        });
        this.backdrop(function () {
            var e = $.support.transition && that.$element.hasClass("fade");
            if (!that.$element.parent().length) {
                that.$element.appendTo(that.$body);
            }
            that.$element.show().scrollTop(0);
            that.adjustDialog();
            if (e) {
                that.$element[0].offsetWidth;
            }
            that.$element.addClass("in");
            that.enforceFocus();
            var aerisTopic = $.Event("shown.bs.modal", {
                relatedTarget: _relatedTarget
            });
            if (e) {
                that.$dialog.one("bsTransitionEnd", function () {
                    that.$element.trigger("focus").trigger(aerisTopic);
                }).emulateTransitionEnd(Modal.TRANSITION_DURATION);
            } else {
                that.$element.trigger("focus").trigger(aerisTopic);
            }
        });
    };
    /**
     * @param {!Object} e
     * @return {undefined}
     */
    Modal.prototype.hide = function (e) {
        if (e) {
            e.preventDefault();
        }
        e = $.Event("hide.bs.modal");
        this.$element.trigger(e);
        if (!this.isShown || e.isDefaultPrevented()) {
            return;
        }
        /** @type {boolean} */
        this.isShown = false;
        this.escape();
        this.resize();
        $(document).off("focusin.bs.modal");
        this.$element.removeClass("in").off("click.dismiss.bs.modal").off("mouseup.dismiss.bs.modal");
        this.$dialog.off("mousedown.dismiss.bs.modal");
        if ($.support.transition && this.$element.hasClass("fade")) {
            this.$element.one("bsTransitionEnd", $.proxy(this.hideModal, this)).emulateTransitionEnd(Modal.TRANSITION_DURATION);
        } else {
            this.hideModal();
        }
    };
    /**
     * @return {undefined}
     */
    Modal.prototype.enforceFocus = function () {
        $(document).off("focusin.bs.modal").on("focusin.bs.modal", $.proxy(function (e) {
            if (document !== e.target && this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                this.$element.trigger("focus");
            }
        }, this));
    };
    /**
     * @return {undefined}
     */
    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on("keydown.dismiss.bs.modal", $.proxy(function (event) {
                if (event.which == 27) {
                    this.hide();
                }
            }, this));
        } else {
            if (!this.isShown) {
                this.$element.off("keydown.dismiss.bs.modal");
            }
        }
    };
    /**
     * @return {undefined}
     */
    Modal.prototype.resize = function () {
        if (this.isShown) {
            $(window).on("resize.bs.modal", $.proxy(this.handleUpdate, this));
        } else {
            $(window).off("resize.bs.modal");
        }
    };
    /**
     * @return {undefined}
     */
    Modal.prototype.hideModal = function () {
        var that = this;
        this.$element.hide();
        this.backdrop(function () {
            that.$body.removeClass("modal-open");
            that.resetAdjustments();
            that.resetScrollbar();
            that.$element.trigger("hidden.bs.modal");
        });
    };
    /**
     * @return {undefined}
     */
    Modal.prototype.removeBackdrop = function () {
        if (this.$backdrop) {
            this.$backdrop.remove();
        }
        /** @type {null} */
        this.$backdrop = null;
    };
    /**
     * @param {!Function} callback
     * @return {undefined}
     */
    Modal.prototype.backdrop = function (callback) {
        var that = this;
        /** @type {string} */
        var animate = this.$element.hasClass("fade") ? "fade" : "";
        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;
            this.$backdrop = $(document.createElement("div")).addClass("modal-backdrop " + animate).appendTo(this.$body);
            if (this.$element.hasClass("top-modal")) {
                this.$backdrop.addClass("top-backdrop");
            }
            this.$element.on("click.dismiss.bs.modal", $.proxy(function (event) {
                if (this.ignoreBackdropClick) {
                    /** @type {boolean} */
                    this.ignoreBackdropClick = false;
                    return;
                }
                if (event.target !== event.currentTarget) {
                    return;
                }
                if (this.options.backdrop == "static") {
                    this.$element[0].focus();
                } else {
                    this.hide();
                }
            }, this));
            if (doAnimate) {
                this.$backdrop[0].offsetWidth;
            }
            this.$backdrop.addClass("in");
            if (!callback) {
                return;
            }
            if (doAnimate) {
                this.$backdrop.one("bsTransitionEnd", callback).emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION);
            } else {
                callback();
            }
        } else {
            if (!this.isShown && this.$backdrop) {
                this.$backdrop.removeClass("in");
                /**
                 * @return {undefined}
                 */
                var callbackRemove = function () {
                    that.removeBackdrop();
                    if (callback) {
                        callback();
                    }
                };
                if ($.support.transition && this.$element.hasClass("fade")) {
                    this.$backdrop.one("bsTransitionEnd", callbackRemove).emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION);
                } else {
                    callbackRemove();
                }
            } else {
                if (callback) {
                    callback();
                }
            }
        }
    };
    /**
     * @return {undefined}
     */
    Modal.prototype.handleUpdate = function () {
        this.adjustDialog();
    };
    /**
     * @return {undefined}
     */
    Modal.prototype.adjustDialog = function () {
        /** @type {boolean} */
        var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight;
        this.$element.css({
            paddingLeft: !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : "",
            paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ""
        });
    };
    /**
     * @return {undefined}
     */
    Modal.prototype.resetAdjustments = function () {
        this.$element.css({
            paddingLeft: "",
            paddingRight: ""
        });
    };
    /**
     * @return {undefined}
     */
    Modal.prototype.checkScrollbar = function () {
        /** @type {number} */
        var fullWindowWidth = window.innerWidth;
        if (!fullWindowWidth) {
            /** @type {!ClientRect} */
            var documentElementRect = document.documentElement.getBoundingClientRect();
            /** @type {number} */
            fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
        }
        /** @type {boolean} */
        this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth;
        this.scrollbarWidth = this.measureScrollbar();
    };
    /**
     * @return {undefined}
     */
    Modal.prototype.setScrollbar = function () {
        /** @type {number} */
        var bodyPad = parseInt(this.$body.css("padding-right") || 0, 10);
        /** @type {(number|string)} */
        this.originalBodyPad = document.body.style.paddingRight || "";
        if (this.bodyIsOverflowing) {
            this.$body.css("padding-right", bodyPad + this.scrollbarWidth);
        }
    };
    /**
     * @return {undefined}
     */
    Modal.prototype.resetScrollbar = function () {
        this.$body.css("padding-right", this.originalBodyPad);
    };
    /**
     * @return {?}
     */
    Modal.prototype.measureScrollbar = function () {
        /** @type {!Element} */
        var scrollDiv = document.createElement("div");
        /** @type {string} */
        scrollDiv.className = "modal-scrollbar-measure";
        this.$body.append(scrollDiv);
        /** @type {number} */
        var b = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        return this.$body[0].removeChild(scrollDiv), b;
    };
    var old = $.fn.modal;
    /** @type {function(string, !Object): ?} */
    $.fn.modal = Plugin;
    /** @type {function(?, !Object): undefined} */
    $.fn.modal.Constructor = Modal;
    /**
     * @return {?}
     */
    $.fn.modal.noConflict = function () {
        return $.fn.modal = old, this;
    };
    $(document).on("click.bs.modal.data-api", '[data-toggle="modal"]', function (event) {
        var $this = $(this);
        var href = $this.attr("href");
        var $target = $($this.attr("data-target") || href && href.replace(/.*(?=#[^\s]+$)/, ""));
        var option = $target.data("bs.modal") ? "toggle" : $.extend({
            remote: !/#/.test(href) && href
        }, $target.data(), $this.data());
        if ($this.is("a")) {
            event.preventDefault();
        }
        $target.one("show.bs.modal", function (event) {
            if (event.isDefaultPrevented()) {
                return;
            }
            $target.one("hidden.bs.modal", function () {
                if ($this.css("visibility", "visible")) {
                    $this.trigger("focus");
                }
            });
        });
        Plugin.call($target, option, this);
    });
}($), function () {
    /**
     * @return {undefined}
     */
    function _init() {
        /** @type {boolean} */
        var a = false;
        if ("localStorage" in window) {
            try {
                window.localStorage.setItem("_tmptest", "tmpval");
                /** @type {boolean} */
                a = true;
                window.localStorage.removeItem("_tmptest");
            } catch (b) {
            }
        }
        if (a) {
            try {
                if (window.localStorage) {
                    /** @type {!Storage} */
                    _storage_service = window.localStorage;
                    /** @type {string} */
                    _backend = "localStorage";
                    _observer_update = _storage_service.jStorage_update;
                }
            } catch (c) {
            }
        } else {
            if ("globalStorage" in window) {
                try {
                    if (window.globalStorage) {
                        _storage_service = window.globalStorage[window.location.hostname];
                        /** @type {string} */
                        _backend = "globalStorage";
                        _observer_update = _storage_service.jStorage_update;
                    }
                } catch (d) {
                }
            } else {
                /** @type {!Element} */
                _storage_elm = document.createElement("link");
                if (!_storage_elm.addBehavior) {
                    /** @type {null} */
                    _storage_elm = null;
                    return;
                }
                /** @type {string} */
                _storage_elm.style.behavior = "url(#default#userData)";
                document.getElementsByTagName("head")[0].appendChild(_storage_elm);
                try {
                    _storage_elm.load("jStorage");
                } catch (g) {
                    _storage_elm.setAttribute("jStorage", "{}");
                    _storage_elm.save("jStorage");
                    _storage_elm.load("jStorage");
                }
                /** @type {string} */
                var data = "{}";
                try {
                    /** @type {string} */
                    data = _storage_elm.getAttribute("jStorage");
                } catch (j) {
                }
                try {
                    /** @type {string} */
                    _observer_update = _storage_elm.getAttribute("jStorage_update");
                } catch (l) {
                }
                /** @type {string} */
                _storage_service.jStorage = data;
                /** @type {string} */
                _backend = "userDataBehavior";
            }
        }
        _load_storage();
        _handleTTL();
        _createPolyfillStorage("local");
        _createPolyfillStorage("session");
        _setupObserver();
        _handlePubSub();
        if ("addEventListener" in window) {
            window.addEventListener("pageshow", function (state) {
                if (state.persisted) {
                    _storageObserver();
                }
            }, false);
        }
    }

    /**
     * @param {string} type
     * @param {boolean} forceCreate
     * @return {undefined}
     */
    function _createPolyfillStorage(type, forceCreate) {
        /**
         * @return {undefined}
         */
        function _sessionStoragePolyfillUpdate() {
            if (type != "session") {
                return;
            }
            try {
                storage_source = JSON.parse(window.name || "{}");
            } catch (b) {
                storage_source = {};
            }
        }

        /**
         * @return {undefined}
         */
        function _sessionStoragePolyfillSave() {
            if (type != "session") {
                return;
            }
            window.name = JSON.stringify(storage_source);
        }

        /** @type {boolean} */
        var _skipSave = false;
        /** @type {number} */
        var _length = 0;
        var i;
        var storage;
        var storage_source = {};
        /** @type {number} */
        var l = Math.random();
        if (!forceCreate && typeof window[type + "Storage"] != "undefined") {
            return;
        }
        if (type == "local" && window.globalStorage) {
            localStorage = window.globalStorage[window.location.hostname];
            return;
        }
        if (_backend != "userDataBehavior") {
            return;
        }
        if (forceCreate && window[type + "Storage"] && window[type + "Storage"].parentNode) {
            window[type + "Storage"].parentNode.removeChild(window[type + "Storage"]);
        }
        /** @type {!Element} */
        storage = document.createElement("button");
        document.getElementsByTagName("head")[0].appendChild(storage);
        if (type == "local") {
            storage_source = _storage;
        } else {
            if (type == "session") {
                _sessionStoragePolyfillUpdate();
            }
        }
        for (i in storage_source) {
            if (storage_source.hasOwnProperty(i) && i != "__jstorage_meta" && i != "length" && typeof storage_source[i] != "undefined") {
                if (!(i in storage)) {
                    _length++;
                }
                storage[i] = storage_source[i];
            }
        }
        storage.length = _length;
        /**
         * @param {(!Function|number)} type
         * @return {?}
         */
        storage.key = function (type) {
            /** @type {number} */
            var lc_raw_intent = 0;
            var i;
            _sessionStoragePolyfillUpdate();
            for (i in storage_source) {
                if (storage_source.hasOwnProperty(i) && i != "__jstorage_meta" && i != "length" && typeof storage_source[i] != "undefined") {
                    if (lc_raw_intent == type) {
                        return i;
                    }
                    lc_raw_intent++;
                }
            }
        };
        /**
         * @param {string} key
         * @return {?}
         */
        storage.getItem = function (key) {
            return _sessionStoragePolyfillUpdate(), type == "session" ? storage_source[key] : $.jStorage.get(key);
        };
        /**
         * @param {string} key
         * @param {string} value
         * @return {undefined}
         */
        storage.setItem = function (key, value) {
            if (typeof value == "undefined") {
                return;
            }
            storage[key] = (value || "").toString();
        };
        /**
         * @param {string} key
         * @return {?}
         */
        storage.removeItem = function (key) {
            if (type == "local") {
                return $.jStorage.deleteKey(key);
            }
            storage[key] = undefined;
            /** @type {boolean} */
            _skipSave = true;
            if (key in storage) {
                storage.removeAttribute(key);
            }
            /** @type {boolean} */
            _skipSave = false;
        };
        /**
         * @return {undefined}
         */
        storage.clear = function () {
            if (type == "session") {
                /** @type {string} */
                window.name = "";
                _createPolyfillStorage("session", true);
                return;
            }
            $.jStorage.flush();
        };
        if (type == "local") {
            /**
             * @param {string} key
             * @param {string} value
             * @return {undefined}
             */
            _localStoragePolyfillSetKey = function (key, value) {
                if (key == "length") {
                    return;
                }
                /** @type {boolean} */
                _skipSave = true;
                if (typeof value == "undefined") {
                    if (key in storage) {
                        _length--;
                        storage.removeAttribute(key);
                    }
                } else {
                    if (!(key in storage)) {
                        _length++;
                    }
                    storage[key] = (value || "").toString();
                }
                storage.length = _length;
                /** @type {boolean} */
                _skipSave = false;
            };
        }
        storage.attachEvent("onpropertychange", function (e) {
            if (e.propertyName == "length") {
                return;
            }
            if (_skipSave || e.propertyName == "length") {
                return;
            }
            if (type == "local") {
                if (!(e.propertyName in storage_source) && typeof storage[e.propertyName] != "undefined") {
                    _length++;
                }
            } else {
                if (type == "session") {
                    _sessionStoragePolyfillUpdate();
                    if (typeof storage[e.propertyName] == "undefined" || e.propertyName in storage_source) {
                        if (typeof storage[e.propertyName] == "undefined" && e.propertyName in storage_source) {
                            delete storage_source[e.propertyName];
                            _length--;
                        } else {
                            storage_source[e.propertyName] = storage[e.propertyName];
                        }
                    } else {
                        storage_source[e.propertyName] = storage[e.propertyName];
                        _length++;
                    }
                    _sessionStoragePolyfillSave();
                    storage.length = _length;
                    return;
                }
            }
            $.jStorage.set(e.propertyName, storage[e.propertyName]);
            storage.length = _length;
        });
        /** @type {!Element} */
        window[type + "Storage"] = storage;
    }

    /**
     * @return {undefined}
     */
    function _reloadData() {
        /** @type {string} */
        var data = "{}";
        if (_backend == "userDataBehavior") {
            _storage_elm.load("jStorage");
            try {
                data = _storage_elm.getAttribute("jStorage");
            } catch (b) {
            }
            try {
                _observer_update = _storage_elm.getAttribute("jStorage_update");
            } catch (c) {
            }
            _storage_service.jStorage = data;
        }
        _load_storage();
        _handleTTL();
        _handlePubSub();
    }

    /**
     * @return {undefined}
     */
    function _setupObserver() {
        if (_backend == "localStorage" || _backend == "globalStorage") {
            if ("addEventListener" in window) {
                window.addEventListener("storage", _storageObserver, false);
            } else {
                document.attachEvent("onstorage", _storageObserver);
            }
        } else {
            if (_backend == "userDataBehavior") {
                setInterval(_storageObserver, 1e3);
            }
        }
    }

    /**
     * @return {undefined}
     */
    function _storageObserver() {
        var updateTime;
        clearTimeout(_takingTooLongTimeout);
        /** @type {number} */
        _takingTooLongTimeout = setTimeout(function () {
            if (_backend == "localStorage" || _backend == "globalStorage") {
                updateTime = _storage_service.jStorage_update;
            } else {
                if (_backend == "userDataBehavior") {
                    _storage_elm.load("jStorage");
                    try {
                        updateTime = _storage_elm.getAttribute("jStorage_update");
                    } catch (b) {
                    }
                }
            }
            if (updateTime && updateTime != _observer_update) {
                _observer_update = updateTime;
                _checkUpdatedKeys();
            }
        }, 25);
    }

    /**
     * @return {undefined}
     */
    function _checkUpdatedKeys() {
        var obj2 = JSON.parse(JSON.stringify(_storage.__jstorage_meta.CRC32));
        var obj1;
        _reloadData();
        obj1 = JSON.parse(JSON.stringify(_storage.__jstorage_meta.CRC32));
        var i;
        /** @type {!Array} */
        var deleted = [];
        /** @type {!Array} */
        var removed = [];
        for (i in obj2) {
            if (obj2.hasOwnProperty(i)) {
                if (!obj1[i]) {
                    removed.push(i);
                    continue;
                }
                if (obj2[i] != obj1[i]) {
                    deleted.push(i);
                }
            }
        }
        for (i in obj1) {
            if (obj1.hasOwnProperty(i)) {
                if (!obj2[i]) {
                    deleted.push(i);
                }
            }
        }
        _fireObservers(deleted, "updated");
        _fireObservers(removed, "deleted");
    }

    /**
     * @param {!Object} keys
     * @param {string} action
     * @return {undefined}
     */
    function _fireObservers(keys, action) {
        /** @type {!Array<?>} */
        keys = [].concat(keys || []);
        if (action == "flushed") {
            /** @type {!Array} */
            keys = [];
            var i;
            for (i in arr) {
                if (arr.hasOwnProperty(i)) {
                    keys.push(i);
                }
            }
            /** @type {string} */
            action = "deleted";
        }
        /** @type {number} */
        var k = 0;
        /** @type {number} */
        var klength = keys.length;
        for (; k < klength; k++) {
            if (arr[keys[k]]) {
                /** @type {number} */
                var j = 0;
                var imagesLen = arr[keys[k]].length;
                for (; j < imagesLen; j++) {
                    arr[keys[k]][j](keys[k], action);
                }
            }
        }
    }

    /**
     * @return {undefined}
     */
    function _publishChange() {
        /** @type {string} */
        var updateTime = (+new Date).toString();
        if (_backend == "localStorage" || _backend == "globalStorage") {
            /** @type {string} */
            _storage_service.jStorage_update = updateTime;
        } else {
            if (_backend == "userDataBehavior") {
                _storage_elm.setAttribute("jStorage_update", updateTime);
                _storage_elm.save("jStorage");
            }
        }
        _storageObserver();
    }

    /**
     * @return {undefined}
     */
    function _load_storage() {
        if (_storage_service.jStorage) {
            try {
                _storage = JSON.parse(String(_storage_service.jStorage));
            } catch (a) {
                /** @type {string} */
                _storage_service.jStorage = "{}";
            }
        } else {
            /** @type {string} */
            _storage_service.jStorage = "{}";
        }
        /** @type {number} */
        _storage_size = _storage_service.jStorage ? String(_storage_service.jStorage).length : 0;
        if (!_storage.__jstorage_meta) {
            _storage.__jstorage_meta = {};
        }
        if (!_storage.__jstorage_meta.CRC32) {
            _storage.__jstorage_meta.CRC32 = {};
        }
    }

    /**
     * @return {undefined}
     */
    function _save() {
        _dropOldEvents();
        try {
            _storage_service.jStorage = JSON.stringify(_storage);
            if (_storage_elm) {
                _storage_elm.setAttribute("jStorage", _storage_service.jStorage);
                _storage_elm.save("jStorage");
            }
            /** @type {number} */
            _storage_size = _storage_service.jStorage ? String(_storage_service.jStorage).length : 0;
        } catch (a) {
        }
    }

    /**
     * @param {string} key
     * @return {?}
     */
    function _checkKey(key) {
        if (!key || typeof key != "string" && typeof key != "number") {
            throw new TypeError("Key name must be string or numeric");
        }
        if (key == "__jstorage_meta") {
            throw new TypeError("Reserved key name");
        }
        return true;
    }

    /**
     * @return {undefined}
     */
    function _handleTTL() {
        var curtime;
        var i;
        var TTL;
        var CRC32;
        /** @type {number} */
        var nextExpire = Infinity;
        /** @type {boolean} */
        var g = false;
        /** @type {!Array} */
        var deleted = [];
        clearTimeout(_ttl_timeout);
        if (!_storage.__jstorage_meta || typeof _storage.__jstorage_meta.TTL != "object") {
            return;
        }
        /** @type {number} */
        curtime = +new Date;
        TTL = _storage.__jstorage_meta.TTL;
        CRC32 = _storage.__jstorage_meta.CRC32;
        for (i in TTL) {
            if (TTL.hasOwnProperty(i)) {
                if (TTL[i] <= curtime) {
                    delete TTL[i];
                    delete CRC32[i];
                    delete _storage[i];
                    /** @type {boolean} */
                    g = true;
                    deleted.push(i);
                } else {
                    if (TTL[i] < nextExpire) {
                        nextExpire = TTL[i];
                    }
                }
            }
        }
        if (nextExpire != Infinity) {
            /** @type {number} */
            _ttl_timeout = setTimeout(_handleTTL, nextExpire - curtime);
        }
        if (g) {
            _save();
            _publishChange();
            _fireObservers(deleted, "deleted");
        }
    }

    /**
     * @return {undefined}
     */
    function _handlePubSub() {
        if (!_storage.__jstorage_meta.PubSub) {
            return;
        }
        var pubelm;
        var _pubsubCurrent = _pubsub_last;
        /** @type {number} */
        var i = len = _storage.__jstorage_meta.PubSub.length - 1;
        for (; i >= 0; i--) {
            pubelm = _storage.__jstorage_meta.PubSub[i];
            if (pubelm[0] > _pubsub_last) {
                _pubsubCurrent = pubelm[0];
                _fireSubscribers(pubelm[1], pubelm[2]);
            }
        }
        _pubsub_last = _pubsubCurrent;
    }

    /**
     * @param {?} channel
     * @param {!Object} payload
     * @return {undefined}
     */
    function _fireSubscribers(channel, payload) {
        if (_pubsub_observers[channel]) {
            /** @type {number} */
            var i = 0;
            var patchLen = _pubsub_observers[channel].length;
            for (; i < patchLen; i++) {
                _pubsub_observers[channel][i](channel, JSON.parse(JSON.stringify(payload)));
            }
        }
    }

    /**
     * @return {undefined}
     */
    function _dropOldEvents() {
        if (!_storage.__jstorage_meta.PubSub) {
            return;
        }
        /** @type {number} */
        var a = +new Date - 2e3;
        /** @type {number} */
        var i = 0;
        var patchLen = _storage.__jstorage_meta.PubSub.length;
        for (; i < patchLen; i++) {
            if (_storage.__jstorage_meta.PubSub[i][0] <= a) {
                _storage.__jstorage_meta.PubSub.splice(i, _storage.__jstorage_meta.PubSub.length - i);
                break;
            }
        }
        if (!_storage.__jstorage_meta.PubSub.length) {
            delete _storage.__jstorage_meta.PubSub;
        }
    }

    /**
     * @param {string} name
     * @param {?} data
     * @return {undefined}
     */
    function _publish(name, data) {
        if (!_storage.__jstorage_meta) {
            _storage.__jstorage_meta = {};
        }
        if (!_storage.__jstorage_meta.PubSub) {
            /** @type {!Array} */
            _storage.__jstorage_meta.PubSub = [];
        }
        _storage.__jstorage_meta.PubSub.unshift([+new Date, name, data]);
        _save();
        _publishChange();
    }

    /**
     * @param {string} str
     * @param {number} crc
     * @return {?}
     */
    function _crc32(str, crc) {
        crc = crc || 0;
        /** @type {number} */
        var j = 0;
        /** @type {number} */
        var x = 0;
        /** @type {number} */
        crc = crc ^ -1;
        /** @type {number} */
        var i = 0;
        var l = str.length;
        for (; i < l; i++) {
            /** @type {number} */
            j = (crc ^ str.charCodeAt(i)) & 255;
            /** @type {string} */
            x = "0x" + code.substr(j * 9, 8);
            /** @type {number} */
            crc = crc >>> 8 ^ x;
        }
        return crc ^ -1;
    }

    /** @type {string} */
    var ELECTRON_VERSION = "0.3.0";
    var $ = window.jQuery || window.$ || (window.$ = {});
    var JSON = {
        parse: window.JSON && (window.JSON.parse || window.JSON.decode) || String.prototype.evalJSON && function (str) {
            return String(str).evalJSON();
        } || $.parseJSON || $.evalJSON,
        stringify: Object.toJSON || window.JSON && (window.JSON.stringify || window.JSON.encode) || $.toJSON
    };
    if (!JSON.parse || !JSON.stringify) {
        throw new Error("No JSON support found, include //cdnjs.cloudflare.com/ajax/libs/json2/20110223/json2.js to page");
    }
    var _storage = {};
    var _storage_service = {
        jStorage: "{}"
    };
    /** @type {null} */
    var _storage_elm = null;
    /** @type {number} */
    var _storage_size = 0;
    /** @type {boolean} */
    var _backend = false;
    var arr = {};
    /** @type {boolean} */
    var _takingTooLongTimeout = false;
    /** @type {number} */
    var _observer_update = 0;
    var _pubsub_observers = {};
    /** @type {number} */
    var _pubsub_last = +new Date;
    var _ttl_timeout;
    /** @type {string} */
    var code = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
    var _XMLService = {
        isXML: function (elm) {
            var documentElement = (elm ? elm.ownerDocument || elm : 0).documentElement;
            return documentElement ? documentElement.nodeName !== "HTML" : false;
        },
        encode: function (data) {
            if (!this.isXML(data)) {
                return false;
            }
            try {
                return (new XMLSerializer).serializeToString(data);
            } catch (b) {
                try {
                    return data.xml;
                } catch (c) {
                }
            }
            return false;
        },
        decode: function (str) {
            var dom_parser = "DOMParser" in window && (new DOMParser).parseFromString || window.ActiveXObject && function (string) {
                var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                return xmlDoc.async = "false", xmlDoc.loadXML(string), xmlDoc;
            };
            var resultXML;
            return dom_parser ? (resultXML = dom_parser.call("DOMParser" in window && new DOMParser || window, str, "text/xml"), this.isXML(resultXML) ? resultXML : false) : false;
        }
    };
    /**
     * @return {undefined}
     */
    var _localStoragePolyfillSetKey = function () {
    };
    $.jStorage = {
        version: ELECTRON_VERSION,
        set: function (key, value, options) {
            _checkKey(key);
            options = options || {};
            if (typeof value == "undefined") {
                return this.deleteKey(key), value;
            }
            if (_XMLService.isXML(value)) {
                value = {
                    _is_xml: true,
                    xml: _XMLService.encode(value)
                };
            } else {
                if (typeof value == "function") {
                    return undefined;
                }
                if (value && typeof value == "object") {
                    value = JSON.parse(JSON.stringify(value));
                }
            }
            return _storage[key] = value, _storage.__jstorage_meta.CRC32[key] = _crc32(JSON.stringify(value)), this.setTTL(key, options.TTL || 0), _localStoragePolyfillSetKey(key, value), _fireObservers(key, "updated"), value;
        },
        get: function (key, b) {
            return _checkKey(key), key in _storage ? _storage[key] && typeof _storage[key] == "object" && _storage[key]._is_xml && _storage[key]._is_xml ? _XMLService.decode(_storage[key].xml) : _storage[key] : typeof b == "undefined" ? null : b;
        },
        deleteKey: function (key) {
            return _checkKey(key), key in _storage ? (delete _storage[key], typeof _storage.__jstorage_meta.TTL == "object" && key in _storage.__jstorage_meta.TTL && delete _storage.__jstorage_meta.TTL[key], delete _storage.__jstorage_meta.CRC32[key], _localStoragePolyfillSetKey(key, undefined), _save(), _publishChange(), _fireObservers(key, "deleted"), true) : false;
        },
        setTTL: function (key, ttl) {
            /** @type {number} */
            var curtime = +new Date;
            return _checkKey(key), ttl = Number(ttl) || 0, key in _storage ? (_storage.__jstorage_meta.TTL || (_storage.__jstorage_meta.TTL = {}), ttl > 0 ? _storage.__jstorage_meta.TTL[key] = curtime + ttl : delete _storage.__jstorage_meta.TTL[key], _save(), _handleTTL(), _publishChange(), true) : false;
        },
        getTTL: function (key) {
            /** @type {number} */
            var offset = +new Date;
            var copyptr;
            return _checkKey(key), key in _storage && _storage.__jstorage_meta.TTL && _storage.__jstorage_meta.TTL[key] ? (copyptr = _storage.__jstorage_meta.TTL[key] - offset, copyptr || 0) : 0;
        },
        flush: function () {
            return _storage = {
                __jstorage_meta: {
                    CRC32: {}
                }
            }, _createPolyfillStorage("local", true), _save(), _publishChange(), _fireObservers(null, "flushed"), true;
        },
        storageObj: function () {
            /**
             * @return {undefined}
             */
            function F() {
            }

            return F.prototype = _storage, new F;
        },
        index: function () {
            /** @type {!Array} */
            var keyIndex = [];
            var i;
            for (i in _storage) {
                if (_storage.hasOwnProperty(i) && i != "__jstorage_meta") {
                    keyIndex.push(i);
                }
            }
            return keyIndex;
        },
        storageSize: function () {
            return _storage_size;
        },
        currentBackend: function () {
            return _backend;
        },
        storageAvailable: function () {
            return !!_backend;
        },
        listenKeyChange: function (key, callback) {
            _checkKey(key);
            if (!arr[key]) {
                /** @type {!Array} */
                arr[key] = [];
            }
            arr[key].push(callback);
        },
        stopListening: function (key, object) {
            _checkKey(key);
            if (!arr[key]) {
                return;
            }
            if (!object) {
                delete arr[key];
                return;
            }
            /** @type {number} */
            var i = arr[key].length - 1;
            for (; i >= 0; i--) {
                if (arr[key][i] == object) {
                    arr[key].splice(i, 1);
                }
            }
        },
        subscribe: function (channel, cb) {
            channel = (channel || "").toString();
            if (!channel) {
                throw new TypeError("Channel not defined");
            }
            if (!_pubsub_observers[channel]) {
                /** @type {!Array} */
                _pubsub_observers[channel] = [];
            }
            _pubsub_observers[channel].push(cb);
        },
        publish: function (message, payload) {
            message = (message || "").toString();
            if (!message) {
                throw new TypeError("Channel not defined");
            }
            _publish(message, payload);
        },
        reInit: function () {
            _reloadData();
        }
    };
    _init();
}(), function (factory) {
    if (typeof define == "function" && define.amd) {
        define(["jquery"], factory);
    } else {
        if (typeof module == "object" && module.exports) {
            module.exports = factory(require("jquery"));
        } else {
            factory(jQuery);
        }
    }
}(function ($) {
    $.extend($.fn, {
        validate: function (options) {
            if (!this.length) {
                if (options && options.debug && window.console) {
                    console.warn("Nothing selected, can't validate, returning nothing.");
                }
                return;
            }
            var validator = $.data(this[0], "validator");
            return validator ? validator : (this.attr("novalidate", "novalidate"), validator = new $.validator(options, this[0]), $.data(this[0], "validator", validator), validator.settings.onsubmit && (this.on("click.validate", "submit", function (event) {
                if (validator.settings.submitHandler) {
                    validator.submitButton = event.target;
                }
                if ($(this).hasClass("cancel")) {
                    /** @type {boolean} */
                    validator.cancelSubmit = true;
                }
                if ($(this).attr("formnovalidate") !== undefined) {
                    /** @type {boolean} */
                    validator.cancelSubmit = true;
                }
            }), this.on("submit.validate", function (event) {
                /**
                 * @return {?}
                 */
                function handle() {
                    var exMap;
                    var result;
                    return validator.settings.submitHandler ? (validator.submitButton && (exMap = $("<input type='hidden'/>").attr("name", validator.submitButton.name).val($(validator.submitButton).val()).appendTo(validator.currentForm)), result = validator.settings.submitHandler.call(validator, validator.currentForm, event), validator.submitButton && exMap.remove(), result !== undefined ? result : false) : true;
                }

                return validator.settings.debug && event.preventDefault(), validator.cancelSubmit ? (validator.cancelSubmit = false, handle()) : validator.form() ? validator.pendingRequest ? (validator.formSubmitted = true, false) : handle() : (validator.focusInvalid(), false);
            })), validator);
        },
        valid: function () {
            var b;
            var validator;
            var errorList;
            return $(this[0]).is("form") ? b = this.validate().form() : (errorList = [], b = true, validator = $(this[0].form).validate(), this.each(function () {
                b = validator.element(this) && b;
                if (!b) {
                    errorList = errorList.concat(validator.errorList);
                }
            }), validator.errorList = errorList), b;
        },
        rules: function (command, argument) {
            var element = this[0];
            var settings;
            var staticRules;
            var message;
            var data;
            var param;
            var info;
            if (element == null || element.form == null) {
                return;
            }
            if (command) {
                settings = $.data(element.form, "validator").settings;
                staticRules = settings.rules;
                message = $.validator.staticRules(element);
                switch (command) {
                    case "add":
                        $.extend(message, $.validator.normalizeRule(argument));
                        delete message.messages;
                        staticRules[element.name] = message;
                        if (argument.messages) {
                            settings.messages[element.name] = $.extend(settings.messages[element.name], argument.messages);
                        }
                        break;
                    case "remove":
                        if (!argument) {
                            return delete staticRules[element.name], message;
                        }
                        return info = {}, $.each(argument.split(/\s/), function (b, i) {
                            info[i] = message[i];
                            delete message[i];
                            if (i === "required") {
                                $(element).removeAttr("aria-required");
                            }
                        }), info;
                }
            }
            return data = $.validator.normalizeRules($.extend({}, $.validator.classRules(element), $.validator.attributeRules(element), $.validator.dataRules(element), $.validator.staticRules(element)), element), data.required && (param = data.required, delete data.required, data = $.extend({
                required: param
            }, data), $(element).attr("aria-required", "true")), data.remote && (param = data.remote, delete data.remote, data = $.extend(data, {
                remote: param
            })), data;
        }
    });
    $.extend($.expr[":"], {
        blank: function (a) {
            return !$.trim("" + $(a).val());
        },
        filled: function (a) {
            var x = $(a).val();
            return x !== null && !!$.trim("" + x);
        },
        unchecked: function (a) {
            return !$(a).prop("checked");
        }
    });
    /**
     * @param {?} options
     * @param {string} form
     * @return {undefined}
     */
    $.validator = function (options, form) {
        this.settings = $.extend(true, {}, $.validator.defaults, options);
        /** @type {string} */
        this.currentForm = form;
        this.init();
    };
    /**
     * @param {string} s
     * @param {string} v
     * @return {?}
     */
    $.validator.format = function (s, v) {
        return arguments.length === 1 ? function () {
            var b = $.makeArray(arguments);
            return b.unshift(s), $.validator.format.apply(this, b);
        } : v === undefined ? s : (arguments.length > 2 && v.constructor !== Array && (v = $.makeArray(arguments).slice(1)), v.constructor !== Array && (v = [v]), $.each(v, function (a, canCreateDiscussions) {
            s = s.replace(new RegExp("\\{" + a + "\\}", "g"), function () {
                return canCreateDiscussions;
            });
        }), s);
    };
    $.extend($.validator, {
        defaults: {
            messages: {},
            groups: {},
            rules: {},
            errorClass: "error",
            pendingClass: "pending",
            validClass: "valid",
            errorElement: "label",
            focusCleanup: false,
            focusInvalid: true,
            errorContainer: $([]),
            errorLabelContainer: $([]),
            onsubmit: true,
            ignore: "hidden",
            ignoreTitle: false,
            onfocusin: function (element) {
                /** @type {string} */
                this.lastActive = element;
                if (this.settings.focusCleanup) {
                    if (this.settings.unhighlight) {
                        this.settings.unhighlight.call(this, element, this.settings.errorClass, this.settings.validClass);
                    }
                    this.hideThese(this.errorsFor(element));
                }
            },
            onfocusout: function (element) {
                if (!this.checkable(element) && (element.name in this.submitted || !this.optional(element))) {
                    this.element(element);
                }
            },
            onkeyup: function (element, event) {
                /** @type {!Array} */
                var compareTerms = [16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225];
                if (event.which === 9 && this.elementValue(element) === "" || $.inArray(event.keyCode, compareTerms) !== -1) {
                    return;
                }
                if (element.name in this.submitted || element.name in this.invalid) {
                    this.element(element);
                }
            },
            onclick: function (element) {
                if (element.name in this.submitted) {
                    this.element(element);
                } else {
                    if (element.parentNode.name in this.submitted) {
                        this.element(element.parentNode);
                    }
                }
            },
            highlight: function (element, n, d) {
                if (element.type === "radio") {
                    this.findByName(element.name).addClass(n).removeClass(d);
                } else {
                    $(element).addClass(n).removeClass(d);
                }
            },
            unhighlight: function (element, errorClass, validClass) {
                if (element.type === "radio") {
                    this.findByName(element.name).removeClass(errorClass).addClass(validClass);
                } else {
                    $(element).removeClass(errorClass).addClass(validClass);
                }
            }
        },
        setDefaults: function (settings) {
            $.extend($.validator.defaults, settings);
        },
        messages: {
            required: "This field is required.",
            remote: "Please fix this field.",
            email: "Please enter a valid email address.",
            url: "Please enter a valid URL.",
            date: "Please enter a valid date.",
            dateISO: "Please enter a valid date (ISO).",
            number: "Please enter a valid number.",
            digits: "Please enter only digits.",
            creditcard: "Please enter a valid credit card number.",
            equalTo: "Please enter the same value again.",
            maxlength: $.validator.format("Please enter no more than {0} characters."),
            minlength: $.validator.format("Please enter at least {0} characters."),
            rangelength: $.validator.format("Please enter a value between {0} and {1} characters long."),
            range: $.validator.format("Please enter a value between {0} and {1}."),
            max: $.validator.format("Please enter a value less than or equal to {0}."),
            min: $.validator.format("Please enter a value greater than or equal to {0}."),
            step: $.validator.format("Please enter a multiple of {0}.")
        },
        autoCreateRanges: false,
        prototype: {
            init: function () {
                /**
                 * @param {!Object} event
                 * @return {undefined}
                 */
                function delegate(event) {
                    if (!this.form && this.hasAttribute("contenteditable")) {
                        this.form = $(this).closest("form")[0];
                    }
                    var validator = $.data(this.form, "validator");
                    var eventType = "on" + event.type.replace(/^validate/, "");
                    var settings = validator.settings;
                    if (settings[eventType] && !$(this).is(settings.ignore)) {
                        settings[eventType].call(validator, this, event);
                    }
                }

                this.labelContainer = $(this.settings.errorLabelContainer);
                this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
                this.containers = $(this.settings.errorContainer).add(this.settings.errorLabelContainer);
                this.submitted = {};
                this.valueCache = {};
                /** @type {number} */
                this.pendingRequest = 0;
                this.pending = {};
                this.invalid = {};
                this.reset();
                var groups = this.groups = {};
                var rules;
                $.each(this.settings.groups, function ($this, d) {
                    if (typeof d == "string") {
                        /** @type {!Array<string>} */
                        d = d.split(/\s/);
                    }
                    $.each(d, function (a, i) {
                        groups[i] = $this;
                    });
                });
                rules = this.settings.rules;
                $.each(rules, function (name, value) {
                    rules[name] = $.validator.normalizeRule(value);
                });
                $(this.currentForm).on("focusin.validate focusout.validate keyup.validate", "[type='text'], [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], [type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], [type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], [type='radio'], [type='checkbox'], [contenteditable]", delegate).on("click.validate", "select, option, [type='radio'], [type='checkbox']",
                    delegate);
                if (this.settings.invalidHandler) {
                    $(this.currentForm).on("invalid-form.validate", this.settings.invalidHandler);
                }
                $(this.currentForm).find("[required], [data-rule-required], .required").attr("aria-required", "true");
            },
            form: function () {
                return this.checkForm(), $.extend(this.submitted, this.errorMap), this.invalid = $.extend({}, this.errorMap), this.valid() || $(this.currentForm).triggerHandler("invalid-form", [this]), this.showErrors(), this.valid();
            },
            checkForm: function () {
                this.prepareForm();
                /** @type {number} */
                var i = 0;
                var elements = this.currentElements = this.elements();
                for (; elements[i]; i++) {
                    this.check(elements[i]);
                }
                return this.valid();
            },
            element: function (element) {
                var cleanElement = this.clean(element);
                var checkElement = this.validationTargetFor(cleanElement);
                var v = this;
                /** @type {boolean} */
                var result = true;
                var rs;
                var group;
                return checkElement === undefined ? delete this.invalid[cleanElement.name] : (this.prepareElement(checkElement), this.currentElements = $(checkElement), group = this.groups[checkElement.name], group && $.each(this.groups, function (name, testgroup) {
                    if (testgroup === group && name !== checkElement.name) {
                        cleanElement = v.validationTargetFor(v.clean(v.findByName(name)));
                        if (cleanElement && cleanElement.name in v.invalid) {
                            v.currentElements.push(cleanElement);
                            result = v.check(cleanElement) && result;
                        }
                    }
                }), rs = this.check(checkElement) !== false, result = result && rs, rs ? this.invalid[checkElement.name] = false : this.invalid[checkElement.name] = true, this.numberOfInvalids() || (this.toHide = this.toHide.add(this.containers)), this.showErrors(), $(element).attr("aria-invalid", !rs)), result;
            },
            showErrors: function (errors) {
                if (errors) {
                    var windowsStorage = this;
                    $.extend(this.errorMap, errors);
                    this.errorList = $.map(this.errorMap, function (notMessage, target) {
                        return {
                            message: notMessage,
                            element: windowsStorage.findByName(target)[0]
                        };
                    });
                    this.successList = $.grep(this.successList, function (element) {
                        return !(element.name in errors);
                    });
                }
                if (this.settings.showErrors) {
                    this.settings.showErrors.call(this, this.errorMap, this.errorList);
                } else {
                    this.defaultShowErrors();
                }
            },
            resetForm: function () {
                if ($.fn.resetForm) {
                    $(this.currentForm).resetForm();
                }
                this.invalid = {};
                this.submitted = {};
                this.prepareForm();
                this.hideErrors();
                var elements = this.elements().removeData("previousValue").removeAttr("aria-invalid");
                this.resetElements(elements);
            },
            resetElements: function (elements) {
                var i;
                if (this.settings.unhighlight) {
                    /** @type {number} */
                    i = 0;
                    for (; elements[i]; i++) {
                        this.settings.unhighlight.call(this, elements[i], this.settings.errorClass, "");
                        this.findByName(elements[i].name).removeClass(this.settings.validClass);
                    }
                } else {
                    elements.removeClass(this.settings.errorClass).removeClass(this.settings.validClass);
                }
            },
            numberOfInvalids: function () {
                return this.objectLength(this.invalid);
            },
            objectLength: function (o) {
                /** @type {number} */
                var count = 0;
                var sProp;
                for (sProp in o) {
                    if (o[sProp]) {
                        count++;
                    }
                }
                return count;
            },
            hideErrors: function () {
                this.hideThese(this.toHide);
            },
            hideThese: function (errors) {
                errors.not(this.containers).text("");
                this.addWrapper(errors).hide();
            },
            valid: function () {
                return this.size() === 0;
            },
            size: function () {
                return this.errorList.length;
            },
            focusInvalid: function () {
                if (this.settings.focusInvalid) {
                    try {
                        $(this.findLastActive() || this.errorList.length && this.errorList[0].element || []).filter(":visible").focus().trigger("focusin");
                    } catch (b) {
                    }
                }
            },
            findLastActive: function () {
                var lastActive = this.lastActive;
                return lastActive && $.grep(this.errorList, function (a) {
                    return a.element.name === lastActive.name;
                }).length === 1 && lastActive;
            },
            elements: function () {
                var validator = this;
                var activeEngines = {};
                return $(this.currentForm).find("input, select, textarea, [contenteditable]").not("submit, reset, image, [disabled]").not(this.settings.ignore).filter(function () {
                    var name = this.name || $(this).attr("name");
                    return !name && validator.settings.debug && window.console && console.error("%o has no name assigned", this), this.hasAttribute("contenteditable") && (this.form = $(this).closest("form")[0]), name in activeEngines || !validator.objectLength($(this).rules()) ? false : (activeEngines[name] = true, true);
                });
            },
            clean: function (context) {
                return $(context)[0];
            },
            errors: function () {
                var conid = this.settings.errorClass.split(" ").join(".");
                return $(this.settings.errorElement + "." + conid, this.errorContext);
            },
            resetInternals: function () {
                /** @type {!Array} */
                this.successList = [];
                /** @type {!Array} */
                this.errorList = [];
                this.errorMap = {};
                this.toShow = $([]);
                this.toHide = $([]);
            },
            reset: function () {
                this.resetInternals();
                this.currentElements = $([]);
            },
            prepareForm: function () {
                this.reset();
                this.toHide = this.errors().add(this.containers);
            },
            prepareElement: function (element) {
                this.reset();
                this.toHide = this.errorsFor(element);
            },
            elementValue: function (element) {
                var c = $(element);
                var type = element.type;
                var value;
                var position;
                return type === "radio" || type === "checkbox" ? this.findByName(element.name).filter(":checked").val() : type === "number" && typeof element.validity != "undefined" ? element.validity.badInput ? "NaN" : c.val() : (element.hasAttribute("contenteditable") ? value = c.text() : value = c.val(), type === "file" ? value.substr(0, 12) === "C:\\fakepath\\" ? value.substr(12) : (position = value.lastIndexOf("/"), position >= 0 ? value.substr(position + 1) : (position = value.lastIndexOf("\\"), position >=
                0 ? value.substr(position + 1) : value)) : typeof value == "string" ? value.replace(/\r/g, "") : value);
            },
            check: function (element) {
                element = this.validationTargetFor(this.clean(element));
                var rules = $(element).rules();
                var rulesCount = $.map(rules, function (a, i) {
                    return i;
                }).length;
                /** @type {boolean} */
                var e = false;
                var val = this.elementValue(element);
                var result;
                var method;
                var rule;
                if (typeof rules.normalizer == "function") {
                    val = rules.normalizer.call(element, val);
                    if (typeof val != "string") {
                        throw new TypeError("The normalizer should return a string value.");
                    }
                    delete rules.normalizer;
                }
                for (method in rules) {
                    rule = {
                        method: method,
                        parameters: rules[method]
                    };
                    try {
                        result = $.validator.methods[method].call(this, val, element, rule.parameters);
                        if (result === "dependency-mismatch" && rulesCount === 1) {
                            /** @type {boolean} */
                            e = true;
                            continue;
                        }
                        /** @type {boolean} */
                        e = false;
                        if (result === "pending") {
                            this.toHide = this.toHide.not(this.errorsFor(element));
                            return;
                        }
                        if (!result) {
                            return this.formatAndAdd(element, rule), false;
                        }
                    } catch (e) {
                        throw this.settings.debug && window.console && console.log("Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e), e instanceof TypeError && (e.message += ".  Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method."), e;
                    }
                }
                if (e) {
                    return;
                }
                return this.objectLength(rules) && this.successList.push(element), true;
            },
            customDataMessage: function (element, method) {
                return $(element).data("msg" + method.charAt(0).toUpperCase() + method.substring(1).toLowerCase()) || $(element).data("msg");
            },
            customMessage: function (name, method) {
                var m = this.settings.messages[name];
                return m && (m.constructor === String ? m : m[method]);
            },
            findDefined: function () {
                /** @type {number} */
                var i = 0;
                for (; i < arguments.length; i++) {
                    if (arguments[i] !== undefined) {
                        return arguments[i];
                    }
                }
                return undefined;
            },
            defaultMessage: function (element, rule) {
                if (typeof rule == "string") {
                    rule = {
                        method: rule
                    };
                }
                var message = this.findDefined(this.customMessage(element.name, rule.method), this.customDataMessage(element, rule.method), !this.settings.ignoreTitle && element.title || undefined, $.validator.messages[rule.method], "<strong>Warning: No message defined for " + element.name + "</strong>");
                /** @type {!RegExp} */
                var theregex = /\$?\{(\d+)\}/g;
                return typeof message == "function" ? message = message.call(this, rule.parameters, element) : theregex.test(message) && (message = $.validator.format(message.replace(theregex, "{$1}"), rule.parameters)), message;
            },
            formatAndAdd: function (element, rule) {
                var message = this.defaultMessage(element, rule);
                this.errorList.push({
                    message: message,
                    element: element,
                    method: rule.method
                });
                this.errorMap[element.name] = message;
                this.submitted[element.name] = message;
            },
            addWrapper: function (toToggle) {
                return this.settings.wrapper && (toToggle = toToggle.add(toToggle.parent(this.settings.wrapper))), toToggle;
            },
            defaultShowErrors: function () {
                var i;
                var elements;
                var error;
                /** @type {number} */
                i = 0;
                for (; this.errorList[i]; i++) {
                    error = this.errorList[i];
                    if (this.settings.highlight) {
                        this.settings.highlight.call(this, error.element, this.settings.errorClass, this.settings.validClass);
                    }
                    this.showLabel(error.element, error.message);
                }
                if (this.errorList.length) {
                    this.toShow = this.toShow.add(this.containers);
                }
                if (this.settings.success) {
                    /** @type {number} */
                    i = 0;
                    for (; this.successList[i]; i++) {
                        this.showLabel(this.successList[i]);
                    }
                }
                if (this.settings.unhighlight) {
                    /** @type {number} */
                    i = 0;
                    elements = this.validElements();
                    for (; elements[i]; i++) {
                        this.settings.unhighlight.call(this, elements[i], this.settings.errorClass, this.settings.validClass);
                    }
                }
                this.toHide = this.toHide.not(this.toShow);
                this.hideErrors();
                this.addWrapper(this.toShow).show();
            },
            validElements: function () {
                return this.currentElements.not(this.invalidElements());
            },
            invalidElements: function () {
                return $(this.errorList).map(function () {
                    return this.element;
                });
            },
            showLabel: function (element, message) {
                var place;
                var group;
                var errorID;
                var v;
                var error = this.errorsFor(element);
                var elementID = this.idOrName(element);
                var describedBy = $(element).attr("aria-describedby");
                if (error.length) {
                    error.removeClass(this.settings.validClass).addClass(this.settings.errorClass);
                    error.html(message);
                } else {
                    error = $("<" + this.settings.errorElement + ">").attr("id", elementID + "-error").addClass(this.settings.errorClass).html(message || "");
                    place = error;
                    if (this.settings.wrapper) {
                        place = error.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
                    }
                    if (this.labelContainer.length) {
                        this.labelContainer.append(place);
                    } else {
                        if (this.settings.errorPlacement) {
                            this.settings.errorPlacement.call(this, place, $(element));
                        } else {
                            place.insertAfter(element);
                        }
                    }
                    if (error.is("label")) {
                        error.attr("for", elementID);
                    } else {
                        if (error.parents("label[for='" + this.escapeCssMeta(elementID) + "']").length === 0) {
                            errorID = error.attr("id");
                            if (describedBy) {
                                if (!describedBy.match(new RegExp("\\b" + this.escapeCssMeta(errorID) + "\\b"))) {
                                    /** @type {string} */
                                    describedBy = describedBy + (" " + errorID);
                                }
                            } else {
                                describedBy = errorID;
                            }
                            $(element).attr("aria-describedby", describedBy);
                            group = this.groups[element.name];
                            if (group) {
                                v = this;
                                $.each(v.groups, function (name, testgroup) {
                                    if (testgroup === group) {
                                        $("[name='" + v.escapeCssMeta(name) + "']", v.currentForm).attr("aria-describedby", error.attr("id"));
                                    }
                                });
                            }
                        }
                    }
                }
                if (!message && this.settings.success) {
                    error.text("");
                    if (typeof this.settings.success == "string") {
                        error.addClass(this.settings.success);
                    } else {
                        this.settings.success(error, element);
                    }
                }
                this.toShow = this.toShow.add(error);
            },
            errorsFor: function (element) {
                var name = this.escapeCssMeta(this.idOrName(element));
                var describer = $(element).attr("aria-describedby");
                /** @type {string} */
                var excludeNone = "label[for='" + name + "'], label[for='" + name + "'] *";
                return describer && (excludeNone = excludeNone + ", #" + this.escapeCssMeta(describer).replace(/\s+/g, ", #")), this.errors().filter(excludeNone);
            },
            escapeCssMeta: function (string) {
                return string.replace(/([\\!"#$%&'()*+,./:;<=>?@\[\]^`{|}~])/g, "\\$1");
            },
            idOrName: function (element) {
                return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name);
            },
            validationTargetFor: function (element) {
                return this.checkable(element) && (element = this.findByName(element.name)), $(element).not(this.settings.ignore)[0];
            },
            checkable: function (element) {
                return /radio|checkbox/i.test(element.type);
            },
            findByName: function (name) {
                return $(this.currentForm).find("[name='" + this.escapeCssMeta(name) + "']");
            },
            getLength: function (value, element) {
                switch (element.nodeName.toLowerCase()) {
                    case "select":
                        return $("option:selected", element).length;
                    case "input":
                        if (this.checkable(element)) {
                            return this.findByName(element.name).filter(":checked").length;
                        }
                }
                return value.length;
            },
            depend: function (param, element) {
                return this.dependTypes[typeof param] ? this.dependTypes[typeof param](param, element) : true;
            },
            dependTypes: {
                "boolean": function (val) {
                    return val;
                },
                string: function (value, elem) {
                    return !!$(value, elem.form).length;
                },
                "function": function (param, element) {
                    return param(element);
                }
            },
            optional: function (element) {
                var val = this.elementValue(element);
                return !$.validator.methods.required.call(this, val, element) && "dependency-mismatch";
            },
            startRequest: function (element) {
                if (!this.pending[element.name]) {
                    this.pendingRequest++;
                    $(element).addClass(this.settings.pendingClass);
                    /** @type {boolean} */
                    this.pending[element.name] = true;
                }
            },
            stopRequest: function (element, valid) {
                this.pendingRequest--;
                if (this.pendingRequest < 0) {
                    /** @type {number} */
                    this.pendingRequest = 0;
                }
                delete this.pending[element.name];
                $(element).removeClass(this.settings.pendingClass);
                if (valid && this.pendingRequest === 0 && this.formSubmitted && this.form()) {
                    $(this.currentForm).submit();
                    /** @type {boolean} */
                    this.formSubmitted = false;
                } else {
                    if (!valid && this.pendingRequest === 0 && this.formSubmitted) {
                        $(this.currentForm).triggerHandler("invalid-form", [this]);
                        /** @type {boolean} */
                        this.formSubmitted = false;
                    }
                }
            },
            previousValue: function (element, method) {
                return method = typeof method == "string" && method || "remote", $.data(element, "previousValue") || $.data(element, "previousValue", {
                    old: null,
                    valid: true,
                    message: this.defaultMessage(element, {
                        method: method
                    })
                });
            },
            destroy: function () {
                this.resetForm();
                $(this.currentForm).off(".validate").removeData("validator").find(".validate-equalTo-blur").off(".validate-equalTo").removeClass("validate-equalTo-blur");
            }
        },
        classRuleSettings: {
            required: {
                required: true
            },
            email: {
                email: true
            },
            url: {
                url: true
            },
            date: {
                date: true
            },
            dateISO: {
                dateISO: true
            },
            number: {
                number: true
            },
            digits: {
                digits: true
            },
            creditcard: {
                creditcard: true
            }
        },
        addClassRules: function (className, rules) {
            if (className.constructor === String) {
                this.classRuleSettings[className] = rules;
            } else {
                $.extend(this.classRuleSettings, className);
            }
        },
        classRules: function (element) {
            var t = {};
            var e = $(element).attr("class");
            return e && $.each(e.split(" "), function () {
                if (this in $.validator.classRuleSettings) {
                    $.extend(t, $.validator.classRuleSettings[this]);
                }
            }), t;
        },
        normalizeAttributeRule: function (rules, type, method, value) {
            if (/min|max|step/.test(method) && (type === null || /number|range|text/.test(type))) {
                /** @type {number} */
                value = Number(value);
                if (isNaN(value)) {
                    value = undefined;
                }
            }
            if (value || value === 0) {
                /** @type {string} */
                rules[method] = value;
            } else {
                if (type === method && type !== "range") {
                    /** @type {boolean} */
                    rules[method] = true;
                }
            }
        },
        attributeRules: function (element) {
            var rules = {};
            var d = $(element);
            var type = element.getAttribute("type");
            var method;
            var value;
            for (method in $.validator.methods) {
                if (method === "required") {
                    value = element.getAttribute(method);
                    if (value === "") {
                        /** @type {boolean} */
                        value = true;
                    }
                    /** @type {boolean} */
                    value = !!value;
                } else {
                    value = d.attr(method);
                }
                this.normalizeAttributeRule(rules, type, method, value);
            }
            return rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength) && delete rules.maxlength, rules;
        },
        dataRules: function (element) {
            var rules = {};
            var d = $(element);
            var type = element.getAttribute("type");
            var method;
            var value;
            for (method in $.validator.methods) {
                value = d.data("rule" + method.charAt(0).toUpperCase() + method.substring(1).toLowerCase());
                this.normalizeAttributeRule(rules, type, method, value);
            }
            return rules;
        },
        staticRules: function (element) {
            var c = {};
            var validator = $.data(element.form, "validator");
            return validator.settings.rules && (c = $.validator.normalizeRule(validator.settings.rules[element.name]) || {}), c;
        },
        normalizeRules: function (rules, element) {
            return $.each(rules, function (languageCode, val) {
                if (val === false) {
                    delete rules[languageCode];
                    return;
                }
                if (val.param || val.depends) {
                    /** @type {boolean} */
                    var $elementsCovered = true;
                    switch (typeof val.depends) {
                        case "string":
                            /** @type {boolean} */
                            $elementsCovered = !!$(val.depends, element.form).length;
                            break;
                        case "function":
                            $elementsCovered = val.depends.call(element, element);
                    }
                    if ($elementsCovered) {
                        rules[languageCode] = val.param !== undefined ? val.param : true;
                    } else {
                        $.data(element.form, "validator").resetElements($(element));
                        delete rules[languageCode];
                    }
                }
            }), $.each(rules, function (rule, parameter) {
                rules[rule] = $.isFunction(parameter) && rule !== "normalizer" ? parameter(element) : parameter;
            }), $.each(["minlength", "maxlength"], function () {
                if (rules[this]) {
                    /** @type {number} */
                    rules[this] = Number(rules[this]);
                }
            }), $.each(["rangelength", "range"], function () {
                var filem;
                if (rules[this]) {
                    if ($.isArray(rules[this])) {
                        /** @type {!Array} */
                        rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
                    } else {
                        if (typeof rules[this] == "string") {
                            filem = rules[this].replace(/[\[\]]/g, "").split(/[\s,]+/);
                            /** @type {!Array} */
                            rules[this] = [Number(filem[0]), Number(filem[1])];
                        }
                    }
                }
            }), $.validator.autoCreateRanges && (rules.min != null && rules.max != null && (rules.range = [rules.min, rules.max], delete rules.min, delete rules.max), rules.minlength != null && rules.maxlength != null && (rules.rangelength = [rules.minlength, rules.maxlength], delete rules.minlength, delete rules.maxlength)), rules;
        },
        normalizeRule: function (data) {
            if (typeof data == "string") {
                var pathOrData = {};
                $.each(data.split(/\s/), function () {
                    /** @type {boolean} */
                    pathOrData[this] = true;
                });
                data = pathOrData;
            }
            return data;
        },
        addMethod: function (name, method, message) {
            /** @type {!Function} */
            $.validator.methods[name] = method;
            $.validator.messages[name] = message !== undefined ? message : $.validator.messages[name];
            if (method.length < 3) {
                $.validator.addClassRules(name, $.validator.normalizeRule(name));
            }
        },
        methods: {
            required: function (value, element, param) {
                if (!this.depend(param, element)) {
                    return "dependency-mismatch";
                }
                if (element.nodeName.toLowerCase() === "select") {
                    var expRecords = $(element).val();
                    return expRecords && expRecords.length > 0;
                }
                return this.checkable(element) ? this.getLength(value, element) > 0 : value.length > 0;
            },
            email: function (value, element) {
                return this.optional(element) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value);
            },
            url: function (value, element) {
                return this.optional(element) || /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
            },
            date: function (value, element) {
                return this.optional(element) || !/Invalid|NaN/.test((new Date(value)).toString());
            },
            dateISO: function (value, element) {
                return this.optional(element) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(value);
            },
            number: function (value, element) {
                return this.optional(element) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
            },
            digits: function (value, element) {
                return this.optional(element) || /^\d+$/.test(value);
            },
            creditcard: function (value, element) {
                if (this.optional(element)) {
                    return "dependency-mismatch";
                }
                if (/[^0-9 -]+/.test(value)) {
                    return false;
                }
                /** @type {number} */
                var fieldhtml = 0;
                /** @type {number} */
                var end = 0;
                /** @type {boolean} */
                var enabled = false;
                value = value.replace(/\D/g, "");
                /** @type {number} */
                var column = value.length - 1;
                for (; column >= 0; column--) {
                    var size = value.charAt(column);
                    /** @type {number} */
                    end = parseInt(size, 10);
                    if (enabled && (end = end * 2) > 9) {
                        /** @type {number} */
                        end = end - 9;
                    }
                    /** @type {number} */
                    fieldhtml = fieldhtml + end;
                    /** @type {boolean} */
                    enabled = !enabled;
                }
                return fieldhtml % 10 == 0;
            },
            minlength: function (value, element, param) {
                var length = $.isArray(value) ? value.length : this.getLength(value, element);
                return this.optional(element) || length >= param;
            },
            maxlength: function (value, element, param) {
                var length = $.isArray(value) ? value.length : this.getLength(value, element);
                return this.optional(element) || length <= param;
            },
            rangelength: function (value, element, param) {
                var length = $.isArray(value) ? value.length : this.getLength(value, element);
                return this.optional(element) || length >= param[0] && length <= param[1];
            },
            min: function (value, element, param) {
                return this.optional(element) || value >= param;
            },
            max: function (value, element, param) {
                return this.optional(element) || value <= param;
            },
            range: function (a, m, b) {
                return this.optional(m) || a >= b[0] && a <= b[1];
            },
            step: function (value, element, param) {
                var map = $(element).attr("type");
                /** @type {string} */
                var lastErrorOutput = "Step attribute on input type " + map + " is not supported.";
                /** @type {!Array} */
                var supportedTypes = ["text", "number", "range"];
                /** @type {!RegExp} */
                var negativeRegex = new RegExp("\\b" + map + "\\b");
                var hasTap = map && !negativeRegex.test(supportedTypes.join());
                /**
                 * @param {string} num
                 * @return {?}
                 */
                var decimalPlaces = function (num) {
                    /** @type {(Array<string>|null)} */
                    var swarm = ("" + num).match(/(?:\.(\d+))?$/);
                    return swarm ? swarm[1] ? swarm[1].length : 0 : 0;
                };
                /**
                 * @param {number} value
                 * @return {?}
                 */
                var toInt = function (value) {
                    return Math.round(value * Math.pow(10, decimals));
                };
                /** @type {boolean} */
                var check = true;
                var decimals;
                if (hasTap) {
                    throw new Error(lastErrorOutput);
                }
                decimals = decimalPlaces(param);
                if (decimalPlaces(value) > decimals || toInt(value) % toInt(param) !== 0) {
                    /** @type {boolean} */
                    check = false;
                }
                return this.optional(element) || check;
            },
            equalTo: function (param, value, rule) {
                var target = $(rule);
                return this.settings.onfocusout && target.not(".validate-equalTo-blur").length && target.addClass("validate-equalTo-blur").on("blur.validate-equalTo", function () {
                    $(value).valid();
                }), param === target.val();
            },
            remote: function (options, element, param, method) {
                if (this.optional(element)) {
                    return "dependency-mismatch";
                }
                /** @type {string} */
                method = typeof method == "string" && method || "remote";
                var previous = this.previousValue(element, method);
                var validator;
                var cache;
                var value;
                return this.settings.messages[element.name] || (this.settings.messages[element.name] = {}), previous.originalMessage = previous.originalMessage || this.settings.messages[element.name][method], this.settings.messages[element.name][method] = previous.message, param = typeof param == "string" && {
                    url: param
                } || param, value = $.param($.extend({
                    data: options
                }, param.data)), previous.old === value ? previous.valid : (previous.old = value, validator = this, this.startRequest(element), cache = {}, cache[element.name] = options, $.ajax($.extend(true, {
                    mode: "abort",
                    port: "validate" + element.name,
                    dataType: "json",
                    data: cache,
                    context: validator.currentForm,
                    success: function (id) {
                        /** @type {boolean} */
                        var valid = id === true || id === "true";
                        var errors;
                        var message;
                        var submitted;
                        validator.settings.messages[element.name][method] = previous.originalMessage;
                        if (valid) {
                            submitted = validator.formSubmitted;
                            validator.resetInternals();
                            validator.toHide = validator.errorsFor(element);
                            validator.formSubmitted = submitted;
                            validator.successList.push(element);
                            /** @type {boolean} */
                            validator.invalid[element.name] = false;
                            validator.showErrors();
                        } else {
                            errors = {};
                            message = id || validator.defaultMessage(element, {
                                method: method,
                                parameters: options
                            });
                            errors[element.name] = previous.message = message;
                            /** @type {boolean} */
                            validator.invalid[element.name] = true;
                            validator.showErrors(errors);
                        }
                        /** @type {boolean} */
                        previous.valid = valid;
                        validator.stopRequest(element, valid);
                    }
                }, param)), "pending");
            }
        }
    });
    var pendingRequests = {};
    var ajax;
    if ($.ajaxPrefilter) {
        $.ajaxPrefilter(function (settings, canCreateDiscussions, xhr) {
            var port = settings.port;
            if (settings.mode === "abort") {
                if (pendingRequests[port]) {
                    pendingRequests[port].abort();
                }
                pendingRequests[port] = xhr;
            }
        });
    } else {
        /** @type {function(!Object): ?} */
        ajax = $.ajax;
        /**
         * @param {!Object} settings
         * @return {?}
         */
        $.ajax = function (settings) {
            var mode = ("mode" in settings ? settings : $.ajaxSettings).mode;
            var port = ("port" in settings ? settings : $.ajaxSettings).port;
            return mode === "abort" ? (pendingRequests[port] && pendingRequests[port].abort(), pendingRequests[port] = ajax.apply(this, arguments), pendingRequests[port]) : ajax.apply(this, arguments);
        };
    }
}), $.validator.prototype.isScrolledIntoView = function (elem) {
    var scTop = $(window).scrollTop() + 70;
    var scBot = scTop + $(window).height();
    var elTop = $(elem).offset().top;
    var elBot = elTop + $(elem).height();
    return elBot <= scBot && elTop >= scTop;
}, $.validator.prototype.origFocusInvalid = $.validator.prototype.focusInvalid, $.validator.prototype.focusInvalid = function () {
    try {
        var btn = $(this.findLastActive() || this.errorList.length && this.errorList[0].element || []);
        this.origFocusInvalid();
        if (btn != [] && !this.isScrolledIntoView(btn)) {
            $(window).scrollTop($(btn).position().top - 70);
        }
    } catch (b) {
    }
}, pm.validate = pm.validate || {}, pm.validate.getNCRegexp = function (a, opt_max) {
    return new RegExp("^[\t\n\r -~\u00a0-\u00ff\u2019\u2018]{" + a + "," + opt_max + "}$");
}, pm.validate.addErrors = function (i, event, data, attr) {
    var validator = $(i).validate();
    var result = {};
    /** @type {boolean} */
    var g = false;
    /** @type {!Array} */
    var prop = [];
    if (data !== null && data !== undefined) {
        try {
            var documents = $.parseJSON(data);
            if ($.isEmptyObject(documents)) {
                /** @type {boolean} */
                g = true;
            } else {
                $.each(documents, function (key, table) {
                    if (key == "base") {
                        /** @type {!Object} */
                        prop = table;
                    } else {
                        if (event != null && event != "") {
                            result[event + "[" + key + "]"] = table[0];
                        } else {
                            result[key] = table[0];
                        }
                    }
                });
            }
        } catch (j) {
            /** @type {boolean} */
            g = true;
        }
    } else {
        /** @type {boolean} */
        g = true;
    }
    if (g) {
        /** @type {!Array} */
        prop = ["Sorry, unable to process your request. Please try again."];
    }
    validator.showErrors(result);
    $.each(prop, function (b, c) {
        var span = $(document.createElement("span"));
        span.addClass($.validator.defaults.baseErrorClass);
        if (attr != undefined) {
            $(span).insertBefore(attr);
        } else {
            $(span).insertBefore($(i).find("legend").first());
        }
        span.html(c);
    });
}, pm.validate.addBaseErrors = function (i, n) {
    var span = $(document.createElement("span"));
    span.addClass($.validator.defaults.baseErrorClass);
    $(span).insertBefore($(i).find("legend").first());
    span.html(n);
}, pm.validate.clearFormErrors = function (key) {
    var $sharepreview = $("#" + key);
    $sharepreview.find("input." + $.validator.defaults.errorClass).removeClass($.validator.defaults.errorClass);
    $sharepreview.find("span." + $.validator.defaults.errorClass).remove();
    $sharepreview.find("span." + $.validator.defaults.baseErrorClass).remove();
    $sharepreview.find("span.base_error_message").remove();
}, $.validator.defaults.errorElement = "span", $.validator.defaults.errorClass = "field_with_error", $.validator.defaults.baseErrorClass = "base_error_message", $.validator.defaults.invalidHandler = function (event, validator) {
    if (validator.numberOfInvalids() > 0) {
        validator.errorList[0].element.focus();
    }
}, $.validator.messages.required = "can't be blank", $.validator.messages.equalTo = "Please enter the same value again", jQuery.validator.addMethod("pm_password_letter_check", function (value, element) {
    return this.optional(element) || /[a-zA-Z]/.test(value);
}, "Password must contain at least one letter"), jQuery.validator.addMethod("pm_password_number_or_symbol_check", function (value, element) {
    return this.optional(element) || /[0-9\x20-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]/.test(value);
}, "Password must contain at least one number or symbol"), jQuery.validator.addMethod("pm_password_length_check", function (inRevIdx, element) {
    return this.optional(element) || inRevIdx.length >= 6;
}, "Password must be at least 6 characters long"), jQuery.validator.addMethod("pm_password_old", function (value, element) {
    return this.optional(element) || /^[\x21-\x7e]*$/.test(value);
}, "Only the following characters are allowed :  a-z, A-Z, 0-9 and common punctuation characters"), jQuery.validator.addMethod("pm_username", function (commentToCheck, element) {
    return this.optional(element) || /^([a-z]|[A-Z]|[0-9]|_)*$/.test(commentToCheck.trim());
}, "Only the following characters are allowed :  a-z, A-Z, 0-9, _"), jQuery.validator.addMethod("pm_date", function (datastring, element) {
    if (this.optional(element)) {
        return true;
    }
    var e;
    var d;
    var month;
    var date;
    var year;
    /** @type {string} */
    var chunkSeparator = "-";
    return e = datastring.split(chunkSeparator), e.length !== 3 ? false : (year = e[0] - 0, month = e[1] - 1, date = e[2] - 0, year < 1e3 || year > 3e3 ? false : (d = (new Date(year, month, date)).getTime(), e = new Date, e.setTime(d), e.getFullYear() !== year || e.getMonth() !== month || e.getDate() !== date ? false : true));
}, "Please enter a valid date"), jQuery.validator.addMethod("routing_number", function (romaji, element) {
    if (this.optional(element)) {
        return true;
    }
    if (/^\d{9}$/.test(romaji)) {
        /** @type {number} */
        var ret = 0;
        /** @type {number} */
        i = 0;
        for (; i < romaji.length; i = i + 3) {
            /** @type {number} */
            ret = ret + (parseInt(romaji.charAt(i), 10) * 3 + parseInt(romaji.charAt(i + 1), 10) * 7 + parseInt(romaji.charAt(i + 2), 10));
        }
        return ret != 0 && ret % 10 == 0 ? true : false;
    }
    return false;
}, "Please enter a valid routing number"), jQuery.validator.addMethod("routing_number_valid_value", function (pathToDestinationFile, element) {
    return this.optional(element) ? true : /^[0123]/.test(pathToDestinationFile) ? true : false;
}, "Please enter a valid routing number. It must begin with a 0, 1, 2 or 3."), jQuery.validator.addMethod("cc_expiry_month", function (windowLeft, galleryitem) {
    var left = windowLeft;
    var value = $($(galleryitem).data("cc-exp-year")).val();
    /** @type {!Date} */
    var dCurrent = new Date;
    /** @type {string} */
    var right = ("0" + (dCurrent.getMonth() + 1)).slice(-2);
    /** @type {string} */
    var todays_date = dCurrent.getFullYear().toString().substr(2, 2);
    if (parseInt(value) == parseInt(todays_date)) {
        if (parseInt(left) < parseInt(right)) {
            return false;
        }
    } else {
        if (parseInt(value) < parseInt(todays_date)) {
            return false;
        }
    }
    return true;
}, "Invalid month"), jQuery.validator.addMethod("cc_expiry_year", function (windowLeft, b) {
    var left = windowLeft;
    /** @type {!Date} */
    var d = new Date;
    /** @type {string} */
    var right = d.getFullYear().toString().substr(2, 2);
    return parseInt(left) < parseInt(right) ? false : true;
}, "Invalid year"), jQuery.validator.addMethod("xml_chars", function (a, element) {
    if (this.optional(element)) {
        return true;
    }
    /** @type {!RegExp} */
    var c = new RegExp("(<|>|&)");
    if (c.test(a)) {
        var m = a.replace(/(?![\46\74\76])[\000-\177]/g, "");
        /** @type {string} */
        var ret = "";
        /** @type {number} */
        var i = 0;
        for (; i < m.length; i++) {
            if (ret.indexOf(m[i]) == -1) {
                ret = ret + m[i];
            }
        }
        return jQuery.validator.messages.xml_chars = 'Sorry, the field cannot contain the "' + ret + '" character', false;
    }
    return true;
}, jQuery.validator.messages.xml_chars), jQuery.validator.addMethod("us_phone_no", function (pathToDestinationFile, element) {
    return this.optional(element) ? true : /^\(?[2-9]{1}[0-9]{2}[) -]*[0-9]{3}[ -]*[0-9]{4}$/.test(pathToDestinationFile) ? true : false;
}, "Please enter a valid US phone no"), jQuery.validator.addMethod("offer_amt", function (identifiers_on_map, galleryitem) {
    var name = identifiers_on_map;
    /** @type {number} */
    var viewerN = parseInt(name, 10);
    /** @type {number} */
    var minN = parseInt($(galleryitem).data("min-amount"), 10);
    /** @type {number} */
    var maxN = parseInt($(galleryitem).data("max-amount"), 10);
    return viewerN < minN || viewerN > maxN ? false : true;
}, function (a, galleryitem) {
    /** @type {number} */
    var whiteRating = parseInt($(galleryitem).data("min-amount"), 10);
    /** @type {number} */
    var pageInd = parseInt($(galleryitem).data("max-amount"), 10);
    return "should be between $" + whiteRating + " - $" + pageInd;
}), jQuery.validator.addMethod("validate_account_id", function (headB, galleryitem) {
    var stripTerrain = $($(galleryitem).data("account_id")).val();
    var cacheB = headB;
    return stripTerrain == cacheB ? true : false;
}, "Whoops! The account numbers you entered do not match"), jQuery.validator.addMethod("validate_redeeem_amount", function (a, galleryitem) {
    var r = $(galleryitem).data("redeemable");
    var aValue = a;
    /** @type {number} */
    var max = parseFloat(r, 10);
    /** @type {number} */
    var position = parseFloat(aValue, 10);
    return position <= max ? true : false;
}, "Whoops! You don't have that much money in your account"), jQuery.validator.addMethod("validate_amount", function (hilo, b) {
    var value = hilo;
    /** @type {number} */
    var replaceArr = parseFloat(value, 10);
    return replaceArr.length < 1 || replaceArr == 0 ? false : true;
}, "Invalid Amount"), jQuery.validator.addMethod("valFirstLastName", function (commentToCheck, b) {
    var s = commentToCheck.trim();
    return s = s.replace(/\s{2,}/g, " "), s = s.split(" "), s.length < 2 ? false : true;
}, "Sorry, the name must include both first and last names"), jQuery.validator.addMethod("trim_required", function (commentToCheck, b) {
    var relativeFromCwd = commentToCheck.trim();
    return relativeFromCwd === "" ? false : true;
}, "can't be blank"), jQuery.validator.addMethod("validate_ach_name", function (httpToken, b) {
    return pm.validate.getNCRegexp(1, 35).test(httpToken);
}, "Please enter a valid name"), jQuery.validator.addMethod("validate_bank_name", function (httpToken, b) {
    return pm.validate.getNCRegexp(1, 35).test(httpToken);
}, "Please enter a valid bank name"), jQuery.validator.addMethod("validate_check_name", function (httpToken, b) {
    return pm.validate.getNCRegexp(1, 50).test(httpToken);
}, "Please enter a valid name"), jQuery.validator.addMethod("validate_check_addr", function (val, b) {
    return val === "" ? true : pm.validate.getNCRegexp(1, 35).test(val);
}, "Please enter a valid address"), jQuery.fn.extend({
    wrapAll: function (html) {
        var b;
        return jQuery.isFunction(html) ? this.each(function (i) {
            jQuery(this).wrapAll(html.call(this, i));
        }) : (this[0] && (b = jQuery(html, this[0].ownerDocument).eq(0).clone(true), this[0].parentNode && b.insertBefore(this[0]), b.map(function () {
            var elem = this;
            for (; elem.firstElementChild;) {
                elem = elem.firstElementChild;
            }
            return elem;
        }).append(this)), this);
    },
    wrapInner: function (html) {
        return jQuery.isFunction(html) ? this.each(function (i) {
            jQuery(this).wrapInner(html.call(this, i));
        }) : this.each(function () {
            var b = jQuery(this);
            var contents = b.contents();
            if (contents.length) {
                contents.wrapAll(html);
            } else {
                b.append(html);
            }
        });
    },
    wrap: function (html) {
        var isFunction = jQuery.isFunction(html);
        return this.each(function (i) {
            jQuery(this).wrapAll(isFunction ? html.call(this, i) : html);
        });
    },
    outerHTML: function () {
        return jQuery(this).clone().wrap("<div></div>").parent().html();
    },
    unwrap: function () {
        return this.parent().each(function () {
            if (!jQuery.nodeName(this, "body")) {
                jQuery(this).replaceWith(this.childNodes);
            }
        }).end();
    }
}), function (f) {
    if (typeof exports == "object" && typeof module != "undefined") {
        module.exports = f();
    } else {
        if (typeof define == "function" && define.amd) {
            define([], f);
        } else {
            var g;
            if (typeof window != "undefined") {
                /** @type {!Window} */
                g = window;
            } else {
                if (typeof global != "undefined") {
                    g = global;
                } else {
                    if (typeof self != "undefined") {
                        /** @type {!Window} */
                        g = self;
                    } else {
                        g = this;
                    }
                }
            }
            g.Clipboard = f();
        }
    }
}(function () {
    var define;
    var b;
    var c;
    return function e(t, n, r) {
        /**
         * @param {string} o
         * @param {?} s
         * @return {?}
         */
        function s(o, s) {
            if (!n[o]) {
                if (!t[o]) {
                    var i = typeof require == "function" && require;
                    if (!s && i) {
                        return i(o, true);
                    }
                    if (a) {
                        return a(o, true);
                    }
                    /** @type {!Error} */
                    var f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f;
                }
                var u = n[o] = {
                    exports: {}
                };
                t[o][0].call(u.exports, function (e) {
                    var n = t[o][1][e];
                    return s(n ? n : e);
                }, u, u.exports, e, t, n, r);
            }
            return n[o].exports;
        }

        var a = typeof require == "function" && require;
        /** @type {number} */
        var o = 0;
        for (; o < r.length; o++) {
            s(r[o]);
        }
        return s;
    }({
        1: [function (require, mixin, canCreateDiscussions) {
            var matches = require("matches-selector");
            /**
             * @param {!Element} element
             * @param {?} selector
             * @param {boolean} checkYoSelf
             * @return {?}
             */
            mixin.exports = function (element, selector, checkYoSelf) {
                var parent = checkYoSelf ? element : element.parentNode;
                for (; parent && parent !== document;) {
                    if (matches(parent, selector)) {
                        return parent;
                    }
                    parent = parent.parentNode;
                }
            };
        }, {
            "matches-selector": 5
        }],
        2: [function (require, module, canCreateDiscussions) {
            /**
             * @param {!Object} t
             * @param {?} port
             * @param {?} e
             * @param {?} opts
             * @param {?} fn
             * @return {?}
             */
            function addListener(t, port, e, opts, fn) {
                var n = listener.apply(this, arguments);
                return t.addEventListener(e, n, fn), {
                    destroy: function () {
                        t.removeEventListener(e, n, fn);
                    }
                };
            }

            /**
             * @param {?} self
             * @param {?} selector
             * @param {?} c
             * @param {!Function} f
             * @return {?}
             */
            function listener(self, selector, c, f) {
                return function (e) {
                    e.delegateTarget = closest(e.target, selector, true);
                    if (e.delegateTarget) {
                        f.call(self, e);
                    }
                };
            }

            var closest = require("closest");
            /** @type {function(!Object, ?, ?, ?, ?): ?} */
            module.exports = addListener;
        }, {
            closest: 1
        }],
        3: [function (a, b, options) {
            /**
             * @param {string} value
             * @return {?}
             */
            options.node = function (value) {
                return value !== undefined && value instanceof HTMLElement && value.nodeType === 1;
            };
            /**
             * @param {!Object} value
             * @return {?}
             */
            options.nodeList = function (value) {
                /** @type {string} */
                var b = Object.prototype.toString.call(value);
                return value !== undefined && (b === "[object NodeList]" || b === "[object HTMLCollection]") && "length" in value && (value.length === 0 || options.node(value[0]));
            };
            /**
             * @param {string} object
             * @return {?}
             */
            options.string = function (object) {
                return typeof object == "string" || object instanceof String;
            };
            /**
             * @param {?} a
             * @return {?}
             */
            options.fn = function (a) {
                /** @type {string} */
                var _ref_a = Object.prototype.toString.call(a);
                return _ref_a === "[object Function]";
            };
        }, {}],
        4: [function ($, module, canCreateDiscussions) {
            /**
             * @param {string} target
             * @param {string} type
             * @param {?} callback
             * @return {?}
             */
            function listen(target, type, callback) {
                if (!target && !type && !callback) {
                    throw new Error("Missing required arguments");
                }
                if (!item.string(type)) {
                    throw new TypeError("Second argument must be a String");
                }
                if (!item.fn(callback)) {
                    throw new TypeError("Third argument must be a Function");
                }
                if (item.node(target)) {
                    return listenNode(target, type, callback);
                }
                if (item.nodeList(target)) {
                    return listenNodeList(target, type, callback);
                }
                if (item.string(target)) {
                    return listenSelector(target, type, callback);
                }
                throw new TypeError("First argument must be a String, HTMLElement, HTMLCollection, or NodeList");
            }

            /**
             * @param {!Object} node
             * @param {string} type
             * @param {?} callback
             * @return {?}
             */
            function listenNode(node, type, callback) {
                return node.addEventListener(type, callback), {
                    destroy: function () {
                        node.removeEventListener(type, callback);
                    }
                };
            }

            /**
             * @param {string} nodeList
             * @param {string} type
             * @param {?} callback
             * @return {?}
             */
            function listenNodeList(nodeList, type, callback) {
                return Array.prototype.forEach.call(nodeList, function (a) {
                    a.addEventListener(type, callback);
                }), {
                    destroy: function () {
                        Array.prototype.forEach.call(nodeList, function (a) {
                            a.removeEventListener(type, callback);
                        });
                    }
                };
            }

            /**
             * @param {string} selector
             * @param {string} type
             * @param {?} callback
             * @return {?}
             */
            function listenSelector(selector, type, callback) {
                return delegate(document.body, selector, type, callback);
            }

            var item = $("./is");
            var delegate = $("delegate");
            /** @type {function(string, string, ?): ?} */
            module.exports = listen;
        }, {
            "./is": 3,
            delegate: 2
        }],
        5: [function (a, module, canCreateDiscussions) {
            /**
             * @param {!Object} d
             * @param {?} type
             * @return {?}
             */
            function f(d, type) {
                if (Event) {
                    return Event.call(d, type);
                }
                var parts = d.parentNode.querySelectorAll(type);
                /** @type {number} */
                var i = 0;
                for (; i < parts.length; ++i) {
                    if (parts[i] == d) {
                        return true;
                    }
                }
                return false;
            }

            var proto = Element.prototype;
            /** @type {function(this:Element, string, (Node|NodeList<?>|null)=): boolean} */
            var Event = proto.matchesSelector || proto.webkitMatchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector;
            /** @type {function(!Object, ?): ?} */
            module.exports = f;
        }, {}],
        6: [function (a, module, canCreateDiscussions) {
            /**
             * @param {!Object} element
             * @return {?}
             */
            function select(element) {
                var selectedText;
                if (element.nodeName === "INPUT" || element.nodeName === "TEXTAREA") {
                    element.focus();
                    element.setSelectionRange(0, element.value.length);
                    selectedText = element.value;
                } else {
                    if (element.hasAttribute("contenteditable")) {
                        element.focus();
                    }
                    /** @type {(Selection|null)} */
                    var sel = window.getSelection();
                    /** @type {(Range|null)} */
                    var range = document.createRange();
                    range.selectNodeContents(element);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    /** @type {string} */
                    selectedText = sel.toString();
                }
                return selectedText;
            }

            /** @type {function(!Object): ?} */
            module.exports = select;
        }, {}],
        7: [function (a, module, canCreateDiscussions) {
            /**
             * @return {undefined}
             */
            function E() {
            }

            E.prototype = {
                on: function (event, name, obj) {
                    var e = this.e || (this.e = {});
                    return (e[event] || (e[event] = [])).push({
                        fn: name,
                        ctx: obj
                    }), this;
                },
                once: function (type, listener, args) {
                    /**
                     * @return {undefined}
                     */
                    function g() {
                        shape.off(type, g);
                        listener.apply(args, arguments);
                    }

                    var shape = this;
                    return g._ = listener, this.on(type, g, args);
                },
                emit: function (name) {
                    /** @type {!Array<?>} */
                    var cmd_args = [].slice.call(arguments, 1);
                    var readyList = ((this.e || (this.e = {}))[name] || []).slice();
                    /** @type {number} */
                    var i = 0;
                    var patchLen = readyList.length;
                    i;
                    for (; i < patchLen; i++) {
                        readyList[i].fn.apply(readyList[i].ctx, cmd_args);
                    }
                    return this;
                },
                off: function (name, callback) {
                    var e = this.e || (this.e = {});
                    var evts = e[name];
                    /** @type {!Array} */
                    var liveEvents = [];
                    if (evts && callback) {
                        /** @type {number} */
                        var i = 0;
                        var l = evts.length;
                        for (; i < l; i++) {
                            if (evts[i].fn !== callback && evts[i].fn._ !== callback) {
                                liveEvents.push(evts[i]);
                            }
                        }
                    }
                    return liveEvents.length ? e[name] = liveEvents : delete e[name], this;
                }
            };
            /** @type {function(): undefined} */
            module.exports = E;
        }, {}],
        8: [function (require, seed, inWithIndex) {
            (function (global, factory) {
                if (typeof define == "function" && define.amd) {
                    define(["module", "select"], factory);
                } else {
                    if (typeof inWithIndex != "undefined") {
                        factory(seed, require("select"));
                    } else {
                        var mod = {
                            exports: {}
                        };
                        factory(mod, global.select);
                        global.clipboardAction = mod.exports;
                    }
                }
            })(this, function (module, _prepareStyleProperties) {
                /**
                 * @param {!Object} obj
                 * @return {?}
                 */
                function _interopRequireDefault(obj) {
                    return obj && obj.__esModule ? obj : {
                        "default": obj
                    };
                }

                /**
                 * @param {!AudioNode} instance
                 * @param {!Function} Constructor
                 * @return {undefined}
                 */
                function _classCallCheck(instance, Constructor) {
                    if (!(instance instanceof Constructor)) {
                        throw new TypeError("Cannot call a class as a function");
                    }
                }

                "use strict";
                var _prepareStyleProperties2 = _interopRequireDefault(_prepareStyleProperties);
                /** @type {function(!Object): ?} */
                var handler = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function (targetRadian) {
                    return typeof targetRadian;
                } : function (obj) {
                    return obj && typeof Symbol == "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
                };
                var _createClass = function () {
                    /**
                     * @param {!Function} target
                     * @param {string} props
                     * @return {undefined}
                     */
                    function defineProperties(target, props) {
                        /** @type {number} */
                        var i = 0;
                        for (; i < props.length; i++) {
                            var descriptor = props[i];
                            descriptor.enumerable = descriptor.enumerable || false;
                            /** @type {boolean} */
                            descriptor.configurable = true;
                            if ("value" in descriptor) {
                                /** @type {boolean} */
                                descriptor.writable = true;
                            }
                            Object.defineProperty(target, descriptor.key, descriptor);
                        }
                    }

                    return function (Constructor, protoProps, staticProps) {
                        return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), Constructor;
                    };
                }();
                var storeMixin = function () {
                    /**
                     * @param {?} options
                     * @return {undefined}
                     */
                    function ClipboardAction(options) {
                        _classCallCheck(this, ClipboardAction);
                        this.resolveOptions(options);
                        this.initSelection();
                    }

                    return ClipboardAction.prototype.resolveOptions = function () {
                        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
                        this.action = options.action;
                        this.emitter = options.emitter;
                        this.target = options.target;
                        this.text = options.text;
                        this.trigger = options.trigger;
                        /** @type {string} */
                        this.selectedText = "";
                    }, ClipboardAction.prototype.initSelection = function () {
                        if (this.text) {
                            this.selectFake();
                        } else {
                            if (this.target) {
                                this.selectTarget();
                            }
                        }
                    }, ClipboardAction.prototype.selectFake = function () {
                        var _this = this;
                        /** @type {boolean} */
                        var isRTL = document.documentElement.getAttribute("dir") == "rtl";
                        this.removeFake();
                        this.fakeHandler = document.body.addEventListener("click", function () {
                            return _this.removeFake();
                        });
                        /** @type {!Element} */
                        this.fakeElem = document.createElement("textarea");
                        /** @type {string} */
                        this.fakeElem.style.fontSize = "12pt";
                        /** @type {string} */
                        this.fakeElem.style.border = "0";
                        /** @type {string} */
                        this.fakeElem.style.padding = "0";
                        /** @type {string} */
                        this.fakeElem.style.margin = "0";
                        /** @type {string} */
                        this.fakeElem.style.position = "fixed";
                        /** @type {string} */
                        this.fakeElem.style[isRTL ? "right" : "left"] = "-9999px";
                        /** @type {string} */
                        this.fakeElem.style.top = (window.pageYOffset || document.documentElement.scrollTop) + "px";
                        this.fakeElem.setAttribute("readonly", "");
                        this.fakeElem.value = this.text;
                        document.body.appendChild(this.fakeElem);
                        this.selectedText = (0, _prepareStyleProperties2.default)(this.fakeElem);
                        this.copyText();
                    }, ClipboardAction.prototype.removeFake = function () {
                        if (this.fakeHandler) {
                            document.body.removeEventListener("click");
                            /** @type {null} */
                            this.fakeHandler = null;
                        }
                        if (this.fakeElem) {
                            document.body.removeChild(this.fakeElem);
                            /** @type {null} */
                            this.fakeElem = null;
                        }
                    }, ClipboardAction.prototype.selectTarget = function () {
                        this.selectedText = (0, _prepareStyleProperties2.default)(this.target);
                        this.copyText();
                    }, ClipboardAction.prototype.copyText = function () {
                        var succeeded = undefined;
                        try {
                            succeeded = document.execCommand(this.action);
                        } catch (b) {
                            /** @type {boolean} */
                            succeeded = false;
                        }
                        this.handleResult(succeeded);
                    }, ClipboardAction.prototype.handleResult = function (succeeded) {
                        if (succeeded) {
                            this.emitter.emit("success", {
                                action: this.action,
                                text: this.selectedText,
                                trigger: this.trigger,
                                clearSelection: this.clearSelection.bind(this)
                            });
                        } else {
                            this.emitter.emit("error", {
                                action: this.action,
                                trigger: this.trigger,
                                clearSelection: this.clearSelection.bind(this)
                            });
                        }
                    }, ClipboardAction.prototype.clearSelection = function () {
                        if (this.target) {
                            this.target.blur();
                        }
                        window.getSelection().removeAllRanges();
                    }, ClipboardAction.prototype.destroy = function () {
                        this.removeFake();
                    }, _createClass(ClipboardAction, [{
                        key: "action",
                        set: function () {
                            var action = arguments.length <= 0 || arguments[0] === undefined ? "copy" : arguments[0];
                            this._action = action;
                            if (this._action !== "copy" && this._action !== "cut") {
                                throw new Error('Invalid "action" value, use either "copy" or "cut"');
                            }
                        },
                        get: function () {
                            return this._action;
                        }
                    }, {
                        key: "target",
                        set: function (target) {
                            if (target !== undefined) {
                                if (!target || (typeof target == "undefined" ? "undefined" : handler(target)) !== "object" || target.nodeType !== 1) {
                                    throw new Error('Invalid "target" value, use a valid Element');
                                }
                                if (this.action === "copy" && target.hasAttribute("disabled")) {
                                    throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
                                }
                                if (this.action === "cut" && (target.hasAttribute("readonly") || target.hasAttribute("disabled"))) {
                                    throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
                                }
                                /** @type {!Object} */
                                this._target = target;
                            }
                        },
                        get: function () {
                            return this._target;
                        }
                    }]), ClipboardAction;
                }();
                module.exports = storeMixin;
            });
        }, {
            select: 6
        }],
        9: [function (require, seed, inWithIndex) {
            (function (global, factory) {
                if (typeof define == "function" && define.amd) {
                    define(["module", "./clipboard-action", "tiny-emitter", "good-listener"], factory);
                } else {
                    if (typeof inWithIndex != "undefined") {
                        factory(seed, require("./clipboard-action"), require("tiny-emitter"), require("good-listener"));
                    } else {
                        var mod = {
                            exports: {}
                        };
                        factory(mod, global.clipboardAction, global.tinyEmitter, global.goodListener);
                        global.clipboard = mod.exports;
                    }
                }
            })(this, function (module, _clipboardAction, _prepareStyleProperties, _normalizeDataUri) {
                /**
                 * @param {!Object} obj
                 * @return {?}
                 */
                function _interopRequireDefault(obj) {
                    return obj && obj.__esModule ? obj : {
                        "default": obj
                    };
                }

                /**
                 * @param {!AudioNode} instance
                 * @param {!Function} Constructor
                 * @return {undefined}
                 */
                function _classCallCheck(instance, Constructor) {
                    if (!(instance instanceof Constructor)) {
                        throw new TypeError("Cannot call a class as a function");
                    }
                }

                /**
                 * @param {string} self
                 * @param {string} call
                 * @return {?}
                 */
                function _possibleConstructorReturn(self, call) {
                    if (!self) {
                        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                    }
                    return !call || typeof call != "object" && typeof call != "function" ? self : call;
                }

                /**
                 * @param {!Object} subClass
                 * @param {!Object} superClass
                 * @return {undefined}
                 */
                function _inherits(subClass, superClass) {
                    if (typeof superClass != "function" && superClass !== null) {
                        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
                    }
                    /** @type {!Object} */
                    subClass.prototype = Object.create(superClass && superClass.prototype, {
                        constructor: {
                            value: subClass,
                            enumerable: false,
                            writable: true,
                            configurable: true
                        }
                    });
                    if (superClass) {
                        if (Object.setPrototypeOf) {
                            Object.setPrototypeOf(subClass, superClass);
                        } else {
                            /** @type {!Object} */
                            subClass.__proto__ = superClass;
                        }
                    }
                }

                /**
                 * @param {string} suffix
                 * @param {!Object} element
                 * @return {?}
                 */
                function getAttributeValue(suffix, element) {
                    /** @type {string} */
                    var attribute = "data-clipboard-" + suffix;
                    if (!element.hasAttribute(attribute)) {
                        return;
                    }
                    return element.getAttribute(attribute);
                }

                "use strict";
                var _clipboardAction2 = _interopRequireDefault(_clipboardAction);
                var _prepareStyleProperties2 = _interopRequireDefault(_prepareStyleProperties);
                var _normalizeDataUri2 = _interopRequireDefault(_normalizeDataUri);
                var storeMixin = function (_Namespace) {
                    /**
                     * @param {?} trigger
                     * @param {?} options
                     * @return {?}
                     */
                    function Clipboard(trigger, options) {
                        _classCallCheck(this, Clipboard);
                        var _this = _possibleConstructorReturn(this, _Namespace.call(this));
                        return _this.resolveOptions(options), _this.listenClick(trigger), _this;
                    }

                    return _inherits(Clipboard, _Namespace), Clipboard.prototype.resolveOptions = function () {
                        var kwArgs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
                        this.action = typeof kwArgs.action == "function" ? kwArgs.action : this.defaultAction;
                        this.target = typeof kwArgs.target == "function" ? kwArgs.target : this.defaultTarget;
                        this.text = typeof kwArgs.text == "function" ? kwArgs.text : this.defaultText;
                    }, Clipboard.prototype.listenClick = function (trigger) {
                        var b = this;
                        this.listener = (0, _normalizeDataUri2.default)(trigger, "click", function (s) {
                            return b.onClick(s);
                        });
                    }, Clipboard.prototype.onClick = function (e) {
                        var name = e.delegateTarget || e.currentTarget;
                        if (this.clipboardAction) {
                            /** @type {null} */
                            this.clipboardAction = null;
                        }
                        this.clipboardAction = new _clipboardAction2.default({
                            action: this.action(name),
                            target: this.target(name),
                            text: this.text(name),
                            trigger: name,
                            emitter: this
                        });
                    }, Clipboard.prototype.defaultAction = function (type) {
                        return getAttributeValue("action", type);
                    }, Clipboard.prototype.defaultTarget = function (name) {
                        var selector = getAttributeValue("target", name);
                        if (selector) {
                            return document.querySelector(selector);
                        }
                    }, Clipboard.prototype.defaultText = function (value) {
                        return getAttributeValue("text", value);
                    }, Clipboard.prototype.destroy = function () {
                        this.listener.destroy();
                        if (this.clipboardAction) {
                            this.clipboardAction.destroy();
                            /** @type {null} */
                            this.clipboardAction = null;
                        }
                    }, Clipboard;
                }(_prepareStyleProperties2.default);
                module.exports = storeMixin;
            });
        }, {
            "./clipboard-action": 8,
            "good-listener": 4,
            "tiny-emitter": 7
        }]
    }, {}, [9])(9);
}), !function (window, doc, exportName, undefined) {
    /**
     * @param {!Function} fn
     * @param {?} timeout
     * @param {?} context
     * @return {?}
     */
    function setTimeoutContext(fn, timeout, context) {
        return setTimeout(bindFn(fn, context), timeout);
    }

    /**
     * @param {!Object} arg
     * @param {string} fn
     * @param {!Object} context
     * @return {?}
     */
    function invokeArrayArg(arg, fn, context) {
        return Array.isArray(arg) ? (each(arg, context[fn], context), true) : false;
    }

    /**
     * @param {string} obj
     * @param {!Function} iterator
     * @param {!Object} context
     * @return {undefined}
     */
    function each(obj, iterator, context) {
        var i;
        if (obj) {
            if (obj.forEach) {
                obj.forEach(iterator, context);
            } else {
                if (obj.length !== undefined) {
                    /** @type {number} */
                    i = 0;
                    for (; i < obj.length;) {
                        iterator.call(context, obj[i], i, obj);
                        i++;
                    }
                } else {
                    for (i in obj) {
                        if (obj.hasOwnProperty(i)) {
                            iterator.call(context, obj[i], i, obj);
                        }
                    }
                }
            }
        }
    }

    /**
     * @param {!Function} callback
     * @param {string} fn
     * @param {string} deprecationWarning
     * @return {?}
     */
    function deprecate(callback, fn, deprecationWarning) {
        /** @type {string} */
        var nexv = "DEPRECATED METHOD: " + fn + "\n" + deprecationWarning + " AT \n";
        return function () {
            /** @type {!Error} */
            var e = new Error("get-stack-trace");
            /** @type {string} */
            var prev = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, "").replace(/^\s+at\s+/gm, "").replace(/^Object.<anonymous>\s*\(/gm, "{anonymous}()@") : "Unknown Stack Trace";
            /** @type {function(this:Console, ...*): undefined} */
            var deltaUpdate = window.console && (window.console.warn || window.console.log);
            return deltaUpdate && deltaUpdate.call(window.console, nexv, prev), callback.apply(this, arguments);
        };
    }

    /**
     * @param {!Object} child
     * @param {!Function} base
     * @param {?} prototype
     * @return {undefined}
     */
    function inherit(child, base, prototype) {
        var childP;
        var baseP = base.prototype;
        /** @type {!Object} */
        childP = child.prototype = Object.create(baseP);
        /** @type {!Object} */
        childP.constructor = child;
        childP._super = baseP;
        if (prototype) {
            assign(childP, prototype);
        }
    }

    /**
     * @param {!Function} fn
     * @param {?} context
     * @return {?}
     */
    function bindFn(fn, context) {
        return function () {
            return fn.apply(context, arguments);
        };
    }

    /**
     * @param {!Function} val
     * @param {?} args
     * @return {?}
     */
    function boolOrFn(val, args) {
        return typeof val == string ? val.apply(args ? args[0] || undefined : undefined, args) : val;
    }

    /**
     * @param {string} val1
     * @param {string} val2
     * @return {?}
     */
    function ifUndefined(val1, val2) {
        return val1 === undefined ? val2 : val1;
    }

    /**
     * @param {string} event
     * @param {string} name
     * @param {!Function} type
     * @return {undefined}
     */
    function addEventListeners(event, name, type) {
        each(off(name), function (b) {
            event.addEventListener(b, type, false);
        });
    }

    /**
     * @param {!Object} events
     * @param {string} name
     * @param {?} handler
     * @return {undefined}
     */
    function removeEventListeners(events, name, handler) {
        each(off(name), function (win) {
            events.removeEventListener(win, handler, false);
        });
    }

    /**
     * @param {!Element} parent
     * @param {!Element} node
     * @return {?}
     */
    function hasParent(parent, node) {
        for (; parent;) {
            if (parent == node) {
                return true;
            }
            parent = parent.parentNode;
        }
        return false;
    }

    /**
     * @param {string} url
     * @param {string} find
     * @return {?}
     */
    function fn(url, find) {
        return url.indexOf(find) > -1;
    }

    /**
     * @param {string} name
     * @return {?}
     */
    function off(name) {
        return name.trim().split(/\s+/g);
    }

    /**
     * @param {!Array} src
     * @param {!Object} find
     * @param {string} findByKey
     * @return {?}
     */
    function inArray(src, find, findByKey) {
        if (src.indexOf && !findByKey) {
            return src.indexOf(find);
        }
        /** @type {number} */
        var i = 0;
        for (; i < src.length;) {
            if (findByKey && src[i][findByKey] == find || !findByKey && src[i] === find) {
                return i;
            }
            i++;
        }
        return -1;
    }

    /**
     * @param {?} elemntList
     * @return {?}
     */
    function toArray(elemntList) {
        return Array.prototype.slice.call(elemntList, 0);
    }

    /**
     * @param {!NodeList} c
     * @param {string} b
     * @param {boolean} array
     * @return {?}
     */
    function uniqueArray(c, b, array) {
        /** @type {!Array} */
        var f = [];
        /** @type {!Array} */
        var values = [];
        /** @type {number} */
        var i = 0;
        for (; i < c.length;) {
            var name = b ? c[i][b] : c[i];
            if (inArray(values, name) < 0) {
                f.push(c[i]);
            }
            values[i] = name;
            i++;
        }
        return array && (f = b ? f.sort(function (scores, wordCounts) {
            return scores[b] > wordCounts[b];
        }) : f.sort()), f;
    }

    /**
     * @param {!Object} elem
     * @param {string} property
     * @return {?}
     */
    function prefixed(elem, property) {
        var prefix;
        var prop;
        var id = property[0].toUpperCase() + property.slice(1);
        /** @type {number} */
        var i = 0;
        for (; i < VENDOR_PREFIXES.length;) {
            if (prefix = VENDOR_PREFIXES[i], prop = prefix ? prefix + id : property, prop in elem) {
                return prop;
            }
            i++;
        }
        return undefined;
    }

    /**
     * @return {?}
     */
    function uniqueId() {
        return bu++;
    }

    /**
     * @param {!Object} element
     * @return {?}
     */
    function getWindowForElement(element) {
        var doc = element.ownerDocument || element;
        return doc.defaultView || doc.parentWindow || window;
    }

    /**
     * @param {!Object} manager
     * @param {!Function} callback
     * @return {undefined}
     */
    function Input(manager, callback) {
        var shortcut = this;
        /** @type {!Object} */
        this.manager = manager;
        /** @type {!Function} */
        this.callback = callback;
        this.element = manager.element;
        this.target = manager.options.inputTarget;
        /**
         * @param {!Object} ev
         * @return {undefined}
         */
        this.domHandler = function (ev) {
            if (boolOrFn(manager.options.enable, [manager])) {
                shortcut.handler(ev);
            }
        };
        this.init();
    }

    /**
     * @param {!Object} manager
     * @return {?}
     */
    function createInputInstance(manager) {
        var _minsnap;
        var snap = manager.options.inputClass;
        return new (_minsnap = snap ? snap : rawDataIsArray ? PointerEventInput : rawDataIsList ? TouchInput : IS_TOUCH_ENABLED ? TouchMouseInput : MouseInput)(manager, inputHandler);
    }

    /**
     * @param {?} manager
     * @param {string} eventType
     * @param {!Object} input
     * @return {undefined}
     */
    function inputHandler(manager, eventType, input) {
        var maxNrStages = input.pointers.length;
        var nrStages = input.changedPointers.length;
        /** @type {(boolean|number)} */
        var f = eventType & INPUT_START && maxNrStages - nrStages === 0;
        /** @type {(boolean|number)} */
        var g = eventType & (INPUT_END | INPUT_CANCEL) && maxNrStages - nrStages === 0;
        /** @type {boolean} */
        input.isFirst = !!f;
        /** @type {boolean} */
        input.isFinal = !!g;
        if (f) {
            manager.session = {};
        }
        /** @type {string} */
        input.eventType = eventType;
        computeInputData(manager, input);
        manager.emit("hammer.input", input);
        manager.recognize(input);
        /** @type {!Object} */
        manager.session.prevInput = input;
    }

    /**
     * @param {!Object} manager
     * @param {!Object} input
     * @return {undefined}
     */
    function computeInputData(manager, input) {
        var session = manager.session;
        var pointers = input.pointers;
        var pointersLength = pointers.length;
        if (!session.firstInput) {
            session.firstInput = simpleCloneInputData(input);
        }
        if (pointersLength > 1 && !session.firstMultiple) {
            session.firstMultiple = simpleCloneInputData(input);
        } else {
            if (1 === pointersLength) {
                /** @type {boolean} */
                session.firstMultiple = false;
            }
        }
        var firstInput = session.firstInput;
        var firstMultiple = session.firstMultiple;
        var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;
        var center = input.center = getCenter(pointers);
        /** @type {number} */
        input.timeStamp = now();
        /** @type {number} */
        input.deltaTime = input.timeStamp - firstInput.timeStamp;
        input.angle = getAngle(offsetCenter, center);
        input.distance = getDistance(offsetCenter, center);
        computeDeltaXY(session, input);
        input.offsetDirection = getDirection(input.deltaX, input.deltaY);
        var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
        input.overallVelocityX = overallVelocity.x;
        input.overallVelocityY = overallVelocity.y;
        input.overallVelocity = abs(overallVelocity.x) > abs(overallVelocity.y) ? overallVelocity.x : overallVelocity.y;
        input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
        input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;
        input.maxPointers = session.prevInput ? input.pointers.length > session.prevInput.maxPointers ? input.pointers.length : session.prevInput.maxPointers : input.pointers.length;
        computeIntervalInputData(session, input);
        var target = manager.element;
        if (hasParent(input.srcEvent.target, target)) {
            target = input.srcEvent.target;
        }
        input.target = target;
    }

    /**
     * @param {?} session
     * @param {!Object} input
     * @return {undefined}
     */
    function computeDeltaXY(session, input) {
        var c = input.center;
        var b = session.offsetDelta || {};
        var xhair = session.prevDelta || {};
        var prevInput = session.prevInput || {};
        if (!(input.eventType !== INPUT_START && prevInput.eventType !== INPUT_END)) {
            xhair = session.prevDelta = {
                x: prevInput.deltaX || 0,
                y: prevInput.deltaY || 0
            };
            b = session.offsetDelta = {
                x: c.x,
                y: c.y
            };
        }
        input.deltaX = xhair.x + (c.x - b.x);
        input.deltaY = xhair.y + (c.y - b.y);
    }

    /**
     * @param {!Object} session
     * @param {!Object} input
     * @return {undefined}
     */
    function computeIntervalInputData(session, input) {
        var velocity;
        var velocityX;
        var velocityY;
        var direction;
        var last = session.lastInterval || input;
        /** @type {number} */
        var deltaTime = input.timeStamp - last.timeStamp;
        if (input.eventType != INPUT_CANCEL && (deltaTime > CAL_INTERVAL || last.velocity === undefined)) {
            /** @type {number} */
            var deltaX = input.deltaX - last.deltaX;
            /** @type {number} */
            var deltaY = input.deltaY - last.deltaY;
            var v = getVelocity(deltaTime, deltaX, deltaY);
            velocityX = v.x;
            velocityY = v.y;
            velocity = abs(v.x) > abs(v.y) ? v.x : v.y;
            direction = getDirection(deltaX, deltaY);
            /** @type {!Object} */
            session.lastInterval = input;
        } else {
            velocity = last.velocity;
            velocityX = last.velocityX;
            velocityY = last.velocityY;
            direction = last.direction;
        }
        input.velocity = velocity;
        input.velocityX = velocityX;
        input.velocityY = velocityY;
        input.direction = direction;
    }

    /**
     * @param {!Object} input
     * @return {?}
     */
    function simpleCloneInputData(input) {
        /** @type {!Array} */
        var pointers = [];
        /** @type {number} */
        var i = 0;
        for (; i < input.pointers.length;) {
            pointers[i] = {
                clientX: round(input.pointers[i].clientX),
                clientY: round(input.pointers[i].clientY)
            };
            i++;
        }
        return {
            timeStamp: now(),
            pointers: pointers,
            center: getCenter(pointers),
            deltaX: input.deltaX,
            deltaY: input.deltaY
        };
    }

    /**
     * @param {!Array} pointers
     * @return {?}
     */
    function getCenter(pointers) {
        var pointersLength = pointers.length;
        if (1 === pointersLength) {
            return {
                x: round(pointers[0].clientX),
                y: round(pointers[0].clientY)
            };
        }
        /** @type {number} */
        var x = 0;
        /** @type {number} */
        var y = 0;
        /** @type {number} */
        var i = 0;
        for (; pointersLength > i;) {
            x = x + pointers[i].clientX;
            y = y + pointers[i].clientY;
            i++;
        }
        return {
            x: round(x / pointersLength),
            y: round(y / pointersLength)
        };
    }

    /**
     * @param {number} deltaTime
     * @param {number} x
     * @param {number} y
     * @return {?}
     */
    function getVelocity(deltaTime, x, y) {
        return {
            x: x / deltaTime || 0,
            y: y / deltaTime || 0
        };
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {?}
     */
    function getDirection(x, y) {
        return x === y ? DIRECTION_NONE : abs(x) >= abs(y) ? 0 > x ? left : right : 0 > y ? DIRECTION_UP : DIRECTION_DOWN;
    }

    /**
     * @param {?} p1
     * @param {?} p2
     * @param {!Array} props
     * @return {?}
     */
    function getDistance(p1, p2, props) {
        if (!props) {
            /** @type {!Array} */
            props = PROPS_XY;
        }
        /** @type {number} */
        var lightI = p2[props[0]] - p1[props[0]];
        /** @type {number} */
        var lightJ = p2[props[1]] - p1[props[1]];
        return Math.sqrt(lightI * lightI + lightJ * lightJ);
    }

    /**
     * @param {?} p1
     * @param {?} p2
     * @param {!Array} props
     * @return {?}
     */
    function getAngle(p1, p2, props) {
        if (!props) {
            /** @type {!Array} */
            props = PROPS_XY;
        }
        /** @type {number} */
        var mouseStartXFromCentre = p2[props[0]] - p1[props[0]];
        /** @type {number} */
        var trueAnomalyY = p2[props[1]] - p1[props[1]];
        return 180 * Math.atan2(trueAnomalyY, mouseStartXFromCentre) / Math.PI;
    }

    /**
     * @param {!Object} start
     * @param {!Object} end
     * @return {?}
     */
    function getRotation(start, end) {
        return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
    }

    /**
     * @param {!Object} start
     * @param {!Object} end
     * @return {?}
     */
    function getScale(start, end) {
        return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
    }

    /**
     * @return {undefined}
     */
    function MouseInput() {
        /** @type {string} */
        this.evEl = MOUSE_ELEMENT_EVENTS;
        /** @type {string} */
        this.evWin = POINTER_WINDOW_EVENTS;
        /** @type {boolean} */
        this.pressed = false;
        Input.apply(this, arguments);
    }

    /**
     * @return {undefined}
     */
    function PointerEventInput() {
        this.evEl = POINTER_ELEMENT_EVENTS;
        this.evWin = MOUSE_WINDOW_EVENTS;
        Input.apply(this, arguments);
        /** @type {!Array} */
        this.store = this.manager.session.pointerEvents = [];
    }

    /**
     * @return {undefined}
     */
    function SingleTouchInput() {
        /** @type {string} */
        this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
        /** @type {string} */
        this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
        /** @type {boolean} */
        this.started = false;
        Input.apply(this, arguments);
    }

    /**
     * @param {!Event} ev
     * @param {number} type
     * @return {?}
     */
    function normalizeSingleTouches(ev, type) {
        var targetTouches = toArray(ev.touches);
        var changedTargetTouches = toArray(ev.changedTouches);
        return type & (INPUT_END | INPUT_CANCEL) && (targetTouches = uniqueArray(targetTouches.concat(changedTargetTouches), "identifier", true)), [targetTouches, changedTargetTouches];
    }

    /**
     * @return {undefined}
     */
    function TouchInput() {
        /** @type {string} */
        this.evTarget = TOUCH_TARGET_EVENTS;
        this.targetIds = {};
        Input.apply(this, arguments);
    }

    /**
     * @param {!Event} e
     * @param {number} type
     * @return {?}
     */
    function getTouches(e, type) {
        var allTouches = toArray(e.touches);
        var targetIds = this.targetIds;
        if (type & (INPUT_START | INPUT_MOVE) && 1 === allTouches.length) {
            return targetIds[allTouches[0].identifier] = true, [allTouches, allTouches];
        }
        var i;
        var targetTouches;
        var changedTouches = toArray(e.changedTouches);
        /** @type {!Array} */
        var changedTargetTouches = [];
        var target = this.target;
        if (targetTouches = allTouches.filter(function (touch) {
            return hasParent(touch.target, target);
        }), type === INPUT_START) {
            /** @type {number} */
            i = 0;
            for (; i < targetTouches.length;) {
                /** @type {boolean} */
                targetIds[targetTouches[i].identifier] = true;
                i++;
            }
        }
        /** @type {number} */
        i = 0;
        for (; i < changedTouches.length;) {
            if (targetIds[changedTouches[i].identifier]) {
                changedTargetTouches.push(changedTouches[i]);
            }
            if (type & (INPUT_END | INPUT_CANCEL)) {
                delete targetIds[changedTouches[i].identifier];
            }
            i++;
        }
        return changedTargetTouches.length ? [uniqueArray(targetTouches.concat(changedTargetTouches), "identifier", true), changedTargetTouches] : void 0;
    }

    /**
     * @return {undefined}
     */
    function TouchMouseInput() {
        Input.apply(this, arguments);
        var handler = bindFn(this.handler, this);
        this.touch = new TouchInput(this.manager, handler);
        this.mouse = new MouseInput(this.manager, handler);
        /** @type {null} */
        this.primaryTouch = null;
        /** @type {!Array} */
        this.lastTouches = [];
    }

    /**
     * @param {number} eventType
     * @param {!Object} eventData
     * @return {undefined}
     */
    function recordTouches(eventType, eventData) {
        if (eventType & INPUT_START) {
            this.primaryTouch = eventData.changedPointers[0].identifier;
            setLastTouch.call(this, eventData);
        } else {
            if (eventType & (INPUT_END | INPUT_CANCEL)) {
                setLastTouch.call(this, eventData);
            }
        }
    }

    /**
     * @param {!Object} eventData
     * @return {undefined}
     */
    function setLastTouch(eventData) {
        var touch = eventData.changedPointers[0];
        if (touch.identifier === this.primaryTouch) {
            var c = {
                x: touch.clientX,
                y: touch.clientY
            };
            this.lastTouches.push(c);
            var lts = this.lastTouches;
            /**
             * @return {undefined}
             */
            var removeLastTouch = function () {
                var i = lts.indexOf(c);
                if (i > -1) {
                    lts.splice(i, 1);
                }
            };
            setTimeout(removeLastTouch, ngiScroll_timeout);
        }
    }

    /**
     * @param {!Object} eventData
     * @return {?}
     */
    function isSyntheticEvent(eventData) {
        var x = eventData.srcEvent.clientX;
        var y = eventData.srcEvent.clientY;
        /** @type {number} */
        var i = 0;
        for (; i < this.lastTouches.length; i++) {
            var t = this.lastTouches[i];
            /** @type {number} */
            var r = Math.abs(x - t.x);
            /** @type {number} */
            var b = Math.abs(y - t.y);
            if (g >= r && g >= b) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param {!Object} manager
     * @param {undefined} value
     * @return {undefined}
     */
    function TouchAction(manager, value) {
        /** @type {!Object} */
        this.manager = manager;
        this.set(value);
    }

    /**
     * @param {string} a
     * @return {?}
     */
    function interpolate(a) {
        if (fn(a, value)) {
            return value;
        }
        var o = fn(a, name);
        var d = fn(a, c);
        return o && d ? value : o || d ? o ? name : c : fn(a, b) ? b : diffUnequal;
    }

    /**
     * @return {?}
     */
    function getTouchActionProps() {
        if (!NATIVE_TOUCH_ACTION) {
            return false;
        }
        var touchMap = {};
        /** @type {(function(this:CSSInterface, string, string=): boolean|null)} */
        var cssSupports = window.CSS && window.CSS.supports;
        return ["auto", "manipulation", "pan-y", "pan-x", "pan-x pan-y", "none"].forEach(function (val) {
            /** @type {boolean} */
            touchMap[val] = cssSupports ? window.CSS.supports("touch-action", val) : true;
        }), touchMap;
    }

    /**
     * @param {number} options
     * @return {undefined}
     */
    function Recognizer(options) {
        this.options = assign({}, this.defaults, options || {});
        this.id = uniqueId();
        /** @type {null} */
        this.manager = null;
        this.options.enable = ifUndefined(this.options.enable, true);
        /** @type {number} */
        this.state = STATE_POSSIBLE;
        this.simultaneous = {};
        /** @type {!Array} */
        this.requireFail = [];
    }

    /**
     * @param {boolean} state
     * @return {?}
     */
    function stateStr(state) {
        return state & STATE_CANCELLED ? "cancel" : state & STATE_ENDED ? "end" : state & STATE_CHANGED ? "move" : state & STATE_BEGAN ? "start" : "";
    }

    /**
     * @param {number} dir
     * @return {?}
     */
    function $(dir) {
        return dir == DIRECTION_DOWN ? "down" : dir == DIRECTION_UP ? "up" : dir == left ? "left" : dir == right ? "right" : "";
    }

    /**
     * @param {!Object} arg
     * @param {!Window} task
     * @return {?}
     */
    function getRecognizerByNameIfManager(arg, task) {
        var context = task.manager;
        return context ? context.get(arg) : arg;
    }

    /**
     * @return {undefined}
     */
    function AttrRecognizer() {
        Recognizer.apply(this, arguments);
    }

    /**
     * @return {undefined}
     */
    function PanRecognizer() {
        AttrRecognizer.apply(this, arguments);
        /** @type {null} */
        this.pX = null;
        /** @type {null} */
        this.pY = null;
    }

    /**
     * @return {undefined}
     */
    function PinchRecognizer() {
        AttrRecognizer.apply(this, arguments);
    }

    /**
     * @return {undefined}
     */
    function PressRecognizer() {
        Recognizer.apply(this, arguments);
        /** @type {null} */
        this._timer = null;
        /** @type {null} */
        this._input = null;
    }

    /**
     * @return {undefined}
     */
    function RotateRecognizer() {
        AttrRecognizer.apply(this, arguments);
    }

    /**
     * @return {undefined}
     */
    function SwipeRecognizer() {
        AttrRecognizer.apply(this, arguments);
    }

    /**
     * @return {undefined}
     */
    function TapRecognizer() {
        Recognizer.apply(this, arguments);
        /** @type {boolean} */
        this.pTime = false;
        /** @type {boolean} */
        this.pCenter = false;
        /** @type {null} */
        this._timer = null;
        /** @type {null} */
        this._input = null;
        /** @type {number} */
        this.count = 0;
    }

    /**
     * @param {string} element
     * @param {!Object} options
     * @return {?}
     */
    function Hammer(element, options) {
        return options = options || {}, options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset), new Manager(element, options);
    }

    /**
     * @param {string} element
     * @param {number} options
     * @return {undefined}
     */
    function Manager(element, options) {
        this.options = assign({}, Hammer.defaults, options || {});
        this.options.inputTarget = this.options.inputTarget || element;
        this.handlers = {};
        this.session = {};
        /** @type {!Array} */
        this.recognizers = [];
        this.oldCssProps = {};
        /** @type {string} */
        this.element = element;
        this.input = createInputInstance(this);
        this.touchAction = new TouchAction(this, this.options.touchAction);
        toggleCssProps(this, true);
        each(this.options.recognizers, function (item) {
            var recognizer = this.add(new item[0](item[1]));
            if (item[2]) {
                recognizer.recognizeWith(item[2]);
            }
            if (item[3]) {
                recognizer.requireFailure(item[3]);
            }
        }, this);
    }

    /**
     * @param {!Object} manager
     * @param {boolean} add
     * @return {undefined}
     */
    function toggleCssProps(manager, add) {
        var element = manager.element;
        if (element.style) {
            var prop;
            each(manager.options.cssProps, function (cond, name) {
                prop = prefixed(element.style, name);
                if (add) {
                    manager.oldCssProps[prop] = element.style[prop];
                    /** @type {!Object} */
                    element.style[prop] = cond;
                } else {
                    element.style[prop] = manager.oldCssProps[prop] || "";
                }
            });
            if (!add) {
                manager.oldCssProps = {};
            }
        }
    }

    /**
     * @param {string} type
     * @param {!Object} data
     * @return {undefined}
     */
    function trigger(type, data) {
        /** @type {(Event|null)} */
        var event = doc.createEvent("Event");
        event.initEvent(type, true, true);
        /** @type {!Object} */
        event.gesture = data;
        data.target.dispatchEvent(event);
    }

    "use strict";
    var assign;
    /** @type {!Array} */
    var VENDOR_PREFIXES = ["", "webkit", "Moz", "MS", "ms", "o"];
    /** @type {!Element} */
    var TEST_ELEMENT = doc.createElement("div");
    /** @type {string} */
    var string = "function";
    /** @type {function(?): number} */
    var round = Math.round;
    /** @type {function(?): number} */
    var abs = Math.abs;
    /** @type {function(): number} */
    var now = Date.now;
    /** @type {!Function} */
    assign = "function" != typeof Object.assign ? function (target) {
        if (target === undefined || null === target) {
            throw new TypeError("Cannot convert undefined or null to object");
        }
        /** @type {!Object} */
        var obj = Object(target);
        /** @type {number} */
        var i = 1;
        for (; i < arguments.length; i++) {
            var node = arguments[i];
            if (node !== undefined && null !== node) {
                var p;
                for (p in node) {
                    if (node.hasOwnProperty(p)) {
                        obj[p] = node[p];
                    }
                }
            }
        }
        return obj;
    } : Object.assign;
    var extend = deprecate(function (a, b, optional) {
        /** @type {!Array<string>} */
        var keys = Object.keys(b);
        /** @type {number} */
        var i = 0;
        for (; i < keys.length;) {
            if (!optional || optional && a[keys[i]] === undefined) {
                a[keys[i]] = b[keys[i]];
            }
            i++;
        }
        return a;
    }, "extend", "Use `assign`.");
    var merge = deprecate(function (a, _s3Params) {
        return extend(a, _s3Params, true);
    }, "merge", "Use `assign`.");
    /** @type {number} */
    var bu = 1;
    /** @type {!RegExp} */
    var FIREFOX_LINUX = /mobile|tablet|ip(ad|hone|od)|android/i;
    /** @type {boolean} */
    var IS_TOUCH_ENABLED = "ontouchstart" in window;
    /** @type {boolean} */
    var rawDataIsArray = prefixed(window, "PointerEvent") !== undefined;
    /** @type {boolean} */
    var rawDataIsList = IS_TOUCH_ENABLED && FIREFOX_LINUX.test(navigator.userAgent);
    /** @type {string} */
    var INPUT_TYPE_TOUCH = "touch";
    /** @type {string} */
    var INPUT_TYPE_PEN = "pen";
    /** @type {string} */
    var INPUT_TYPE_MOUSE = "mouse";
    /** @type {string} */
    var INPUT_TYPE_KINECT = "kinect";
    /** @type {number} */
    var CAL_INTERVAL = 25;
    /** @type {number} */
    var INPUT_START = 1;
    /** @type {number} */
    var INPUT_MOVE = 2;
    /** @type {number} */
    var INPUT_END = 4;
    /** @type {number} */
    var INPUT_CANCEL = 8;
    /** @type {number} */
    var DIRECTION_NONE = 1;
    /** @type {number} */
    var left = 2;
    /** @type {number} */
    var right = 4;
    /** @type {number} */
    var DIRECTION_UP = 8;
    /** @type {number} */
    var DIRECTION_DOWN = 16;
    /** @type {number} */
    var DIRECTION_HORIZONTAL = left | right;
    /** @type {number} */
    var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
    /** @type {number} */
    var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;
    /** @type {!Array} */
    var PROPS_XY = ["x", "y"];
    /** @type {!Array} */
    var PROPS_CLIENT_XY = ["clientX", "clientY"];
    Input.prototype = {
        handler: function () {
        },
        init: function () {
            if (this.evEl) {
                addEventListeners(this.element, this.evEl, this.domHandler);
            }
            if (this.evTarget) {
                addEventListeners(this.target, this.evTarget, this.domHandler);
            }
            if (this.evWin) {
                addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
            }
        },
        destroy: function () {
            if (this.evEl) {
                removeEventListeners(this.element, this.evEl, this.domHandler);
            }
            if (this.evTarget) {
                removeEventListeners(this.target, this.evTarget, this.domHandler);
            }
            if (this.evWin) {
                removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
            }
        }
    };
    var MOUSE_INPUT_MAP = {
        mousedown: INPUT_START,
        mousemove: INPUT_MOVE,
        mouseup: INPUT_END
    };
    /** @type {string} */
    var MOUSE_ELEMENT_EVENTS = "mousedown";
    /** @type {string} */
    var POINTER_WINDOW_EVENTS = "mousemove mouseup";
    inherit(MouseInput, Input, {
        handler: function (ev) {
            var eventType = MOUSE_INPUT_MAP[ev.type];
            if (eventType & INPUT_START && 0 === ev.button) {
                /** @type {boolean} */
                this.pressed = true;
            }
            if (eventType & INPUT_MOVE && 1 !== ev.which) {
                /** @type {number} */
                eventType = INPUT_END;
            }
            if (this.pressed) {
                if (eventType & INPUT_END) {
                    /** @type {boolean} */
                    this.pressed = false;
                }
                this.callback(this.manager, eventType, {
                    pointers: [ev],
                    changedPointers: [ev],
                    pointerType: INPUT_TYPE_MOUSE,
                    srcEvent: ev
                });
            }
        }
    });
    var POINTER_INPUT_MAP = {
        pointerdown: INPUT_START,
        pointermove: INPUT_MOVE,
        pointerup: INPUT_END,
        pointercancel: INPUT_CANCEL,
        pointerout: INPUT_CANCEL
    };
    var IE10_POINTER_TYPE_ENUM = {
        2: INPUT_TYPE_TOUCH,
        3: INPUT_TYPE_PEN,
        4: INPUT_TYPE_MOUSE,
        5: INPUT_TYPE_KINECT
    };
    /** @type {string} */
    var POINTER_ELEMENT_EVENTS = "pointerdown";
    /** @type {string} */
    var MOUSE_WINDOW_EVENTS = "pointermove pointerup pointercancel";
    if (window.MSPointerEvent && !window.PointerEvent) {
        /** @type {string} */
        POINTER_ELEMENT_EVENTS = "MSPointerDown";
        /** @type {string} */
        MOUSE_WINDOW_EVENTS = "MSPointerMove MSPointerUp MSPointerCancel";
    }
    inherit(PointerEventInput, Input, {
        handler: function (ev) {
            var store = this.store;
            /** @type {boolean} */
            var c = false;
            var eventTypeNormalized = ev.type.toLowerCase().replace("ms", "");
            var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
            var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;
            /** @type {boolean} */
            var isTouch = pointerType == INPUT_TYPE_TOUCH;
            var storeIndex = inArray(store, ev.pointerId, "pointerId");
            if (eventType & INPUT_START && (0 === ev.button || isTouch)) {
                if (0 > storeIndex) {
                    store.push(ev);
                    /** @type {number} */
                    storeIndex = store.length - 1;
                }
            } else {
                if (eventType & (INPUT_END | INPUT_CANCEL)) {
                    /** @type {boolean} */
                    c = true;
                }
            }
            if (!(0 > storeIndex)) {
                /** @type {!Object} */
                store[storeIndex] = ev;
                this.callback(this.manager, eventType, {
                    pointers: store,
                    changedPointers: [ev],
                    pointerType: pointerType,
                    srcEvent: ev
                });
                if (c) {
                    store.splice(storeIndex, 1);
                }
            }
        }
    });
    var TOUCH_INPUT_MAP = {
        touchstart: INPUT_START,
        touchmove: INPUT_MOVE,
        touchend: INPUT_END,
        touchcancel: INPUT_CANCEL
    };
    /** @type {string} */
    var SINGLE_TOUCH_TARGET_EVENTS = "touchstart";
    /** @type {string} */
    var SINGLE_TOUCH_WINDOW_EVENTS = "touchstart touchmove touchend touchcancel";
    inherit(SingleTouchInput, Input, {
        handler: function (ev) {
            var type = TOUCH_INPUT_MAP[ev.type];
            if (type === INPUT_START && (this.started = true), this.started) {
                var touches = normalizeSingleTouches.call(this, ev, type);
                if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
                    /** @type {boolean} */
                    this.started = false;
                }
                this.callback(this.manager, type, {
                    pointers: touches[0],
                    changedPointers: touches[1],
                    pointerType: INPUT_TYPE_TOUCH,
                    srcEvent: ev
                });
            }
        }
    });
    var SINGLE_TOUCH_INPUT_MAP = {
        touchstart: INPUT_START,
        touchmove: INPUT_MOVE,
        touchend: INPUT_END,
        touchcancel: INPUT_CANCEL
    };
    /** @type {string} */
    var TOUCH_TARGET_EVENTS = "touchstart touchmove touchend touchcancel";
    inherit(TouchInput, Input, {
        handler: function (ev) {
            var type = SINGLE_TOUCH_INPUT_MAP[ev.type];
            var touches = getTouches.call(this, ev, type);
            if (touches) {
                this.callback(this.manager, type, {
                    pointers: touches[0],
                    changedPointers: touches[1],
                    pointerType: INPUT_TYPE_TOUCH,
                    srcEvent: ev
                });
            }
        }
    });
    /** @type {number} */
    var ngiScroll_timeout = 2500;
    /** @type {number} */
    var g = 25;
    inherit(TouchMouseInput, Input, {
        handler: function (type, inputEvent, inputData) {
            /** @type {boolean} */
            var isTouch = inputData.pointerType == INPUT_TYPE_TOUCH;
            /** @type {boolean} */
            var isMouse = inputData.pointerType == INPUT_TYPE_MOUSE;
            if (!(isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents)) {
                if (isTouch) {
                    recordTouches.call(this, inputEvent, inputData);
                } else {
                    if (isMouse && isSyntheticEvent.call(this, inputData)) {
                        return;
                    }
                }
                this.callback(type, inputEvent, inputData);
            }
        },
        destroy: function () {
            this.touch.destroy();
            this.mouse.destroy();
        }
    });
    var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, "touchAction");
    /** @type {boolean} */
    var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;
    /** @type {string} */
    var TOUCH_ACTION_COMPUTE = "compute";
    /** @type {string} */
    var diffUnequal = "auto";
    /** @type {string} */
    var b = "manipulation";
    /** @type {string} */
    var value = "none";
    /** @type {string} */
    var name = "pan-x";
    /** @type {string} */
    var c = "pan-y";
    var TOUCH_ACTION_MAP = getTouchActionProps();
    TouchAction.prototype = {
        set: function (value) {
            if (value == TOUCH_ACTION_COMPUTE) {
                value = this.compute();
            }
            if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
                /** @type {string} */
                this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
            }
            this.actions = value.toLowerCase().trim();
        },
        update: function () {
            this.set(this.manager.options.touchAction);
        },
        compute: function () {
            /** @type {!Array} */
            var sortedFolderIds = [];
            return each(this.manager.recognizers, function (recognizer) {
                if (boolOrFn(recognizer.options.enable, [recognizer])) {
                    sortedFolderIds = sortedFolderIds.concat(recognizer.getTouchAction());
                }
            }), interpolate(sortedFolderIds.join(" "));
        },
        preventDefaults: function (input) {
            var srcEvent = input.srcEvent;
            var direction = input.offsetDirection;
            if (this.manager.session.prevented) {
                return void srcEvent.preventDefault();
            }
            var a = this.actions;
            var hasNone = fn(a, value) && !TOUCH_ACTION_MAP[value];
            var hasPanY = fn(a, c) && !TOUCH_ACTION_MAP[c];
            var hasPanX = fn(a, name) && !TOUCH_ACTION_MAP[name];
            if (hasNone) {
                /** @type {boolean} */
                var h = 1 === input.pointers.length;
                /** @type {boolean} */
                var sw = input.distance < 2;
                /** @type {boolean} */
                var sh = input.deltaTime < 250;
                if (h && sw && sh) {
                    return;
                }
            }
            return hasPanX && hasPanY ? void 0 : hasNone || hasPanY && direction & DIRECTION_HORIZONTAL || hasPanX && direction & DIRECTION_VERTICAL ? this.preventSrc(srcEvent) : void 0;
        },
        preventSrc: function (srcEvent) {
            /** @type {boolean} */
            this.manager.session.prevented = true;
            srcEvent.preventDefault();
        }
    };
    /** @type {number} */
    var STATE_POSSIBLE = 1;
    /** @type {number} */
    var STATE_BEGAN = 2;
    /** @type {number} */
    var STATE_CHANGED = 4;
    /** @type {number} */
    var STATE_ENDED = 8;
    /** @type {number} */
    var STATE_RECOGNIZED = STATE_ENDED;
    /** @type {number} */
    var STATE_CANCELLED = 16;
    /** @type {number} */
    var STATE_FAILED = 32;
    Recognizer.prototype = {
        defaults: {},
        set: function (a) {
            return assign(this.options, a), this.manager && this.manager.touchAction.update(), this;
        },
        recognizeWith: function (otherRecognizer) {
            if (invokeArrayArg(otherRecognizer, "recognizeWith", this)) {
                return this;
            }
            var simultaneous = this.simultaneous;
            return otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this), simultaneous[otherRecognizer.id] || (simultaneous[otherRecognizer.id] = otherRecognizer, otherRecognizer.recognizeWith(this)), this;
        },
        dropRecognizeWith: function (otherRecognizer) {
            return invokeArrayArg(otherRecognizer, "dropRecognizeWith", this) ? this : (otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this), delete this.simultaneous[otherRecognizer.id], this);
        },
        requireFailure: function (otherRecognizer) {
            if (invokeArrayArg(otherRecognizer, "requireFailure", this)) {
                return this;
            }
            var requireFail = this.requireFail;
            return otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this), -1 === inArray(requireFail, otherRecognizer) && (requireFail.push(otherRecognizer), otherRecognizer.requireFailure(this)), this;
        },
        dropRequireFailure: function (otherRecognizer) {
            if (invokeArrayArg(otherRecognizer, "dropRequireFailure", this)) {
                return this;
            }
            otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
            var index = inArray(this.requireFail, otherRecognizer);
            return index > -1 && this.requireFail.splice(index, 1), this;
        },
        hasRequireFailures: function () {
            return this.requireFail.length > 0;
        },
        canRecognizeWith: function (otherRecognizer) {
            return !!this.simultaneous[otherRecognizer.id];
        },
        emit: function (value) {
            /**
             * @param {undefined} name
             * @return {undefined}
             */
            function emit(name) {
                that.manager.emit(name, value);
            }

            var that = this;
            var state = this.state;
            if (STATE_ENDED > state) {
                emit(that.options.event + stateStr(state));
            }
            emit(that.options.event);
            if (value.additionalEvent) {
                emit(value.additionalEvent);
            }
            if (state >= STATE_ENDED) {
                emit(that.options.event + stateStr(state));
            }
        },
        tryEmit: function (input) {
            return this.canEmit() ? this.emit(input) : void (this.state = STATE_FAILED);
        },
        canEmit: function () {
            /** @type {number} */
            var i = 0;
            for (; i < this.requireFail.length;) {
                if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                    return false;
                }
                i++;
            }
            return true;
        },
        recognize: function (inputData) {
            var inputDataClone = assign({}, inputData);
            return boolOrFn(this.options.enable, [this, inputDataClone]) ? (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED) && (this.state = STATE_POSSIBLE), this.state = this.process(inputDataClone), void (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED) && this.tryEmit(inputDataClone))) : (this.reset(), void (this.state = STATE_FAILED));
        },
        process: function (input) {
        },
        getTouchAction: function () {
        },
        reset: function () {
        }
    };
    inherit(AttrRecognizer, Recognizer, {
        defaults: {
            pointers: 1
        },
        attrTest: function (input) {
            var optionPointers = this.options.pointers;
            return 0 === optionPointers || input.pointers.length === optionPointers;
        },
        process: function (input) {
            var state = this.state;
            var eventType = input.eventType;
            /** @type {number} */
            var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
            var isValid = this.attrTest(input);
            return isRecognized && (eventType & INPUT_CANCEL || !isValid) ? state | STATE_CANCELLED : isRecognized || isValid ? eventType & INPUT_END ? state | STATE_ENDED : state & STATE_BEGAN ? state | STATE_CHANGED : STATE_BEGAN : STATE_FAILED;
        }
    });
    inherit(PanRecognizer, AttrRecognizer, {
        defaults: {
            event: "pan",
            threshold: 10,
            pointers: 1,
            direction: DIRECTION_ALL
        },
        getTouchAction: function () {
            var direction = this.options.direction;
            /** @type {!Array} */
            var b = [];
            return direction & DIRECTION_HORIZONTAL && b.push(c), direction & DIRECTION_VERTICAL && b.push(name), b;
        },
        directionTest: function (input) {
            var options = this.options;
            /** @type {boolean} */
            var hasMoved = true;
            var distance = input.distance;
            var direction = input.direction;
            var x = input.deltaX;
            var y = input.deltaY;
            return direction & options.direction || (options.direction & DIRECTION_HORIZONTAL ? (direction = 0 === x ? DIRECTION_NONE : 0 > x ? left : right, hasMoved = x != this.pX, distance = Math.abs(input.deltaX)) : (direction = 0 === y ? DIRECTION_NONE : 0 > y ? DIRECTION_UP : DIRECTION_DOWN, hasMoved = y != this.pY, distance = Math.abs(input.deltaY))), input.direction = direction, hasMoved && distance > options.threshold && direction & options.direction;
        },
        attrTest: function (input) {
            return AttrRecognizer.prototype.attrTest.call(this, input) && (this.state & STATE_BEGAN || !(this.state & STATE_BEGAN) && this.directionTest(input));
        },
        emit: function (input) {
            this.pX = input.deltaX;
            this.pY = input.deltaY;
            var direction = $(input.direction);
            if (direction) {
                input.additionalEvent = this.options.event + direction;
            }
            this._super.emit.call(this, input);
        }
    });
    inherit(PinchRecognizer, AttrRecognizer, {
        defaults: {
            event: "pinch",
            threshold: 0,
            pointers: 2
        },
        getTouchAction: function () {
            return [value];
        },
        attrTest: function (input) {
            return this._super.attrTest.call(this, input) && (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
        },
        emit: function (input) {
            if (1 !== input.scale) {
                /** @type {string} */
                var inOut = input.scale < 1 ? "in" : "out";
                /** @type {string} */
                input.additionalEvent = this.options.event + inOut;
            }
            this._super.emit.call(this, input);
        }
    });
    inherit(PressRecognizer, Recognizer, {
        defaults: {
            event: "press",
            pointers: 1,
            time: 251,
            threshold: 9
        },
        getTouchAction: function () {
            return [diffUnequal];
        },
        process: function (input) {
            var options = this.options;
            /** @type {boolean} */
            var c = input.pointers.length === options.pointers;
            /** @type {boolean} */
            var s = input.distance < options.threshold;
            /** @type {boolean} */
            var f = input.deltaTime > options.time;
            if (this._input = input, !s || !c || input.eventType & (INPUT_END | INPUT_CANCEL) && !f) {
                this.reset();
            } else {
                if (input.eventType & INPUT_START) {
                    this.reset();
                    this._timer = setTimeoutContext(function () {
                        /** @type {number} */
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.time, this);
                } else {
                    if (input.eventType & INPUT_END) {
                        return STATE_RECOGNIZED;
                    }
                }
            }
            return STATE_FAILED;
        },
        reset: function () {
            clearTimeout(this._timer);
        },
        emit: function (input) {
            if (this.state === STATE_RECOGNIZED) {
                if (input && input.eventType & INPUT_END) {
                    this.manager.emit(this.options.event + "up", input);
                } else {
                    /** @type {number} */
                    this._input.timeStamp = now();
                    this.manager.emit(this.options.event, this._input);
                }
            }
        }
    });
    inherit(RotateRecognizer, AttrRecognizer, {
        defaults: {
            event: "rotate",
            threshold: 0,
            pointers: 2
        },
        getTouchAction: function () {
            return [value];
        },
        attrTest: function (input) {
            return this._super.attrTest.call(this, input) && (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
        }
    });
    inherit(SwipeRecognizer, AttrRecognizer, {
        defaults: {
            event: "swipe",
            threshold: 10,
            velocity: .3,
            direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
            pointers: 1
        },
        getTouchAction: function () {
            return PanRecognizer.prototype.getTouchAction.call(this);
        },
        attrTest: function (input) {
            var velocity;
            var direction = this.options.direction;
            return direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL) ? velocity = input.overallVelocity : direction & DIRECTION_HORIZONTAL ? velocity = input.overallVelocityX : direction & DIRECTION_VERTICAL && (velocity = input.overallVelocityY), this._super.attrTest.call(this, input) && direction & input.offsetDirection && input.distance > this.options.threshold && input.maxPointers == this.options.pointers && abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
        },
        emit: function (data) {
            var direction = $(data.offsetDirection);
            if (direction) {
                this.manager.emit(this.options.event + direction, data);
            }
            this.manager.emit(this.options.event, data);
        }
    });
    inherit(TapRecognizer, Recognizer, {
        defaults: {
            event: "tap",
            pointers: 1,
            taps: 1,
            interval: 300,
            time: 250,
            threshold: 9,
            posThreshold: 10
        },
        getTouchAction: function () {
            return [b];
        },
        process: function (input) {
            var options = this.options;
            /** @type {boolean} */
            var c = input.pointers.length === options.pointers;
            /** @type {boolean} */
            var d = input.distance < options.threshold;
            /** @type {boolean} */
            var k = input.deltaTime < options.time;
            if (this.reset(), input.eventType & INPUT_START && 0 === this.count) {
                return this.failTimeout();
            }
            if (d && k && c) {
                if (input.eventType != INPUT_END) {
                    return this.failTimeout();
                }
                /** @type {boolean} */
                var reverseValue = this.pTime ? input.timeStamp - this.pTime < options.interval : true;
                /** @type {boolean} */
                var reverseIsSingle = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;
                this.pTime = input.timeStamp;
                this.pCenter = input.center;
                if (reverseIsSingle && reverseValue) {
                    this.count += 1;
                } else {
                    /** @type {number} */
                    this.count = 1;
                }
                /** @type {!Object} */
                this._input = input;
                /** @type {number} */
                var tapCount = this.count % options.taps;
                if (0 === tapCount) {
                    return this.hasRequireFailures() ? (this._timer = setTimeoutContext(function () {
                        /** @type {number} */
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this), STATE_BEGAN) : STATE_RECOGNIZED;
                }
            }
            return STATE_FAILED;
        },
        failTimeout: function () {
            return this._timer = setTimeoutContext(function () {
                /** @type {number} */
                this.state = STATE_FAILED;
            }, this.options.interval, this), STATE_FAILED;
        },
        reset: function () {
            clearTimeout(this._timer);
        },
        emit: function () {
            if (this.state == STATE_RECOGNIZED) {
                this._input.tapCount = this.count;
                this.manager.emit(this.options.event, this._input);
            }
        }
    });
    /** @type {string} */
    Hammer.VERSION = "2.0.8";
    Hammer.defaults = {
        domEvents: false,
        touchAction: TOUCH_ACTION_COMPUTE,
        enable: true,
        inputTarget: null,
        inputClass: null,
        preset: [[RotateRecognizer, {
            enable: false
        }], [PinchRecognizer, {
            enable: false
        }, ["rotate"]], [SwipeRecognizer, {
            direction: DIRECTION_HORIZONTAL
        }], [PanRecognizer, {
            direction: DIRECTION_HORIZONTAL
        }, ["swipe"]], [TapRecognizer], [TapRecognizer, {
            event: "doubletap",
            taps: 2
        }, ["tap"]], [PressRecognizer]],
        cssProps: {
            userSelect: "none",
            touchSelect: "none",
            touchCallout: "none",
            contentZooming: "none",
            userDrag: "none",
            tapHighlightColor: "rgba(0,0,0,0)"
        }
    };
    /** @type {number} */
    var STOP = 1;
    /** @type {number} */
    var FORCED_STOP = 2;
    Manager.prototype = {
        set: function (options) {
            return assign(this.options, options), options.touchAction && this.touchAction.update(), options.inputTarget && (this.input.destroy(), this.input.target = options.inputTarget, this.input.init()), this;
        },
        stop: function (force) {
            /** @type {number} */
            this.session.stopped = force ? FORCED_STOP : STOP;
        },
        recognize: function (inputData) {
            var session = this.session;
            if (!session.stopped) {
                this.touchAction.preventDefaults(inputData);
                var recognizer;
                var recognizers = this.recognizers;
                var curRecognizer = session.curRecognizer;
                if (!curRecognizer || curRecognizer && curRecognizer.state & STATE_RECOGNIZED) {
                    /** @type {null} */
                    curRecognizer = session.curRecognizer = null;
                }
                /** @type {number} */
                var i = 0;
                for (; i < recognizers.length;) {
                    recognizer = recognizers[i];
                    if (session.stopped === FORCED_STOP || curRecognizer && recognizer != curRecognizer && !recognizer.canRecognizeWith(curRecognizer)) {
                        recognizer.reset();
                    } else {
                        recognizer.recognize(inputData);
                    }
                    if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                        curRecognizer = session.curRecognizer = recognizer;
                    }
                    i++;
                }
            }
        },
        get: function (type) {
            if (type instanceof Recognizer) {
                return type;
            }
            var recognizers = this.recognizers;
            /** @type {number} */
            var i = 0;
            for (; i < recognizers.length; i++) {
                if (recognizers[i].options.event == type) {
                    return recognizers[i];
                }
            }
            return null;
        },
        add: function (data) {
            if (invokeArrayArg(data, "add", this)) {
                return this;
            }
            var x = this.get(data.options.event);
            return x && this.remove(x), this.recognizers.push(data), data.manager = this, this.touchAction.update(), data;
        },
        remove: function (val) {
            if (invokeArrayArg(val, "remove", this)) {
                return this;
            }
            if (val = this.get(val)) {
                var recognizers = this.recognizers;
                var index = inArray(recognizers, val);
                if (-1 !== index) {
                    recognizers.splice(index, 1);
                    this.touchAction.update();
                }
            }
            return this;
        },
        on: function (event, name) {
            if (event !== undefined && name !== undefined) {
                var handlers = this.handlers;
                return each(off(event), function (eventName) {
                    handlers[eventName] = handlers[eventName] || [];
                    handlers[eventName].push(name);
                }), this;
            }
        },
        off: function (events, name) {
            if (events !== undefined) {
                var handlers = this.handlers;
                return each(off(events), function (event) {
                    if (name) {
                        if (handlers[event]) {
                            handlers[event].splice(inArray(handlers[event], name), 1);
                        }
                    } else {
                        delete handlers[event];
                    }
                }), this;
            }
        },
        emit: function (type, data) {
            if (this.options.domEvents) {
                trigger(type, data);
            }
            var urls = this.handlers[type] && this.handlers[type].slice();
            if (urls && urls.length) {
                /** @type {string} */
                data.type = type;
                /**
                 * @return {undefined}
                 */
                data.preventDefault = function () {
                    data.srcEvent.preventDefault();
                };
                /** @type {number} */
                var i = 0;
                for (; i < urls.length;) {
                    urls[i](data);
                    i++;
                }
            }
        },
        destroy: function () {
            if (this.element) {
                toggleCssProps(this, false);
            }
            this.handlers = {};
            this.session = {};
            this.input.destroy();
            /** @type {null} */
            this.element = null;
        }
    };
    assign(Hammer, {
        INPUT_START: INPUT_START,
        INPUT_MOVE: INPUT_MOVE,
        INPUT_END: INPUT_END,
        INPUT_CANCEL: INPUT_CANCEL,
        STATE_POSSIBLE: STATE_POSSIBLE,
        STATE_BEGAN: STATE_BEGAN,
        STATE_CHANGED: STATE_CHANGED,
        STATE_ENDED: STATE_ENDED,
        STATE_RECOGNIZED: STATE_RECOGNIZED,
        STATE_CANCELLED: STATE_CANCELLED,
        STATE_FAILED: STATE_FAILED,
        DIRECTION_NONE: DIRECTION_NONE,
        DIRECTION_LEFT: left,
        DIRECTION_RIGHT: right,
        DIRECTION_UP: DIRECTION_UP,
        DIRECTION_DOWN: DIRECTION_DOWN,
        DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
        DIRECTION_VERTICAL: DIRECTION_VERTICAL,
        DIRECTION_ALL: DIRECTION_ALL,
        Manager: Manager,
        Input: Input,
        TouchAction: TouchAction,
        TouchInput: TouchInput,
        MouseInput: MouseInput,
        PointerEventInput: PointerEventInput,
        TouchMouseInput: TouchMouseInput,
        SingleTouchInput: SingleTouchInput,
        Recognizer: Recognizer,
        AttrRecognizer: AttrRecognizer,
        Tap: TapRecognizer,
        Pan: PanRecognizer,
        Swipe: SwipeRecognizer,
        Pinch: PinchRecognizer,
        Rotate: RotateRecognizer,
        Press: PressRecognizer,
        on: addEventListeners,
        off: removeEventListeners,
        each: each,
        merge: merge,
        extend: extend,
        assign: assign,
        inherit: inherit,
        bindFn: bindFn,
        prefixed: prefixed
    });
    /** @type {(Window|{})} */
    var freeGlobal = "undefined" != typeof window ? window : "undefined" != typeof self ? self : {};
    /** @type {function(string, !Object): ?} */
    freeGlobal.Hammer = Hammer;
    if ("function" == typeof define && define.amd) {
        define(function () {
            return Hammer;
        });
    } else {
        if ("undefined" != typeof module && module.exports) {
            /** @type {function(string, !Object): ?} */
            module.exports = Hammer;
        } else {
            /** @type {function(string, !Object): ?} */
            window[exportName] = Hammer;
        }
    }
}(window, document, "Hammer"), function () {
    var $;
    $ = this.jQuery || window.jQuery;
    /**
     * @param {?} i
     * @return {?}
     */
    $.fn.scrollPagination = function (i) {
        var options = $.extend($.fn.scrollPagination.defaults, i);
        var dest = options.scrollTarget;
        return dest == null && (dest = obj), options.scrollTarget = dest, this.each(function () {
            $.fn.scrollPagination.init($(this), options);
        });
    };
    /**
     * @return {?}
     */
    $.fn.stopScrollPagination = function () {
        return this.each(function () {
            $(this).attr("scrollPagination", "disabled");
        });
    };
    /**
     * @param {!Object} element
     * @param {!Object} data
     * @return {undefined}
     */
    $.fn.scrollPagination.loadContent = function (element, data) {
        var container = data.scrollTarget;
        var cssChanges = data.scrollTargetParent || $(document);
        /** @type {boolean} */
        var f = $(container).scrollTop() + data.heightOffset >= cssChanges.height() - $(container).height();
        if (f && !data.requestInProgress) {
            /** @type {boolean} */
            data.requestInProgress = true;
            if (data.beforeLoad != null) {
                data.beforeLoad();
            }
            var sample = data.contentData;
            sample.max_id = element.data("max-id");
            $("#load-more").show();
            if (sample.max_id) {
                $.get({
                    url: data.contentPage,
                    dataType: "json",
                    data: sample,
                    success: function (options) {
                        element.append(options.html);
                        element.data("max-id", options.max_id);
                        /** @type {boolean} */
                        data.requestInProgress = false;
                        if (data.afterLoad != null) {
                            data.afterLoad(options, data);
                        }
                        $("#load-more").hide();
                        pm.backButtonCache.store(element.attr("id"), sample.max_id, options.max_id, options.html);
                        /** @type {number} */
                        var e = (element.data("scroll-depth") ? parseInt(element.data("scroll-depth")) : 1) + 1;
                        element.data("scroll-depth", e);
                        $(document).trigger("infiniteScroll:complete", e);
                    }
                });
            } else {
                $("#load-more").hide();
            }
        }
    };
    /**
     * @param {string} path
     * @param {!Object} data
     * @return {undefined}
     */
    $.fn.scrollPagination.init = function (path, data) {
        var placeholder = data.scrollTarget;
        $(path).attr("scrollPagination", "enabled");
        $(placeholder).scroll(function (event) {
            if ($(path).attr("scrollPagination") == "enabled") {
                $.fn.scrollPagination.loadContent(path, data);
            } else {
                event.stopPropagation();
            }
        });
        $.fn.scrollPagination.loadContent(path, data);
    };
    $.fn.scrollPagination.defaults = {
        contentPage: null,
        contentData: {},
        beforeLoad: null,
        success: null,
        scrollTarget: null,
        heightOffset: 0
    };
}(jQuery), pm.lazyLoad = function () {
    /**
     * @return {undefined}
     */
    var a = function () {
        delayed();
        inspect();
        end();
    };
    var inviewObserver;
    /**
     * @return {undefined}
     */
    var delayed = function () {
        if (typeof IntersectionObserver == "undefined") {
            return;
        }
        var defaults = {
            rootMargin: "150px 100px",
            threshold: .01
        };
        /** @type {!IntersectionObserver} */
        inviewObserver = new IntersectionObserver(spy, defaults);
    };
    /**
     * @return {undefined}
     */
    var end = function () {
        var a = $("[data-lazy-load=true]");
        if (inviewObserver) {
            extend(a);
        } else {
            filter(a);
        }
    };
    /**
     * @return {undefined}
     */
    var inspect = function () {
        var a = $("[data-lazy-image=true]");
        if (inviewObserver) {
            extend(a);
        } else {
            filter(a);
        }
    };
    /**
     * @param {!Object} a
     * @param {string} itemId
     * @return {undefined}
     */
    var callback = function (a, itemId) {
        if (a.data("loaded")) {
            return;
        }
        itemId = itemId || a.data("lazy-url");
        $.ajax({
            url: itemId,
            method: "GET",
            success: function (v) {
                if (v.success) {
                    if (v.html) {
                        a.find(".placeholder").addClass("fade");
                        a.append(v.html);
                        a.data("loaded", true);
                    } else {
                        a.remove();
                    }
                    a.trigger("lazyLoaded", v);
                } else {
                    a.remove();
                    a.trigger("lazyLoaded:error", v);
                }
            }
        });
    };
    /**
     * @param {!Element} elem
     * @return {undefined}
     */
    var next = function (elem) {
        elem.src = elem.dataset.src;
    };
    /**
     * @param {!Object} a
     * @return {undefined}
     */
    var extend = function (a) {
        a.each(function (a, elem) {
            inviewObserver.observe(elem);
        });
    };
    /**
     * @param {!Object} a
     * @return {undefined}
     */
    var filter = function (a) {
        a.each(function (a, b) {
            if (b.dataset.lazyImage) {
                next(b);
            } else {
                callback($(b));
            }
        });
    };
    /**
     * @param {!Array} res
     * @param {?} object
     * @return {undefined}
     */
    var spy = function (res, object) {
        var value;
        res.forEach(function (entry) {
            if (entry.intersectionRatio > 0) {
                value = entry.target;
                if (value.dataset.lazyImage) {
                    next(value);
                } else {
                    callback($(value));
                }
                object.unobserve(value);
            }
        });
    };
    return {
        initLazyLoad: a,
        lazyLoadImages: inspect,
        populateLazyLoadContent: callback
    };
}(), pm.overlay = function () {
    /**
     * @param {!Object} _relatedTarget
     * @return {?}
     */
    var toggle = function (_relatedTarget) {
        return $("#overlay").addClass("open"), this;
    };
    /**
     * @param {?} callback
     * @return {?}
     */
    var hideMenu = function (callback) {
        return $("#overlay").removeClass("open"), this;
    };
    return {
        show: toggle,
        hide: hideMenu
    };
}(), $("form[validate=true]").validate();
/**
 * @param {!Event} data
 * @return {undefined}
 */
var remoteAction = function (data) {
    var b = $(data.currentTarget);
    /** @type {boolean} */
    var itemrequired = !b.attr("data-authorized") || b.attr("data-authorized") == "true";
    /** @type {boolean} */
    var hasSimpleAttrs = !utils.isMobileDevice.any() || !b.attr("data-ajax-ignore-mobile");
    var hasDynamicAttributes = b.data("remote-old");
    if (itemrequired && hasSimpleAttrs && !hasDynamicAttributes) {
        data.preventDefault();
        data.stopImmediatePropagation();
        /** @type {boolean} */
        var show_download_image_button = b.attr("data-ajax-modal") === "true";
        if (show_download_image_button) {
            remoteModal(b);
        } else {
            if (b.is("form")) {
                remoteForm(b);
            } else {
                if (b.is("a") || b.is("button")) {
                    remoteLink(b);
                }
            }
        }
    }
};
/**
 * @param {!Object} element
 * @return {?}
 */
var getParams = function (element) {
    return params = {}, params.url = element.attr("href") || element.attr("data-ajax-href") || element.attr("action"), params.method = element.attr("data-ajax-method") || "GET", params.method.toUpperCase() === "POST" || params.method.toUpperCase() === "DELETE" ? params.headers = utils.getCsrfToken() : params.headers = {}, params;
};
/**
 * @param {!Object} el
 * @return {undefined}
 */
var showProgress = function (el) {
    if (el.data("show-loader")) {
        el.find(".modal-footer").find(".btn, a, p").hide();
        el.find(".form-progress-msg").show();
        el.find("[data-hide-loading=true]").hide();
    }
};
/**
 * @param {!Object} element
 * @return {undefined}
 */
var hideProgress = function (element) {
    if (element.data("show-loader")) {
        element.find(".modal-footer").find(".btn, a, p").show();
        element.find(".form-progress-msg").hide();
        element.find("[data-hide-loading=true]").show();
    }
};
/**
 * @param {!Object} s
 * @return {undefined}
 */
var showOverlay = function (s) {
    if (s.data("show-overlay")) {
        pm.overlay.show();
    }
};
/**
 * @param {!Object} s
 * @return {undefined}
 */
var hideOverlay = function (s) {
    if (s.data("show-overlay")) {
        pm.overlay.hide();
    }
};
/**
 * @param {!Object} cb
 * @param {!Object} obj
 * @param {!Function} func
 * @return {undefined}
 */
var remoteRequest = function (cb, obj, func) {
    $.ajax({
        type: obj.method,
        url: obj.url,
        data: obj.data,
        headers: obj.headers,
        success: function (obj) {
            if (!obj.success && obj.is_page_modal) {
                $("#share-popup").modal("hide");
                $("#bundle-error-popup .sub-text-msg").html(obj.message);
                $("#bundle-error-popup").modal("show");
            } else {
                if (func) {
                    func(obj);
                }
                cb.trigger("remoteAction", obj);
            }
        },
        error: function (obj) {
            if (obj.is_page_modal) {
                $("#bundle-error-popup .sub-text-msg").html(obj.message);
                $("#bundle-error-popup").modal("show");
            } else {
                if (func) {
                    func(obj);
                }
                cb.trigger("remoteAction:error", obj);
            }
        }
    });
};
/**
 * @param {!Object} element
 * @return {undefined}
 */
var remoteForm = function (element) {
    var currentSelectBoxOption = element.find("input[type=submit]");
    currentSelectBoxOption.attr("disabled", "disabled");
    /** @type {null} */
    var checkCanAutoInc = null;
    if (currentSelectBoxOption) {
        /**
         * @return {undefined}
         */
        checkCanAutoInc = function () {
            currentSelectBoxOption.removeAttr("disabled");
        };
    }
    var item = getParams(element);
    showProgress(element);
    showOverlay(element);
    item.method = element.attr("data-ajax-method") || "POST";
    item.data = element.serialize();
    remoteRequest(element, item, checkCanAutoInc);
};
/**
 * @param {!Object} key
 * @return {undefined}
 */
var remoteLink = function (key) {
    var data = getParams(key);
    remoteRequest(key, data);
};
/**
 * @param {!Object} component
 * @return {undefined}
 */
var remoteModal = function (component) {
    var obj;
    var data = getParams(component);
    if (component.attr("href") !== void 0 && component.attr("href") !== "#" || component.attr("action") !== void 0 && component.attr("action")) {
        /** @type {!Object} */
        obj = component;
        /**
         * @param {!Object} a
         * @return {?}
         */
        var detectAndShow = function (a) {
            if (a instanceof Object && a.status != 200) {
                return;
            }
            var html;
            var ZenBlock;
            return ZenBlock = $(a).appendTo("main").hide(), $(".main-con").length > 0 && (ZenBlock = $(a).appendTo(".main-con").hide()), obj.attr("target") ? html = obj.attr("target") : html = ZenBlock, $(html).modal("show");
        };
    }
    var otweets = obj && obj.attr("target") ? $(obj.attr("target")) : [];
    if (otweets.length > 0) {
        if (obj.attr("data-ajax-new-modal")) {
            otweets.remove();
            remoteRequest(component, data, detectAndShow);
        } else {
            $(obj.attr("target")).modal("show");
        }
    } else {
        remoteRequest(component, data, detectAndShow);
    }
};
/**
 * @param {!Event} event
 * @return {undefined}
 */
var remoteFakeComplete = function (event) {
    $form = $(event.currentTarget);
    hideProgress($form);
    $form.parents(".modal").find(".modal-header .close").show();
};
/**
 * @param {!Event} event
 * @return {undefined}
 */
var remoteFakeBeforeSend = function (event) {
    $form = $(event.currentTarget);
    showProgress($form);
    $form.find(".base_error_message").remove();
    $form.parents(".modal").find(".modal-header .close").hide();
};
/**
 * @param {!Event} data
 * @param {!Object} config
 * @return {undefined}
 */
var remoteActionResponse = function (data, config) {
    var element = $(data.target);
    if (element.is("form")) {
        hideProgress(element);
        hideOverlay(element);
        if (config.success) {
            var assetConfirmationModal = element.parents(".modal");
            if (assetConfirmationModal) {
                if (assetConfirmationModal.find(".form-success-msg").length > 0) {
                    pm.flashMessage.push({
                        text: assetConfirmationModal.find(".form-success-msg").text()
                    });
                }
                assetConfirmationModal.modal("hide");
            }
            if (config.redirect_url && !element.data("ajax-controlled-redirect")) {
                window.location.href = config.redirect_url;
            }
            var e = element.find("textarea[data-grow=true]");
            if (e.length > 0) {
                pm.textAreaGrow.shrink(e);
            }
        } else {
            if (config.errors) {
                if (pm !== undefined && pm.validate !== undefined) {
                    pm.validate.clearFormErrors(element.attr("id"));
                    pm.validate.addErrors(element, element.data("selector"), config.errors);
                } else {
                    if (validate_obj !== undefined) {
                        validate_obj.clear_form_errors(element.attr("id"));
                        validate_obj.add_errors(element, element.data("selector"), config.errors);
                    }
                }
            }
        }
    }
};
$(document).on("click", "a[data-ajax], a[data-ajax-modal], button[data-ajax], button[data-ajax-modal]", remoteAction), $(document).on("submit", "form[data-ajax], form[data-ajax-modal]", remoteAction), $(document).on("submit.ajax", "form[data-ajax], form[data-ajax-modal]", remoteAction), $(document).on("remoteAction", "form", function (testItemData, config_arg) {
    remoteActionResponse(testItemData, config_arg);
}), $(document).on("fakeComplete", "form", remoteFakeComplete), $(document).on("fakeBeforeSend", "form", remoteFakeBeforeSend), function () {
    var $;
    var win;
    $ = this.jQuery || window.jQuery;
    win = $(window);
    /**
     * @param {!Object} opts
     * @return {?}
     */
    $.fn.stick_in_parent = function (opts) {
        var $$;
        var form;
        var enable_bottoming;
        var inner_scrolling;
        var manual_spacer;
        var k;
        var getSize;
        var target;
        var recalc_every;
        var sticky_class;
        var fn;
        var i;
        var j;
        if (opts == null) {
            opts = {};
        }
        sticky_class = opts.sticky_class;
        inner_scrolling = opts.inner_scrolling;
        recalc_every = opts.recalc_every;
        target = opts.parent;
        k = opts.offset_top;
        manual_spacer = opts.spacer;
        enable_bottoming = opts.bottoming;
        if (k == null) {
            /** @type {number} */
            k = 0;
        }
        if (target == null) {
            target = void 0;
        }
        if (inner_scrolling == null) {
            /** @type {boolean} */
            inner_scrolling = true;
        }
        if (sticky_class == null) {
            /** @type {string} */
            sticky_class = "is_stuck";
        }
        $$ = $(document);
        if (enable_bottoming == null) {
            /** @type {boolean} */
            enable_bottoming = true;
        }
        /**
         * @param {!Object} node
         * @return {?}
         */
        getSize = function (node) {
            var style;
            var ret;
            var codeGeneratorFunc;
            return window.getComputedStyle ? (codeGeneratorFunc = node[0], style = window.getComputedStyle(node[0]), ret = parseFloat(style.getPropertyValue("width")) + parseFloat(style.getPropertyValue("margin-left")) + parseFloat(style.getPropertyValue("margin-right")), style.getPropertyValue("box-sizing") !== "border-box" && (ret = ret + (parseFloat(style.getPropertyValue("border-left-width")) + parseFloat(style.getPropertyValue("border-right-width")) + parseFloat(style.getPropertyValue("padding-left")) +
                parseFloat(style.getPropertyValue("padding-right")))), ret) : node.outerWidth(true);
        };
        /**
         * @param {!Object} elm
         * @param {string} content
         * @param {?} f
         * @param {?} a
         * @param {number} p
         * @param {number} i
         * @param {?} val
         * @param {number} size
         * @return {?}
         */
        fn = function (elm, content, f, a, p, i, val, size) {
            var is_document;
            var detach;
            var fixed;
            var j;
            var normal;
            var v;
            var $container;
            var recalc;
            var callback;
            var recalc_counter;
            var spacer;
            var tick;
            if (elm.data("sticky_kit")) {
                return;
            }
            elm.data("sticky_kit", true);
            normal = $$.height();
            $container = elm.parent();
            if (target != null) {
                $container = $container.closest(target);
            }
            if (!$container.length) {
                throw "failed to find stick parent";
            }
            /** @type {boolean} */
            fixed = false;
            /** @type {boolean} */
            is_document = false;
            spacer = manual_spacer != null ? manual_spacer && elm.closest(manual_spacer) : $("<div />");
            if (spacer) {
                spacer.css("position", elm.css("position"));
            }
            /**
             * @return {?}
             */
            recalc = function () {
                var h;
                var r;
                var s;
                if (size) {
                    return;
                }
                normal = $$.height();
                /** @type {number} */
                h = parseInt($container.css("border-top-width"), 10);
                /** @type {number} */
                r = parseInt($container.css("padding-top"), 10);
                /** @type {number} */
                content = parseInt($container.css("padding-bottom"), 10);
                f = $container.offset().top + h + r;
                a = $container.height();
                if (fixed) {
                    /** @type {boolean} */
                    fixed = false;
                    /** @type {boolean} */
                    is_document = false;
                    if (manual_spacer == null) {
                        elm.insertAfter(spacer);
                        spacer.detach();
                    }
                    elm.css({
                        position: "",
                        top: "",
                        width: "",
                        bottom: ""
                    }).removeClass(sticky_class);
                    /** @type {boolean} */
                    s = true;
                }
                /** @type {number} */
                p = elm.offset().top - (parseInt(elm.css("margin-top"), 10) || 0) - k;
                i = elm.outerHeight(true);
                val = elm.css("float");
                if (spacer) {
                    spacer.css({
                        width: getSize(elm),
                        height: i,
                        display: elm.css("display"),
                        "vertical-align": elm.css("vertical-align"),
                        "float": val,
                        "z-index": -1
                    });
                }
                if (s) {
                    return tick();
                }
            };
            recalc();
            if (i === a) {
                return;
            }
            return j = void 0, v = k, recalc_counter = recalc_every, tick = function () {
                var css;
                var offset;
                var depthInFontWeight;
                var n;
                var option;
                var length;
                if (size) {
                    return;
                }
                /** @type {boolean} */
                depthInFontWeight = false;
                if (recalc_counter != null) {
                    /** @type {number} */
                    recalc_counter = recalc_counter - 1;
                    if (recalc_counter <= 0) {
                        recalc_counter = recalc_every;
                        recalc();
                        /** @type {boolean} */
                        depthInFontWeight = true;
                    }
                }
                if (!depthInFontWeight && $$.height() !== normal) {
                    recalc();
                    /** @type {boolean} */
                    depthInFontWeight = true;
                }
                n = win.scrollTop();
                if (j != null) {
                    /** @type {number} */
                    offset = n - j;
                }
                j = n;
                if (fixed) {
                    if (enable_bottoming) {
                        /** @type {boolean} */
                        option = n + i + v > a + f;
                        if (is_document && !option) {
                            /** @type {boolean} */
                            is_document = false;
                            elm.css({
                                position: "fixed",
                                bottom: "",
                                top: v
                            }).trigger("sticky_kit:unbottom");
                        }
                    }
                    if (n < p) {
                        /** @type {boolean} */
                        fixed = false;
                        v = k;
                        if (manual_spacer == null) {
                            if (val === "left" || val === "right") {
                                elm.insertAfter(spacer);
                            }
                            spacer.detach();
                        }
                        css = {
                            position: "",
                            width: "",
                            top: ""
                        };
                        elm.css(css).removeClass(sticky_class).trigger("sticky_kit:unstick");
                    }
                    if (inner_scrolling) {
                        length = win.height();
                        if (i + k > length) {
                            if (!is_document) {
                                /** @type {number} */
                                v = v - offset;
                                /** @type {number} */
                                v = Math.max(length - i, v);
                                /** @type {number} */
                                v = Math.min(k, v);
                                if (fixed) {
                                    elm.css({
                                        top: v + "px"
                                    });
                                }
                            }
                        }
                    }
                } else {
                    if (n > p) {
                        /** @type {boolean} */
                        fixed = true;
                        css = {
                            position: "fixed",
                            top: v + "px"
                        };
                        css.width = elm.css("box-sizing") === "border-box" ? elm.outerWidth() + "px" : elm.width() + "px";
                        elm.css(css).addClass(sticky_class);
                        if (manual_spacer == null) {
                            elm.after(spacer);
                            if (val === "left" || val === "right") {
                                spacer.append(elm);
                            }
                        }
                        elm.trigger("sticky_kit:stick");
                    }
                }
                if (fixed && enable_bottoming) {
                    if (option == null) {
                        /** @type {boolean} */
                        option = n + i + v > a + f;
                    }
                    if (!is_document && option) {
                        return is_document = true, $container.css("position") === "static" && $container.css({
                            position: "relative"
                        }), elm.css({
                            position: "absolute",
                            bottom: content,
                            top: "auto"
                        }).trigger("sticky_kit:bottom");
                    }
                }
            }, callback = function () {
                return recalc(), tick();
            }, detach = function () {
                /** @type {boolean} */
                size = true;
                win.off("touchmove", tick);
                win.off("scroll", tick);
                win.off("resize", callback);
                $(document.body).off("sticky_kit:recalc", callback);
                elm.off("sticky_kit:detach", detach);
                elm.removeData("sticky_kit");
                elm.css({
                    position: "",
                    bottom: "",
                    top: "",
                    width: ""
                });
                $container.position("position", "");
                if (fixed) {
                    return manual_spacer == null && ((val === "left" || val === "right") && elm.insertAfter(spacer), spacer.remove()), elm.removeClass(sticky_class);
                }
            }, win.on("touchmove", tick), win.on("scroll", tick), win.on("resize", callback), $(document.body).on("sticky_kit:recalc", callback), elm.on("sticky_kit:detach", detach), setTimeout(tick, 0);
        };
        /** @type {number} */
        i = 0;
        j = this.length;
        for (; i < j; i++) {
            form = this[i];
            fn($(form));
        }
        return this;
    };
}.call(this), $(document).on("click", '[data-toggle="tab"]', function (event) {
    var selectedTierOption = $(event.currentTarget);
    if (selectedTierOption.hasClass("selected")) {
        return;
    }
    selectedTierOption.siblings(".tab").removeClass("selected");
    selectedTierOption.addClass("selected");
    var $sharePopup = $(selectedTierOption.data("tab-target"));
    $sharePopup.siblings(".tab-content").addClass("hide");
    $sharePopup.removeClass("hide");
}), utils = function () {
    /**
     * @return {?}
     */
    var checkFormatRegex = function () {
        /** @type {!RegExp} */
        var olderIEUA = /\(.*https?:\/\/.*\)/;
        return olderIEUA.test(navigator.userAgent);
    };
    /**
     * @param {string} name
     * @return {?}
     */
    var getCookie = function (name) {
        var i;
        var html;
        var c_user;
        /** @type {!Array<string>} */
        var commentTags = document.cookie.split(";");
        /** @type {number} */
        i = 0;
        for (; i < commentTags.length; i++) {
            /** @type {string} */
            html = commentTags[i].substr(0, commentTags[i].indexOf("="));
            /** @type {string} */
            c_user = commentTags[i].substr(commentTags[i].indexOf("=") + 1);
            /** @type {string} */
            html = html.replace(/^\s+|\s+$/g, "");
            if (html == name) {
                return decodeURIComponent(c_user);
            }
        }
    };
    /**
     * @param {string} name
     * @param {string} a
     * @param {number} value
     * @param {string} options
     * @return {undefined}
     */
    var setCookie = function (name, a, value, options) {
        /** @type {!Date} */
        var date = new Date;
        var output = options || "/";
        date.setTime(date.getTime() + value * 60 * 1e3);
        /** @type {string} */
        var floatTheadId = encodeURIComponent(a) + (value == null ? "" : "; expires=" + date.toUTCString());
        /** @type {string} */
        document.cookie = name + "=" + floatTheadId + ";" + "path=" + output;
    };
    /**
     * @param {string} value
     * @return {undefined}
     */
    var cookieMachine = function (value) {
        /** @type {!Date} */
        var date = new Date;
        date.setTime(date.getTime());
        document.cookie = value = value + ("=; expires=" + date.toUTCString());
    };
    /**
     * @param {!Object} link
     * @param {!NodeList} value
     * @return {undefined}
     */
    var scoreNextPageLinkCandidate = function (link, value) {
        var word = link.innerText;
        var i = word.indexOf(value);
        if (i > -1) {
            link.innerHTML = word.substring(0, i) + "<span class='highlight'>" + word.substring(i, i + value.length) + "</span>" + word.substring(i + value.length);
        }
    };
    var isMobile = {
        Android: function () {
            return navigator.userAgent.match(/Android/i) ? true : false;
        },
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i) ? true : false;
        },
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
        },
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i) ? true : false;
        },
        iPad: function () {
            return navigator.userAgent.match(/iPad/i) ? true : false;
        },
        any: function () {
            return isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows();
        }
    };
    /**
     * @param {!Object} items
     * @return {?}
     */
    var getValues = function (items) {
        return Object.keys(items).map(function (customName) {
            return items[customName];
        });
    };
    /**
     * @param {!Object} group
     * @param {?} user
     * @return {?}
     */
    var userToGroup = function (group, user) {
        var i;
        for (i in group) {
            if (group.hasOwnProperty(i) && group[i] === user) {
                return i;
            }
        }
    };
    /**
     * @param {string} url
     * @return {?}
     */
    var parse = function (url) {
        if (/^(https?|file|ftps?|mailto|javascript|data:image\/[^;]{2,9};):/i.test(url)) {
            return url;
        }
        /** @type {string} */
        var host = location.href.match(/^(.+)\/?(?:#.+)?$/)[0] + "/";
        if (url.substring(0, 2) == "//") {
            return location.protocol + url;
        }
        if (url.charAt(0) == "/") {
            return location.protocol + "//" + location.host + url;
        }
        if (url.substring(0, 2) == "./") {
            /** @type {string} */
            url = "." + url;
        } else {
            if (/^\s*$/.test(url)) {
                return "";
            }
            /** @type {string} */
            url = "../" + url;
        }
        /** @type {string} */
        url = host + url;
        /** @type {number} */
        var c = 0;
        for (; /\/\.\.\//.test(url = url.replace(/[^\/]+\/+\.\.\//g, ""));) {
        }
        return url = url.replace(/\.$/, "").replace(/\/\./g, "").replace(/"/g, "%22").replace(/'/g, "%27").replace(/</g, "%3C").replace(/>/g, "%3E"), url;
    };
    /**
     * @param {string} url
     * @return {?}
     */
    var getUrlParams = function (url) {
        var fieldHash = {};
        if (url.indexOf("?") >= 0) {
            var componentsStr = url.split("?")[1];
            if (componentsStr) {
                var newUrlParts = componentsStr.split("&");
                /** @type {number} */
                var i = 0;
                for (; i < newUrlParts.length; i++) {
                    if (newUrlParts[i].indexOf("=") > 0) {
                        var f = newUrlParts[i].split("=");
                        fieldHash[f[0]] = f[1];
                    }
                }
            }
        }
        return fieldHash;
    };
    /**
     * @return {?}
     */
    var send_to_beta = function () {
        var token = $("meta[name='csrf-token']").attr("content");
        var b = {
            "X-CSRF-Token": token
        };
        return b;
    };
    /**
     * @param {string} el
     * @param {?} start
     * @param {?} end
     * @return {undefined}
     */
    var select = function (el, start, end) {
        if (el.setSelectionRange) {
            el.focus();
            el.setSelectionRange(start, end);
        } else {
            if (el.createTextRange) {
                var range = el.createTextRange();
                range.collapse(true);
                range.moveEnd("character", end);
                range.moveStart("character", start);
                range.select();
            }
        }
    };
    /**
     * @param {string} a
     * @param {?} b
     * @return {undefined}
     */
    var compareAlphabetically = function (a, b) {
        select(a, b, b);
    };
    /**
     * @param {string} a
     * @param {!Array} be
     * @return {?}
     */
    var init = function (a, be) {
        var tForm = {};
        return $.each($("#" + a).serializeArray(), function (a, options) {
            if (be.indexOf(options.name.substring(options.name.indexOf("[") + 1, options.name.indexOf("]"))) >= 0) {
                tForm[options.name] = options.value;
            }
            if (["authenticity_token", "utf8"].indexOf(options.name) >= 0) {
                tForm[options.name] = options.value;
            }
        }), tForm;
    };
    /**
     * @param {string} id
     * @return {?}
     */
    var getLegendSymbol = function (id) {
        var depthInFontWeight;
        /** @type {string} */
        var delta = "utm_source=web&utm_campaign=getapp";
        return id.indexOf("?") >= 0 ? depthInFontWeight = id + "&" + delta : depthInFontWeight = id + "?" + delta, depthInFontWeight;
    };
    /**
     * @param {string} a
     * @return {?}
     */
    var naturalSort = function (a) {
        var url = parse(a);
        return url.replace(/^http:\/\//i, "https://");
    };
    /**
     * @param {string} text
     * @return {?}
     */
    var _escapeHTML = function (text) {
        return String(text).replace(/&(?!\w+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    };
    /**
     * @param {!Object} element
     * @param {!Object} e
     * @return {undefined}
     */
    var addRippleElement = function (element, e) {
        var R = element.index();
        /** @type {number} */
        var d = R * element.outerWidth(true);
        e.scrollLeft(Math.max(0, d));
    };
    /**
     * @param {!Object} d
     * @param {number} b
     * @return {undefined}
     */
    var s = function (d, b) {
        d.value = d.value.replace(/[^\dA-Z]/g, "");
        /** @type {!Array} */
        var chunks = [];
        /** @type {number} */
        var a = 0;
        var Del = d.value.length;
        for (; a < Del; a = a + b) {
            chunks.push(d.value.substr(a, b));
        }
        /** @type {string} */
        d.value = chunks.join(" ");
    };
    /**
     * @param {string} a
     * @param {?} b
     * @param {string} $el
     * @return {undefined}
     */
    var getObjectOfSetupPage = function (a, b, $el) {
        $.each($el, function (b, utteranceLine) {
            $("#" + a + " [name='" + b + "']").val(utteranceLine);
        });
    };
    /**
     * @param {string} sel_open_end
     * @return {undefined}
     */
    var cellDblClicked = function (sel_open_end) {
        $(sel_open_end + " input[type=text]").attr("readonly", true);
        $("option:not(:checked)").attr("disabled", true);
        $(sel_open_end + " input[type=text],select").addClass("readonly-fields");
    };
    /**
     * @param {string} sel_open_end
     * @return {undefined}
     */
    var _disableQuiz = function (sel_open_end) {
        $(sel_open_end + " input[type=text]").attr("readonly", false);
        $("option:not(:checked)").attr("disabled", false);
    };
    /**
     * @return {undefined}
     */
    var resizeFullHeight = function () {
        var a = $(window).height();
        var b = $("body").height();
        if (b < a) {
            /** @type {number} */
            var c = parseInt($("footer").css("margin-top"));
            $("footer").css("margin-top", a - b + c);
        }
    };
    /**
     * @param {!NodeList} arrayOfSelects
     * @return {undefined}
     */
    var populateDataTable = function (arrayOfSelects) {
        /** @type {number} */
        var i = 0;
        for (; i < arrayOfSelects.length; i++) {
            $(arrayOfSelects[i]).off("click");
        }
    };
    /**
     * @param {string} locale
     * @return {?}
     */
    var load = function (locale) {
        var datahome = jQuery.param({
            app_version: "1",
            app_type: "web"
        });
        /** @type {string} */
        var name = "?";
        return locale.indexOf("?") >= 0 && (name = "&"), "/api/" + locale + name + datahome;
    };
    /**
     * @param {?} response
     * @param {string} id
     * @return {?}
     */
    var start = function (response, id) {
        return "/listing/" + $.trim(response).replace(/[^a-z0-9A-Z ]/gi, "").replace(/\s\s+/g, "-") + "-" + id;
    };
    /**
     * @param {?} e
     * @param {number} timeout
     * @return {?}
     */
    var render = function (e, timeout) {
        /**
         * @return {undefined}
         */
        function expand() {
            if (!c) {
                /** @type {boolean} */
                c = true;
                e();
            }
        }

        /** @type {boolean} */
        var c = false;
        return setTimeout(expand, timeout || 1e3), expand;
    };
    /**
     * @return {undefined}
     */
    var the_end = function () {
        $.jStorage.set("br-trk", "1");
        $.jStorage.setTTL("br-trk", 72e5);
    };
    /**
     * @return {?}
     */
    var generate_path = function () {
        return $.jStorage.get("br-trk") ? true : false;
    };
    /**
     * @param {string} rawDate
     * @return {?}
     */
    var getUtcDate = function (rawDate) {
        return new Date(parseInt(rawDate.substring(0, 8), 16) * 1e3);
    };
    /**
     * @param {string} rawValue
     * @return {?}
     */
    var animate = function (rawValue) {
        var dateValue = getUtcDate(rawValue);
        return Math.ceil(Math.abs((new Date((new Date).setHours(0, 0, 0, 0))).getTime() - dateValue.getTime()) / 864e5);
    };
    /**
     * @param {string} a
     * @return {?}
     */
    var F = function (a) {
        return a.charAt(0).toUpperCase() + a.slice(1);
    };
    return {
        isBot: checkFormatRegex,
        setCookie: setCookie,
        getCookie: getCookie,
        deleteCookie: cookieMachine,
        highlightText: scoreNextPageLinkCandidate,
        isMobileDevice: isMobile,
        getValues: getValues,
        getKeyByValue: userToGroup,
        relToAbs: parse,
        getUrlParams: getUrlParams,
        getCsrfToken: send_to_beta,
        setCaretToPos: compareAlphabetically,
        getFormDataHash: init,
        addGetAppTracking: getLegendSymbol,
        getSecureUrl: naturalSort,
        escapeHTML: _escapeHTML,
        horizontalScrollToListItem: addRippleElement,
        insertSpaceAfter: s,
        populateFormWithHash: getObjectOfSetupPage,
        disableFieldsOfDiv: cellDblClicked,
        enableFieldsOfDiv: _disableQuiz,
        stickFooterToBottom: resizeFullHeight,
        unBindClick: populateDataTable,
        appendAPIParams: load,
        firendlyListingUrl: start,
        ensureFunctionCallWithTimeout: render,
        setBranchTracked: the_end,
        isBranchTracked: generate_path,
        dateFromObjectId: getUtcDate,
        daysSinceSignup: animate,
        firstToUpperCase: F
    };
}(), pm.commerce.googlePay = function () {
    /** @type {null} */
    var _this = null;
    var res = {};
    /** @type {boolean} */
    var c = false;
    /** @type {null} */
    var lastTrackInfoUrl = null;
    /** @type {null} */
    var me = null;
    /** @type {!Array} */
    var f = ["CARD"];
    /**
     * @return {?}
     */
    var get = function () {
        return _this ? _this : (_this = new google.payments.api.PaymentsClient({
            environment: pm.commerce.googlePayEnv
        }), _this);
    };
    /**
     * @param {?} url
     * @return {undefined}
     */
    var render = function (url) {
        res = url;
        createPhantomProcess().then(function (a) {
            if (a) {
                finish();
            } else {
                next("Error While initBraintreeClientInstance");
            }
        }, function (a) {
            next(a);
        });
        if ($(".submit-with-loader-con").length > 0) {
            /** @type {!Element} */
            var openLoginScreenBtn = document.getElementsByClassName("submit-with-loader-con")[0];
            openLoginScreenBtn.addEventListener("click", function (num) {
                var editingEl = $(document.getElementById("payment_info"));
                if (editingEl.data("payment_method") === "gp") {
                    run(num);
                }
            });
        } else {
            if ($("#google-pay-btn").length > 0) {
                _this = get();
                const userJoinedText = _this.createButton({
                    onClick: function (x) {
                        /** @type {string} */
                        res.checkout_type = "gp";
                        run(x);
                    }
                });
                document.getElementById("google-pay-btn").appendChild(userJoinedText);
                $("#google-pay-btn").removeClass("hide");
            }
        }
    };
    /**
     * @return {?}
     */
    var createPhantomProcess = function () {
        return new Promise(function (negater, obtainGETData) {
            braintree.client.create({
                authorization: pm.commerce.brainTreeClientToken
            }, function (val, trackInfoUrl) {
                if (val) {
                    next(val);
                    obtainGETData(val);
                } else {
                    /** @type {!Object} */
                    lastTrackInfoUrl = trackInfoUrl;
                    negater(true);
                }
            });
        });
    };
    /**
     * @return {undefined}
     */
    var finish = function () {
        if (lastTrackInfoUrl) {
            braintree.googlePayment.create({
                client: lastTrackInfoUrl
            }, function (a, object) {
                if (a) {
                    next(a);
                } else {
                    /** @type {!Object} */
                    me = object;
                }
            });
        } else {
            next("Error while initGooglePaymentInstance, braintreeClientInstance is null");
        }
    };
    /**
     * @param {!Event} val
     * @return {undefined}
     */
    var run = function (val) {
        _this = get();
        if (me) {
            pm.hudMessage.push({
                type: 1,
                text: "Processing..."
            });
            var values = me.createPaymentDataRequest(filter());
            _this.loadPaymentData(values).then(function (tz) {
                pm.hudMessage.dismiss();
                callback(tz);
            }).catch(function (a) {
                pm.hudMessage.dismiss();
                next(a);
            });
        } else {
            next("Error while initGooglePaySubmit, googlePayClientInstance is null");
        }
    };
    /**
     * @param {!Object} request
     * @return {undefined}
     */
    var callback = function (request) {
        if (me) {
            me.parseResponse(request, function (b, inviteInfo) {
                if (b) {
                    next(b);
                }
                var options = {
                    nonce: inviteInfo.nonce,
                    email: request.email,
                    billingAddress: request.cardInfo.billingAddress
                };
                if (request.shippingAddress) {
                    options.shippingAddress = request.shippingAddress;
                }
                create(options);
            });
        } else {
            next("Error while processGooglePayresponse, googlePayClientInstance is null");
        }
    };
    /**
     * @param {string} num
     * @param {string} c
     * @return {?}
     */
    var next = function (num, c) {
        if (!c) {
            /** @type {string} */
            c = "Sorry! There was an error while processing your request. Please try again.";
        }
        var handle = pm.pageInfo.paTrackerData.screen_name;
        if ([pm.settings.screenNames.shipping, pm.settings.screenNames.shippingGuest].includes(handle) && res.page_type === "order") {
            pm.flashMessage.push({
                text: c,
                duration: 5e3
            });
        } else {
            /** @type {string} */
            var hashed_url = "";
            if (res.page_type === "order") {
                /** @type {string} */
                hashed_url = "checkout_summary_form";
            } else {
                if (res.page_type === "offer") {
                    /** @type {string} */
                    hashed_url = "offer_summary_form";
                }
            }
            pm.validate.clearFormErrors(hashed_url);
            pm.validate.addBaseErrors(pm.checkout.formObj, c);
        }
        return false;
    };
    /**
     * @param {!Object} options
     * @return {undefined}
     */
    var create = function (options) {
        var patchUrl = pm.checkout.objectId();
        var data = utils.getFormDataHash(pm.checkout.formId(), []);
        /** @type {string} */
        var title_ = "";
        var result = options.billingAddress;
        var address = {};
        if (res.page_type === "order") {
            /** @type {string} */
            title_ = "checkout_form";
            address = res.shipping_address;
        } else {
            /** @type {string} */
            title_ = "offer_checkout_form";
            address = res.shipping_address.address;
        }
        data[title_ + "[cc_nonce]"] = options.nonce;
        data[title_ + "[bt_device_data]"] = $("#device_data").val();
        /** @type {string} */
        data[title_ + "[payment_type]"] = "bt";
        /** @type {string} */
        data[title_ + "[payment_method]"] = "gp";
        data[title_ + "[email]"] = options.email;
        data[title_ + "[billing_address_name]"] = result.name;
        data[title_ + "[billing_address_street]"] = result.address1;
        data[title_ + "[billing_address_street2]"] = result.address2;
        data[title_ + "[billing_address_city]"] = result.locality;
        data[title_ + "[billing_address_state]"] = result.administrativeArea;
        data[title_ + "[billing_address_zip]"] = result.postalCode;
        if (!pm.userInfo.isLoggedIn()) {
            data[title_ + "[user_email]"] = options.email;
            if (result.name) {
                var dataChunk = result.name.split(" ");
                if (dataChunk[0] && dataChunk[0].length > 0) {
                    data[title_ + "[first_name]"] = dataChunk[0];
                }
                if (dataChunk[1] && dataChunk[1].length > 0) {
                    data[title_ + "[last_name]"] = dataChunk[1];
                }
            }
        }
        if ((!res.shipping_address || Object.keys(res.shipping_address).length === 0) && options.shippingAddress) {
            address = options.shippingAddress;
            data[title_ + "[shipping_address_name]"] = address.name;
            data[title_ + "[shipping_address_street]"] = address.address1;
            data[title_ + "[shipping_address_street2]"] = address.address2;
            data[title_ + "[shipping_address_city]"] = address.locality;
            data[title_ + "[shipping_address_state]"] = address.administrativeArea;
            data[title_ + "[shipping_address_zip]"] = address.postalCode;
        } else {
            data[title_ + "[shipping_address_name]"] = address.name;
            data[title_ + "[shipping_address_street]"] = address.street;
            data[title_ + "[shipping_address_street2]"] = address.street2;
            data[title_ + "[shipping_address_city]"] = address.city;
            data[title_ + "[shipping_address_state]"] = address.state;
            data[title_ + "[shipping_address_zip]"] = address.zip;
        }
        var handle = pm.pageInfo.paTrackerData.screen_name;
        if ([pm.settings.screenNames.shipping, pm.settings.screenNames.shippingGuest].includes(handle) && res.page_type === "order") {
            var hrefaction = $(pm.checkout.formObj()).attr("action");
            /** @type {boolean} */
            data.fast_checkout = true;
            $.ajax({
                type: "POST",
                url: hrefaction,
                data: data,
                headers: utils.getCsrfToken(),
                beforeSend: function () {
                    pm.hudMessage.push({
                        type: 1,
                        text: "Processing..."
                    });
                },
                success: function (obj) {
                    pm.hudMessage.dismiss();
                    if (obj.error) {
                        pm.flashMessage.push({
                            text: obj.error,
                            duration: 1e4
                        });
                    } else {
                        if (obj.errors) {
                            /** @type {*} */
                            var copy_bits = JSON.parse(obj.errors);
                            pm.flashMessage.push({
                                text: copy_bits.base[0],
                                duration: 1e4
                            });
                        } else {
                            if (obj.modal_html) {
                                try {
                                    $("#" + $(obj.modal_html).attr("id")).remove();
                                } catch (b) {
                                }
                                var $cover_details = $(obj.modal_html).appendTo("#content").first();
                                $cover_details.modal("show");
                            } else {
                                if (obj.submit_order_url) {
                                    window.location.href = obj.submit_order_url;
                                }
                            }
                        }
                    }
                },
                dataType: "json"
            });
        } else {
            if (res.page_type === "order") {
                request(patchUrl, data);
            } else {
                if (res.page_type === "offer") {
                    var form = $("#offer_summary_form");
                    $.ajax({
                        type: "POST",
                        url: form.attr("action"),
                        data: data,
                        beforeSend: function () {
                            pm.hudMessage.push({
                                type: 1,
                                text: "Processing..."
                            });
                        },
                        success: pm.checkout.finalOfferCheckoutSuccess,
                        error: function (obj) {
                            pm.overlay.hide();
                            next(obj);
                        },
                        pm_context: {
                            form: form
                        },
                        dataType: "json"
                    });
                }
            }
        }
    };
    /**
     * @param {string} index
     * @param {!Object} item
     * @return {undefined}
     */
    var request = function (index, item) {
        $.ajax({
            type: "POST",
            url: "/order/" + index + "/final_checkout",
            data: item,
            beforeSend: function () {
                pm.overlay.show();
            },
            success: pm.checkout.checkoutFinalOrderSuccess,
            error: function (obj) {
                pm.overlay.hide();
                next(obj);
            },
            dataType: "json"
        });
    };
    /**
     * @return {?}
     */
    var filter = function () {
        var $scope = {};
        $scope.merchantId = pm.commerce.googlePayMerchantId;
        $scope.transactionInfo = {};
        /** @type {string} */
        $scope.transactionInfo.currencyCode = "USD";
        /** @type {string} */
        $scope.transactionInfo.totalPriceStatus = "FINAL";
        $scope.transactionInfo.totalPrice = res.net_balance.toString();
        /** @type {boolean} */
        $scope.shippingAddressRequired = false;
        /** @type {boolean} */
        $scope.emailRequired = false;
        var handle = pm.pageInfo.paTrackerData.screen_name;
        return [pm.settings.screenNames.shipping, pm.settings.screenNames.shippingGuest].includes(handle) && (!res.shipping_address || Object.keys(res.shipping_address).length === 0) && ($scope.shippingAddressRequired = true, $scope.emailRequired = true, $scope.allowedCountryCodes = ["US"]), $scope.cardRequirements = {}, $scope.cardRequirements.billingAddressRequired = true, $scope.cardRequirements.billingAddressFormat = "FULL", $scope;
    };
    /**
     * @return {?}
     */
    var update = function () {
        return new Promise(function (checkResult, saveNotifs) {
            if (window.google && window.google.payments) {
                _this = get();
                _this.isReadyToPay({
                    allowedPaymentMethods: f
                }).then(function (response) {
                    checkResult(response.result);
                }, function (notifications) {
                    saveNotifs(notifications);
                }).catch(function (notifications) {
                    saveNotifs(notifications);
                });
            } else {
                checkResult(false);
            }
        });
    };
    /**
     * @return {undefined}
     */
    var chooseOrderType = function () {
        _this = get();
        _this.isReadyToPay({
            allowedPaymentMethods: f
        }).then(function (jptResponseObj) {
            if (jptResponseObj.result) {
                $("#checkout_form_payment_method_gp").show();
                $("#offer_checkout_form_payment_method_gp").show();
                $(".google-pay-button").show();
            }
        }, function (a) {
        }).catch(function (a) {
        });
    };
    /**
     * @param {?} width
     * @return {undefined}
     */
    var justinImageSize = function (width) {
        res = width;
    };
    /**
     * @param {?} a
     * @return {undefined}
     */
    var t = function (a) {
        /** @type {boolean} */
        pm.commerce.googlePay.isClientSupported = false;
        setTimeout(function () {
            if (!pm.commerce.googlePay.isClientSupported) {
                init();
            }
        }, 1e4);
        update().then(function (b) {
            if (b) {
                /** @type {boolean} */
                pm.commerce.googlePay.isClientSupported = true;
                pm.commerce.googlePay.initGooglePay(a);
            } else {
                init();
            }
        }, function (a) {
            init();
        }).catch(function (a) {
            init();
        });
    };
    /**
     * @return {undefined}
     */
    var init = function () {
        var macro = utils.getUrlParams(window.location.href);
        /** @type {string} */
        var strEncoded = window.location.origin + window.location.pathname;
        if (macro.supported_payment_method) {
            /** @type {!Array<string>} */
            var action = unescape(macro.supported_payment_method).split(",");
            if (action.includes("ap")) {
                /** @type {string} */
                strEncoded = strEncoded + "?supported_payment_method=ap";
            }
        }
        /** @type {string} */
        window.location = strEncoded;
    };
    /**
     * @return {undefined}
     */
    var process_change = function () {
        /** @type {boolean} */
        pm.commerce.googlePay.isClientSupported = false;
        update().then(function (a) {
            if (a) {
                /** @type {boolean} */
                pm.commerce.googlePay.isClientSupported = true;
            }
        });
    };
    /**
     * @param {?} history
     * @return {undefined}
     */
    var createProduct = function (history) {
        /** @type {boolean} */
        pm.commerce.googlePay.isClientSupported = false;
        update().then(function (b) {
            if (b) {
                /** @type {boolean} */
                pm.commerce.googlePay.isClientSupported = true;
                pm.commerce.googlePay.initGooglePay(history);
            }
        });
    };
    return {
        initGooglePay: render,
        isReadyToPay: update,
        isClientSupported: c,
        googlePayButtonShow: chooseOrderType,
        updateGoogleClientCheckoutData: justinImageSize,
        initGooglePayForCheckout: t,
        initGooglePayForFasterCheckout: createProduct,
        checkIsGPSupported: process_change,
        googlePayFinalOrderSubmit: request
    };
}(), pm.commerce.applePay = pm.commerce.applePay || {}, pm.commerce.applePay.shippingMethods = [], pm.commerce.applePay.headers = {}, pm.commerce.applePay.headers = utils.getCsrfToken(), pm.commerce.applePay.request = undefined, pm.commerce.applePay.shippingContactSelected = function (options, value, parentOptions) {
    var result = {
        total: value.total,
        lineItems: value.lineItems
    };
    options.completeShippingContactSelection(ApplePaySession.STATUS_SUCCESS, pm.commerce.applePay.shippingMethods, result.total, result.lineItems);
}, pm.commerce.applePay.display_payment_sheet = true, pm.commerce.applePay.init_apple_pay = function (options, total, url, prefix, depth, s, n, prev, type, selector, mode, currency, name, search, value, label, graph, transitNodes) {
    /** @type {string} */
    pm.listings.post_id = transitNodes;
    if (window.ApplePaySession) {
        if ([pm.settings.screenNames.listingDetails, pm.settings.screenNames.shipping, pm.settings.screenNames.shippingGuest].includes(selector)) {
            /** @type {(Element|null)} */
            var openLoginScreenBtn = document.getElementById("apple_pay");
        } else {
            /** @type {!Element} */
            openLoginScreenBtn = document.getElementsByClassName("submit-with-loader-con")[0];
        }
        braintree.client.create({
            authorization: pm.commerce.brainTreeClientToken
        }, function (r, oothClient) {
            if (r) {
                console.error("Error creating client:", r);
                return;
            }
            braintree.applePay.create({
                client: oothClient
            }, function (r, newModelData) {
                if (r) {
                    console.error("Error creating apple pay:", r);
                } else {
                    openLoginScreenBtn.addEventListener("click", function (canCreateDiscussions) {
                        if (selector === "listing_details") {
                            var postId = $("#apple_pay").data("post-id");
                            pm.listings.post_id = postId;
                            var u = $("#apple_pay").data("url");
                            /** @type {string} */
                            var method = (parseInt(total) + parseFloat(value)).toFixed(2);
                            if (typeof $("#buy_listing_form input[type=radio]:checked").val() == "undefined") {
                                pm.flashMessage.push({
                                    text: "Sorry! Please select a size first.",
                                    duration: 5e3
                                });
                            } else {
                                pm.commerce.applePay.request = pm.commerce.applePay.construct_payment_request(method, total, value, label, graph);
                                var session = new ApplePaySession(1, pm.commerce.applePay.request);
                                /**
                                 * @param {?} event
                                 * @return {undefined}
                                 */
                                session.onvalidatemerchant = function (event) {
                                    pm.commerce.applePay.validateMerchant(newModelData, session, event);
                                };
                                /**
                                 * @param {!Object} event
                                 * @return {undefined}
                                 */
                                session.onpaymentauthorized = function (event) {
                                    pm.commerce.applePay.paymentAuthorized(newModelData, session, event, pm.listings.order_id, "checkout_form", "buy_listing_form", pm.listings.checkout_type);
                                };
                                /**
                                 * @return {undefined}
                                 */
                                session.oncancel = function () {
                                    pm.commerce.applePay.cancelApplePay(pm.listings.order_id, selector);
                                };
                                /**
                                 * @param {?} event
                                 * @return {undefined}
                                 */
                                session.onshippingcontactselected = function (event) {
                                    $("#post_inventory_form_selected_payment_method").val("ap");
                                    $.ajax({
                                        url: u,
                                        type: "POST",
                                        data: $("#buy_listing_form").serialize(),
                                        headers: pm.commerce.applePay.headers,
                                        beforeSend: function () {
                                            pm.overlay.show();
                                        },
                                        success: function (element) {
                                            pm.listings.order_id = element.order_id;
                                            pm.listings.checkout_type = element.checkout_type;
                                            pm.listings.checkout_url = element.checkout_url;
                                            pm.overlay.hide();
                                            if (element.error) {
                                                pm.flashMessage.push({
                                                    text: element.error,
                                                    duration: 1e4
                                                });
                                                pm.commerce.applePay.cancelApplePay(pm.listings.order_id, selector);
                                                session.abort();
                                            } else {
                                                pm.commerce.applePay.estimateTax(session, event, pm.listings.order_id, selector, total, value);
                                            }
                                        }
                                    });
                                };
                                if (pm.commerce.applePay.display_payment_sheet == 1) {
                                    session.begin();
                                }
                            }
                        } else {
                            if (url != "0.00") {
                                pm.commerce.applePay.request = pm.commerce.applePay.construct_payment_request(url, total, options, label, graph);
                                if (prefix.length > 0) {
                                    pm.commerce.applePay.request.shippingContact = {
                                        locality: s,
                                        administrativeArea: n,
                                        postalCode: prev,
                                        addressLines: [prefix, depth],
                                        familyName: name,
                                        givenName: search
                                    };
                                }
                                if (mode && mode != "0.00") {
                                    pm.commerce.applePay.request.lineItems.push({
                                        label: "Redeemable Balance",
                                        amount: "-" + mode
                                    });
                                }
                                if (currency && currency != "0.00") {
                                    pm.commerce.applePay.request.lineItems.push({
                                        label: "Posh Credits",
                                        amount: "-" + currency
                                    });
                                }
                                session = new ApplePaySession(1, pm.commerce.applePay.request);
                                /**
                                 * @param {?} event
                                 * @return {undefined}
                                 */
                                session.onvalidatemerchant = function (event) {
                                    pm.commerce.applePay.validateMerchant(newModelData, session, event);
                                };
                                /**
                                 * @param {!Object} event
                                 * @return {undefined}
                                 */
                                session.onpaymentauthorized = function (event) {
                                    if ([pm.settings.screenNames.shipping, pm.settings.screenNames.shippingGuest, "order"].includes(selector)) {
                                        pm.commerce.applePay.paymentAuthorized(newModelData, session, event, pm.checkout.objectId(), "checkout_form", "checkout_summary_form", type);
                                    } else {
                                        pm.commerce.applePay.paymentAuthorized(newModelData, session, event, pm.checkout.objectId(), "offer_checkout_form", "offer_summary_form", type);
                                    }
                                };
                                /**
                                 * @param {?} event
                                 * @return {undefined}
                                 */
                                session.onshippingcontactselected = function (event) {
                                    pm.commerce.applePay.estimateTax(session, event, pm.checkout.objectId(), selector, total, value);
                                };
                                /**
                                 * @return {undefined}
                                 */
                                session.oncancel = function () {
                                    pm.commerce.applePay.cancelApplePay(pm.checkout.objectId(), selector);
                                };
                                if (pm.commerce.applePay.display_payment_sheet == 1) {
                                    session.begin();
                                }
                            } else {
                                pm.flashMessage.push({
                                    text: "We are having difficulty processing your payment. Please double check the details or try another payment method.",
                                    duration: 5e3
                                });
                            }
                        }
                    });
                }
            });
        });
    }
}, pm.commerce.applePay.construct_payment_request = function (value, n, depth, i, fn) {
    var result = {
        currencyCode: "USD",
        countryCode: "US",
        total: {
            label: "Poshmark",
            amount: value
        },
        merchantCapabilities: ["supports3DS"],
        supportedNetworks: ["visa", "masterCard", "amex", "discover"],
        requiredShippingContactFields: ["postalAddress", "phone", "email", "name"],
        requiredBillingContactFields: ["postalAddress", "phone", "email", "name"],
        lineItems: [{
            label: "Sub Total",
            amount: n
        }, {
            label: "Shipping",
            amount: depth
        }, {
            label: fn,
            amount: i
        }]
    };
    return result;
}, pm.commerce.applePay.validateMerchant = function (model, session, event) {
    model.performValidation({
        validationURL: event.validationURL,
        displayName: "Poshmark",
        merchantIdentifier: pm.commerce.merchantIdentifier
    }, function (a, fakeMerchantSession) {
        if (a) {
            session.completePayment(ApplePaySession.STATUS_FAILURE);
            return;
        }
        session.completeMerchantValidation(fakeMerchantSession);
    });
}, pm.commerce.applePay.paymentAuthorized = function (state, session, options, frequency, res, request_id, data) {
    session.completePayment(ApplePaySession.STATUS_SUCCESS);
    var _token = options.payment.token;
    state.tokenize({
        token: _token
    }, function (a, testItemData) {
        if (a) {
            session.completePayment(ApplePaySession.STATUS_FAILURE);
            return;
        }
        pm.commerce.applePay.submitAPNonce(testItemData, options.payment, frequency, res, request_id, data);
    });
}, pm.commerce.applePay.submitAPNonce = function (data, elem, c, e, d, expression) {
    var obj = utils.getFormDataHash(e, []);
    BraintreeData.setup(pm.commerce.brainTreeMerchantId, d, BraintreeData.environments[pm.commerce.braintreeEnv]);
    obj[e + "[cc_nonce]"] = data.nonce;
    obj[e + "[bt_device_data]"] = $("#device_data").val();
    /** @type {string} */
    obj[e + "[payment_type]"] = "bt";
    /** @type {string} */
    obj[e + "[payment_method]"] = "ap";
    var result = elem.shippingContact;
    var address = elem.billingContact;
    obj[e + "[billing_address_street]"] = address.addressLines[0];
    obj[e + "[billing_address_street2]"] = address.addressLines[1] || "";
    obj[e + "[billing_address_city]"] = address.locality;
    obj[e + "[billing_address_state]"] = address.administrativeArea;
    obj[e + "[billing_address_zip]"] = address.postalCode;
    obj[e + "[shipping_address_street]"] = result.addressLines[0];
    obj[e + "[shipping_address_street2]"] = result.addressLines[1] || "";
    obj[e + "[shipping_address_city]"] = result.locality;
    obj[e + "[shipping_address_state]"] = result.administrativeArea;
    obj[e + "[shipping_address_zip]"] = result.postalCode;
    /** @type {string} */
    obj[e + "[shipping_address_name]"] = result.givenName + " " + result.familyName;
    if (pm.userInfo.isLoggedIn()) {
        if (e == "checkout_form") {
            /** @type {string} */
            obj[e + "[checkout_type]"] = expression;
            $.ajax({
                type: "POST",
                url: "/order/" + c + "/final_checkout",
                data: obj,
                headers: pm.commerce.applePay.headers,
                beforeSend: function () {
                    pm.overlay.show();
                },
                success: pm.checkout.checkoutFinalOrderSuccess,
                dataType: "json"
            });
            try {
                gtag("event", "submit_order_button_clicked", {
                    event_category: "listing",
                    event_label: pm.checkout.objectId(),
                    send_to: pm.tracker.gaTrackers
                });
            } catch (conv_reverse_sort) {
                console.log(conv_reverse_sort);
            }
        } else {
            var form = $("#offer_summary_form");
            $.ajax({
                type: "POST",
                url: form.attr("action"),
                data: obj,
                headers: pm.commerce.applePay.headers,
                beforeSend: function () {
                    pm.hudMessage.push({
                        type: 1,
                        text: "Processing..."
                    });
                },
                success: pm.checkout.finalOfferCheckoutSuccess,
                pm_context: {
                    form: form
                },
                dataType: "json"
            });
        }
    } else {
        try {
            obj[e + "[user_email]"] = result.emailAddress;
            obj[e + "[first_name]"] = result.givenName;
            obj[e + "[last_name]"] = result.familyName;
            obj[e + "[iobb]"] = ioGetBlackbox().blackbox;
            var action_url = pm.listings.checkout_url;
            var handle = pm.pageInfo.paTrackerData.screen_name;
            if ([pm.settings.screenNames.shipping, pm.settings.screenNames.shippingGuest].includes(handle)) {
                action_url = $(pm.checkout.formObj()).attr("action");
            }
            $.ajax({
                type: "POST",
                url: action_url,
                data: obj,
                headers: utils.getCsrfToken(),
                beforeSend: function () {
                    pm.overlay.show();
                },
                success: function (value) {
                    pm.overlay.hide();
                    if (value.error) {
                        pm.flashMessage.push.push({
                            text: value.error,
                            duration: 1e4
                        });
                    } else {
                        if (value.errors) {
                            /** @type {*} */
                            n = JSON.parse(value.errors);
                            pm.flashMessage.push.push({
                                text: n.base[0],
                                duration: 1e4
                            });
                        } else {
                            if (value.modal_html) {
                                var $cover_details = $(value.modal_html).appendTo("#content").first();
                                $cover_details.modal("show");
                            } else {
                                if (value.submit_order_url) {
                                    $.ajax({
                                        type: "POST",
                                        url: value.submit_order_url,
                                        data: obj,
                                        headers: pm.commerce.applePay.headers,
                                        beforeSend: function () {
                                            pm.overlay.show();
                                        },
                                        success: pm.checkout.checkoutFinalOrderSuccess,
                                        dataType: "json"
                                    });
                                } else {
                                    pm.flashMessage.push({
                                        text: "We are having difficulty processing your payment. Please double check the details or try another payment method.",
                                        duration: 5e3
                                    });
                                }
                            }
                        }
                    }
                },
                dataType: "json"
            });
        } catch (n) {
            pm.flashMessage.push({
                text: "We are having difficulty processing your request. Please try again after sometime.",
                duration: 5e3
            });
        }
    }
}, pm.commerce.applePay.cancelApplePay = function (c, callback) {
    if (typeof c != "undefined" && typeof callback != "undefined" && callback == "listing_details") {
        $.ajax({
            url: "/order/" + c + "/cancel",
            type: "POST",
            headers: pm.commerce.applePay.headers,
            success: function (obj) {
                if (obj.error) {
                    console.log("cancelling session failed");
                }
            }
        });
    }
    $("#post_inventory_form_selected_payment_method").val("non-ap");
}, pm.commerce.applePay.estimateTax = function (path, options, d, type, v, arg) {
    var ret = undefined;
    var txDataQueue = undefined;
    if (pm.userInfo.isLoggedIn()) {
        if (type == "offer") {
            /** @type {string} */
            txDataQueue = "/offer/" + d + "/estimate_sales_tax";
        } else {
            /** @type {string} */
            txDataQueue = "/order/" + d + "/estimate_sales_tax";
        }
    } else {
        if (typeof d == "undefined" && typeof pm.listings.post_id != "undefined") {
            /** @type {string} */
            txDataQueue = "/listing/" + pm.listings.post_id + "/estimate_sales_tax";
        } else {
            /** @type {string} */
            txDataQueue = "/order/" + d + "/estimate_sales_tax";
        }
    }
    if (options.shippingContact !== undefined) {
        var address = options.shippingContact;
        var maindata3 = {
            shipping_address: {
                city: address.locality,
                state: address.administrativeArea,
                zip: address.postalCode
            }
        };
        if (typeof txDataQueue != "undefined") {
            $.ajax({
                url: txDataQueue,
                type: "GET",
                headers: pm.commerce.applePay.headers,
                data: maindata3,
                dataType: "json",
                success: function (item) {
                    if (item.error) {
                        pm.flashMessage.push({
                            text: item.error,
                            duration: 1e4
                        });
                        pm.commerce.applePay.cancelApplePay(d, type);
                        path.abort();
                    } else {
                        if (pm.userInfo.isLoggedIn()) {
                            var f = item.net_balance_amount;
                            if (f != "0.00") {
                                ret = pm.commerce.applePay.construct_payment_request(f, item.sub_total, item.shipping_amount, item.total_tax, item.tax_field_label);
                                if (item["redeemable_to_apply_amount"] != "0.00") {
                                    ret.lineItems.push({
                                        label: "Redeemable Balance",
                                        amount: "-" + item.redeemable_to_apply_amount
                                    });
                                }
                                if (item["credits_to_apply_amount"] != "0.00") {
                                    ret.lineItems.push({
                                        label: "Posh Credits",
                                        amount: "-" + item.credits_to_apply_amount
                                    });
                                }
                            } else {
                                pm.flashMessage.push({
                                    text: "We are having difficulty processing your payment. Please double check the details or try another payment method.",
                                    duration: 5e3
                                });
                                pm.commerce.applePay.cancelApplePay(d, type);
                                path.abort();
                            }
                        } else {
                            f = item.net_balance_amount;
                            ret = pm.commerce.applePay.construct_payment_request(f, item.sub_total, item.shipping_amount, item.total_tax, item.tax_field_label);
                        }
                        pm.commerce.applePay.request = pm.commerce.applePay.shippingContactSelected(path, ret, options);
                    }
                },
                error: function () {
                    /** @type {string} */
                    var hrp = (parseInt(v) + parseFloat(arg)).toFixed(2);
                    ret = pm.commerce.applePay.construct_payment_request(hrp, v, arg, "0.00", "Tax");
                    pm.commerce.applePay.request = pm.commerce.applePay.shippingContactSelected(path, ret, options);
                }
            });
        } else {
            /** @type {string} */
            var hrp = (parseInt(v) + parseFloat(arg)).toFixed(2);
            ret = pm.commerce.applePay.construct_payment_request(hrp, v, arg, "0.00", "Tax");
            pm.commerce.applePay.request = pm.commerce.applePay.shippingContactSelected(path, ret, options);
        }
    }
}, pm.commerce.PayPal = pm.commerce.PayPal || {}, pm.commerce.PayPal.errMsg = "Sorry! There was an error while processing your request. Please try again.", pm.commerce.PayPal.init = function (comment, num) {
    /** @type {boolean} */
    var c = false;
    if ($("#paypal-btn").length > 0) {
        $("#paypal-btn").removeClass("hide");
        /** @type {boolean} */
        c = true;
    }
    if ($("#paypal-credit-btn").length > 0) {
        $("#paypal-credit-btn").removeClass("hide");
        /** @type {boolean} */
        c = true;
    }
    if (c) {
        pm.commerce.PayPal.submitPaypal(comment, num);
    }
}, pm.commerce.PayPal.initPaypalCredit = function (type, num) {
    if ($("#paypal-credit-btn").length > 0) {
        $("#paypal-credit-btn").removeClass("hide");
        pm.commerce.PayPal.submitPaypal(type, num);
    }
}, pm.commerce.PayPal.submitPaypal = function (type, index) {
    var author = pm.pageInfo.paTrackerData.screen_name;
    var nativeCreate = braintree.client.create;
    nativeCreate({
        authorization: pm.commerce.brainTreeClientToken
    }, function (a, oothClient) {
        braintree.paypal.create({
            client: oothClient
        }, function (a, b) {
            if (a) {
                return [pm.settings.screenNames.listingDetails, pm.settings.screenNames.shipping, pm.settings.screenNames.shippingGuest].includes(author) ? pm.flashMessage.push({
                    text: pm.commerce.PayPal.errMsg,
                    duration: 5e3
                }) : validate_obj.add_base_error(pm.checkout.formObj(), pm.commerce.PayPal.errMsg), false;
            }
            pm.commerce.paypalInstance = b;
            document.querySelector("#paypal-btn").addEventListener("click", function (event) {
                event.preventDefault();
                pm.commerce.PayPal.initSubmitPayment(author, b, false);
            }, false);
            if ($("#paypal-credit-btn").length > 0) {
                document.querySelector("#paypal-credit-btn").addEventListener("click", function (event) {
                    event.preventDefault();
                    pm.commerce.PayPal.initSubmitPayment(author, b, true);
                }, false);
            }
        });
    });
}, pm.commerce.PayPal.initSubmitPayment = function (a, b, rev) {
    if (a === "listing_details") {
        var url = $("#paypal-btn").data("url");
        if (typeof $("#buy_listing_form input[type=radio]:checked").val() == "undefined") {
            $("#size-selector-modal").modal("show");
            $("#size_selector_form").attr({
                action: "paypal",
                allow_paypal_credit: rev
            });
        } else {
            $("#post_inventory_form_selected_payment_method").val("pp");
            pm.commerce.PayPal.submitPayment($("#buy_listing_form").serialize(), rev);
        }
    } else {
        if ([pm.settings.screenNames.shipping, pm.settings.screenNames.shippingGuest].includes(a)) {
            pm.hudMessage.push({
                type: 1,
                text: "Processing..."
            });
        }
        b.tokenize({
            flow: "vault",
            enableShippingAddress: true,
            enableBillingAddress: true,
            headless: true,
            offerCredit: rev
        }, function (b, tagRequest) {
            if (b) {
                return [pm.settings.screenNames.shipping, pm.settings.screenNames.shippingGuest].includes(a) ? (pm.hudMessage.dismiss(), pm.flashMessage.push({
                    text: pm.commerce.PayPal.errMsg,
                    duration: 5e3
                })) : validate_obj.add_base_error(pm.checkout.formObj(), pm.commerce.PayPal.errMsg), false;
            }
            url = $(pm.checkout.formObj()).attr("action");
            if (pm.userInfo.isLoggedIn() && [pm.settings.screenNames.shipping, pm.settings.screenNames.shippingGuest].includes(a)) {
                url = pm.routes.addPaypalPaymentInfo(pm.checkout.objectId());
            }
            pm.commerce.PayPal.submitPPNonce(tagRequest, pm.checkout.objectId(), a, url);
        });
    }
}, pm.commerce.PayPal.submitPayment = function (t, b) {
    pm.hudMessage.push({
        type: 1,
        text: "Processing..."
    });
    pm.commerce.paypalInstance.tokenize({
        flow: "vault",
        enableShippingAddress: true,
        enableBillingAddress: true,
        headless: true,
        offerCredit: b
    }, function (b, tagRequest) {
        if (b) {
            return pm.hudMessage.dismiss(), pm.flashMessage.push({
                text: pm.commerce.PayPal.errMsg,
                duration: 5e3
            }), false;
        }
        $("#post_inventory_form_selected_payment_method").val("pp");
        $.ajax({
            url: $("#paypal-btn").data("url"),
            type: "POST",
            data: t,
            success: function (element) {
                pm.listings.order_id = element.order_id;
                if (element.error) {
                    pm.hudMessage.dismiss();
                    pm.flashMessage.push({
                        text: element.error,
                        duration: 1e4
                    });
                } else {
                    pm.commerce.PayPal.submitPPNonce(tagRequest, pm.listings.order_id, pm.pageInfo.paTrackerData.screen_name, element.checkout_url);
                }
            }
        });
    });
}, pm.commerce.PayPal.submitPPNonce = function (request, event, text, url) {
    formId = pm.checkout.formId() || "checkout_form";
    /** @type {null} */
    var results = null;
    if ([pm.settings.screenNames.listingDetails, pm.settings.screenNames.shipping, pm.settings.screenNames.shippingGuest].includes(text)) {
        results = utils.getFormDataHash(pm.checkout.formId(), []);
    } else {
        results = pm_obj.getFormDataHash(pm.checkout.formId(), []);
    }
    results[formId + "[cc_nonce]"] = request.nonce;
    results[formId + "[bt_device_data]"] = $("#device_data").val();
    results[formId + "[iobb]"] = ioGetBlackbox().blackbox;
    /** @type {string} */
    results[formId + "[payment_type]"] = "bt";
    /** @type {string} */
    results[formId + "[payment_method]"] = "pp";
    pp_billing_address = request.details.billingAddress;
    pp_shipping_address = request.details.shippingAddress;
    if (!pm.userInfo.isLoggedIn()) {
        results[formId + "[user_email]"] = request.details.email;
        results[formId + "[first_name]"] = request.details.firstName;
        results[formId + "[last_name]"] = request.details.lastName;
    }
    /** @type {string} */
    results[formId + "[billing_address_name]"] = request.details.firstName + " " + request.details.lastName;
    results[formId + "[shipping_address_name]"] = pp_shipping_address.recipientName;
    results[formId + "[billing_address_street]"] = pp_billing_address.line1;
    results[formId + "[billing_address_street2]"] = pp_billing_address.line2 || "";
    results[formId + "[billing_address_city]"] = pp_billing_address.city;
    results[formId + "[billing_address_state]"] = pp_billing_address.state;
    results[formId + "[billing_address_zip]"] = pp_billing_address.postalCode;
    results[formId + "[shipping_address_street]"] = pp_shipping_address.line1;
    results[formId + "[shipping_address_street2]"] = pp_shipping_address.line2 || "";
    results[formId + "[shipping_address_city]"] = pp_shipping_address.city;
    results[formId + "[shipping_address_state]"] = pp_shipping_address.state;
    results[formId + "[shipping_address_zip]"] = pp_shipping_address.postalCode;
    if ([pm.settings.screenNames.shipping, pm.settings.screenNames.shippingGuest].includes(text)) {
        /** @type {boolean} */
        results.fast_checkout = true;
    }
    $.ajax({
        type: "POST",
        url: url,
        data: results,
        headers: utils.getCsrfToken(),
        beforeSend: function () {
            if (![pm.settings.screenNames.listingDetails, pm.settings.screenNames.shipping, pm.settings.screenNames.shippingGuest].includes(text)) {
                pm.flashMessage.push({
                    type: 1,
                    text: "Processing..."
                });
            }
        },
        success: function (obj) {
            if ([pm.settings.screenNames.listingDetails, pm.settings.screenNames.shipping, pm.settings.screenNames.shippingGuest].includes(text)) {
                pm.hudMessage.dismiss();
                if (obj.error) {
                    pm.flashMessage.push({
                        text: obj.error,
                        duration: 1e4
                    });
                } else {
                    if (obj.errors) {
                        /** @type {*} */
                        var copy_bits = JSON.parse(obj.errors);
                        pm.flashMessage.push({
                            text: copy_bits.base[0],
                            duration: 1e4
                        });
                    } else {
                        if (obj.modal_html) {
                            try {
                                $("#" + $(obj.modal_html).attr("id")).remove();
                            } catch (b) {
                            }
                            var $cover_details = $(obj.modal_html).appendTo("#content").first();
                            $cover_details.modal("show");
                        } else {
                            if (obj.submit_order_url) {
                                window.location.href = obj.submit_order_url;
                            }
                        }
                    }
                }
            } else {
                if (obj.errors) {
                    validate_obj.clear_form_errors(formId);
                    validate_obj.add_errors(pm.checkout.formObj(), formId, obj.errors);
                    $("body").scrollTop(0);
                } else {
                    if (obj.error) {
                        flash_message_obj.push({
                            text: obj.error,
                            duration: 5e3
                        });
                    } else {
                        if (obj.modal_html) {
                            try {
                                $("#" + $(obj.modal_html).attr("id")).remove();
                            } catch (b) {
                            }
                            $cover_details = $(obj.modal_html).appendTo("main").first();
                            $cover_details.modal("show");
                        } else {
                            if (obj.submit_order_url) {
                                if (user_info_obj.is_logged_in()) {
                                    $.ajax({
                                        type: "POST",
                                        url: obj.submit_order_url,
                                        data: results,
                                        headers: utils.getCsrfToken(),
                                        beforeSend: function () {
                                            pm.flashMessage.push({
                                                type: 1,
                                                text: "Processing..."
                                            });
                                        },
                                        success: function (obj) {
                                            if (obj.errors) {
                                                validate_obj.clear_form_errors(formId);
                                                validate_obj.add_errors(pm.checkout.formObj(), formId, obj.errors);
                                                $("body").scrollTop(0);
                                            } else {
                                                if (obj.error) {
                                                    flash_message_obj.push({
                                                        text: obj.error,
                                                        duration: 5e3
                                                    });
                                                } else {
                                                    if (obj.modal_html) {
                                                        try {
                                                            $("#" + $(obj.modal_html).attr("id")).remove();
                                                        } catch (b) {
                                                        }
                                                        var $cover_details = $(obj.modal_html).appendTo("main").first();
                                                        $cover_details.modal("show");
                                                    } else {
                                                        if (obj.submit_order_url) {
                                                            window.location.href = obj.submit_order_url;
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        dataType: "json"
                                    });
                                } else {
                                    window.location.href = obj.submit_order_url;
                                }
                            }
                        }
                    }
                }
            }
        },
        dataType: "json"
    });
}, pm.settings = pm.settings || {}, pm.settings.ga = [], pm.settings.ga.accountId = "UA-24801737-5", pm.settings.adwords = {}, pm.settings.adwords.main = {}, pm.settings.adwords.retargeting = {}, pm.settings.adwords.main.accountId = "AW-1008471087", pm.settings.adwords.main.purchaseLabel = "oWPzCMHB1mcQr5jw4AM", pm.settings.adwords.main.d1_purchase_label = "DeL_CJz9tYcBEK-Y8OAD", pm.settings.adwords.main.signupLabel = "dXINCKqKuIABEK-Y8OAD", pm.settings.adwords.retargeting.accountId = "AW-780917115",
    pm.settings.adwords.retargeting.purchaseLabel = "0ho4CNi_8I8BEPuyr_QC", pm.settings.adwords.retargeting.signupLabel = "P1ZrCKnD8I8BEPuyr_QC", pm.settings.fb = [], pm.settings.fb.id = "182809591793403", pm.settings.gp = {}, pm.settings.gp.id = "917058316614.apps.googleusercontent.com", pm.settings.webUserNotificationTimeouts = [15e3, 3e4, 6e4, 9e4, 12e4], pm.settings.appScheme = "poshmark", pm.settings.androidAppPackage = "com.poshmark.app", pm.settings.searchPreferenceExpiryDays = 30, pm.settings.env =
    "production", pm.settings.userAppChoiceExpiryMins = {
    max: 525600,
    min: 5040
}, pm.settings.userSearchPreferenceExpiryMins = {
    max: pm.settings.searchPreferenceExpiryDays * 24 * 60,
    min: 10080
}, pm.settings.branch_api_key = "key_live_nlluzKlFN7wzrkZXRG83zklgjbfSurdH", pm.settings.trackedOpenInAppLink = "https://bnc.lt/a/key_live_nlluzKlFN7wzrkZXRG83zklgjbfSurdH/?channel=web&feature=open_in_app&campaign=tracked_app_link", pm.settings.itunesStoreUrl = "http://itunes.apple.com/us/app/poshmark/id470412147?mt=8&uo=4", pm.settings.androidPlayStoreUrl = "http://play.google.com/store/apps/details?id=com.poshmark.app", pm.settings.listingPinitBtn = true, pm.settings.trackingEventUrl = "//et.poshmark.com/trck/events",
    pm.settings.webAppUrl = "https://poshmark.com", pm.settings.autoCompleteEnabled = true, pm.settings.bannerHideTime = 30, pm.settings.screenNames = {}, pm.settings.screenNames.listingDetails = "listing_details", pm.settings.screenNames.shipping = "shipping", pm.settings.screenNames.shippingGuest = "shipping_guest", pm.userInfo = function () {
    /**
     * @return {?}
     */
    var embedded = function () {
        var server = utils.getCookie("ui");
        return server ? $.parseJSON(utils.getCookie("ui")) : null;
    };
    /**
     * @return {?}
     */
    var startNotificationsService = function () {
        return embedded().dh;
    };
    /**
     * @return {?}
     */
    var parseCity = function () {
        return embedded().uit;
    };
    /**
     * @return {?}
     */
    var clock = function () {
        return embedded().uid;
    };
    /**
     * @return {?}
     */
    var userRoles = function () {
        return embedded().roles;
    };
    /**
     * @return {?}
     */
    var isLoggedIn = function () {
        return embedded() != null && embedded().gbe == null;
    };
    /**
     * @return {?}
     */
    var isGuest = function () {
        return embedded() != null && embedded().gbe != null;
    };
    /**
     * @return {?}
     */
    var getLastPath = function () {
        return getCookie("mysize");
    };
    /**
     * @return {?}
     */
    var getDomPage = function () {
        return pm.pageInfo.bSegment;
    };
    /**
     * @return {?}
     */
    var getRenderingStatus = function () {
        return pm.pageInfo.uSegment;
    };
    /**
     * @return {?}
     */
    var setRenderingStatus = function () {
        return pm.pageInfo.cSegment;
    };
    /**
     * @return {?}
     */
    var get = function () {
        return jQuery.parseJSON(utils.getCookie("ps"));
    };
    /**
     * @return {?}
     */
    var render = function () {
        var param = $.parseJSON(utils.getCookie("exp"));
        return param ? param.val : "all";
    };
    /**
     * @param {string} key
     * @return {undefined}
     */
    var register = function (key) {
        var value = $.parseJSON(utils.getCookie("exp"));
        /** @type {string} */
        value.val = key;
        utils.setCookie("exp", JSON.stringify(value));
    };
    return {
        getUserCookie: embedded,
        displayHandle: startNotificationsService,
        userTinyImage: parseCity,
        userId: clock,
        userRoles: userRoles,
        isLoggedIn: isLoggedIn,
        isGuest: isGuest,
        mySize: getLastPath,
        browserSegment: getDomPage,
        userSegment: getRenderingStatus,
        contentSegment: setRenderingStatus,
        ps: get,
        experience: render,
        setExperience: register
    };
}(), pm.tracker = function () {
    var render;
    var config = {
        screen: "screen",
        popup: "popup",
        drop_down: "drop_down",
        alert: "alert"
    };
    var views = {
        unspecified: "unspecified"
    };
    var name = {
        bundle: "bundle",
        likes: "likes",
        byMe: "by_me",
        forMe: "for_me",
        unspecified: "unspecified"
    };
    var self = {
        view: "view",
        click: "click",
        externalShare: "external_share"
    };
    var data = {
        button: "button",
        image: "image",
        link: "link"
    };
    var payload = {
        page: "page",
        pageElement: "page_element"
    };
    var msg = {
        to: "to",
        "with": "with"
    };
    /**
     * @param {!Object} data
     * @return {?}
     */
    var set = function (data) {
        var INTEGER;
        var graphContainer;
        var req;
        var username;
        var result;
        var obj;
        if (pm.userInfo.isLoggedIn() || pm.userInfo.isGuest()) {
            INTEGER = pm.userInfo.userId();
        }
        /** @type {number} */
        graphContainer = (new Date).getTime() / 1e3;
        username = pm.pageInfo.paTrackerData ? pm.pageInfo.paTrackerData.screen_name : views.unspecified;
        result = {
            name: data.name,
            url: window.location.pathname + window.location.search,
            type: data.element_type
        };
        obj = {
            name: data.on_screen_name || username,
            url: window.location.pathname + window.location.search,
            type: data.on_screen_type || config.screen
        };
        if (data.tab) {
            result.tab = data.tab;
            obj.tab = data.tab;
        }
        req = {
            schema_version: "0.2",
            app: {
                type: "web"
            },
            request: {
                at: graphContainer
            },
            events: [{
                at: graphContainer,
                visitor_id: pm.userInfo.ps().bid,
                user_id: INTEGER,
                guest: pm.userInfo.isGuest(),
                action: data.type,
                element: result,
                properties: data.properties
            }]
        };
        if (data.type === self.view) {
            req.events[0].referrer_url = data.referrer_url || document.referrer;
        }
        if (data.type === self.click || data.type === self.view && data.element_type === config.popup) {
            req.events[0].on_screen = obj;
        }
        return req;
    };
    /**
     * @param {!Object} options
     * @param {boolean} d
     * @return {?}
     */
    render = function (options, d) {
        /** @type {string} */
        var GET_USER_PROFILE_SUCCESS = options.type === self.view ? payload.page : payload.pageElement;
        var name = pm.pageInfo.paTrackerData ? pm.pageInfo.paTrackerData.screen_name : views.unspecified;
        var data;
        data = {
            type: GET_USER_PROFILE_SUCCESS,
            url: window.location.pathname + window.location.search
        };
        if (options.tab) {
            data.tab = options.tab;
        }
        if (d) {
            data.name = options.name;
            if (options.type === self.view) {
                data.screen_type = options.element_type;
            } else {
                data.element_type = options.element_type;
            }
        } else {
            var obj = parse(options);
            data.name = obj.name || name;
            data.screen_type = obj.screen_type || config.screen;
            /** @type {string} */
            data.type = payload.page;
        }
        return data;
    };
    /**
     * @param {!Object} res
     * @return {?}
     */
    var parse = function (res) {
        var current_screen = {};
        return current_screen.name = res.attributes ? res.attributes.paScreenName : res.on_screen_name, current_screen.screen_type = res.attributes ? res.attributes.paScreenType : res.on_screen_type, current_screen;
    };
    /**
     * @param {!Object} data
     * @return {?}
     */
    var update = function (data) {
        var INTEGER;
        var graphContainer;
        var options;
        if (pm.userInfo.isLoggedIn() || pm.userInfo.isGuest()) {
            INTEGER = pm.userInfo.userId();
        }
        /** @type {number} */
        graphContainer = (new Date).getTime() / 1e3;
        options = {
            schema_version: "0.3",
            app: {
                type: "web"
            },
            request: {
                at: graphContainer
            },
            events: [{
                at: graphContainer,
                visitor_id: pm.userInfo.ps().bid,
                user_id: INTEGER,
                guest: pm.userInfo.isGuest(),
                verb: data.type,
                direct_object: data.directObject ? data.directObject : render(data, true),
                properties: data.properties,
                base_exp: pm.userInfo.experience(),
                exp: pm.userInfo.experience()
            }]
        };
        if (data.type === self.view) {
            options.events[0].referrer_url = data.referrer_url || document.referrer;
        }
        if (data.type === self.click || data.type === self.view && data.element_type !== config.screen) {
            options.events[0].on = data.on ? data.on : render(data, false);
        }
        if (data.type !== self.view && data.type !== self.click) {
            var i;
            for (i in msg) {
                if (msg.hasOwnProperty(i) && data[i]) {
                    options.events[0][msg[i]] = data[i];
                }
            }
        }
        return options;
    };
    /**
     * @param {!Object} files
     * @return {undefined}
     */
    var callback = function (files) {
        try {
            var result;
            if (pm.pageInfo.paTrackingSchemaUpdate) {
                result = update(files);
            } else {
                result = set(files);
            }
            $.get(pm.settings.trackingEventUrl, {
                data: encodeURIComponent(JSON.stringify(result))
            });
        } catch (conv_reverse_sort) {
            console.log("track_error");
            console.log(conv_reverse_sort);
        }
    };
    /**
     * @param {?} extension
     * @return {?}
     */
    var extend = function (extension) {
        var ext = extension;
        var orig = {};
        var name;
        for (name in ext) {
            if (name.substring(0, 6) == "paAttr") {
                orig[name.substring(6).toLowerCase()] = ext[name];
            }
        }
        return orig;
    };
    /**
     * @param {!Object} user
     * @return {undefined}
     */
    var create = function (user) {
        var props = extend(user.data.attributes);
        /** @type {!Array} */
        var newNodeLists = [];
        var d;
        var key;
        for (key in props) {
            if (props.hasOwnProperty(key)) {
                newNodeLists.push(key + ":" + props[key]);
            }
        }
        if (pm.pageInfo.paTrackingEnabled && !utils.isBot()) {
            user.data.name = user.data.attributes.paName;
            user.data.properties = props;
            callback(user.data);
        }
    };
    /**
     * @param {!Object} tab
     * @return {undefined}
     */
    var search = function (tab) {
        if (pm.pageInfo.paTrackingEnabled && !pm.pageInfo.firedOnServer) {
            callback(tab.data);
        }
    };
    /**
     * @param {!Object} tab
     * @return {undefined}
     */
    var onPageActionClicked = function (tab) {
        if (pm.pageInfo.paTrackingEnabled && !pm.pageInfo.firedOnServer) {
            callback(tab.data);
        }
    };
    /**
     * @param {!Object} event
     * @return {undefined}
     */
    var init = function (event) {
        var type = event.nodeName;
        var special = {
            BUTTON: pm.tracker.elementType.button,
            A: pm.tracker.elementType.link,
            IMG: pm.tracker.elementType.image
        };
        var element_type = $(event).data("paClickType") || special[type] || pm.tracker.elementType.button;
        var obj = {
            type: pm.tracker.actionType.click,
            element_type: element_type,
            attributes: $(event).data()
        };
        if (pm.pageInfo.paTrackerData && pm.pageInfo.paTrackerData.tab_name) {
            obj.tab = pm.pageInfo.paTrackerData.tab_name;
        }
        pm.tracker.clickTrack({
            data: obj
        });
    };
    /**
     * @return {?}
     */
    var DocumentView_parseScale = function () {
        var metadata = {
            type: pm.tracker.actionType.view,
            name: pm.pageInfo.paTrackerData ? pm.pageInfo.paTrackerData.screen_name : pm.tracker.screenName.unspecified,
            element_type: pm.tracker.screenType.screen,
            properties: pm.pageInfo.paTrackerData ? pm.pageInfo.paTrackerData.screen_properties : null
        };
        return pm.pageInfo.paTrackerData && pm.pageInfo.paTrackerData.tab_name && (metadata.tab = pm.pageInfo.paTrackerData.tab_name), metadata;
    };
    return {
        clickTrack: create,
        screenView: search,
        eventTrack: onPageActionClicked,
        screenType: config,
        screenName: views,
        tabName: name,
        actionType: self,
        elementType: data,
        setUpClickTrack: init,
        setUpScreenView: DocumentView_parseScale
    };
}(), pm.tracker.gaTrackers = [pm.settings.ga.accountId], pm.tracker.AdwordsPurchaseTrackers = [pm.settings.adwords.main.accountId + "/" + pm.settings.adwords.main.purchaseLabel, pm.settings.adwords.retargeting.accountId + "/" + pm.settings.adwords.retargeting.purchaseLabel], pm.tracker.AdwordsSignupTrackers = [pm.settings.adwords.main.accountId + "/" + pm.settings.adwords.main.signupLabel, pm.settings.adwords.retargeting.accountId + "/" + pm.settings.adwords.retargeting.signupLabel], pm.tracker.AdwordsD1PurchaseTrackers =
    [pm.settings.adwords.main.accountId + "/" + pm.settings.adwords.main.d1_purchase_label], pm.userInfo.isLoggedIn() ? gtag("config", pm.settings.ga.accountId, {
    dimension1: pm.userInfo.displayHandle() + "_" + pm.userInfo.userId(),
    dimension2: pm.userInfo.userSegment(),
    dimension3: utils.daysSinceSignup(pm.userInfo.userId()).toString(),
    dimension4: pm.userInfo.browserSegment(),
    content_group1: pm.pageInfo.gaPageType || "Other Page Type",
    currency: "USD",
    country: "US",
    linker: {
        accept_incoming: true
    }
}) : gtag("config", pm.settings.ga.accountId, {
    dimension1: "",
    dimension2: "",
    dimension3: "guest_visitor",
    dimension4: pm.userInfo.browserSegment(),
    currency: "USD",
    country: "US",
    content_group1: pm.pageInfo.gaPageType || "Other Page Type",
    linker: {
        accept_incoming: true
    }
});
try {
    $(document).ready(function () {
        var maindata3 = pm.tracker.setUpScreenView();
        pm.tracker.screenView({
            data: maindata3
        });
        $("body").on("click", "div[data-pa-name], li[data-pa-name], img[data-pa-name], a[data-pa-name], button[data-pa-name], span[data-pa-name], input[data-pa-name], form[data-pa-name], i[data-pa-name], select[data-pa-name]", function (a) {
            pm.tracker.setUpClickTrack(this);
        });
        $(document).on("change", "select[data-pa-name]", function (a) {
            pm.tracker.setUpClickTrack(this);
        });
    });
    $(document).on("infiniteScroll:complete", function (a, sortL) {
        var a = pm.pageInfo.paTrackerData && pm.pageInfo.paTrackerData.screen_properties ? pm.pageInfo.paTrackerData.screen_properties : {};
        a.scroll_depth = sortL;
        var metadata = {
            type: pm.tracker.actionType.view,
            name: pm.pageInfo.paTrackerData ? pm.pageInfo.paTrackerData.screen_name : pm.tracker.screenName.unspecified,
            element_type: pm.tracker.screenType.screen,
            properties: a
        };
        /** @type {string} */
        metadata.referrer_url = document.location.href;
        if (pm.pageInfo.paTrackerData && pm.pageInfo.paTrackerData.tab_name) {
            metadata.tab = pm.pageInfo.paTrackerData.tab_name;
        }
        pm.tracker.screenView({
            data: metadata
        });
    });
    $(document).on("show.bs.modal", ".modal[data-pa-modal-name]", function () {
        if (this.dataset.paModalName) {
            pm.tracker.screenView({
                data: {
                    type: pm.tracker.actionType.view,
                    name: this.dataset.paModalName,
                    element_type: pm.tracker.screenType.popup,
                    properties: pm.pageInfo.paTrackerData ? pm.pageInfo.paTrackerData.screen_properties : null,
                    tab: pm.pageInfo.paTrackerData && pm.pageInfo.paTrackerData.tab_name ? pm.pageInfo.paTrackerData.tab_name : null,
                    referrer_url: document.location.href
                }
            });
        }
    });
    $(document).on("show.bs.dropdown", ".dropdown[data-pa-dropdown-name]", function () {
        if (this.dataset.paDropdownName) {
            pm.tracker.screenView({
                data: {
                    type: pm.tracker.actionType.view,
                    name: this.dataset.paDropdownName,
                    element_type: pm.tracker.screenType.drop_down,
                    properties: pm.pageInfo.paTrackerData ? pm.pageInfo.paTrackerData.screen_properties : null,
                    tab: pm.pageInfo.paTrackerData && pm.pageInfo.paTrackerData.tab_name ? pm.pageInfo.paTrackerData.tab_name : null,
                    referrer_url: document.location.href
                }
            });
        }
    });
} catch (conv_reverse_sort) {
    console.log(conv_reverse_sort);
}
pm.routes = function () {
    /**
     * @return {?}
     */
    var a = function () {
        return "/search/suggested";
    };
    /**
     * @return {?}
     */
    var b = function () {
        return "/news/user_new_notifications";
    };
    /**
     * @param {boolean} hide
     * @return {?}
     */
    var showOrHideImage = function (hide) {
        return hide ? pm.settings.trackedOpenInAppLink : pm.settings.androidPlayStoreUrl;
    };
    /**
     * @return {?}
     */
    var updateGraphUrl = function () {
        /** @type {string} */
        var sendhash = encodeURIComponent(window.location.href);
        return "/user/my-size?return_url=" + sendhash + "";
    };
    /**
     * @param {boolean} data
     * @return {?}
     */
    var ScenarioBlock = function (data) {
        return data ? pm.settings.trackedOpenInAppLink : pm.settings.itunesStoreUrl;
    };
    /**
     * @param {string} callback
     * @return {?}
     */
    var extractPresetLocal = function (callback) {
        return "/closet/" + callback;
    };
    /**
     * @param {?} selector
     * @return {?}
     */
    var clickWithWebdriver = function (selector) {
        return "/user/link-external-service";
    };
    /**
     * @param {?} a
     * @return {?}
     */
    var USEC_TO_TICKS = function (a) {
        return "/user/unlink-external-service";
    };
    /**
     * @return {?}
     */
    var i = function () {
        return "/track_event";
    };
    /**
     * @return {?}
     */
    var signUp = function () {
        return "/signup";
    };
    /**
     * @param {string} p2
     * @return {?}
     */
    var process = function (p2) {
        return "intent:/" + p2 + "/#Intent;scheme=" + pm.settings.appScheme + ";package=" + pm.settings.androidAppPackage + ";end";
    };
    /**
     * @param {string} user
     * @return {?}
     */
    var googleContacts = function (user) {
        return pm.settings.appScheme + ":/" + user;
    };
    /**
     * @param {string} a
     * @return {?}
     */
    var documentCompare = function (a) {
        return "/user/get-city-states-by-zipcode/" + a;
    };
    /**
     * @param {string} user
     * @return {?}
     */
    var fetchUserSurveys = function (user) {
        return "/users/" + user + "/interaction/users";
    };
    /**
     * @param {string} data
     * @return {?}
     */
    var config = function (data) {
        return "/listing/" + data + "/interaction/users";
    };
    /**
     * @param {string} data
     * @return {?}
     */
    var cb = function (data) {
        return "/listing/" + data + "/ext_share_content";
    };
    /**
     * @param {string} group
     * @return {?}
     */
    var inviteOrStartParty = function (group) {
        return "/party/" + group + "/new_listings_count";
    };
    /**
     * @param {string} b
     * @param {string} a
     * @return {?}
     */
    var connfunc = function (b, a) {
        return "/user/" + b + "/direct_share/post/" + a;
    };
    /**
     * @param {string} name
     * @param {string} url
     * @return {?}
     */
    var getAsyncContent = function (name, url) {
        /** @type {string} */
        var s = "/user/otp/send" + (name ? "?otp_call=" + name : "");
        return url && (s = s + ((s.indexOf("?") > -1 ? "&" : "?") + "otp_type=" + url)), s;
    };
    /**
     * @param {string} version
     * @param {string} value
     * @return {?}
     */
    var t = function (version, value) {
        /** @type {string} */
        var seen = "/user/otp_modal" + (version ? "?otp_call=" + version : "");
        return value && (seen = seen + ((seen.indexOf("?") > -1 ? "&" : "?") + "otp_type=" + value)), seen;
    };
    /**
     * @param {string} a
     * @return {?}
     */
    var rotateAdd = function (a) {
        return "/user/college-suggestions?query=" + a;
    };
    /**
     * @param {string} module
     * @return {?}
     */
    var getCoreTestFilePath = function (module) {
        return "/external_service/connect_now?ch=" + module;
    };
    /**
     * @param {string} a
     * @param {string} b
     * @return {?}
     */
    var makeColorMaterial = function (a, b) {
        return "/auto-fill-fields?title=" + a + "&department=" + b;
    };
    /**
     * @param {?} query
     * @return {?}
     */
    var logout = function (query) {
        return "/user/" + pm.userInfo.userId() + "/follow_brand?brand_name=" + encodeURIComponent(query);
    };
    /**
     * @param {?} match
     * @return {?}
     */
    var handler = function (match) {
        return "/user/" + pm.userInfo.userId() + "/unfollow_brand?brand_name=" + encodeURIComponent(match);
    };
    /**
     * @param {string} res
     * @return {?}
     */
    var SigninRoute = function (res) {
        return "/brand/" + res + "/ext_share_content";
    };
    /**
     * @return {?}
     */
    var A = function () {
        return "/brand-suggestions";
    };
    /**
     * @return {?}
     */
    var B = function () {
        return "/user/update-experience";
    };
    /**
     * @return {?}
     */
    var C = function () {
        return "/user/user-experiences";
    };
    /**
     * @param {string} selector
     * @return {?}
     */
    var clickWithJavaScript = function (selector) {
        return "/order/" + selector + "/add_pp_payment_info";
    };
    return {
        autoSuggestPath: a,
        newsSummaryPath: b,
        mySizePath: updateGraphUrl,
        androidPlayStorePath: showOrHideImage,
        iosItunesStorePath: ScenarioBlock,
        userClosetPath: extractPresetLocal,
        linkExternalService: clickWithWebdriver,
        unlinkExternalService: USEC_TO_TICKS,
        yagaTrackEvent: i,
        signupPath: signUp,
        setProfileInfo: "/set-profile-info",
        captchaModal: "/captcha_modal",
        openAndroidAppOrStore: process,
        iosAppPath: googleContacts,
        zipAutoSuggest: documentCompare,
        userInteractedUsers: fetchUserSurveys,
        listingInteractions: config,
        listingExtShareContent: cb,
        partyListingCountPath: inviteOrStartParty,
        directSharePath: connfunc,
        sendOneTimePassword: getAsyncContent,
        getOneTimePasswordModal: t,
        collegeSuggestions: rotateAdd,
        extServiceConnect: getCoreTestFilePath,
        autoFillFields: makeColorMaterial,
        followBrand: logout,
        unFollowBrand: handler,
        brandExtShareContent: SigninRoute,
        brandSuggestions: A,
        updateUserExperience: B,
        addPaypalPaymentInfo: clickWithJavaScript,
        userExperiences: C
    };
}(), pm.constants = function () {
    return {
        allDept: "All",
        womenDept: "Women",
        menDept: "Men",
        kidsDept: "Kids",
        searchTypeListings: "listings",
        autoCompleteDefaultCount: 20,
        autoCompleteCount: 8,
        autoCompleteStorageCacheTTL: 6e5,
        autoCompleteTimeout: 300,
        maxNotificationCount: 99,
        smrCommentLimitCount: 50,
        experiences: {
            all: ["000e8975d97b4e80ef00a955", "01008c10d97b4e1245005764", "20008c10d97b4e1245005764"],
            men: ["01008c10d97b4e1245005764"],
            kids: ["20008c10d97b4e1245005764"],
            plus: ["000e8975d97b4e80ef00a955"],
            plus_apparel: ["000e8975d97b4e80ef00a955"],
            women: ["000e8975d97b4e80ef00a955"],
            boutique: ["000e8975d97b4e80ef00a955", "01008c10d97b4e1245005764", "20008c10d97b4e1245005764"],
            luxury: ["000e8975d97b4e80ef00a955", "01008c10d97b4e1245005764", "20008c10d97b4e1245005764"],
            gifts: ["000e8975d97b4e80ef00a955", "01008c10d97b4e1245005764", "20008c10d97b4e1245005764"],
            makeup: ["000e8975d97b4e80ef00a955"]
        },
        departmentDisplayToID: {
            Women: "000e8975d97b4e80ef00a955",
            Men: "01008c10d97b4e1245005764",
            Kids: "20008c10d97b4e1245005764"
        },
        departmentIDToDisplaySlug: {
            "000e8975d97b4e80ef00a955": {
                name: "Women",
                slug: "Women"
            },
            "01008c10d97b4e1245005764": {
                name: "Men",
                slug: "Men"
            },
            "20008c10d97b4e1245005764": {
                name: "Kids",
                slug: "Kids"
            }
        },
        experienceGridPages: ["Brand", "Search Listings", "Category", "Browse", "Showroom", "Party", "Closet"],
        localExperienceTTL: 36e5
    };
}(), pm.comments = function () {
    /**
     * @return {undefined}
     */
    var initialize = function () {
        if (!pm.userInfo.isLoggedIn()) {
            return;
        }
        $("main").on("click", "form.add-comment .btn", function (a) {
            var $replyTextArea = $("form.add-comment textarea");
            if ($replyTextArea.val().length == 0 || $replyTextArea.val().trim().length == 0) {
                return $replyTextArea.val(""), $replyTextArea.focus(), false;
            }
            var parent = $("form.add-comment");
            parent.find("input[type=submit]").hide();
            parent.find(".css-loader").show();
            parent.on("remoteAction", function (a, data) {
                parent.find("input[type=submit]").show();
                parent.find(".css-loader").hide();
                if (data.success) {
                    addButton(parent, data);
                } else {
                    if (data.message && data.message != "") {
                        $("#bundle-error-popup .sub-text-msg").html(data.message);
                        $("#bundle-error-popup").modal("show");
                        if (data.show_edit_settings_btn) {
                            $("#bundle-error-popup .modal-footer").addClass("f-right");
                            $("#bundle-error-popup").css("min-width", "0px");
                            $("#bundle-error-popup .show_edit_settings_btn").show();
                        }
                    }
                }
                parent.off("remoteAction");
            });
        });
        $("main").on("click", ".comments .reply", function (event) {
            event.preventDefault();
            $commenter = $(event.target).data("user-handle");
            /** @type {string} */
            commentText = $commenter == pm.userInfo.displayHandle() ? "" : "@" + $commenter + " ";
            $("textarea").val(commentText);
            utils.setCaretToPos($("textarea")[0], $("textarea").val().length);
        });
        $("main").on("click", ".comments .report", function (jEvent) {
            var commentId = $(jEvent.target).parent().data("comment-id");
            $("<input>").attr({
                type: "hidden",
                id: "report_comment_form_reported_comment_id",
                name: "report_comment_form[comment_id]",
                value: commentId
            }).appendTo("#new_report_comment_form .modal-body");
        });
        $("main").on("click", ".comments.banner", function (event) {
            event.preventDefault();
            commentBox = $("textarea");
            /** @type {number} */
            scrollPosition = commentBox.offset().top - ($(window).height() - commentBox.height()) / 2;
            $(window).scrollTop(scrollPosition);
            commentBox.focus();
            if ($(this).data("prefill")) {
                prefill = $(this).data("prefill");
                commentBox.val(prefill);
                commentBox.height(commentBox[0].scrollHeight);
            }
            $(this).hide();
        });
        $("body").on("remoteAction", ".delete-comment", function (a, result) {
            if (result.success) {
                $(".comments").replaceWith(result.html);
            } else {
                pm.showPageModalError(result.error_message);
            }
        });
        $("body").on("remoteAction:error", ".delete-comment", function (a, result) {
            pm.showPageModalError(result.error_message);
        });
        $("#new_report_comment_form").on("remoteAction", function (a, b) {
            $("#new_report_comment_form .modal-body #report_comment_form_reported_comment_id").remove();
        });
        $("main").on("click", ".social-actions .comment", function () {
            $("form.add-comment textarea").focus();
            event.preventDefault();
        });
        if (window.location.hash === "#comment") {
            $("form.add-comment textarea").focus();
        }
    };
    /**
     * @param {!Object} node
     * @param {!Object} options
     * @return {undefined}
     */
    var addButton = function (node, options) {
        if (options.success) {
            var filteredView = node.closest(".comments");
            var percent = $(".comment-count");
            /** @type {number} */
            var n = parseInt(percent.text());
            percent.text(n + 1);
            var p = $(".comment-count-text");
            if (n == 0 || !p) {
                p.removeClass("f-hide");
            }
            $(".comment-count-suffix-text").text(n == 0 ? "" : "s");
            filteredView.find("form.add-comment").before(options.html);
            node.find("textarea").val("");
            if ("commentUrl" in options) {
                node.attr("action", options.commentUrl);
            }
        }
    };
    return {
        initComments: initialize
    };
}(), pm.bundleV3 = function () {
    var fileAndWordList = {
        styleCardPurchasesActiveIndex: 0
    };
    var data = {
        skip: "Skipped Successfully",
        styleMe: "Your request to be styled by {0} has been sent! ",
        addToBundle: "Added to bundle",
        removeFromBundle: "Removed from bundle",
        somethingWentWrong: "Something went wrong. Please try again later.",
        itemNotAvailable: "Sorry! This item is not available to purchase.",
        buyer: {
            offerWithSizeNotSelected: [false, "Unable to make offer. Some items in your Bundle do not have a size selected.", "Please select a size and try again."],
            offerWithItemNotAvailable: [true, "Unable to make offer. Some items in your bundle are no longer available.", "Please remove them to complete the offer."],
            offerWithItemReserved: [true, "Unable to make offer. Some items in your Bundle are reserved.", "Please remove them to complete the offer."],
            offerOnEmptyBundle: [false, "Unable to make offer. Your Bundle is empty.", "Please add items to complete the offer."],
            buyNowWithSizeNotSelected: [false, "Unable to purchase. Some items in your Bundle do not have a size selected.", "Please select a size and try again."],
            buyNowWithItemNotAvailable: [true, "Unable to purchase. Some items in your Bundle are no longer available.", "Please remove them to continue checking out."],
            buyNowWithItemReserved: [true, "Unable to purchase. Some items in your Bundle are reserved.", "Please remove them to continue checking out."],
            buyOnEmptyBundle: [false, "Unable to purchase. Your Bundle is empty.", "Please add items and try again."]
        },
        seller: {
            offerWithSizeNotSelected: [false, "Unable to make offer. Some items in this Bundle do not have a size selected.", "Please select a size and try again."],
            offerWithItemNotAvailable: [false, "Unable to make offer. Some items in this Bundle are no longer available.", "Please remove them to complete the offer."],
            offerWithItemReserved: [false, "Unable to make offer. Some items in this Bundle are reserved.", "Please remove them to complete the offer."],
            offerOnEmptyBundle: [false, "Unable to make offer. This Bundle is empty.", "Please share items to complete the offer."]
        }
    };
    /** @type {null} */
    var optionUsed3 = null;
    var theNode = $(".user-bundle");
    /** @type {boolean} */
    var hasSongChanged = theNode.data("user-view") == "seller";
    /** @type {boolean} */
    var isReplayingSong = theNode.data("user-view") == "buyer";
    /** @type {boolean} */
    var g = !hasSongChanged && !isReplayingSong;
    var voteResult = {};
    /**
     * @param {!Event} obj
     * @param {string} n
     * @return {undefined}
     */
    var validate = function (obj, n) {
        var $dds = $(obj.currentTarget);
        $dds.on("remoteAction", function () {
            var i = data[n];
            if (n == "styleMe") {
                var validatorType = $(".user-bundle .suggested .header .item-content .name").html();
                i = $.validator.format(i, [validatorType]);
                $(".user-bundle .suggested .empty-view .notation").html("Last requested a moment ago");
            }
            pm.flashMessage.push({
                type: 1,
                parent: theNode,
                text: i,
                duration: 2e3
            });
            $dds.off("remoteAction");
            if (n != "styleMe") {
                t();
            }
        });
        $dds.on("remoteAction:error", function (a, data) {
            pm.flashMessage.push({
                type: 1,
                parent: theNode,
                text: data.responseJSON.error.user_message,
                duration: 3e3
            });
            $dds.off("remoteAction:error");
        });
    };
    /**
     * @param {!Event} event
     * @param {string} pos
     * @return {undefined}
     */
    var onTouchMove = function (event, pos) {
        $carouselAction = $(event.currentTarget);
        var $carousel = $carouselAction.parent();
        var $wrapElement = $carousel.find(".carousel-btn.prev");
        var formsearch = $carousel.find(".carousel-btn.next");
        var expRecords = $carousel.find(".post-section");
        /** @type {number} */
        var undefined = expRecords.length - 1;
        $carousel.carousel({
            interval: false
        });
        if ($carouselAction.hasClass("active")) {
            if ($carouselAction.hasClass("next")) {
                if (fileAndWordList[pos] != undefined) {
                    fileAndWordList[pos]++;
                    $carousel.carousel("next");
                }
                if (fileAndWordList[pos] == undefined) {
                    formsearch.removeClass("active");
                }
                if (fileAndWordList[pos] == 1) {
                    $wrapElement.addClass("active");
                }
            } else {
                if ($carouselAction.hasClass("prev")) {
                    if (fileAndWordList[pos] !== 0) {
                        fileAndWordList[pos]--;
                        $carousel.carousel("prev");
                    }
                    if (fileAndWordList[pos] == 0) {
                        $wrapElement.removeClass("active");
                    }
                    if (fileAndWordList[pos] == undefined - 1) {
                        formsearch.addClass("active");
                    }
                }
            }
        }
    };
    /**
     * @return {undefined}
     */
    var open = function () {
        $("main").on("click", ".bundle-style-card-con .user-purchases-con #carousel-style-card-purchases .carousel-btn", function (event) {
            onTouchMove(event, "styleCardPurchasesActiveIndex");
        });
        var $sharepreview = $(".user-sizes-con");
        var backwardCtrl = $(".user-sizes-con .tab");
        backwardCtrl.on("click", function (event) {
            var curOpt = $(event.target);
            if (curOpt.hasClass("disabled")) {
                return;
            }
            $sharepreview.find(".tab").removeClass("selected");
            curOpt.addClass("selected");
            $(".size-department").addClass("hide");
            $(event.target.dataset.target).removeClass("hide");
        });
        $(".bundle-style-card-con .brands-followed-con .brand-block.hide").hide();
        $("main").on("click", ".bundle-style-card-con .brands-followed-con .brands .show-more a", function () {
            $(".bundle-style-card-con .brands-followed-con .brand-block.hide").show();
            $(".bundle-style-card-con .brands-followed-con .brands .show-more").hide();
        });
    };
    /**
     * @return {undefined}
     */
    var path = function () {
        if (history && history.pushState) {
            history.pushState({
                refresh: true,
                html: {
                    bundleItems: $(".user-bundle .bundle-items")[0].outerHTML,
                    checkoutSummary: $(".user-bundle .checkout-summary")[0].outerHTML,
                    listingDisclaimers: $(".user-bundle .disclaimers")[0].outerHTML,
                    likedActions: voteResult
                }
            }, document.title, window.location);
        }
    };
    /**
     * @param {!Object} options
     * @return {undefined}
     */
    var parse = function (options) {
        if (options.success) {
            $(".user-bundle .comments-con").html(options.html);
            pm.userNameAutoComplete.initUserNameAutoComplete($(".comments textarea.username-autocomplete"));
        } else {
            $(".add-comment").show();
            $(".add-comment-loading").hide();
            var capture_headings = options.error_message || data.somethingWentWrong;
            pm.flashMessage.push({
                text: capture_headings,
                duration: 5e3
            });
        }
    };
    /**
     * @return {undefined}
     */
    var getInsta = function () {
        $.ajax({
            url: $(".user-bundle .comments-con").data("refresh-url"),
            method: "GET",
            dataType: "json",
            cache: false,
            success: parse
        });
    };
    /**
     * @param {!Object} ast
     * @param {?} name
     * @return {undefined}
     */
    var build = function (ast, name) {
        /** @type {number} */
        var di = 0;
        if (ast.length > 0) {
            if (name) {
                if (!ast.find("a.like").hasClass("f-hide")) {
                    ast.find("a.like").addClass("f-hide");
                    ast.find("a.unlike").removeClass("f-hide");
                    di++;
                }
            } else {
                if (ast.find("a.like").hasClass("f-hide")) {
                    ast.find("a.like").removeClass("f-hide");
                    ast.find("a.unlike").addClass("f-hide");
                    di--;
                }
            }
            if (di != 0) {
                var item = ast.find(".likes");
                if (item.length > 0) {
                    /** @type {number} */
                    var i = parseInt(item.attr("data-count")) + di;
                    item.find(".count").html(i <= 0 ? "" : i);
                    item.attr("data-count", i);
                }
            }
        }
    };
    /**
     * @param {!Object} item
     * @return {undefined}
     */
    var activate = function (item) {
        var data = item.data();
        if (data.location == "bundle_section") {
            var a = $("#" + data.postId);
        } else {
            a = $(".bundle-items-con[data-post-id='" + data.postId + "']");
        }
        build(a, item.hasClass("like"));
        voteResult[data.postId] = item.hasClass("like");
        path();
    };
    /**
     * @return {undefined}
     */
    var remove = function () {
        if (g) {
            $(".bundle-items-con").each(function () {
                var post = $(this).data("post-id");
                $(".third-party-add-to-bundle[data-post-id='" + post + "']").show();
            });
        }
    };
    /**
     * @param {!Object} self
     * @return {undefined}
     */
    var update = function (self) {
        if (self.success) {
            var bodyScrollTop = $(window).scrollTop();
            if (utils.isMobileDevice.any()) {
                var d = $(".bundle-items .bundle-items-con").length;
                $(".user-bundle .bundle-items").replaceWith(self.bundle_items);
                /** @type {number} */
                var diff = $(".bundle-items .bundle-items-con").length - d;
                /** @type {number} */
                var slideTop = diff > 0 ? $(".bundle-items .bundle-items-con").first().outerHeight(true) * diff : 0;
                $(window).scrollTop(bodyScrollTop + slideTop);
            } else {
                $(".user-bundle .bundle-items").replaceWith(self.bundle_items);
                $(window).scrollTop(bodyScrollTop);
            }
            $(".user-bundle .checkout-summary").replaceWith(self.checkout_summary);
            $(".user-bundle .disclaimers").replaceWith(self.listing_disclaimers);
            if (history && history.state && history.state.html && history.state.html.likedActions) {
                $.each(history.state.html.likedActions, function (domRootID, loadFile) {
                    build($("#" + domRootID), loadFile);
                    build($(".bundle-items-con[data-post-id='" + domRootID + "']"), loadFile);
                });
            }
            $(".bundle-items-con").each(function (a) {
                var urlParams = $(this).data();
                var c = $("#" + urlParams.postId);
                if (c.length > 0) {
                    c.find(".add-to-bundle").hide();
                    c.find(".in-bundle").show();
                }
            });
            remove();
            $(".user-bundle").show();
            path();
        } else {
            var capture_headings = self.error_message || data.somethingWentWrong;
            pm.flashMessage.push({
                text: capture_headings,
                duration: 5e3
            });
        }
        $(".loading").hide();
    };
    /**
     * @param {!Object} miniWidget
     * @return {?}
     */
    var updateContextButton = function (miniWidget) {
        /** @type {null} */
        var mergeBody = null;
        return isReplayingSong ? miniWidget.data().name == "buy_now" ? $(".bundle-items .empty-bundle").length > 0 ? mergeBody = data.buyer.buyOnEmptyBundle : $(".bundle-items-con .select-size").length > 0 ? mergeBody = data.buyer.buyNowWithSizeNotSelected : $(".bundle-items-con .not-available").length > 0 ? mergeBody = data.buyer.buyNowWithItemNotAvailable : $(".bundle-items-con .reserved").length > 0 && (mergeBody = data.buyer.buyNowWithItemReserved) : miniWidget.data().name == "make_offer" && ($(".bundle-items .empty-bundle").length >
        0 ? mergeBody = data.buyer.offerOnEmptyBundle : $(".bundle-items-con .select-size").length > 0 ? mergeBody = data.buyer.offerWithSizeNotSelected : $(".bundle-items-con .not-available").length > 0 ? mergeBody = data.buyer.offerWithItemNotAvailable : $(".bundle-items-con .reserved").length > 0 && (mergeBody = data.buyer.offerWithItemReserved)) : miniWidget.data().name == "make_offer" && ($(".bundle-items .empty-bundle").length > 0 ? mergeBody = data.seller.offerOnEmptyBundle : $(".bundle-items-con .select-size").length >
        0 ? mergeBody = data.seller.offerWithSizeNotSelected : $(".bundle-items-con .not-available").length > 0 ? mergeBody = data.seller.offerWithItemNotAvailable : $(".bundle-items-con .reserved").length > 0 && (mergeBody = data.seller.offerWithItemReserved)), mergeBody != null ? (mergeBody[0] ? $("#bundle-error-popup .alert-icon").show() : $("#bundle-error-popup .alert-icon").hide(), $("#bundle-error-popup .text-msg").html(mergeBody[1]), mergeBody.length > 2 ? ($("#bundle-error-popup .sub-text-msg").html(mergeBody[2]),
            $("#bundle-error-popup .sub-text-msg").show()) : $("#bundle-error-popup .sub-text-msg").hide(), $("#bundle-error-popup").modal("show"), false) : true;
    };
    /**
     * @return {undefined}
     */
    var t = function () {
        /** @type {number} */
        var a = (new Date).getTime();
        /** @type {number} */
        optionUsed3 = a;
        $.ajax({
            url: $(".user-bundle .items-con").data("refresh-url"),
            method: "GET",
            dataType: "json",
            cache: false,
            success: function (value) {
                if (optionUsed3 == a) {
                    update(value);
                }
            }
        });
    };
    /**
     * @param {!Object} params
     * @return {undefined}
     */
    var render = function (params) {
        var item = params.data();
        var data = getParams(params);
        data.url = item.addPostUrl;
        if ("sizeContent" in item) {
            data.data = {
                size_id: item.sizeContent
            };
        }
        /**
         * @param {!Object} options
         * @return {undefined}
         */
        var update = function (options) {
            if (options.success) {
                pm.flashMessage.push({
                    text: data.addToBundle,
                    duration: 5e3
                });
                if (item.location == "bundle_likes" && !$(".user-bundle").data("bundleV3")) {
                    var thumbRow = $("#" + item.postId);
                    thumbRow.find(".add-to-bundle").hide();
                    thumbRow.find(".in-bundle").show();
                    var options = $(".bundle-likes").data();
                    if (options.isBuyer) {
                        window.location.href = options.bundleUrl;
                    }
                } else {
                    if (g || $(".items-con").data("bundle-status") == "sold") {
                        window.location.href = $(".items-con").data("new-bundle-url");
                    } else {
                        thumbRow = $("#" + item.postId);
                        thumbRow.find(".add-to-bundle").hide();
                        thumbRow.find(".in-bundle").show();
                        history.pushState({
                            refresh: true,
                            html: null
                        }, document.title, window.location);
                        t();
                    }
                }
            } else {
                if (options.is_page_modal) {
                    $("#bundle-error-popup .sub-text-msg").html(options.message);
                    $("#bundle-error-popup").modal("show");
                } else {
                    pm.flashMessage.push({
                        text: options.error_message || data.somethingWentWrong,
                        duration: 5e3
                    });
                }
                if ($(".user-bundle").data("bundleV3")) {
                    t();
                }
            }
        };
        remoteRequest(params, data, update);
    };
    /**
     * @param {!Object} input
     * @return {undefined}
     */
    var run = function (input) {
        var item = input.data();
        var params = getParams(input);
        params.url = item.removePostUrl;
        /**
         * @param {!Object} options
         * @return {undefined}
         */
        var update = function (options) {
            if (options.success) {
                history.pushState({
                    refresh: true,
                    html: null
                }, document.title, window.location);
                pm.flashMessage.push({
                    text: data.removeFromBundle,
                    duration: 5e3
                });
                $(".bundle-items-con[data-post-id='" + item.postId + "']").hide();
                $(".remove-from-bundle[data-post-id='" + item.postId + "']").hide();
                var d = $("#" + item.postId);
                if (d.length > 0) {
                    d.find(".in-bundle").hide();
                    d.find(".add-to-bundle").show();
                }
                t();
            } else {
                if (options.is_page_modal) {
                    $("#bundle-error-popup .sub-text-msg").html(options.message);
                    $("#bundle-error-popup").modal("show");
                } else {
                    pm.flashMessage.push({
                        text: options.error_message || data.somethingWentWrong,
                        duration: 5e3
                    });
                }
                t();
            }
        };
        remoteRequest(input, params, update);
    };
    /**
     * @return {undefined}
     */
    var initFileListMenu = function () {
        $("main").on("click", ".user-bundle .info a", function (event) {
            event.preventDefault();
            $("#user-bundle-help-popup").modal("show");
        });
    };
    /**
     * @param {!Object} data
     * @return {undefined}
     */
    var success = function (data) {
        $("#size-selector .item-pic").attr("src", data.coverShotUrl);
        /** @type {string} */
        var scrolltable = "";
        var strCookies = data.sizeSelector.split(",");
        /** @type {number} */
        var i = 0;
        for (; i < strCookies.length; i++) {
            var f = strCookies[i].split(":");
            /** @type {string} */
            scrolltable = scrolltable + ('<div class="size-selector' + (f[2] == 0 ? " disabled" : "") + '" data-post-id="' + data.postId + '" data-location="' + data.location + '" data-pa-attr-location="' + data.paAttrLocation + '" data-pa-name="size" data-pa-click-type="button" data-pa-screen-type="popup" data-pa-screen-name="listing_size_picker" data-pa-attr-content_type="size" data-pa-attr-content="[' + data.sizeContent + ']" data-pa-attr-bundle_id="' + data.paAttrBundle_id + '" data-pa-attr-listing_id="' +
                data.postId + '" data-pa-attr-lister_id="' + data.paAttrLister_id + '" data-pa-attr-buyer_id="' + data.paAttrBuyer_id + '" ' + (data.addPostUrl ? 'data-add-post-url="' + data.addPostUrl + '"' : 'data-update-post-url="' + data.updatePostUrl + '"') + ' data-size-content="' + f[0] + '">&nbsp;' + f[1] + "&nbsp;</div>");
        }
        $("#size-selector .sizes").html(scrolltable);
        $("#size-selector").modal("show");
        pm.tracker.screenView({
            data: {
                type: pm.tracker.actionType.view,
                name: "listing_size_picker",
                element_type: pm.tracker.screenType.popup,
                properties: {
                    bundle_id: data.bundleId,
                    listing_id: data.postId,
                    lister_id: data.listerId,
                    buyer_id: data.buyerId
                }
            }
        });
    };
    /**
     * @return {undefined}
     */
    var start = function () {
        $("main").on("click", ".add-to-bundle", function (event) {
            var data = $(this).data();
            if (data.itemAvailable) {
                if (data.sizesAvailable) {
                    success(data);
                } else {
                    render($(this));
                }
            } else {
                pm.flashMessage.push({
                    text: data.itemNotAvailable,
                    duration: 5e3
                });
            }
            event.preventDefault();
        });
        $("main").on("click", ".size-selector", function (a) {
            var input = $(this);
            if (!input.hasClass("disabled")) {
                $("#size-selector").modal("hide");
                var s3Data = input.data();
                if (s3Data.addPostUrl) {
                    render(input);
                } else {
                    var data = getParams(input);
                    data.url = s3Data.updatePostUrl;
                    data.data = {
                        size_id: s3Data.sizeContent
                    };
                    remoteRequest(input, data, update);
                }
            }
        });
    };
    /**
     * @return {undefined}
     */
    var init = function () {
        initFileListMenu();
        open();
        start();
        if ($(".user-bundle").length > 0) {
            if (window.location.href.indexOf("dsr_request") > -1) {
                pm.flashMessage.push({
                    text: "Style request sent",
                    duration: 5e3
                });
                window.history.replaceState("bundlePage", "Bundle", window.location.pathname);
            }
            pm.listings.initToggleLikes("bundleV3");
        }
        $("main").on("click", ".bundle-items .remove-from-bundle", function (event) {
            var bundle = $(this).data();
            if (bundle.removeWarning) {
                $("#bundle-remove-warning .keep-item").data("pa-attr-listing_id", bundle.postId);
                $("#bundle-remove-warning .remove-item").data("pa-attr-listing_id", bundle.postId);
                $("#bundle-remove-warning .remove-item").data("post-id", bundle.postId);
                $("#bundle-remove-warning .remove-item").data("remove-post-url", bundle.removePostUrl);
                $("#bundle-remove-warning").modal("show");
                pm.tracker.screenView({
                    data: {
                        type: pm.tracker.actionType.view,
                        name: "confirm_remove_item",
                        element_type: pm.tracker.screenType.popup,
                        properties: {
                            bundle_id: bundle.paAttrBundle_id,
                            listing_id: bundle.postId,
                            lister_id: bundle.paAttrLister_id,
                            buyer_id: bundle.paAttrBuyer_id
                        }
                    }
                });
            } else {
                run($(this));
            }
            event.preventDefault();
        });
        $("main").on("click", ".size-edit", function (a) {
            var data = $(this).data();
            data.coverShotUrl = $(".bundle-items-con[data-post-id='" + data.postId + "'] .img-con img").attr("src");
            success(data);
        });
        $("main").on("click", "#bundle-remove-warning .remove-item", function (a) {
            $("#bundle-remove-warning").modal("hide");
            run($(this));
        });
        $("main").on("click", ".user-bundle .buy-now", function (a) {
            if (updateContextButton($(this))) {
                var ctx = $(this).data();
                var params = getParams($(this));
                params.url = ctx.buyUrl;
                params.data = {
                    products: $(".products-info").attr("productsInfo"),
                    supported_payment_method: pm.listings.getSupportedPayments()
                };
                /** @type {string} */
                params.method = "POST";
                /**
                 * @param {!Object} response
                 * @return {undefined}
                 */
                var show = function (response) {
                    if (response.success) {
                        window.location.href = response.redirect_url;
                    } else {
                        $("#bundle-error-popup .text-msg").html(response.error_message || data.somethingWentWrong);
                        if (response.product_unavailable == 1) {
                            $("#bundle-error-popup .sub-text-msg").show();
                        } else {
                            $("#bundle-error-popup .sub-text-msg").hide();
                        }
                        $("#bundle-error-popup").modal("show");
                        t();
                    }
                };
                remoteRequest($(this), params, show);
            }
        });
        $("main").on("click", ".user-bundle .buyer-offer", function (a) {
            return updateContextButton($(this));
        });
        $("main").on("click", ".user-bundle .seller-offer", function (a) {
            return updateContextButton($(this));
        });
        if (history && history.state && history.state.refresh) {
            if (history.state.html) {
                $(".user-bundle .bundle-items").replaceWith(history.state.html.bundleItems);
                $(".user-bundle .checkout-summary").replaceWith(history.state.html.checkoutSummary);
                $(".user-bundle .disclaimers").replaceWith(history.state.html.listingDisclaimers);
                $(".user-bundle").show();
                $(".loading").hide();
            } else {
                $(".loading img").css("visibility", "visible");
            }
            getInsta();
            t();
        } else {
            remove();
            $(".user-bundle").show();
            $(".loading").hide();
            getInsta();
        }
        recentlyViewedBundlesV3Obj.initRecentlyViewedBundlesV3();
    };
    return {
        initBundleV3Actions: init,
        initBundleV3AddToBundle: start,
        refreshAfterLikeAction: activate
    };
}(), pm.listing_moderation = function () {
    var a = {
        somethingWentWrong: "Something went wrong. Please try again later.",
        ModerationQueueEmptyError: "There are currently no listings requiring review due to the efforts of our amazing community. Thank you!",
        ModerationLimitReachedError: "Mission complete! Thanks for your help with keeping Poshmark in tiptop shape.",
        optOutSuccess: "Successfully updated!",
        decisionError: "Whoops!  We didn\u2019t get that.  Please resubmit your feedback"
    };
    var result = {
        replica: {
            header: "What is Replica?",
            content: "A replica (AKA counterfeit or knockoff) is an unauthorized copy or imitation of an authentic branded item.  Replicas violate federal trademark law."
        },
        mistagged_brand: {
            header: "What is a mistagged brand?",
            content: "Mistagged brand means a brand is being used in the listing details or description, but the item was not actually made by that brand."
        },
        offensive: {
            header: "What is an offensive item?",
            content: "An offensive item is inappropriate or hurtful to others.  Items that promote hatred, violence, racial, sexual or religious intolerance are not allowed."
        },
        prohibited: {
            header: "What is a prohibited/illegal item?",
            content: "A prohibited/illegal item is not allowed to be sold on Poshmark under federal or state law. Common examples include, but are not limited to prescription drugs and medical devices, illicit drugs and drug paraphernalia, tobacco products, endangered species parts and weapons."
        },
        non_fashion: {
            header: "What is an unsupported non-fashion/other item?",
            content: "Common examples include, but are not limited to, electronics, home goods, books/DVDs/media, health or wellness products, flammable liquids (nail polish, perfume, aerosols), kids/baby items, used makeup or underwear, gift cards and event tickets."
        },
        offline_transaction: {
            header: "What is a transaction off Poshmark?",
            content: "A transaction off Poshmark is a payment that is made outside of the platform, initiated by the seller. The exchange of personal information, such as email address, is not allowed."
        }
    };
    /**
     * @return {undefined}
     */
    var setup = function () {
        var propertiesPanel = $("#moderation-portal");
        $("main").on("click", "#moderation-portal .content .cm-main .cm-footer .right a", function (event) {
            event.preventDefault();
            $("#confirm-moderation-opt-out-popup").modal("show");
        });
        $("main").on("click", "#confirm-moderation-opt-out-popup .user-selection", function (event) {
            event.preventDefault();
            /**
             * @param {!Object} body
             * @return {undefined}
             */
            var update = function (body) {
                /** @type {string} */
                var temp = "";
                /** @type {number} */
                var touchTime = 2e3;
                if (body.success) {
                    $("#confirm-moderation-opt-out-popup").modal("hide");
                    /** @type {string} */
                    temp = a.optOutSuccess;
                } else {
                    temp = body.error && body.error.error_message ? body.error.error_message : a.somethingWentWrong;
                    /** @type {number} */
                    touchTime = 5e3;
                }
                pm.flashMessage.push({
                    type: 1,
                    parent: propertiesPanel,
                    text: temp,
                    duration: touchTime
                });
            };
            var editingEl = $(this);
            var content = editingEl.data();
            content.data = {
                userSelection: content.userSelection
            };
            remoteRequest($(this), content, update);
        });
    };
    /**
     * @param {!Object} o
     * @return {?}
     */
    var formatError = function (o) {
        if (o.success) {
            window.location = o.redirect_url;
        } else {
            var i = o.error && o.error.error_type ? o.error.error_type : "somethingWentWrong";
            var c1 = a[i];
            if ($("#continue-moderation-popup").length > 0) {
                $("#continue-moderation-popup").modal("hide");
            }
            $("#listing-moderation-error-popup .modal-body p").html(c1);
            $("#listing-moderation-error-popup").modal("show");
        }
        return false;
    };
    /**
     * @return {undefined}
     */
    var init = function () {
        $("main").on("click", "#moderation-portal .content .cm-main .cm-body .action a, #continue-moderation-popup .modal-footer .next-listing", function (event) {
            event.preventDefault();
            var editingEl = $(this);
            var pornResult = editingEl.data();
            remoteRequest($(this), pornResult, formatError);
        });
        $("main").on("click", "#continue-moderation-popup .modal-footer .news", function (a) {
            $("#continue-moderation-popup").modal("hide");
            window.location = $(this).data().url;
        });
        $("main").on("click", "#listing-moderation-banner .firstline a", function (event) {
            event.preventDefault();
            var name = $(this).attr("data-value");
            $("#moderation-reason-help-popup .modal-header div h5").html(result[name].header);
            $("#moderation-reason-help-popup .modal-body p").html(result[name].content);
            $("#moderation-reason-help-popup").modal("show");
        });
        $("main").on("click", "#listing-moderation-banner .actions a", function (event) {
            event.preventDefault();
            var jQScrollable = $(this);
            /**
             * @param {!Object} body
             * @return {undefined}
             */
            var update = function (body) {
                if (body.success || body.error && body.error.error_type && body.error.error_type == "AlreadyExistsError") {
                    if (jQScrollable.attr("data-first-time") == 1 && !$.jStorage.get("continue-moderation-popup-shown")) {
                        $("#continue-moderation-popup").modal("show");
                        $.jStorage.set("continue-moderation-popup-shown", true);
                    } else {
                        var event = jQScrollable.data();
                        event.url = event.reviewListingUrl;
                        remoteRequest($(this), event, formatError);
                    }
                } else {
                    var capture_headings = body.error && body.error.error_message ? body.error.error_message : a.decisionError;
                    pm.flashMessage.push({
                        text: capture_headings,
                        duration: 5e3
                    });
                }
            };
            var editingEl = $(this);
            var data = editingEl.data();
            data.data = {
                post_id: encodeURIComponent(data.listingId),
                decision: encodeURIComponent(data.decision),
                moderation_reason: encodeURIComponent(data.reason)
            };
            remoteRequest($(this), data, update);
        });
    };
    /**
     * @return {undefined}
     */
    var iosAppBanner = function () {
        setup();
        init();
    };
    return {
        initListingModeration: iosAppBanner
    };
}(), pm.highlightListing = function () {
    var lastEndDate;
    /**
     * @return {?}
     */
    var do_search = function () {
        var id = $("#closet-header").data("user-id");
        var bxConfig = $.jStorage.get("just_in_closet_details");
        return bxConfig && bxConfig[id];
    };
    /**
     * @param {string} primary_key_name
     * @return {undefined}
     */
    var generate_path = function (primary_key_name) {
        var b = $.jStorage.get("just_in_closet_details");
        if (b) {
            /** @type {string} */
            b[$("#closet-header").data("user-id")].caller_just_in_visit_at = primary_key_name;
            $.jStorage.set("just_in_closet_details", b);
        }
    };
    /**
     * @return {?}
     */
    var onhashchange = function () {
        var found = do_search();
        if (found) {
            return found.caller_just_in_visit_at;
        }
    };
    /**
     * @return {undefined}
     */
    var go = function () {
        lastEndDate = onhashchange();
        if (lastEndDate) {
            save();
            fixTableHeader();
            stampDownload();
        }
    };
    /**
     * @return {undefined}
     */
    var save = function () {
        $("#tiles-con div.tile").each(function () {
            /** @type {string} */
            var b = (new Date(filter($(this).data("created-at"), "-", "/", 2))).toISOString();
            if (b > (new Date(lastEndDate)).toISOString()) {
                $(this).addClass("highlight--listing-tile");
            }
        });
    };
    /**
     * @return {undefined}
     */
    var fixTableHeader = function () {
        $(document).on("infiniteScroll:complete", save);
    };
    /**
     * @return {undefined}
     */
    var stampDownload = function () {
        pm.highlightListing.setCallerJustInVisitAt((new Date).toISOString());
    };
    /**
     * @param {string} value
     * @param {string} search
     * @param {string} text
     * @param {number} selectIndex
     * @return {?}
     */
    var filter = function (value, search, text, selectIndex) {
        for (; --selectIndex + 1;) {
            value = value.replace(new RegExp(search), text);
        }
        return value;
    };
    return {
        initHighlightListingActions: go,
        setCallerJustInVisitAt: generate_path
    };
}(), pm.flashMessage = function () {
    var defaults = {
        text: "",
        duration: 5e3,
        checkmark: false
    };
    /**
     * @param {!Object} data
     * @return {undefined}
     */
    var render = function (data) {
        data = $.extend({}, defaults, data);
        $(".flash-con .flash-message").html((data.checkmark ? "<span class='checkmark medium white'></span>" : "") + data.text);
        $(".flash-con").show();
        setTimeout(function () {
            $(".flash-con").hide();
        }, data.duration);
        if ($(".flash-message-con").length > 0) {
            $(".flash-message-con .flash-message").text(data.text);
            $(".flash-message-con").show();
            setTimeout(function () {
                $(".flash-message-con").hide();
            }, data.duration);
        }
    };
    /**
     * @param {!Object} settings
     * @return {undefined}
     */
    var c = function (settings) {
        if ($(".flash-con").data("flash-duration")) {
            settings = {};
            settings.duration = $(".flash-con").data("flash-duration");
        }
        settings = $.extend({}, defaults, settings);
        if ($(".flash-message").text() && $(".flash-message").text().length > 1) {
            $(".flash-con").show();
        }
        setTimeout(function () {
            $(".flash-con").hide();
        }, settings.duration);
    };
    return {
        push: render,
        initialPush: c
    };
}(), pm.hudMessage = function () {
    /** @type {boolean} */
    var a = false;
    var data = {
        type: 0,
        text: "",
        duration: 1,
        callback: null,
        parent: null
    };
    /**
     * @param {!Object} data
     * @return {undefined}
     */
    var render = function (data) {
        data = $.extend({}, this.options, data);
        var c = $("#hud-con");
        c.find(".message").html(data.text);
        c.removeClass();
        var $addon = c.find("i.hud-icon").removeClass().addClass("hud-icon");
        var stubobject = $("#hud-overlay");
        switch (data.type) {
            case 1:
                $addon.addClass("acty-indi");
                break;
            case 2:
                $addon.addClass("success").addClass("sprite");
                break;
            case 3:
                c.addClass("error");
                $addon.addClass("icon alert");
        }
        var h;
        var i;
        if (data.parent) {
            var jqDom = $(data.parent);
            var anchorBoundingBoxViewport = jqDom.offset();
            stubobject.css("left", anchorBoundingBoxViewport.left - $(document).scrollLeft());
            stubobject.css("top", anchorBoundingBoxViewport.top - $(document).scrollTop());
            stubobject.height(jqDom.outerHeight());
            stubobject.width(jqDom.outerWidth());
        } else {
            stubobject.css("top", 0);
            stubobject.css("left", 0);
            stubobject.height("100%");
            stubobject.width("100%");
        }
        $("#hud-overlay, #hud-hidden-overlay, #hud-con").removeClass("fade-out");
        $("#hud-overlay,#hud-hidden-overlay,#hud-con").show();
        _init(data.parent);
        /** @type {boolean} */
        a = true;
        if (data.type != 1) {
            setTimeout(function () {
                close(data.callback);
            }, data.duration * 1e3);
        }
    };
    /**
     * @param {string} obj
     * @return {undefined}
     */
    var _init = function (obj) {
        var overlay = $("#hud-con");
        var _height = $(overlay).outerHeight();
        var popHeightVar = $(overlay).outerWidth();
        var _rowPosition;
        var addtop;
        if (obj && obj != null && obj != undefined) {
            var anchorBoundingBoxViewport = $(obj).offset();
            var blanket_height = $(obj).outerWidth();
            var _zPortHeight = $(obj).outerHeight();
            /** @type {number} */
            addtop = _zPortHeight / 2 - _height / 2;
            /** @type {number} */
            _rowPosition = blanket_height / 2 - popHeightVar / 2;
            /** @type {number} */
            addtop = addtop + (anchorBoundingBoxViewport.top - $(document).scrollTop());
            /** @type {number} */
            _rowPosition = _rowPosition + (anchorBoundingBoxViewport.left - $(document).scrollLeft());
        } else {
            /** @type {number} */
            var blanket_height = document.documentElement.clientWidth;
            /** @type {number} */
            var _zPortHeight = document.documentElement.clientHeight;
            /** @type {number} */
            addtop = _zPortHeight / 2 - _height / 2;
            if (_zPortHeight > _height + 240) {
                /** @type {number} */
                addtop = 120;
            }
            /** @type {number} */
            _rowPosition = blanket_height / 2 - popHeightVar / 2;
        }
        $(overlay).css({
            top: addtop,
            left: _rowPosition,
            margin: "0 0 0 0"
        });
    };
    /**
     * @param {!Function} context
     * @return {undefined}
     */
    var close = function (context) {
        $("#hud-overlay, #hud-hidden-overlay, #hud-con").addClass("fade-out");
        /** @type {boolean} */
        a = false;
        $("body").off("click.hudDismiss");
        if (context && context != null) {
            context.call();
        }
    };
    /**
     * @param {?} text
     * @return {undefined}
     */
    var updateText = function (text) {
        var $sharepreview = $("#hud-con");
        $sharepreview.find(".message").html(text);
    };
    return {
        push: render,
        dismiss: close,
        updateText: updateText
    };
}(), pm.backButtonCache = function () {
    /** @type {number} */
    var a = 5;
    /**
     * @return {?}
     */
    var disqussionNotesHandler = function () {
        var inputel = $("#cached-container-id");
        return inputel.length > 0 && inputel.attr("cache-url-location") === window.location.toString();
    };
    /**
     * @return {undefined}
     */
    var replace = function () {
        /** @type {number} */
        var b = 1;
        for (; b <= a; b++) {
            $("#cached-content-" + b).val("");
        }
        $("#cached-updates").val("");
        $("#cached-max-ids").val("");
        var c = $("#cached-container-id");
        c.val("");
        c.attr("cache-url-location", "");
    };
    /**
     * @param {!Object} section
     * @return {?}
     */
    var init = function (section) {
        return window.safari || navigator.userAgent.toLowerCase().indexOf("firefox") > 0 ? (section.attr("cache-url-location", window.location.toString()), true) : false;
    };
    /**
     * @param {?} n
     * @param {?} type
     * @param {!Object} i
     * @param {?} t
     * @return {undefined}
     */
    var e = function (n, type, i, t) {
        var element = $("#cached-container-id");
        if (element.length > 0 && !init(element)) {
            var $conditionsRuleMajor = $("#cached-max-ids");
            if (element.val().length == 0) {
                element.val(n);
                element.attr("cache-url-location", window.location.toString());
                $conditionsRuleMajor.val(type);
            }
            var coords = $conditionsRuleMajor.val().split(",");
            /** @type {number} */
            var x = parseInt(element.data("max-cache-pages"));
            if (element.val() !== n) {
                replace();
                element.data("max-cache-pages", 0);
            } else {
                if (coords.length < x && (!i || coords.indexOf(i.toString()) == -1)) {
                    /** @type {number} */
                    var cols = Math.ceil(x / a);
                    var tags = $("#cached-content-" + Math.ceil(coords.length / cols));
                    tags.val(tags.val() + t);
                    coords.push(i);
                    $conditionsRuleMajor.val(coords.join(","));
                }
            }
        }
    };
    /**
     * @param {(Object|string)} i
     * @param {?} m
     * @return {undefined}
     */
    var f = function (i, m) {
        var container = $("#cached-container-id");
        var childNode = $("#cached-updates");
        if (childNode.length > 0 && !init(container)) {
            /** @type {*} */
            var d = childNode.val().length > 0 ? JSON.parse(childNode.val()) : {};
            d[i] = m;
            childNode.val(JSON.stringify(d));
        }
    };
    /**
     * @return {undefined}
     */
    var _init = function () {
        var inputel = $("#cached-container-id");
        if (inputel.length > 0 && inputel.val().length > 0) {
            var e = $("#" + inputel.val());
            var d = $("#cached-max-ids").val().split(",");
            if (inputel.attr("cache-url-location") != window.location.toString() && d.length > 0 && e.data("max-id") == d[0]) {
                /** @type {number} */
                var b = 1;
                for (; b <= a; b++) {
                    e.append($("#cached-content-" + b).val());
                }
                e.data("max-id", d[d.length - 1]);
                e.data("scroll-depth", d.length);
                inputel.attr("cache-url-location", window.location.toString());
            }
        }
        var $anchorTarget = $("#cached-updates");
        if ($anchorTarget.length > 0 && $anchorTarget.val().length > 0) {
            /** @type {*} */
            var Locale = JSON.parse($anchorTarget.val());
            var i;
            for (i in Locale) {
                $("#" + i).html(Locale[i]);
            }
        }
    };
    return {
        store: e,
        update: f,
        restore: _init,
        clear: replace,
        DOMPreserved: disqussionNotesHandler
    };
}(), pm.userNameAutoComplete = function () {
    /**
     * @return {undefined}
     */
    function logout() {
        $.ajax({
            type: "GET",
            url: pm.routes.userInteractedUsers(pm.userInfo.userId()),
            dataType: "JSON",
            success: function (obj) {
                path = obj.users;
            }
        });
    }

    /**
     * @param {string} type
     * @return {undefined}
     */
    function render(type) {
        $.ajax({
            type: "GET",
            url: pm.routes.listingInteractions(type),
            dataType: "JSON",
            success: function (val) {
                data[type] = val.users;
            }
        });
    }

    /**
     * @param {?} selector
     * @return {undefined}
     */
    function init(selector) {
        /**
         * @param {?} selector
         * @return {?}
         */
        function $(selector) {
            /** @type {(Array<string>|null)} */
            var m = /([^" "]+)$/.exec(selector);
            return m && m[1] ? m[1].trim() : "";
        }

        /** @type {string} */
        var customPlayerControls = '<li><a href="#"><img class="user-image"/><span class="handle"></span><span class="name"></span></a></li>';
        try {
            $(selector).typeahead({
                matcher: function (data) {
                    var query = $(this.query);
                    return query ? query.indexOf("@") != 0 ? false : query.length < this.options.minLength ? false : data.display_handle.toLowerCase().indexOf(query.substring(1)) == 0 || data.full_name.toLowerCase().indexOf(query.substring(1)) == 0 : false;
                },
                source: function (callback, resolve) {
                    /** @type {null} */
                    var i = null;
                    var $element = this.$element;
                    if ($(".bundle-items .bundle-items-con").length > 0) {
                        i = $(".bundle-items .bundle-items-con").first().data().postId;
                    } else {
                        i = $($element).parents(".listing-wrapper").attr("id") || $($element).parents(".m-listing-con").attr("id");
                    }
                    if (i) {
                        if (result[i]) {
                            resolve(result[i]);
                        } else {
                            if (data[i] && path.length > 0) {
                                result[i] = callback(data[i]);
                                delete data[i];
                                resolve(result[i]);
                            } else {
                                if (path.length > 0) {
                                    render(i);
                                    resolve(path);
                                } else {
                                    if (data[i]) {
                                        logout();
                                        resolve(data[i]);
                                    } else {
                                        logout();
                                        render(i);
                                        resolve([]);
                                    }
                                }
                            }
                        }
                    } else {
                        if (path.length < 1) {
                            logout();
                        }
                        resolve(path);
                    }
                },
                menu: '<ul class="typeahead dropdown-menu username-autocomplete-list"></ul>',
                items: 5,
                minLength: 2,
                sorter: function (items) {
                    /** @type {!Array} */
                    var b = [];
                    /** @type {!Array} */
                    var c = [];
                    /** @type {!Array} */
                    var d = [];
                    var e;
                    for (; e = items.shift();) {
                        if (e.display_handle.toLowerCase().indexOf(this.query.toLowerCase())) {
                            if (~e.display_handle.indexOf(this.query)) {
                                c.push(e);
                            } else {
                                d.push(e);
                            }
                        } else {
                            b.push(e);
                        }
                    }
                    return b.concat(c, d);
                },
                updater: function (newVal) {
                    return this.$element.val().replace(/[^" "]*$/, "") + "@" + newVal + " ";
                },
                render: function (items) {
                    var b = this;
                    return items = $(items).map(function (i, data) {
                        return i = $(customPlayerControls).attr("data-value", data.display_handle), i.find(".name").html(utils.escapeHTML(data.full_name)), i.find(".handle").html(utils.escapeHTML("@" + data.display_handle)), i.find(".user-image").attr("src", data.default_picture_url), i[0];
                    }), this.$menu.css("width", this.$element.outerWidth() + "px"), items.first().addClass("active"), this.$menu.html(items), this;
                }
            });
        } catch (j) {
        }
    }

    /**
     * @param {?} depend_offs
     * @return {?}
     */
    function callback(depend_offs) {
        var res = path;
        return $(depend_offs).each(function (a, item) {
            /** @type {boolean} */
            var d = false;
            $(res).each(function (mmCoreSecondsYear, selectFile) {
                if (selectFile.id == item.id) {
                    /** @type {boolean} */
                    d = true;
                }
            });
            if (!d) {
                res.push(item);
            }
        }), res;
    }

    /** @type {!Array} */
    var path = [];
    /** @type {!Array} */
    var data = [];
    /** @type {!Array} */
    var result = [];
    return {
        initUserNameAutoComplete: init
    };
}(), pm.listings = pm.listings || {}, pm.listings.toggleLikeListing = function (event, hackerspace) {
    var sel = $(event.currentTarget);
    var container = sel.attr("data-sync-action") === "true" ? $("main") : sel.parent();
    var count = container.attr("data-count") || 0;
    var $num = container.find(".like-count-con .count");
    if (hackerspace == "listing") {
        var result = container.find(".social-summary-partial-con");
        var ret = container.find(".likers .liker-images");
        var results = container.find(".likers .liker-names");
        var i = result.data("likes-url");
        count = result.data("count");
    } else {
        if (hackerspace == "bundleV3") {
            pm.bundleV3.refreshAfterLikeAction(sel);
        }
    }
    if (sel.hasClass("like")) {
        container.find("a.like").toggleClass("f-hide");
        container.find("a.unlike").toggleClass("f-hide");
        count++;
        container.attr("data-count", count);
        if (count > 0) {
            $num.removeClass("f-hide");
        }
        $num.html(count);
        if (hackerspace == "listing") {
            result.data("count", count);
            $num.html(count);
            var k = pm.routes.userClosetPath(pm.userInfo.displayHandle());
            var key = pm.userInfo.displayHandle();
            var m = pm.userInfo.userTinyImage();
            if (count == 1) {
                result.html(likesCon(k, key, m));
            } else {
                if (count > 1) {
                    results.html(closetLinkText(k, key, i, count));
                }
            }
            if (ret && count <= 5) {
                ret.append(closetLinkImage(k, key, m));
            }
        }
        var userId = sel.attr("data-pa-attr-listing_id");
        if (userId) {
            allPixel.liked(userId);
        }
    } else {
        if (sel.hasClass("unlike")) {
            container.find("a.unlike").toggleClass("f-hide");
            container.find("a.like").toggleClass("f-hide");
            /** @type {(number|string)} */
            count = count - 1 || "";
            container.attr("data-count", count);
            $num.html(count);
            if (count == 0) {
                $num.addClass("f-hide");
            }
            if (hackerspace == "listing") {
                result.data("count", count);
                ret.find("a[href='" + pm.routes.userClosetPath(pm.userInfo.displayHandle()) + "']").remove();
                if (count == 0) {
                    result.find(".likers").remove();
                } else {
                    var o = ret.find("a");
                    if (o.attr("href") !== undefined) {
                        var source = o.attr("href").substr(o.attr("href").lastIndexOf("/") + 1, o.attr("href").length);
                    }
                    m = o.find("img").attr("src");
                    if (count == 1) {
                        ret.find("a").remove();
                        result.html(likesCon(o.attr("href"), source, m));
                    } else {
                        if (count > 1) {
                            results.html(closetLinkText(o.attr("href"), source, i, count));
                        }
                    }
                }
            }
        }
    }
    sel.off("remoteAction");
    pm.backButtonCache.update(container.parent().attr("id"), container.parent().html());
};
/**
 * @param {string} text
 * @param {string} object
 * @param {string} includeAll
 * @return {?}
 */
var closetLinkImage = function (text, object, includeAll) {
    return "<a href ='" + text + "'><img alt='" + object + "' class='user-image s' context='pm_image_tag' src=" + includeAll + " title='" + object + "'></a>";
};
/**
 * @param {string} identifier
 * @param {string} uri
 * @param {string} c
 * @param {number} result
 * @return {?}
 */
var closetLinkText = function (identifier, uri, c, result) {
    /** @type {string} */
    var okval = "other";
    /** @type {string} */
    var func = "one";
    return result > 2 && (okval = "others", func = result - 1), "<div class='liker-names'><a href ='" + identifier + "'>" + uri + "</a>&nbsp;and<a class='like-count grey' data-ajax-modal='true' href='" + c + "' target='#listing-likes'>&nbsp;" + func + "&nbsp;" + okval + "</a>&nbsp;like this</div>";
};
/**
 * @param {string} text
 * @param {string} object
 * @param {string} includeAll
 * @return {?}
 */
var likesCon = function (text, object, includeAll) {
    return "<div class='likers d-fl ai-c'><div class='liker-images'><a href='" + text + "'><img alt='" + object + "' class='user-image s' context='pm_image_tag' src='" + includeAll + "' title='" + object + "'></a></div><div class='liker-names'><a href ='" + text + "'>" + object + "</a>&nbsp;likes this</div></div>";
};
pm.listings.initReportListing = function () {
    if (!pm.userInfo.isLoggedIn()) {
        return;
    }
    var translationDictionary = {
        mistagged: {
            mistagged_brand: "Mistagged Brand",
            mistagged_category: "Mistagged Category",
            mistagged_condition: "Mistagged Condition"
        },
        not_allowed: {
            non_fashion: "Non-Fashion / Other",
            prohibited: "Prohibited / Illegal (Rx drugs, medical devices, illicit drugs and paraphernalia)"
        }
    };
    /**
     * @param {?} j
     * @return {undefined}
     */
    var updateContextButton = function (j) {
        /** @type {string} */
        var scrolltable = "";
        var k;
        for (k in translationDictionary[j]) {
            /** @type {string} */
            scrolltable = scrolltable + ("<option value='" + k + "'>" + translationDictionary[j][k] + "</option>");
        }
        $("#report-listing select#report_listing_form_sub_reason").html(scrolltable);
        $("#report-listing select#report_listing_form_sub_reason").show();
    };
    $("#report-listing select#report_listing_form_sub_reason").hide();
    $("main").on("change", "#report-listing select#report_listing_form_reason", function (canCreateDiscussions) {
        var j = $("#report-listing select#report_listing_form_reason option:checked").val();
        $("#report-listing select#report_listing_form_sub_reason").html("");
        $("#report-listing select#report_listing_form_sub_reason").hide();
        if (translationDictionary[j]) {
            updateContextButton(j);
        }
    });
}, pm.listings.initToggleLikes = function (name) {
    if (!pm.userInfo.isLoggedIn()) {
        return;
    }
    $("main").on("click", "a.unlike, a.like", function (event) {
        event.preventDefault();
        var $dds = $(event.currentTarget);
        $dds.on("remoteAction", function (b, SMessage) {
            if (SMessage.success) {
                pm.listings.toggleLikeListing(b, name);
            }
        });
        $dds.on("remoteAction:error", function (a, data) {
            pm.flashMessage.push({
                type: 1,
                text: data.responseJSON.error.user_message,
                duration: 3e3
            });
            $dds.off("remoteAction:error");
        });
    });
}, pm.listings.initSelectImage = function () {
    $("main").on("click", ".small-image-con", function (event) {
        var node = $(event.target).is("img") ? $(event.target) : $(event.target).children("img");
        var syncedAnimals = $(event.currentTarget).find(".image-con");
        var image = $(".covershot");
        image.attr("src", node.data("img-src"));
        syncedAnimals.each(function (a, rawCourse) {
            $image = $(rawCourse).children("img");
            if ($image.attr("src") !== node.attr("src")) {
                $image.parent().removeClass("selected");
            } else {
                $image.parent().addClass("selected");
            }
        });
    });
}, pm.listings.initSizeSelectorModal = function (data) {
    $("#size-selector .item-pic").attr("src", data.coverShotUrl);
    /** @type {string} */
    var scrolltable = "";
    var strCookies = data.sizeSelector.split(",");
    /** @type {number} */
    var i = 0;
    for (; i < strCookies.length; i++) {
        var f = strCookies[i].split(":");
        /** @type {string} */
        scrolltable = scrolltable + ('<div class="size-selector' + (f[2] == 0 ? " disabled" : "") + '" data-post-id="' + data.postId + '" data-location="' + data.location + '" data-pa-attr-location="' + data.paAttrLocation + '" data-pa-name="size" data-pa-click-type="button" data-pa-screen-type="popup" data-pa-screen-name="listing_size_picker" data-pa-attr-content_type="size" data-pa-attr-content="[' + data.sizeContent + ']" data-pa-attr-bundle_id="' + data.paAttrBundle_id + '" data-pa-attr-listing_id="' +
            data.postId + '" data-pa-attr-lister_id="' + data.paAttrLister_id + '" data-pa-attr-buyer_id="' + data.paAttrBuyer_id + '" ' + (data.addPostUrl ? 'data-add-post-url="' + data.addPostUrl + '"' : 'data-update-post-url="' + data.updatePostUrl + '"') + ' data-size-content="' + f[0] + '">&nbsp;' + f[1] + "&nbsp;</div>");
    }
    $("#size-selector .sizes").html(scrolltable);
    $("#size-selector").modal("show");
    pm.tracker.screenView({
        data: {
            type: pm.tracker.actionType.view,
            name: "listing_size_picker",
            element_type: pm.tracker.screenType.popup,
            properties: {
                bundle_id: data.bundleId,
                listing_id: data.postId,
                lister_id: data.listerId,
                buyer_id: data.buyerId
            }
        }
    });
}, pm.listings.initShare = function (url, type) {
    var popup = $("#share-popup");
    var element = popup.find("#ds-search-users #search-list .result");
    var $suggestionContainer = popup.find("#ds-search-users #search-list .result-direct-share-users");
    var _thumbnailForm = popup.find("#ds-search-users");
    var $value = popup.find(".direct-share-users");
    /** @type {null} */
    var h = null;
    /**
     * @param {?} a
     * @return {undefined}
     */
    var i = function (a) {
        /** @type {string} */
        var requestOrUrl = "/user/direct_share/recent_users/post/";
        var output = recentlyViewedBundlesV3Obj && recentlyViewedBundlesV3Obj.getRecentItems();
        /** @type {string} */
        var journalTrackId = "";
        if (pm.pageInfo.paTrackerData.screen_properties && pm.pageInfo.paTrackerData.screen_properties.listing_id) {
            journalTrackId = pm.pageInfo.paTrackerData.screen_properties.listing_id;
        } else {
            journalTrackId = sp.data.id;
        }
        var data = {
            authenticity_token: utils.getCsrfToken()["X-CSRF-Token"],
            listing_id: journalTrackId,
            bundles_v3: output ? JSON.stringify(output) : null
        };
        $.ajax({
            dataType: "json",
            url: requestOrUrl,
            cache: false,
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json",
            success: function (value) {
                $value.html(value.html);
                send();
                $value.show();
                $suggestionContainer.html(value.htmlUsersList);
                create();
            }
        });
    };
    /**
     * @return {undefined}
     */
    var create = function () {
        $("#share-popup").on("click", ".direct-share-users a.pm_direct_share, .result-direct-share-users a.pm_direct_share, #ds-search-users a.pm_direct_share", function (event) {
            event.preventDefault();
            var b = $(this);
            var QueryLanguageComponent = b.data("buyer-id") || b.data("pa-attr-buyer_id");
            var item = sp.data.id;
            var languageProperties = pm.pageInfo.paTrackerData ? pm.pageInfo.paTrackerData.screen_properties : null;
            pm.tracker.clickTrack({
                data: {
                    type: pm.tracker.actionType.click,
                    element_type: pm.tracker.elementType.button,
                    attributes: {
                        paName: "direct_share",
                        paAttrListing_id: item,
                        paAttrBuyer_id: QueryLanguageComponent,
                        paAttrLocation: "share_listing_popup"
                    },
                    properties: languageProperties
                }
            });
            remoteRequest(b, {
                method: "POST",
                data: {
                    size_id: sp.data.size
                },
                url: pm.routes.directSharePath(QueryLanguageComponent, item)
            });
        });
    };
    /**
     * @param {!Event} event
     * @return {?}
     */
    var search = function (event) {
        var originPhoto = $.trim(popup.find(".search-section-people form").find("input.search-text").val());
        if (!originPhoto) {
            return false;
        }
        event.preventDefault();
        /** @type {string} */
        var journalTrackId = "";
        if (pm.pageInfo.paTrackerData.screen_properties && pm.pageInfo.paTrackerData.screen_properties.listing_id) {
            journalTrackId = pm.pageInfo.paTrackerData.screen_properties.listing_id;
        } else {
            journalTrackId = sp.data.id;
        }
        var SPACING = element.attr("data-max-id");
        /** @type {string} */
        var x = "/search_people_ds?listing_id=" + journalTrackId + "&query=" + encodeURI(originPhoto);
        if (SPACING) {
            /** @type {string} */
            x = x + ("&max_id=" + SPACING);
        } else {
            element.html("");
        }
        element.attr("data-load-more", false);
        element.attr("data-max-id", "");
        element.show();
        $suggestionContainer.hide();
        $.ajax({
            dataType: "json",
            url: x,
            cache: false,
            success: function (data) {
                /** @type {null} */
                var text = null;
                if (data.html) {
                    element.attr("data-max-id", data.max_id);
                    text = data.html;
                }
                element.append(text);
                if (data.max_id) {
                    element.attr("data-load-more", true);
                } else {
                    element.attr("data-load-more", false);
                }
            }
        });
    };
    /**
     * @param {!Event} type
     * @return {undefined}
     */
    var process = function (type) {
        /** @type {number} */
        var b = 54;
        if (utils.isMobileDevice.any()) {
            /** @type {number} */
            b = 230;
        }
        if (element.scrollTop() > b && element.attr("data-load-more") == "true") {
            search(type);
        }
    };
    /**
     * @param {?} noanimation
     * @return {undefined}
     */
    var open = function (noanimation) {
        if (h) {
            if (pm.pageInfo.browserDeviceCategory !== "mobile") {
                popup.find(".internal-share-con").scrollTop(0);
            } else {
                popup.find("#carousel-ds").children().first().scrollLeft(0);
            }
            $suggestionContainer.scrollTop(0);
        }
        _thumbnailForm.hide();
        _thumbnailForm.find("input.search-text").val("");
        element.attr("data-max-id", "");
        element.attr("data-load-more", false);
        element.hide();
        popup.find(".internal-share-con").show();
        popup.find(".external-share-con").show();
    };
    /**
     * @param {!Event} event
     * @return {undefined}
     */
    var init = function (event) {
        event.preventDefault();
        var languageProperties = pm.pageInfo.paTrackerData ? pm.pageInfo.paTrackerData.screen_properties : null;
        pm.tracker.screenView({
            data: {
                type: pm.tracker.actionType.view,
                name: "direct_share_search",
                element_type: pm.tracker.screenType.popup,
                properties: languageProperties
            }
        });
        _thumbnailForm.show();
        _thumbnailForm.find("input").focus();
        element.attr("data-max-id", "");
        element.attr("data-load-more", false);
        element.hide();
        $suggestionContainer.find(".ds-users-con .item a").attr("data-pa-attr-location", "direct_share_search");
        $suggestionContainer.show();
        popup.find(".internal-share-con").hide();
        popup.find(".external-share-con").hide();
    };
    /**
     * @return {undefined}
     */
    var manageToggleState = function () {
        element.hide();
        $suggestionContainer.show();
    };
    /**
     * @param {!Object} a
     * @param {!Object} b
     * @return {undefined}
     */
    var main_chat_user_new = function (a, b) {
        if (a.length > 0 && b.length > 0 && !a.is(b)) {
            a.before(b.outerHTML());
            b.remove();
        }
    };
    /**
     * @return {?}
     */
    var send = function () {
        if (h) {
            var status = $value.find("[data-buyer-id='" + h + "']").parent();
            if (!(status.length > 0)) {
                return false;
            }
            if (pm.pageInfo.browserDeviceCategory !== "mobile") {
                main_chat_user_new($value.find(".ds-users-con").children().first(), status);
            } else {
                main_chat_user_new($value.find("#ds-search-option").next(), status);
            }
            var QueryLanguageComponent = $suggestionContainer.find("[data-buyer-id='" + h + "']").parent();
            main_chat_user_new($suggestionContainer.find(".ds-users-con").children().first(), QueryLanguageComponent);
            /** @type {null} */
            h = null;
        }
        return true;
    };
    $(document).on("submit", "#share-popup .search-section-people form", search);
    $("#ds-search-users .search-section-people form .search-text").on("input", function (a) {
        if (!this.value) {
            element.hide();
            $suggestionContainer.show();
        }
    });
    element.scroll(process);
    $("main").on("click", "#share-popup #ds-search-option", init);
    $("main").on("click", "#share-popup .search-section-people .esc", open);
    $("main").on("click", "#share-popup .modal-header .close", open);
    $("#share-popup").on("show.bs.modal", function () {
        $suggestionContainer.find(".ds-users-con .item a").attr("data-pa-attr-location", "share_listing_search");
        $value.hide();
        if (pm.userInfo.isLoggedIn() && sp.isListingCreator()) {
            if ($value.html() !== "" && send()) {
                $value.show();
                return;
            }
            i();
        }
    });
    $("main").on("click", "#share-popup .pm_direct_share", function (event) {
        $shareAction = $(event.currentTarget);
        h = $(this).data("buyer-id") || $(this).data("pa-attr-buyer_id");
        $shareAction.on("remoteAction", open);
        $shareAction.on("remoteAction:error", open);
    });
    $("main").on("click", "#share-popup .fb-share-link", function (event) {
        event.preventDefault();
        sp.listing.postToFbFeed();
    });
    $("main").on("click", "#share-popup .email-share-link", function (event) {
        event.preventDefault();
        var valueProgess = $(this).attr("href");
        sp.listing.generateNavigateTrackedEmailContent(valueProgess);
    });
    $("main").on("click", "#share-popup .tw-share-link", function (event) {
        event.preventDefault();
        var valueProgess = $(this).attr("href");
        sp.listing.generateNavigateTrackedTwitterContent(valueProgess);
    });
    $("main").on("click", "#share-popup .pn-share-link", function (event) {
        event.preventDefault();
        var valueProgess = $(this).attr("href");
        sp.listing.generateNavigateTrackedPinterestContent(valueProgess);
    });
    $("main").on("click", "#share-popup .tm-share-link", function (event) {
        event.preventDefault();
        var valueProgess = $(this).attr("href");
        sp.listing.generateNavigateTrackedTumblrContent(valueProgess);
    });
    $("main").on("click", "#share-popup .pm-followers-share-link, #share-popup .pm-party-share-link, #share-popup .pm_direct_share", function (event) {
        $shareAction = $(event.currentTarget);
        $shareAction.on("remoteAction", function () {
            pm.flashMessage.push({
                type: 1,
                parent: $("#share-popup"),
                text: "Shared Successfully",
                duration: 2e3
            });
            $("#share-popup").modal("hide");
            $shareAction.off("remoteAction");
        });
        $shareAction.on("remoteAction:error", function (a, res) {
            if (res.responseJSON && res.responseJSON.error && res.responseJSON.error.user_message) {
                pm.flashMessage.push({
                    type: 1,
                    parent: $("#share-popup"),
                    text: res.responseJSON.error.user_message,
                    duration: 3e3
                });
            }
            if (res.responseJSON && res.responseJSON.error && res.responseJSON.error.error_type === "SuspectedBotError") {
                $("#share-popup").modal("hide");
                $shareAction.off("remoteAction:error");
            } else {
                if (res.status == 403 || res.status == 400) {
                    $("#share-popup").modal("hide");
                    pm.flashMessage.push({
                        text: res.responseJSON.error.user_message
                    });
                }
            }
            $shareAction.off("remoteAction:error");
        });
    });
    $("main").on("click", "#share-popup .external-share-con a", function () {
        $("#share-popup").modal("hide");
    });
    $("main").on("click", "#share-closet-popup ul.external-share-links a", function () {
        $("#share-closet-popup").modal("hide");
    });
    sp.clipboard(".ld-copy-link");
    $(url).on("click", type, function () {
        var valueProgess;
        if ($("#tiles-con, .tile").length > 0) {
            valueProgess = $(this).parents(".tile");
            sp.listing.loadDataFromGrid(valueProgess);
        } else {
            valueProgess = $(document).find(".listing-wrapper, .m-listing-con");
            $("#share_banner").hide();
            var b = $(".item-details-widget");
            sp.listing.loadDataFromListingDetails(valueProgess, b);
        }
        $("#share-popup .tw-share-link").attr("href", sp.listing.generateFallbackTwitterLink());
        $("#share-popup .tm-share-link").attr("href", sp.listing.generateFallbackTumblrLink());
        $("#share-popup .pn-share-link").attr("href", sp.listing.generateFallbackPinterestLink());
        $("#share-popup .email-share-link").attr("href", sp.listing.generateFallbackEmailLink());
        $("#share-popup .ld-copy-link").attr("data-clipboard-text", sp.data.link);
        if ($("#share-popup .pm-followers-share-link").length > 0) {
            sp.listing.modifyPmShareLink($("#share-popup .pm-followers-share-link"));
        }
        if ($("#share-popup .pm-party-share-link").length > 0) {
            sp.listing.modifyPmShareToPartyLink($("#share-popup .pm-party-share-link"));
        }
        $("#share-popup .title").html(sp.data.title);
        $("#share-popup img.covershot").attr("src", sp.data.image);
        $("#share-popup ul.pipe").html(sp.data.details_html);
        $("#share-popup .brand").html(sp.data.brand_html);
        sp.initFacebookLib();
        sp.fbGoogleSignUpInit();
    });
}, pm.listings.initBuy = function () {
    $("main").on("click", ".buy-actions #buy_now , .buy-actions #make_offer", function (event) {
        event.preventDefault();
        var type = $(this).data("action");
        var form = $($(this).closest("form"));
        form.find("input[type=radio][checked=checked]").prop("checked", true);
        if (type == "buy") {
            var targetiframe_id = $(this).data("url");
            if (targetiframe_id) {
                if (typeof form.find("input[type=radio]:checked").val() == "undefined") {
                    $("#size-selector-modal").modal("show");
                    $("#size_selector_form").attr("action", targetiframe_id);
                } else {
                    form.attr("action", targetiframe_id);
                    var encodedPW = pm.listings.getSupportedPayments();
                    $("#post_inventory_form_supported_payment_method").val(encodedPW);
                    form.submit();
                }
            } else {
                pm.popups.updateSignUpWithDestinationParams(this);
                $("#signup-popup-con").modal("show");
                /** @type {string} */
                var f = "Sign up to make this item yours!";
                $("#signup-popup-con .contextual-text h2").text(f);
            }
        } else {
            if (type == "offer") {
                var type = $(this).data("actiontype");
                if (type == "guest_offer") {
                    pm.popups.updateSignUpWithDestinationParams(this);
                    /** @type {string} */
                    f = "Sign up to submit your offer. The seller will get back to you within 24 hours.";
                    $("#signup-popup-con .contextual-text h2").text(f);
                    $("#signup-popup-con").modal("show");
                } else {
                    if (typeof form.find("input[type=radio]:checked").val() == "undefined") {
                        $(this).attr("data-target", "#size-selector-modal");
                        $("#size_selector_form").attr("action", "offer");
                    } else {
                        var h = form.find("input[type=radio]:checked");
                        var htmlCon = h.parent().find("label").text();
                        var old_selected = h.val();
                        $("#offer_form_size_id").val(old_selected);
                        $("#products_size_id").val(old_selected);
                        $("#offer_popup_size_id").text("Size:  " + htmlCon);
                        encodedPW = pm.listings.getSupportedPayments();
                        $("#offer_form_supported_payment_method").val(encodedPW);
                        $(this).attr("data-target", "#new-offer-modal");
                    }
                }
            }
        }
    });
}, pm.listings.getSupportedPayments = function () {
    /** @type {string} */
    var style = "gp";
    return window.ApplePaySession && (style = "ap,gp"), style;
}, pm.listings.initSizeSelectionModal = function () {
    $("main").on("click", "#size_selector_form input[type=radio]", function (event) {
        var filterInput = $(this);
        var form = $(filterInput.closest("form"));
        var d = filterInput.val();
        event.preventDefault();
        if (form.attr("action") == "bundle") {
            var target = $('label[for="' + this.id + '"]');
            var params = target.data();
            params.sizeId = d;
            $("#size-selector-modal").modal("hide");
            pm.listings.addToBundle(target, params);
            $("#size_selector_form").attr("action", "");
        } else {
            if (form.attr("action") == "offer") {
                var htmlCon = filterInput.parent().find("label").text();
                $("#size-selector-modal").modal("hide");
                $("#new-offer-modal").modal("show");
                $("#offer_form_size_id").val(d);
                $("#products_size_id").val(d);
                $("#offer_popup_size_id").text("Size:  " + htmlCon);
                $("#offer_form_supported_payment_method").val(pm.listings.getSupportedPayments());
                form.attr("action", "");
            } else {
                if (form.attr("action") == "paypal") {
                    $("#size-selector-modal").modal("hide");
                    $("#size_selector_form #post_inventory_form_selected_payment_method").val("pp");
                    /** @type {boolean} */
                    var QueryLanguageComponent = form.attr("allow_paypal_credit") === "true";
                    form = $("#size_selector_form").serialize();
                    pm.commerce.PayPal.submitPayment(form, QueryLanguageComponent);
                } else {
                    pm.tracker.clickTrack({
                        data: {
                            type: pm.tracker.actionType.click,
                            element_type: pm.tracker.elementType.link,
                            attributes: {
                                paName: "size_selection",
                                paAttrListing_id: this.id
                            }
                        }
                    });
                    $("#size_selector_form #post_inventory_form_supported_payment_method").val(pm.listings.getSupportedPayments());
                    form.submit();
                    form.attr("action", "");
                }
            }
        }
    });
}, pm.listings.initBundle = function (a) {
    $("main").on("click", ".bundles a, .bundle a", function (event) {
        event.preventDefault();
        var target = $(this);
        var $sharepreview = $(target.closest("form"));
        if (pm.userInfo.isLoggedIn()) {
            var after = $sharepreview.find("input[type=radio]:checked").val();
            var params = target.data();
            return params.sizeId = after, after ? pm.listings.addToBundle(target, params) : ($("#size-selector-modal").modal("show"), $("#size_selector_form").attr("action", "bundle")), false;
        }
        pm.popups.updateSignUpWithDestinationParams(this);
        $("#signup-popup-con").modal("show");
    });
    $("body").on("click", ".rmf-bundle", function () {
        var article = $(this);
        var params = article.data();
        pm.listings.removePost(article, params);
    });
}, pm.listings.addToBundle = function (key, event) {
    pm.tracker.setUpClickTrack(key);
    if (event.postAvailable) {
        var data = getParams(key);
        data.data = {
            size_id: event.sizeId
        };
        data.url = event.addPostUrl;
        /**
         * @param {!Object} data
         * @return {?}
         */
        var update = function (data) {
            if (data["success"] == 1) {
                return pm.overlay.hide(), window.location = event.dressingRoomUrl ? event.dressingRoomUrl : event.bundleV3Url;
            }
            pm.overlay.hide();
            if (data.modal_html) {
                var $cover_details = $(data.modal_html).appendTo("#bundle-popup-con").first();
                $cover_details.modal("show");
            } else {
                var capture_headings = data.error_message || "Something went wrong. Please try again later.";
                pm.flashMessage.push({
                    text: capture_headings,
                    duration: 5e3
                });
            }
            return;
        };
        pm.overlay.show();
        remoteRequest(key, data, update);
    } else {
        pm.flashMessage.push({
            text: "Sorry! This item is not available for purchase.",
            duration: 5e3
        });
    }
}, pm.listings.showPaymentButton = function () {
    var a = $("[data-new-shipping-fee]").data("new-shipping-fee");
    if (window.ApplePaySession) {
        var loadPropPromise = ApplePaySession.canMakePaymentsWithActiveCard(pm.commerce.merchantIdentifier);
        loadPropPromise.then(function (b) {
            if (b) {
                $("#apple_pay").removeClass("hide");
                pm.commerce.PayPal.initPaypalCredit(pm.commerce.listing_sub_total, a);
            } else {
                pm.commerce.PayPal.init(pm.commerce.listing_sub_total, a);
            }
        }).catch(function (b) {
            pm.commerce.PayPal.init(pm.commerce.listing_sub_total, a);
        });
    } else {
        pm.commerce.PayPal.init(pm.commerce.listing_sub_total, a);
    }
}, pm.listings.initApplePay = function () {
    var a = $("[data-new-shipping-fee]").data("new-shipping-fee");
    var composerImage = $("[data-tax-field-label]").data("tax-field-label");
    if (pm.commerce.apple_pay_button_enabled === "true") {
        pm.listings.showPaymentButton();
        pm.commerce.applePay.init_apple_pay("", pm.commerce.listing_sub_total, "", "", "", "", "", "", "", "listing_details", "", "", "", "", a, "0.00", composerImage);
    } else {
        pm.commerce.PayPal.init(pm.commerce.listing_sub_total, a);
    }
}, pm.listings.removePost = function (id, params) {
    var query = getParams(id);
    query.url = params.removePostUrl;
    /**
     * @param {!Object} data
     * @return {undefined}
     */
    var update = function (data) {
        if (data["success"] == 1) {
            $.get(params.bundlePopupUrl, function (message) {
                if (message["success"] == 1) {
                    $("#bundle-popup").modal("hide");
                    $("#bundle-popup").remove();
                    $("#bundle-popup-con").append(message.html);
                    $("#bundle-popup").modal("show");
                } else {
                    $("#bundle-popup").modal("hide");
                }
            });
        } else {
            if (data.modal_html) {
                var $cover_details = $(data.modal_html).appendTo("#bundle-popup-con").first();
                $cover_details.modal("show");
            } else {
                var capture_headings = data.error_message || "Something went wrong. Please try again later.";
                pm.flashMessage.push({
                    text: capture_headings,
                    duration: 5e3
                });
            }
        }
    };
    remoteRequest(id, query, update);
}, pm.listings.initFollowUnfollow = function () {
    $("main").on("click", "a#follow-user, a#unfollow-user", function (event) {
        event.preventDefault();
        var webview = $(event.target);
        webview.on("remoteAction", function (a, SMessage) {
            if (SMessage.success) {
                var filteredView = webview.parent();
                filteredView.find("a#follow-user, a#unfollow-user").toggleClass("f-hide");
            }
            webview.off("remoteAction");
        });
    });
}, pm.listings.initCarousel = function () {
    /** @type {number} */
    var i = 0;
    $(".carousel-con").on("click", "a.carousel-btn", function (event) {
        var clicked = $(event.currentTarget);
        var filteredView = clicked.parent();
        var $wrapElement = filteredView.find(".carousel-btn.prev");
        var formsearch = filteredView.find(".carousel-btn.next");
        var bcofl_checkbox = filteredView.find(".post-section");
        /** @type {number} */
        var fs = bcofl_checkbox.length - 1;
        if (clicked.hasClass("active")) {
            if (clicked.hasClass("next")) {
                $(bcofl_checkbox[i]).toggleClass("f-hide");
                i++;
                $(bcofl_checkbox[i]).toggleClass("f-hide");
                if (i == fs) {
                    formsearch.removeClass("active");
                }
                if (i == 1) {
                    $wrapElement.addClass("active");
                }
            } else {
                if (clicked.hasClass("prev")) {
                    $(bcofl_checkbox[i]).toggleClass("f-hide");
                    i--;
                    $(bcofl_checkbox[i]).toggleClass("f-hide");
                    if (i == 0) {
                        $wrapElement.removeClass("active");
                    }
                    if (i == fs - 1) {
                        formsearch.addClass("active");
                    }
                }
            }
        }
    });
}, pm.listings.initSimilarListings = function () {
    if (!utils.isBot()) {
        var $anchorTarget = $(".similar-listings-con");
        if ($anchorTarget.length > 0) {
            $anchorTarget.on("lazyLoaded", function (a) {
                if (pm.pageInfo.browserDeviceCategory !== "mobile") {
                    pm.listings.initCarousel();
                }
                pm.listings.paginateSimilarListings();
            });
        } else {
            if (pm.pageInfo.browserDeviceCategory !== "mobile") {
                pm.listings.initCarousel();
            }
            pm.listings.paginateSimilarListings();
        }
    }
}, pm.listings.initLastSeenListings = function () {
    if (!utils.isBot()) {
        var $anchorTarget = $(".last-seen-listings-con");
        if ($anchorTarget.length > 0) {
            $anchorTarget.on("lazyLoaded", function (a) {
                if (pm.pageInfo.browserDeviceCategory !== "mobile") {
                    pm.listings.initCarousel();
                }
                pm.listings.paginateLastSeenListings();
            });
        } else {
            if (pm.pageInfo.browserDeviceCategory !== "mobile") {
                pm.listings.initCarousel();
            }
            pm.listings.paginateLastSeenListings();
        }
    }
}, pm.listings.offset = 0, pm.listings.resize = function () {
    $listingSocialActions = $(".listing-detail-con .social-con");
    $listingImages = $(".listing-image-con");
    pm.listings.offset += $listingImages.height() + $listingImages.offset().top - $listingSocialActions.offset().top;
    pm.listings.offset = pm.listings.offset < 0 ? pm.listings.offset : 0;
    $(".social-con").css("top", pm.listings.offset + "px");
}, pm.listings.initResize = function () {
    if (!utils.isMobileDevice.any() && $(".listing-detail-con").length > 0) {
        pm.listings.resize();
        $(window).resize(function () {
            if ($(window).width() > 768) {
                pm.listings.resize();
            }
        });
    }
}, pm.listings.paginateSimilarListings = function () {
    var options = $(".similar-listings ul.carousel-posts > li");
    var b = $(".see-more-listings.similar_listings");
    /** @type {number} */
    var innerRadius = options.length - 1;
    var distance = distance || 1;
    b.on("click", function () {
        $(options[distance]).removeClass("f-hide");
        distance++;
        if (distance > innerRadius) {
            b.hide();
        }
    });
}, pm.listings.paginateLastSeenListings = function () {
    var options = $(".last-seen-listings ul.carousel-posts > li");
    var b = $(".see-more-listings.my_recent_views");
    /** @type {number} */
    var innerRadius = options.length - 1;
    var distance = distance || 1;
    b.on("click", function () {
        $(options[distance]).removeClass("f-hide");
        distance++;
        if (distance > innerRadius) {
            b.hide();
        }
    });
}, pm.listings.indicatorOffScreen = function (a) {
    var b = a.find("li.active");
    /** @type {boolean} */
    var inputWin = b.position().left > a.width() - b.width();
    /** @type {boolean} */
    var winRef = b.position().left < 0;
    if (inputWin || winRef) {
        utils.horizontalScrollToListItem(b, a);
    }
}, pm.listings.fastCheckoutResponse = function (o, options) {
    var myLocation = $(o.currentTarget);
    var input = myLocation.children("form");
    hideProgress(input);
    if (options.success) {
        myLocation.modal("hide");
        if (options.submit_order_url) {
            if (options.checkout_form) {
                /** @type {string} */
                var x = "checkout_form";
                var res = utils.getFormDataHash(x, []);
                var data = options.checkout_form;
                res[x + "[cc_nonce]"] = data.cc_nonce;
                res[x + "[bt_device_data]"] = data.bt_device_data;
                res[x + "[payment_type]"] = data.payment_type;
                res[x + "[payment_method]"] = data.payment_method;
                res[x + "[billing_address_street]"] = data.billing_address_street;
                res[x + "[billing_address_street2]"] = data.billing_address_street2;
                res[x + "[billing_address_city]"] = data.billing_address_city;
                res[x + "[billing_address_state]"] = data.billing_address_state;
                res[x + "[billing_address_zip]"] = data.billing_address_zip;
                res[x + "[shipping_address_street]"] = data.shipping_address_street;
                res[x + "[shipping_address_street2]"] = data.shipping_address_street2;
                res[x + "[shipping_address_city]"] = data.shipping_address_city;
                res[x + "[shipping_address_state]"] = data.shipping_address_state;
                res[x + "[shipping_address_zip]"] = data.shipping_address_zip;
                res[x + "[shipping_address_name]"] = data.shipping_address_name;
                res[x + "[user_email]"] = data.user_email;
                res[x + "[first_name]"] = data.first_name;
                res[x + "[last_name]"] = data.last_name;
                res[x + "[iobb]"] = data.iobb;
                $.ajax({
                    type: "POST",
                    url: options.submit_order_url,
                    data: res,
                    headers: pm.commerce.applePay.headers,
                    beforeSend: function () {
                        pm.overlay.show();
                    },
                    success: pm.commerce.applePay.finalOrderCheckoutSuccess,
                    dataType: "json"
                });
            } else {
                window.location.href = options.submit_order_url;
            }
        } else {
            pm.commerce.applePay.finalOrderCheckoutSuccess(options);
        }
    } else {
        if (options.errors) {
            pm.validate.clearFormErrors(input.attr("id"));
            pm.validate.addErrors(input, input.data("selector"), options.errors);
        } else {
            if (options.error) {
                myLocation.modal("hide");
                pm.flashMessage.push({
                    text: options.error,
                    duration: 1e4
                });
            } else {
                if (options.modal_html) {
                    try {
                        $("#overwrite-address").modal("hide");
                        $("#" + $(options.modal_html).attr("id")).remove();
                    } catch (h) {
                    }
                    myLocation = $(options.modal_html).appendTo("#content").first();
                    myLocation.modal("show");
                } else {
                    pm.flashMessage.push({
                        text: "We are having difficulty processing your request. Please try again after sometime.",
                        duration: 5e3
                    });
                }
            }
        }
    }
}, pm.listings.initOfferToLikers = function () {
    var excludedAttr = utils.getUrlParams(window.location.href).offer_to_likers;
    if (excludedAttr === "true" && $("#new_offer_bundle").length > 0) {
        $("#new_offer_bundle").modal("show");
    }
}, pm.listings.initListingActions = function () {
    pm.listings.initToggleLikes("listing");
    pm.listings.initSelectImage();
    pm.listings.initReportListing();
    pm.userNameAutoComplete.initUserNameAutoComplete($(".listing-detail-con").find(".text-area-con textarea.username-autocomplete"));
    pm.listings.initShare("main", ".social-actions .share, #share_banner");
    pm.listings.initBuy();
    pm.listings.initFollowUnfollow();
    pm.listings.initSizeSelectionModal();
    pm.listings.initBundle();
    pm.listings.initApplePay();
    pm.listings.initSimilarListings();
    pm.listings.initLastSeenListings();
    pm.listings.initResize();
    pm.listings.initOfferToLikers();
}, pm.brands = function () {
    /**
     * @return {undefined}
     */
    var show = function () {
        $("main").on("click", "button#follow-brand, button#unfollow-brand", function (event) {
            event.preventDefault();
            var webview = $(event.target);
            webview.on("remoteAction", function () {
                var filteredView = webview.parent().parent();
                filteredView.find("button#follow-brand, button#unfollow-brand").toggleClass("f-hide");
                webview.off("remoteAction");
            });
        });
    };
    /**
     * @return {undefined}
     */
    var open = function () {
        $onRampFollowBrands = $("#onramp-follow-brands");
        $("main").on("remoteAction", ".tile, .btn", function (jEvent, b) {
            if (b.success) {
                $(jEvent.target).parents(".data").find(".overlay").toggleClass("not-following");
            } else {
                if (b.errors) {
                    pm.flashMessage.push({
                        text: b.errors
                    });
                }
            }
        });
        $(document).on("remoteAction", "a[data-pa-name='follow_more_brands']", function (a) {
            ReactRailsUJS.mountComponents("#follow-more-brands .modal-body");
        });
    };
    /**
     * @return {undefined}
     */
    var loadList = function () {
        show();
        open();
    };
    return {
        initBrandActions: loadList
    };
}(), pm.user = pm.user || {}, pm.user.block = function () {
    $("#block-user-popup").on("remoteAction", "form", function (a, b) {
        $(".block-unblock-con").addClass("data-user-blocked");
    });
}, pm.user.unblock = function () {
    $("#closet-header").on("remoteAction", "a", function (event) {
        $(event.currentTarget).parents(".block-unblock-con").removeClass("data-user-blocked");
    });
}, pm.user.initUserActions = function () {
    pm.user.block();
    pm.user.unblock();
}, pm.search = function () {
    autoComplete = {};
    autoComplete.params = {
        count: pm.constants.autoCompleteDefaultCount
    };
    autoComplete.timeoutCall;
    autoComplete.timeoutTime = pm.constants.autoCompleteTimeout;
    /** @type {string} */
    autoComplete.jstoragePrefix = "auto_suggest-";
    autoComplete.jstorageCacheTTL = pm.constants.autoCompleteStorageCacheTTL;
    /**
     * @param {string} element
     * @param {boolean} c
     * @return {undefined}
     */
    autoComplete.init = function (element, c) {
        if (c) {
            $(element).typeahead("destroy");
        }
        try {
            /** @type {string} */
            var a = "<li></li>";
            autoComplete.params.userId = pm.userInfo.user_id || null;
            $(element).typeahead({
                source: function (v, callback) {
                    if ($.trim(v) === "") {
                        callback([]);
                        return;
                    }
                    /** @type {*} */
                    var kermit = JSON.parse(utils.getCookie("sp"));
                    if (kermit && kermit.type === pm.constants.searchTypeListings) {
                        if (autoComplete.timeoutCall) {
                            clearTimeout(autoComplete.timeoutCall);
                        }
                        var requestOrUrl = autoComplete.getAutoSuggestUrl(v) + "&exp=" + pm.userInfo.experience();
                        var a = autoComplete.jstoragePrefix + pm.userInfo.experience() + v;
                        var prev = $.jStorage.get(a);
                        if (prev && v != "") {
                            if (prev) {
                                callback(prev);
                            }
                        } else {
                            /** @type {number} */
                            autoComplete.timeoutCall = setTimeout(function () {
                                $.ajax({
                                    type: "GET",
                                    cache: true,
                                    url: requestOrUrl,
                                    dataType: "JSON",
                                    success: function (obj) {
                                        if (obj.data.length > 0) {
                                            callback(obj.data);
                                            $.jStorage.set(a, obj.data, {
                                                TTL: autoComplete.jstorageCacheTTL
                                            });
                                        } else {
                                            callback([{
                                                type: "kw",
                                                kw: v
                                            }]);
                                        }
                                    }
                                });
                            }, autoComplete.timeoutTime);
                        }
                    }
                },
                menu: '<ul class="typeahead dropdown-menu search-auto-suggest-list"></ul>',
                items: pm.constants.autoCompleteCount,
                minLength: 1,
                matcher: function (data) {
                    return data;
                },
                sorter: function (items) {
                    return items;
                },
                updater: function (val) {
                    /** @type {*} */
                    var kermit = JSON.parse(utils.getCookie("sp"));
                    if (kermit && kermit.type === pm.constants.searchTypeListings) {
                        var value = val || this.$element[0].value;
                        var peer = $(".search-auto-suggest-list li.active").data();
                        var e;
                        var f;
                        this.$element[0].value = value;
                        if ($.trim(value) === "") {
                            return;
                        }
                        var id = peer ? peer.market : null;
                        return pm.userInfo.setExperience(id || pm.userInfo.experience()), $(this.$element[0].form).append("<input name='ac' value='true' type='hidden'>"), this.$element[0].form.submit(), value;
                    }
                },
                render: function (items) {
                    var data = this.query;
                    /** @type {!Array} */
                    var ret = [];
                    /** @type {!Array} */
                    var searchPipeline = [];
                    var line = $(a);
                    var el = $(a);
                    var j;
                    /** @type {!Array} */
                    var k = [pm.constants.allDept, pm.constants.womenDept, pm.constants.kidsDept, pm.constants.menDept];
                    /** @type {!Array<string>} */
                    var l = Object.keys(pm.constants.experiences);
                    var name;
                    var n;
                    line.addClass("divider");
                    el.addClass("divider");
                    j = create().dept;
                    name = pm.userInfo.experience();
                    ret.push($(fn(a, "kw", data, data, name, data)).prepend("<span class='prepend-txt'>in " + pm.meta.experienceToPossessiveDisplayName[name] + " market</span>")[0]);
                    searchPipeline = $(items).map(function (a, container) {
                        if (container[container.type] !== data) {
                            return fn(a, container.type, container[container.type], data, name, "for");
                        }
                    });
                    ret.push.apply(ret, searchPipeline);
                    ret.push(el[0]);
                    /** @type {!Array} */
                    var args = [];
                    if (name != "all") {
                        /** @type {!Array} */
                        args = [name, "all"];
                    } else {
                        /** @type {!Array} */
                        args = ["all", "women", "men", "kids"];
                    }
                    /** @type {number} */
                    var i = 0;
                    for (; i < args.length; i++) {
                        if (args[i] !== name) {
                            ret.push(fn(a, "kw", data, data, args[i], "in"));
                        }
                    }
                    return this.$menu.css("width", this.$element.outerWidth() + "px"), this.$menu.html(ret), this;
                }
            });
        } catch (e) {
        }
    };
    /**
     * @param {string} type
     * @param {string} method
     * @return {undefined}
     */
    var log = function (type, method) {
        var result = utils.getCookie("sp");
        var o;
        var val;
        var username;
        try {
            /** @type {*} */
            o = result ? JSON.parse(result) : {};
            username = o.dept;
            o.type = type ? type : pm.constants.searchTypeListings;
            o.dept = method ? method : username ? username : pm.constants.womenDept;
            /** @type {string} */
            val = JSON.stringify(o);
            utils.setCookie("sp", val, pm.settings.userSearchPreferenceExpiryMins.max);
            get(pm.userInfo.experience());
            update_selected_rows_counter(type || pm.constants.searchTypeListings);
        } catch (i) {
            console.log("search preference failed");
        }
    };
    /**
     * @return {?}
     */
    var create = function () {
        var result = utils.getCookie("sp");
        var message;
        return message = result ? JSON.parse(result) : {}, {
            type: message.type ? message.type : pm.constants.searchTypeListings,
            dept: message.dept ? message.dept : pm.constants.womenDept
        };
    };
    /**
     * @param {?} cur_min
     * @return {undefined}
     */
    var update_selected_rows_counter = function (cur_min) {
        $(".search-box .search-entry").data("paAttrSearchType", cur_min);
    };
    /**
     * @param {string} id
     * @return {undefined}
     */
    var get = function (id) {
        /** @type {*} */
        var infoObj = JSON.parse(utils.getCookie("sp"));
        var c = infoObj && infoObj.type ? infoObj.type : pm.constants.searchTypeListings;
        if (c == pm.constants.searchTypeListings) {
            if (id == "all") {
                $(".search-box .search-entry").attr("placeholder", "Search Listings");
            } else {
                var itemm = pm.meta.experienceToPossessiveDisplayName[id];
                $(".search-box .search-entry").attr("placeholder", "Search All " + itemm + " Listings");
            }
        } else {
            $(".search-box .search-entry").attr("placeholder", "Search People...");
        }
    };
    /**
     * @param {!Object} value
     * @return {undefined}
     */
    var build = function (value) {
        /** @type {*} */
        var data = value ? JSON.parse(value) : {};
        data.type = data.type ? data.type : pm.constants.searchTypeListings;
        data.dept = data.dept ? data.dept : pm.constants.womenDept;
        if (data["type"] == pm.constants.searchTypeListings) {
            if (data.dept) {
                var c;
                var classesLine;
                var selector = data.dept;
                c = selector.charAt(0).toUpperCase() + selector.slice(1);
                if (data.dept === pm.constants.kidsDept) {
                    /** @type {string} */
                    classesLine = "Search all " + c + "' listings";
                } else {
                    if (data.dept === pm.constants.allDept) {
                        /** @type {string} */
                        classesLine = "Search all listings";
                    } else {
                        /** @type {string} */
                        classesLine = "Search all " + c + "'s listings";
                    }
                }
                $(".search-box .search-entry").attr("placeholder", classesLine);
            } else {
                $(".search-box .search-entry").attr("placeholder", "Search listings...");
            }
        } else {
            $(".search-box .search-entry").attr("placeholder", "Search People...");
        }
    };
    /**
     * @param {string} left
     * @param {string} key
     * @param {undefined} v
     * @param {(Node|NodeList|string)} options
     * @param {string} value
     * @param {string} type
     * @return {?}
     */
    var fn = function (left, key, v, options, value, type) {
        i = $(left).attr("data-type", key);
        i.attr("data-value", v);
        i.attr("data-market", value);
        value = pm.meta.experienceToPossessiveDisplayName[value];
        i.text(v);
        if (type === "for" || type === "in") {
            utils.highlightText(i[0], options);
            var html = i[0].innerHTML;
            i[0].innerHTML = type === "for" ? html : html + "<span class='market-after-text'>" + " " + type + " " + value + " Market </span>";
        } else {
            html = i[0].innerHTML;
            /** @type {string} */
            i[0].innerHTML = "<span class='market " + value + "'>" + type + "</span>";
        }
        return i[0];
    };
    /**
     * @param {?} out
     * @param {?} a
     * @param {undefined} v
     * @param {(Node|NodeList|string)} options
     * @param {string} key
     * @param {string} value
     * @return {?}
     */
    var add = function (out, a, v, options, key, value) {
        i = $(out).attr("data-type", a);
        i.attr("data-value", v);
        i.attr("data-dept", key);
        i.text(v);
        if (value === "for" || value === "in") {
            utils.highlightText(i[0], options);
            var lastStatus = i[0].innerHTML;
            /** @type {string} */
            i[0].innerHTML = value === "for" ? lastStatus + "<span class='auto-dept " + key + "'>" + " " + value + " " + key + "</span>" : lastStatus + "<span class='dept " + key + "'>" + " " + value + " " + key + "</span>";
        } else {
            lastStatus = i[0].innerHTML;
            /** @type {string} */
            i[0].innerHTML = "<span class='dept " + key + "'>" + value + "</span>";
        }
        return i[0];
    };
    return autoComplete.getAutoSuggestUrl = function (a) {
        var longNameA = pm.routes.autoSuggestPath() + "?count=" + autoComplete.params.count;
        return autoComplete.params.userId ? longNameA + "&query=" + a + "&for_user_id=" + autoComplete.params.userId : longNameA + "&query=" + a;
    }, {
        autoComplete: autoComplete,
        setSearchPreference: log,
        getSearchPreference: create,
        updateSearchPlaceholder: build,
        updateMarketsSearchPlaceholder: get
    };
}(), pm.userNotifications = function () {
    var a = pm.settings.webUserNotificationTimeouts;
    var prevOrder = pm.constants.maxNotificationCount;
    /**
     * @return {undefined}
     */
    var _init = function () {
        $.jStorage.set("last_notification_fetched_time", call());
    };
    /**
     * @return {?}
     */
    var getCookie = function () {
        return $.jStorage.get("last_notification_fetched_time");
    };
    /**
     * @return {undefined}
     */
    var activate = function () {
        $.jStorage.set("last_active_time", call());
    };
    /**
     * @return {?}
     */
    var set = function () {
        return $.jStorage.get("last_active_time");
    };
    /**
     * @return {?}
     */
    var get = function () {
        return $.jStorage.get("timeout_func_call_time", 0);
    };
    /**
     * @param {?} value
     * @return {undefined}
     */
    var _save = function (value) {
        $.jStorage.set("timeout_func_call_time", call() + value);
    };
    /**
     * @param {?} name
     * @return {undefined}
     */
    var remove = function (name) {
        $.jStorage.set("notification_decayed_timeout", name);
    };
    /**
     * @return {?}
     */
    var resolve = function () {
        return $.jStorage.get("notification_decayed_timeout");
    };
    /**
     * @return {?}
     */
    var call = function () {
        return (new Date).getTime();
    };
    /**
     * @return {?}
     */
    var the_end = function () {
        return parseInt($.jStorage.get("li_notification_count", -1));
    };
    /**
     * @param {?} todo
     * @return {undefined}
     */
    var clear = function (todo) {
        $.jStorage.set("li_notification_count", todo);
    };
    /**
     * @return {undefined}
     */
    var request = function () {
        $.ajax({
            type: "GET",
            url: pm.routes.newsSummaryPath(),
            dataType: "JSON",
            beforeSend: function () {
                start();
                if (!pm.userInfo.isLoggedIn()) {
                    return false;
                }
                if (call() - getCookie() < resolve()) {
                    return false;
                }
            },
            success: function (obj) {
                if (obj.user_new_notifications) {
                    clear(obj.user_new_notifications.count);
                }
                _init();
            },
            complete: function () {
                notify();
            }
        });
    };
    /**
     * @return {undefined}
     */
    var launchUpload = function () {
        var newOrder = the_end();
        if (newOrder > 0) {
            var roster_call = newOrder > prevOrder ? prevOrder + "+" : newOrder;
            if (newOrder > prevOrder) {
                clearInterval(pm.userNotifications.timeOut);
            }
            $("nav.fixed li.news span.notification-count").html(roster_call).show().data("pa-content_type", newOrder);
            $("nav.fixed li.account.m span.notification-count").html(roster_call).show().data("pa-content_type", newOrder);
            $("nav.fixed li.account.m .dropdown-item span.notification-count").html(roster_call).show().data("pa-content_type", newOrder);
        } else {
            $("nav.fixed li.news span.notification-count").hide().data("pa-content_type", newOrder);
            $("nav.fixed li.account.m span.notification-count").hide().data("pa-content_type", newOrder);
            $("nav.fixed li.account.m .dropdown-item span.notification-count").hide().data("pa-content_type", newOrder);
        }
    };
    /**
     * @return {undefined}
     */
    var notify = function () {
        var p;
        /** @type {number} */
        var big_time_offset = call() - set();
        /** @type {number} */
        var now = 0;
        $.each(a, function (a, millis) {
            now = now + millis;
            if (now - big_time_offset > 0) {
                return p = millis, false;
            }
        });
        if (!p) {
            p = a.slice(-1)[0];
        }
        /** @type {number} */
        var pY = get() - call();
        if (pY > p || pY < 0) {
            clearInterval(pm.userNotifications.timeOut);
            remove(p);
            _save(p);
            /** @type {number} */
            pm.userNotifications.timeOut = setTimeout(request, p);
        }
    };
    /**
     * @return {undefined}
     */
    var start = function () {
        try {
            if ($.jStorage.get("li_userid", "") != pm.userInfo.userId()) {
                $.each($.jStorage.index(), function (a, key) {
                    if (key.substring(0, 3) == "li_") {
                        $.jStorage.deleteKey(key);
                        console.log("deleted: " + key);
                    }
                });
                if (pm.userInfo.isLoggedIn()) {
                    $.jStorage.set("li_userid", pm.userInfo.userId());
                }
            }
        } catch (a) {
        }
    };
    return {
        setLastActiveTime: activate,
        getNotificationCount: the_end,
        notificationFetch: request,
        setTimeOutCall: notify,
        showNotificationCountInNav: launchUpload,
        syncNotificationsStorage: start
    };
}(), pm.openAppOrStore = function () {
    /**
     * @param {!Event} type
     * @param {string} url
     * @return {undefined}
     */
    var a = function (type, url) {
        url = url || "";
        type.preventDefault();
        var f = _init(url);
        setTimeout(function () {
            callback(f);
        }, 0);
    };
    /**
     * @param {string} path
     * @return {?}
     */
    var _init = function (path) {
        return utils.isMobileDevice.Android() ? ($('meta[property="al:android:url"]').length === 1 ? path = $('meta[property="al:android:url"]').attr("content").replace(pm.settings.appScheme + ":/", "") : path = path || window.location.pathname, path = pm.routes.openAndroidAppOrStore(utils.addGetAppTracking(path))) : utils.isMobileDevice.iOS() && ($('meta[property="al:ios:url"]').length === 1 ? path = $('meta[property="al:ios:url"]').attr("content").replace(pm.settings.appScheme + ":/", "") : path =
            path || window.location.pathname, path = pm.routes.iosAppPath(path)), path;
    };
    /**
     * @param {string} file
     * @return {undefined}
     */
    var callback = function (file) {
        /** @type {string} */
        window.location = file;
        /** @type {number} */
        var code = (new Date).getTime();
        setTimeout(function () {
            done(code, file);
        }, 2e3);
    };
    /**
     * @param {number} action
     * @param {string} name
     * @return {undefined}
     */
    var done = function (action, name) {
        /** @type {number} */
        var state = (new Date).getTime();
        if (state - action < 3e3) {
            if (document.visibilityState == "hidden") {
                return;
            }
            if (utils.isBranchTracked()) {
                window.location = utils.isMobileDevice.iOS() ? pm.routes.iosItunesStorePath(false) : name;
            } else {
                window.location = utils.isMobileDevice.iOS() ? pm.routes.iosItunesStorePath(true) : pm.routes.androidPlayStorePath(true);
            }
        }
    };
    return {
        handleOpenApp: a,
        constructDeepLink: _init,
        performDeepLinkCheck: done,
        redirectToDeepLink: callback
    };
}(), pm.popups = function () {
    /**
     * @param {!Object} o
     * @return {?}
     */
    var callback = function (o) {
        var event;
        var target;
        var el;
        return event = $(o).data("pmrd"), event ? (el = event.usehref, target = encodeURI(window.location.pathname + window.location.search), el === "true" && (target = $(o).attr("href")), {
            url: target
        }) : {};
    };
    /**
     * @param {!Object} s
     * @param {!Object} n
     * @return {?}
     */
    var show = function (s, n) {
        var e;
        var c;
        return e = callback(s), c = "/signup?fpm=true", e.url ? (n.pmrd = e, sp.generateUrlFromParam(c, n)) : c;
    };
    /**
     * @param {!Object} s
     * @param {!Object} obj
     * @param {!Object} params
     * @return {?}
     */
    var fn = function (s, obj, params) {
        var p;
        var c;
        return p = callback(s), c = $(obj).attr("targeturl"), p.url ? (params.pmrd = p, sp.generateUrlFromParam(c, params)) : c;
    };
    /**
     * @param {!Object} name
     * @return {undefined}
     */
    var _really_post_success = function (name) {
        var ctx;
        var value;
        var tool;
        if (!utils.isBot()) {
            tool = $("#signup-popup-con a.email-btn");
            ctx = $("#signup-popup-con #fb-auth-form");
            value = $("#signup-popup-con #gp-auth-form");
            tool.attr("href", show(name, {}));
            ctx.attr("action", utils.getSecureUrl(fn(name, ctx, {})));
            value.attr("action", utils.getSecureUrl(fn(name, value, {})));
        }
    };
    return {
        updateSignUpWithDestinationParams: _really_post_success
    };
}();
/** @type {string} */
var brandMsg = "your favorite brands";
if (pm.pageInfo.paTrackerData && pm.pageInfo.paTrackerData.screen_properties && pm.pageInfo.paTrackerData.screen_properties.brand) {
    brandMsg = pm.pageInfo.paTrackerData.screen_properties.brand;
}
var display_msgs = {
    follow_user: "Sign up to follow this seller and stay up to date on new listings and more!",
    like: "Sign up to save this listing and be notified if the price drops.",
    comment_link: "Questions about this item? Sign up to chat with the seller.",
    comment: "Questions about this item? Sign up to chat with the seller.",
    add_to_bundle: "Got your eye on a few listings? Sign up to create a bundle and save on shipping.",
    offer: "Sign up to submit your offer. The seller will get back to you within 24 hours.",
    buyer_make_offer_link: "Sign up to submit your offer. The seller will get back to you within 24 hours.",
    buy_now: "Sign up to make this item yours!",
    report_listing: "Sign up to report a listing.",
    report_comment: "Sign up to report a comment.",
    brand_follow: "Sign up to shop " + brandMsg + " at up to 70% off retail."
};
var display_msgs_web_reg_flow = {
    follow_user: "Create an account to follow this seller and stay up to date on new listings and more!",
    like: "Create an account to save this listing and be notified if the price drops.",
    comment_link: "Questions about this item? Create an account to chat with the seller.",
    comment: "Questions about this item? Create an account to chat with the seller.",
    add_to_bundle: "Got your eye on a few listings? Create an account to create a bundle and save on shipping.",
    offer: "Create an account to submit your offer. The seller will get back to you within 24 hours.",
    buyer_make_offer_link: "Create an account to submit your offer. The seller will get back to you within 24 hours.",
    buy_now: "Create an account to make this item yours!",
    report_listing: "Create an account to report a listing.",
    report_comment: "Create an account to report a comment.",
    brand_follow: "Create an account to shop " + brandMsg + " at up to 70% off retail."
};
pm.initSignupPop = function () {
    if (!pm.userInfo.isLoggedIn() && !utils.isBot()) {
        if ($("#signup-popup-con").length === 1 && !utils.isBot()) {
            var v = utils.getUrlParams(window.location.href).m_id;
            show_dynamic_popup = pm.pageInfo.paTrackerData && ["category", "showrooms"].indexOf(pm.pageInfo.paTrackerData.screen_name) > -1 && v;
            if (show_dynamic_popup) {
                /** @type {string} */
                url = "/popup_connect_v1?modal_id=" + v;
            } else {
                /** @type {string} */
                url = "/popup_connect_v1";
            }
            $.get(url, function (opentext) {
                if (!show_dynamic_popup) {
                    return $("#signup-popup-con").data("modal-loaded", true), $("#signup-popup-con").html(opentext);
                }
                if (v == "v1" || v == "v2") {
                    $("#signup-popup-con").data("modal-loaded", true);
                    $("#signup-popup-con").html(opentext);
                    var other = $("body");
                    pm.show_signup_popup(other);
                } else {
                    result = $(opentext).appendTo("main").hide();
                    $("#reg-popup-v2").modal("show");
                }
            });
        }
        $("main").on("click", ".auth-required", function (o) {
            return pm.show_signup_popup(o.currentTarget), false;
        });
    }
}, pm.showPageModalError = function (commaParam) {
    var gotoDialog = $("#page-modal-error");
    gotoDialog.find(".modal-body").html(commaParam.replace(/\n/g, "<br />"));
    gotoDialog.modal("show");
}, pm.show_signup_popup = function (input) {
    if ($("#signup-popup-con").length === 1 && $("#signup-popup-con").data("modal-loaded")) {
        pm.tracker.setUpClickTrack(input);
        pm.popups.updateSignUpWithDestinationParams(input);
        var iLetter = $(input).data("pa-name");
        /** @type {string} */
        var c = "Sign up to shop your favorite brands at up to 70% off retail.";
        if (display_msgs[iLetter]) {
            c = display_msgs[iLetter];
        }
        $("#signup-popup-con .contextual-text h2").text(c);
        $("#signup-popup-con").modal("show");
        if ($(".gp-btn").length >= 1) {
            $(".gp-btn").each(function (a) {
                sp.initGoogleSigninButton($(this).attr("id"), "#gp-auth-form");
            });
        }
    }
    return false;
}, pm.initOfferPop = function () {
    var generatedElems = {
        make_offer: "Your offer has been submitted"
    };
    var propertiesPanel = $(".dressing-room-content");
    /**
     * @param {!Event} obj
     * @param {string} i
     * @return {undefined}
     */
    var makeRequest = function (obj, i) {
        var $dds = $(obj.currentTarget);
        $dds.on("remoteAction", function (canCreateDiscussions, chalSuccess) {
            if (chalSuccess && chalSuccess.success) {
                var g = generatedElems[i];
                pm.flashMessage.push({
                    type: 1,
                    parent: propertiesPanel,
                    text: g,
                    duration: 2e3
                });
            }
            $dds.off("remoteAction");
        });
        $dds.on("remoteAction:error", function (a, data) {
            pm.flashMessage.push({
                type: 1,
                parent: propertiesPanel,
                text: data.responseJSON.error.user_message,
                duration: 3e3
            });
            $dds.off("remoteAction:error");
        });
    };
    /**
     * @return {undefined}
     */
    var init = function () {
        $("#bundle_offer_form").validate();
        var excludedAttr = $("#offer_form_is_seller").val();
        if (excludedAttr === "true") {
            var price = $("#offer_form_buy_now_price").val();
            var balance = $("#offer_form_seller_discount").val();
            /** @type {boolean} */
            var global = $("#offer_form_shipping_discount").length > 0;
            /** @type {boolean} */
            var bb = $("#new_offer_bundle").attr("data-offer-to-likers") === "true";
            var g = $("#offer_form_pm_min_flat_fee").val();
            var h = $("#offer_form_pm_min_flat_fee_threshold_amount").val();
            var inputel = $("#offer_form_amount");
            var lines = $("#bundle_offer_form");
            $("main").on("submit", "#new_offer_bundle #bundle_offer_form", function (obj) {
                if (global && parseFloat($("#earnings").data("earnings")) <= 0) {
                    return pm.validate.clearFormErrors(lines.attr("id")), pm.validate.addBaseErrors(lines, "Net earnings must be greater than $0. Please adjust your offer or shipping discount."), false;
                }
                if (!bb && global && parseInt(inputel.val()) >= parseInt(inputel.data("max-amount")) && parseInt($("#offer_form_shipping_discount").val()) == 0) {
                    return pm.validate.clearFormErrors(lines.attr("id")), pm.validate.addBaseErrors(lines, "Offer price should be less than $" + parseInt(inputel.data("max-amount")) + " or there should be a shipping discount."), false;
                }
                if (bb && parseInt($("#offer_form_shipping_discount").val()) == 0) {
                    return pm.validate.clearFormErrors(lines.attr("id")), pm.validate.addErrors(lines, "offer_form", '{"shipping_discount":["Offer must include a shipping discount"]}'), $("#bundle_offer_form .dropdown-toggle #shipping-discount-selection").addClass("invalid-discount"), false;
                }
                if (bb) {
                    var $dds = $(obj.currentTarget);
                    $dds.off("remoteAction");
                    $dds.on("remoteAction", function (a, SMessage) {
                        if (SMessage.success) {
                            $("#offer-congrats-popup").modal("show");
                            $("#offer-congrats-popup button").click(function () {
                                location.reload();
                            });
                        }
                    });
                } else {
                    makeRequest(obj, "make_offer");
                }
            });
            if (inputel.length > 0) {
                var params = {
                    amount: parseFloat(inputel.val()),
                    shipping_discount: $("#offer_form_shipping_discount").length > 0 ? parseFloat($("#offer_form_shipping_discount").val()) : 0,
                    wholesale: inputel.data("wholesale-seller")
                };
                if (isNaN(params.amount)) {
                    if (global) {
                        /** @type {string} */
                        $("#earnings")[0].innerHTML = "$";
                    } else {
                        /** @type {string} */
                        $("#earnings")[0].innerHTML = ": $";
                        /** @type {string} */
                        $("#private_discount")[0].innerHTML = ": ";
                    }
                } else {
                    if (!global) {
                        /** @type {string} */
                        var renderEnd = ((1 - params.amount / price) * 100).toFixed(1);
                        if (balance !== 0) {
                            /** @type {string} */
                            renderEnd = (renderEnd - balance / price * 100).toFixed(1);
                        }
                        if (renderEnd < 0) {
                            /** @type {number} */
                            renderEnd = 0;
                        }
                        /** @type {string} */
                        $("#private_discount")[0].innerHTML = ": " + renderEnd + "%";
                    }
                    $.ajax({
                        type: "GET",
                        url: inputel.data("compute-seller-earnings-url"),
                        data: params,
                        success: function (item) {
                            if (item && item.amount) {
                                $("#earnings").data("earnings", item.amount);
                                /** @type {string} */
                                $("#earnings")[0].innerHTML = (item.amount >= 0 ? "" : "- ") + (global ? "$" : ": $") + Math.abs(item.amount).toFixed(2);
                                if (item.amount <= 0) {
                                    $("#earnings").addClass("invalid-earnings");
                                } else {
                                    $("#earnings").removeClass("invalid-earnings");
                                }
                            }
                        }
                    });
                }
            }
        }
    };
    /**
     * @return {undefined}
     */
    var saveOldJournalFilterSelection = function () {
        /** @type {number} */
        var val = parseFloat($("#offer_form_buy_now_price").val());
        /** @type {number} */
        var n = parseFloat($("#offer_form_discount_multiplier").val());
        /** @type {number} */
        var h = val * n;
        $("#calculate_offer .listing_price").html("$" + Math.round(val).toFixed(0));
        $("#calculate_offer .offer_price").html("$" + Math.floor(h).toFixed(0));
    };
    $("main").on("submit", "#new_offer_bundle #bundle_offer_form", function (a) {
        /** @type {number} */
        var normalized_images = parseInt($("#offer_form_amount").val());
        if (isNaN(normalized_images) || normalized_images <= 0) {
            var lines = $("#bundle_offer_form");
            return pm.validate.clearFormErrors(lines.attr("id")), pm.validate.addErrors(lines, "offer_form", '{"amount":["can\'t be blank"]}'), false;
        }
    });
    $("main").on("input", "#offer_form_amount", init);
    $("main").on("click", "#bundle_offer_form .dropdown-item", function (event) {
        event.preventDefault();
        $("#bundle_offer_form .dropdown-item").removeClass("selected-dropdown");
        $(this).addClass("selected-dropdown");
        $("#bundle_offer_form .dropdown-toggle #shipping-discount-selection").removeClass("invalid-discount");
        $("#offer_form_shipping_discount-error").html("");
        var b = $(this).text();
        $("#bundle_offer_form .dropdown-toggle #shipping-discount-selection").text(b);
        $("#offer_form_shipping_discount").val($(this).data("value"));
        $(".buyer_pays_label").html($(this).data("message"));
        init();
    });
    $("main").on("click", "#offer_to_likers_calculator", function () {
        /** @type {number} */
        var a = parseFloat($("#offer_form_buy_now_price").val());
        $("#calculate_offer .listing_price").html("$" + Math.round(a).toFixed(0));
        $("#calculate_offer .select_discount_error_msg").hide();
        $("#calculate_offer .selected").removeClass("selected");
        $("#calculate_offer .offer_price").html("");
    });
    $("main").on("click", "#calculate_offer .offer_button", function () {
        $("#calculate_offer .selected").removeClass("selected");
        $(this).addClass("selected");
        $("#offer_form_discount_multiplier").val($(this).attr("data-discount_multiplier"));
        $("#calculate_offer .select_discount_error_msg").hide();
        saveOldJournalFilterSelection();
    });
    $("main").on("click", "#calculate_offer .submit_button", function () {
        /** @type {number} */
        var scale = parseFloat($("#offer_form_discount_multiplier").val());
        if (scale == 0) {
            $("#calculate_offer .select_discount_error_msg").show();
        } else {
            /** @type {number} */
            var height = parseFloat($("#offer_form_buy_now_price").val());
            $("#offer_form_amount").val(Math.floor(height * scale).toFixed(0));
            init();
            $("#calculate_offer").modal("hide");
        }
    });
};
var sp = sp || {};
sp.listing = sp.listing || {}, sp.closet = sp.closet || {}, sp.brand = sp.brand || {}, sp.shareSettings = sp.shareSettings || {}, sp.gapiLoadForm = null, sp.listing.loadDataFromGrid = function (a) {
    /** @type {!Object} */
    sp.data = new Object;
    var openid = $(a).find("h4.title").text();
    if (openid.length > 34) {
        sp.data.title = openid.substring(0, 30) + "...";
    } else {
        sp.data.title = openid;
    }
    sp.data.link = utils.relToAbs($(a).find(".covershot-con").attr("href"));
    sp.data.image = utils.relToAbs($(a).find(".covershot").attr("src"));
    var data = $(a).data();
    if (data.postId) {
        sp.data.id = data.postId;
    } else {
        sp.data.id = $(a).attr("id");
    }
    sp.data.price = data.postPrice;
    sp.data.size = data.postSize;
    if (data.creatorHandle) {
        sp.data.creator = data.creatorHandle;
    } else {
        sp.data.creator = $(a).find(".creator-handle").text();
    }
    sp.listing.computeTexts();
    sp.data.brand = data.postBrand;
    sp.setSharePopupData();
}, sp.listing.loadDataFromListingDetails = function (a, b) {
    /** @type {!Object} */
    sp.data = new Object;
    var openid = $(a).find("h1.title").text();
    if (openid.length > 34) {
        sp.data.title = openid.substring(0, 30) + "...";
    } else {
        sp.data.title = openid;
    }
    sp.data.link = utils.relToAbs($(a).data("ext-share-url"));
    sp.data.image = utils.relToAbs($(a).find(".covershot-con img").attr("src"));
    sp.data.id = $(a).attr("id");
    sp.data.size = $(a).data("post-size");
    sp.data.brand = $(a).data("post-brand");
    sp.data.creator = $(a).find(".creator-details .handle").first().text();
    sp.data.price = $(a).data("post-price");
    sp.listing.computeTexts();
    sp.setSharePopupData();
}, sp.brand.loadDataFromBrandPage = function (elem) {
    /** @type {!Object} */
    sp.data = new Object;
    var result = $(elem);
    sp.data.title = "The Best Deals on " + result.data("title");
    sp.data.brand_name = result.data("title");
    sp.data.link = utils.relToAbs(result.data("ext-share-url"));
    /** @type {string} */
    sp.data.description = "Find " + result.data("title") + " and more for up to 70% off retail when you shop on Poshmark.";
    /** @type {string} */
    sp.data["tw-description"] = "Find " + result.data("title") + " and more for up to 70% off retail when you shop on @Poshmarkapp:";
    sp.data.image = utils.relToAbs(result.data("img"));
    sp.data.id = result.data("id");
    sp.data.brand_id = result.data("brand-id");
}, sp.listing.computeTexts = function (a) {
    if (sp.isListingCreator()) {
        /** @type {string} */
        sp.data.description = "I just added this to my closet on Poshmark: " + sp.data.title + ".";
    } else {
        /** @type {string} */
        sp.data.description = "I just discovered this while shopping on Poshmark: " + sp.data.title + ". Check it out!";
    }
    /** @type {string} */
    sp.data.details = "";
    if (sp.data.price && sp.data["price"] != "") {
        sp.data.details += "Price: " + sp.data.price;
    }
    if (sp.data.size && sp.data["size"] != "") {
        sp.data.details += " Size: " + sp.data.size;
    }
    if (sp.data.creator && sp.data["creator"] != "" && !sp.isListingCreator()) {
        sp.data.details += ", listed by " + sp.data.creator;
    }
}, sp.generateUrlFromParam = function (h, obj) {
    var prop;
    for (prop in obj) {
        if (obj[prop] == undefined || obj[prop] == "" || obj[prop] == "undefined") {
            delete obj[prop];
        }
    }
    var v = jQuery.param(obj);
    return h && h.indexOf("?") > -1 ? h + "&" + v : h + "?" + v;
}, sp.initTwitterLib = function () {
    window.twttr = function (doc, s, id) {
        var t;
        var js;
        /** @type {!Element} */
        var wafCss = doc.getElementsByTagName(s)[0];
        if (doc.getElementById(id)) {
            return;
        }
        return js = doc.createElement(s), js.id = id, js.src = "//platform.twitter.com/widgets.js", wafCss.parentNode.insertBefore(js, wafCss), window.twttr || (t = {
            _e: [],
            ready: function (fn) {
                t._e.push(fn);
            }
        });
    }(document, "script", "twitter-wjs");
    twttr.ready(function (a) {
        a.events.on("tweet", function (a) {
            console.log("tweeted");
        });
    });
}, sp.generateTwitterLink = function (i, b, key, optModifiers) {
    var target = {
        url: i,
        text: b,
        via: key,
        hashtags: optModifiers
    };
    return sp.generateUrlFromParam("https://twitter.com/intent/tweet", target);
}, sp.generatePinterestLink = function (uri, d, q) {
    var params = {
        url: uri,
        description: d,
        media: q
    };
    return sp.generateUrlFromParam("http://pinterest.com/pin/create/button/", params);
}, sp.initGoogleLib = function () {
    (function () {
        /** @type {!Element} */
        var script = document.createElement("script");
        /** @type {string} */
        script.type = "text/javascript";
        /** @type {boolean} */
        script.async = true;
        /** @type {boolean} */
        script.defer = true;
        /** @type {string} */
        script.src = "https://apis.google.com/js/platform.js?onload=init_gapi_success";
        /** @type {!Element} */
        var wafCss = document.getElementsByTagName("script")[0];
        wafCss.parentNode.insertBefore(script, wafCss);
    })();
}, init_gapi_success = function () {
    gapi.load("auth2", function () {
        gapi.auth2.init({
            client_id: pm.settings.gp.id,
            scope: "profile email"
        }).then(function () {
            /** @type {boolean} */
            sp.gapiInitialized = true;
            if (sp.gapiLoadForm != null) {
                sp.googleSign(sp.gapiLoadForm);
            }
        });
    });
}, sp.googleSignInCallback = function (res, component) {
    var response = res.getAuthResponse();
    component.find("input[name='login_form[ext_access_token]']").val(response.access_token);
    component.find("input[name='login_form[ext_id_token]']").val(response.id_token);
    component.find("input[name='login_form[ext_service_id]']").val("gp");
    component.submit();
}, sp.initGoogleSigninButton = function (field_id, text) {
    $(document).on("click", "#" + field_id, function (a) {
        sp.googleSign($(text));
    });
}, sp.googleSign = function (comp) {
    if (!sp.gapiInitialized) {
        sp.gapiLoadForm = $(comp);
    } else {
        var auth = gapi.auth2.getAuthInstance();
        if (auth.isSignedIn.get()) {
            sp.googleSignInCallback(auth.currentUser.get(), comp);
        } else {
            auth.signIn().then(function () {
                sp.googleSignInCallback(auth.currentUser.get(), comp);
            });
        }
    }
}, sp.generateTumblrLink = function (nirXml, value) {
    var data = {
        posttype: "link",
        content: nirXml,
        caption: value,
        canonicalUrl: nirXml
    };
    return sp.generateUrlFromParam("//www.tumblr.com/widgets/share/tool", data);
}, sp.generateEmailLink = function (win, fn) {
    var fields = {
        subject: win,
        body: fn
    };
    /** @type {!Array} */
    var drilldownLevelLabels = [];
    return $.each(fields, function (PROXY_URL, requestedUrl) {
        drilldownLevelLabels.push(PROXY_URL + "=" + encodeURIComponent(requestedUrl));
    }), "mailto:?" + drilldownLevelLabels.join("&");
}, sp.listing.modifyPmShareLink = function (clicked_el) {
    var page = $(clicked_el).attr("targeturl");
    var data = {
        post_id: sp.data.id
    };
    var d = sp.generateUrlFromParam(page, data);
    $(clicked_el).attr("href", d);
}, sp.listing.modifyPmShareToPartyLink = function (clicked_el) {
    var size = $(clicked_el).attr("targeturl");
    var event_id = $(clicked_el).attr("eventid");
    var event = {
        post_id: sp.data.id,
        event_id: event_id
    };
    var value = sp.generateUrlFromParam(size, event);
    $(clicked_el).attr("href", value);
}, sp.generateBranchTrackedLink = function (size, quality, data) {
    var map = {
        rfuid: pm.userInfo.isLoggedIn() ? pm.userInfo.userId() : null,
        feature: data,
        ext_trk: "branch"
    };
    return params = {
        utm_source: quality,
        utm_content: $.param(map)
    }, sp.generateUrlFromParam(size, params);
}, sp.postToFbFeed = function (type, filename, blob, id, name, table, query, object) {
    /**
     * @param {!Object} result
     * @return {undefined}
     */
    function render(result) {
        var data = {};
        if (object && object.type === "brand") {
            data = {
                act: "sh_b",
                mdm: "fb",
                ep_s: true,
                app: "web",
                oid: object.id
            };
        } else {
            if (object && object.type === "listing") {
                data = {
                    act: "sh_l",
                    mdm: "fb",
                    ep_s: true,
                    app: "web",
                    oid: object.id
                };
            }
        }
        if (pm.userInfo.isLoggedIn()) {
            data.uid = pm.userInfo.userId();
        }
        if (result && !result.error_code) {
            if (!$.isEmptyObject(data)) {
                pm.yaq.push({
                    data: data,
                    eventType: "ext_share"
                });
            }
            pm.tracker.eventTrack({
                data: {
                    type: pm.tracker.actionType.externalShare,
                    directObject: object,
                    "with": [{
                        type: "medium",
                        name: "fb"
                    }]
                }
            });
        } else {
            if (!$.isEmptyObject(data)) {
                pm.yaq.push({
                    data: data,
                    eventType: "ext_share_fail"
                });
            }
            pm.tracker.clickTrack({
                data: {
                    type: pm.tracker.actionType.click,
                    element_type: pm.tracker.elementType.button,
                    attributes: {
                        paName: "cancel"
                    },
                    on: {
                        type: "page",
                        screen_type: "popup",
                        name: "fb_share_dialog"
                    }
                }
            });
        }
    }

    var options = {
        method: type,
        link: filename,
        picture: blob,
        name: id,
        display: name,
        caption: table,
        description: query
    };
    FB.ui(options, render);
}, sp.initFacebookLib = function () {
    /**
     * @return {undefined}
     */
    window.fbAsyncInit = function () {
        FB.init({
            appId: pm.settings.fb.id,
            oauth: true,
            status: true,
            cookie: true,
            xfbml: true,
            version: "v2.11"
        });
        $("body").trigger("facebook_lib:ready");
        /** @type {boolean} */
        sp.fbInitialized = true;
        FB.getLoginStatus(function (set) {
            /** @type {string} */
            sp.fbLoginStatus = set;
        });
    };
    (function (doc) {
        var script;
        /** @type {string} */
        var id = "facebook-jssdk";
        /** @type {!Element} */
        var wafCss = doc.getElementsByTagName("script")[0];
        if (doc.getElementById(id)) {
            return;
        }
        /** @type {!Element} */
        script = doc.createElement("script");
        /** @type {string} */
        script.id = id;
        /** @type {boolean} */
        script.async = true;
        /** @type {string} */
        script.src = "//connect.facebook.net/en_US/sdk.js";
        wafCss.parentNode.insertBefore(script, wafCss);
    })(document);
}, sp.fbEnsureInit = function (cb) {
    if (typeof FB == "undefined") {
        sp.initFacebookLib();
    }
    if (sp.fbInitialized) {
        if (cb) {
            cb();
        }
    } else {
        setTimeout(function () {
            sp.fbEnsureInit(cb);
        }, 50);
    }
}, sp.isListingCreator = function () {
    return pm.userInfo.isLoggedIn() && sp.data["creator"] == pm.userInfo.displayHandle();
}, sp.listing.generateNavigateTrackedTwitterContent = function (a) {
    if (!pm.userInfo.isLoggedIn()) {
        window.open(a, "_blank");
        return;
    }
    /** @type {(Window|null)} */
    var doc = window.open();
    $.ajax({
        url: pm.routes.listingExtShareContent(sp.data.id),
        type: "GET",
        data: {
            ext_service_ids: "tw",
            share_context: "share_sheet"
        }
    }).done(function (self) {
        if (self.data) {
            doc.location = sp.generateTwitterLink(null, self.data.tw.message);
        } else {
            /** @type {string} */
            doc.location = a;
        }
    }).fail(function () {
        /** @type {string} */
        doc.location = a;
    });
}, sp.listing.generateFallbackTwitterLink = function () {
    return sp.isListingCreator() ? sp.generateTwitterLink(sp.data.link, sp.data.description, "poshmarkapp", "shopmycloset") : sp.generateTwitterLink(sp.data.link, sp.data.description, "poshmarkapp");
}, sp.listing.generateNavigateTrackedPinterestContent = function (a) {
    if (!pm.userInfo.isLoggedIn()) {
        window.open(a, "_blank");
        return;
    }
    /** @type {(Window|null)} */
    var doc = window.open();
    $.ajax({
        url: pm.routes.listingExtShareContent(sp.data.id),
        type: "GET",
        data: {
            ext_service_ids: "pnd",
            share_context: "share_sheet"
        }
    }).done(function (simpleselect) {
        if (simpleselect.data) {
            doc.location = sp.generatePinterestLink(simpleselect.data.pnd.url, simpleselect.data.pnd.description, simpleselect.data.pnd.image_url);
        } else {
            /** @type {string} */
            doc.location = a;
        }
    }).fail(function () {
        /** @type {string} */
        doc.location = a;
    });
}, sp.listing.generateFallbackPinterestLink = function () {
    /** @type {string} */
    var value = sp.data.description + " " + sp.data.details;
    return sp.generatePinterestLink(sp.data.link, value, sp.data.image);
}, sp.listing.generateNavigateTrackedTumblrContent = function (a) {
    if (!pm.userInfo.isLoggedIn()) {
        window.open(a, "_blank");
        return;
    }
    /** @type {(Window|null)} */
    var doc = window.open();
    $.ajax({
        url: pm.routes.listingExtShareContent(sp.data.id),
        type: "GET",
        data: {
            ext_service_ids: "tm",
            share_context: "share_sheet"
        }
    }).done(function (code) {
        if (code.data) {
            doc.location = sp.generateTumblrLink(code.data.tm.url, code.data.tm.message);
        } else {
            /** @type {string} */
            doc.location = a;
        }
    }).fail(function () {
        /** @type {string} */
        doc.location = a;
    });
}, sp.listing.generateFallbackTumblrLink = function () {
    /** @type {string} */
    var value = sp.data.description + " #poshmark #fashion #shopping";
    return sp.isListingCreator() && (value = value + " #shopmycloset"), sp.generateTumblrLink(sp.data.link, value);
}, sp.listing.generateFallbackEmailLink = function () {
    /** @type {string} */
    var win = sp.data.title + " - Discovered on Poshmark!";
    /** @type {string} */
    var ac = "";
    if (sp.isListingCreator()) {
        /** @type {string} */
        ac = "I just added this to my closet on Poshmark!";
    } else {
        /** @type {string} */
        ac = "Checkout this awesome item I found on Poshmark!";
    }
    /** @type {!Array} */
    var expected = ["Hi there!", "", ac, sp.data.title, sp.data.link];
    if (sp.data.price) {
        expected.push("Price: " + sp.data.price);
    }
    if (sp.data.size) {
        expected.push("Size: " + sp.data.size);
    }
    expected.push("");
    /** @type {string} */
    var onError = expected.join("\n");
    return pm.userInfo.isLoggedIn() && (onError = onError + ("\n- " + pm.userInfo.displayHandle())), sp.generateEmailLink(win, onError);
}, sp.listing.generateNavigateTrackedEmailContent = function (a) {
    if (!pm.userInfo.isLoggedIn()) {
        window.open(a, "_blank");
        return;
    }
    /** @type {(Window|null)} */
    var b = window.open();
    $.ajax({
        url: pm.routes.listingExtShareContent(sp.data.id),
        type: "GET",
        data: {
            ext_service_ids: "email",
            share_context: "share_sheet"
        }
    }).done(function (results) {
        if (results.data) {
            b.location = sp.generateEmailLink(results.data.email.subject, results.data.email.plain_body);
        } else {
            /** @type {!Window} */
            b = a;
        }
    }).fail(function () {
        /** @type {!Window} */
        b = a;
    });
}, sp.listing.postToFbFeed = function () {
    var pathname = sp.generateBranchTrackedLink(sp.data.link, "fb_sh", "sh_li_ss_web");
    var b = {
        type: "listing",
        id: sp.data.id,
        url: pathname
    };
    sp.postToFbFeed("feed", pathname, sp.data.image, sp.data.title, "iframe", "poshmark.com", sp.data.details, b);
    pm.tracker.screenView({
        data: {
            type: pm.tracker.actionType.view,
            name: "fb_share_dialog",
            element_type: pm.tracker.screenType.popup
        }
    });
}, sp.brand.generateFallbackEmailLink = function () {
    /** @type {string} */
    var win = sp.data.title + " - Discovered on Poshmark!";
    var description = sp.data.description;
    /** @type {string} */
    var onError = ["Hi there!", "", description, sp.data.title, sp.data.link, ""].join("\n");
    return pm.userInfo.isLoggedIn() && (onError = onError + ("\n- " + pm.userInfo.displayHandle())), sp.generateEmailLink(win, onError);
}, sp.brand.generateFallbackTumblrLink = function () {
    /** @type {string} */
    var sav = sp.data.description + " #poshmark #fashion #shopping";
    return sp.generateTumblrLink(sp.data.link, sav);
}, sp.brand.postToFbFeed = function () {
    var pathname = sp.generateBranchTrackedLink(sp.data.link, "fb_sh", "sh_br_ss_web");
    var b = {
        type: "brand",
        id: sp.data.brand_id,
        url: pathname
    };
    sp.postToFbFeed("feed", pathname, sp.data.image, sp.data.title, "iframe", null, sp.data.details, b);
    pm.tracker.screenView({
        data: {
            type: pm.tracker.actionType.view,
            name: "fb_share_dialog",
            element_type: pm.tracker.screenType.popup
        }
    });
}, sp.brand.generateNavigateTrackedTwitterContent = function (a) {
    if (!pm.userInfo.isLoggedIn()) {
        window.open(a, "_blank");
        return;
    }
    /** @type {(Window|null)} */
    var doc = window.open();
    $.ajax({
        url: pm.routes.brandExtShareContent(sp.data.brand_id),
        type: "GET",
        data: {
            ext_service_ids: "tw",
            share_context: "share_sheet"
        }
    }).done(function (self) {
        if (self.data) {
            doc.location = sp.generateTwitterLink(null, self.data.tw.message);
        } else {
            /** @type {string} */
            doc.location = a;
        }
    }).fail(function () {
        /** @type {string} */
        doc.location = a;
    });
}, sp.brand.generateNavigateTrackedPinterestContent = function (a) {
    if (!pm.userInfo.isLoggedIn()) {
        window.open(a, "_blank");
        return;
    }
    /** @type {(Window|null)} */
    var doc = window.open();
    $.ajax({
        url: pm.routes.brandExtShareContent(sp.data.brand_id),
        type: "GET",
        data: {
            ext_service_ids: "pnd",
            share_context: "share_sheet"
        }
    }).done(function (simpleselect) {
        if (simpleselect.data) {
            doc.location = sp.generatePinterestLink(simpleselect.data.pnd.url, simpleselect.data.pnd.description, simpleselect.data.pnd.image_url);
        } else {
            /** @type {string} */
            doc.location = a;
        }
    }).fail(function () {
        /** @type {string} */
        doc.location = a;
    });
}, sp.brand.generateNavigateTrackedTumblrContent = function (a) {
    if (!pm.userInfo.isLoggedIn()) {
        window.open(a, "_blank");
        return;
    }
    /** @type {(Window|null)} */
    var doc = window.open();
    $.ajax({
        url: pm.routes.brandExtShareContent(sp.data.brand_id),
        type: "GET",
        data: {
            ext_service_ids: "tm",
            share_context: "share_sheet"
        }
    }).done(function (code) {
        if (code.data) {
            doc.location = sp.generateTumblrLink(code.data.tm.url, code.data.tm.message);
        } else {
            /** @type {string} */
            doc.location = a;
        }
    }).fail(function () {
        /** @type {string} */
        doc.location = a;
    });
}, sp.brand.generateNavigateTrackedEmailContent = function (a) {
    if (!pm.userInfo.isLoggedIn()) {
        window.open(a, "_blank");
        return;
    }
    /** @type {(Window|null)} */
    var doc = window.open();
    $.ajax({
        url: pm.routes.brandExtShareContent(sp.data.brand_id),
        type: "GET",
        data: {
            ext_service_ids: "email",
            share_context: "share_sheet"
        }
    }).done(function (results) {
        if (results.data) {
            doc.location = sp.generateEmailLink(results.data.email.subject, results.data.email.plain_body);
        } else {
            /** @type {string} */
            doc.location = a;
        }
    }).fail(function () {
        /** @type {string} */
        doc.location = a;
    });
}, sp.closet.isOwn = function () {
    return sp.data["user_name"] == pm.userInfo.displayHandle();
}, sp.closet.computeTexts = function (a) {
    if (sp.closet.isOwn()) {
        /** @type {string} */
        sp.data.description = "I have my closet on Poshmark: " + sp.data.title + ".";
    } else {
        /** @type {string} */
        sp.data.description = "I just discovered this closet while shopping on Poshmark: " + sp.data.title + ". Check it out!";
    }
}, sp.closet.load_data_from_user_widget = function (mei) {
    /** @type {!Object} */
    sp.data = new Object;
    sp.data.title = $(mei).find(".top-con .info h2").text();
    sp.data.user_name = $(mei).find(".top-con-wrapper").attr("username");
    sp.data.link = utils.relToAbs(pm.routes.userClosetPath(sp.data.user_name));
    sp.data.image = utils.relToAbs($(mei).find(".user-image-l").attr("src"));
    sp.data.id = $(mei).find(".top-con-wrapper").attr("id");
    sp.closet.computeTexts();
}, sp.closet.generateFallbackTwitterLink = function () {
    return sp.closet.isOwn() ? sp.generateTwitterLink(sp.data.link, sp.data.description, "poshmarkapp", "shopmycloset") : sp.generateTwitterLink(sp.data.link, sp.data.description, "poshmarkapp");
}, sp.closet.generateFallbackPinterestLink = function () {
    var value = sp.data.description;
    return sp.generatePinterestLink(sp.data.link, value, sp.data.image);
}, sp.closet.generateFallbackTumblrLink = function () {
    /** @type {string} */
    var value = sp.data.description + " #poshmark #fashion #shopping";
    return sp.closet.isOwn() && (value = value + " #shopmycloset"), sp.generateTumblrLink(sp.data.link, value);
}, sp.closet.generateFallbackEmailLink = function () {
    /** @type {string} */
    var win = sp.data.title + " - On Poshmark!";
    /** @type {string} */
    var attrsStr = "";
    if (sp.closet.isOwn()) {
        /** @type {string} */
        attrsStr = "I have my closet on Poshmark!";
    } else {
        /** @type {string} */
        attrsStr = "Checkout this awesome closet I found on Poshmark!";
    }
    /** @type {string} */
    var onError = ["Hi there!", "", attrsStr, sp.data.title, sp.data.link, "", "- " + pm.userInfo.displayHandle()].join("\n");
    return sp.generateEmailLink(win, onError);
}, sp.fillFBLoginFields = function (panel, options) {
    panel.find("input[name='login_form[ext_access_token]']").val(options.accessToken);
    panel.find("input[name='login_form[ext_service_id]']").val("fb");
    panel.find("input[name='login_form[ext_user_id]']").val(options.userID);
    panel.submit();
}, sp.loginUsingFb = function (results, key) {
    if (key) {
        key.preventDefault();
    }
    var search = $(results);
    $(".activity-indicator").show();
    sp.fbEnsureInit(function () {
        if (sp.fbLoginStatus && sp.fbLoginStatus.status === "connected") {
            sp.fillFBLoginFields(search, sp.fbLoginStatus.authResponse);
            return;
        }
        FB.login(function (p) {
            if (p.authResponse) {
                sp.fillFBLoginFields(search, p.authResponse);
            } else {
                $(".activity-indicator").hide();
            }
        }, {
            scope: "email,user_friends"
        });
    });
}, sp.fillFBLinkFields = function (item, obj) {
    item.find("input[name='login_form[ext_access_token]']").val(obj.accessToken);
    item.find("input[name='login_form[ext_service_id]']").val("fb");
    item.find("input[name='login_form[ext_user_id]']").val(obj.userID);
    pm.flashMessage.push({
        type: 1,
        text: "Requesting..."
    });
    $.ajax({
        url: pm.routes.linkExternalService(),
        type: "POST",
        data: item.serialize()
    }).done(function (a) {
        if (a.success) {
            $(document).trigger("account_linked", "fb");
        } else {
            pm.flashMessage.push({
                text: a.errors.message
            });
        }
    });
}, sp.linkFbAccount = function (a, dim) {
    var i = $(a);
    sp.fbEnsureInit(function () {
        if (sp.fbLoginStatus && sp.fbLoginStatus.status === "connected") {
            sp.fillFBLinkFields(i, sp.fbLoginStatus.authResponse);
            return;
        }
        FB.login(function (p) {
            if (p.authResponse) {
                sp.fillFBLinkFields(i, p.authResponse);
            }
        }, {
            scope: "email"
        });
    });
}, sp.unlinkAccount = function (name) {
    $.ajax({
        url: pm.routes.unlinkExternalService(),
        type: "DELETE",
        headers: utils.getCsrfToken(),
        data: {
            ext_service_id: name
        }
    }).done(function (res5) {
        if (res5.success) {
            $(document).trigger("account_unlinked", [name]);
        } else {
            pm.flashMessage.push({
                text: res5.errors.message
            });
        }
    });
}, sp.initPinItButton = function () {
    if (pm.settings.listingPinitBtn && $(".shopping-tile").length <= 0 && !touchSupport) {
        (function (doc) {
            /** @type {!Element} */
            var wafCss = doc.getElementsByTagName("SCRIPT")[0];
            /** @type {!Element} */
            var script = doc.createElement("SCRIPT");
            /** @type {string} */
            script.type = "text/javascript";
            /** @type {boolean} */
            script.async = true;
            script.setAttribute("data-pin-hover", true);
            /** @type {string} */
            script.src = "//assets.pinterest.com/js/pinit.js";
            wafCss.parentNode.insertBefore(script, wafCss);
        })(document);
        sp.disablePinitNonListingImg();
    }
}, sp.disablePinitNonListingImg = function () {
    $("img").not(".add_pin_it_btn").attr("data-pin-no-hover", "true");
}, sp.fbGoogleSignUpInit = function () {
    $(".fb-btn").on("click", function (i) {
        sp.loginUsingFb("#fb-authentication-form", i);
    });
    if ($(".gp-btn").length >= 1) {
        $(".gp-btn").each(function (a) {
            sp.initGoogleSigninButton($(this).attr("id"), "#gp-authentication-form");
        });
    }
}, sp.brand.generateFallbackTwitterLink = function () {
    return sp.generateTwitterLink(sp.data.link, sp.data["tw-description"]);
}, sp.brand.generateFallbackPinterestLink = function () {
    return sp.generatePinterestLink(sp.data.link, sp.data.description, sp.data.image);
}, sp.brand.brand_share = function (selector) {
    sp.brand.loadDataFromBrandPage(selector);
    sp.initFacebookLib();
    $(selector + " .tw-share-link").attr("href", sp.brand.generateFallbackTwitterLink());
    $(selector + " .tm-share-link").attr("href", sp.brand.generateFallbackTumblrLink());
    $(selector + " .pn-share-link").attr("href", sp.brand.generateFallbackPinterestLink());
    $(selector + " .email-share-link").attr("href", sp.brand.generateFallbackEmailLink());
    $(selector + " .ld-copy-link").attr("data-clipboard-text", sp.data.link);
    $(document).on("click", selector + " .fb-share-link", function (event) {
        event.preventDefault();
        sp.brand.postToFbFeed();
    });
    $(document).on("click", selector + " .tw-share-link", function (event) {
        event.preventDefault();
        var valueProgess = $(this).attr("href");
        sp.brand.generateNavigateTrackedTwitterContent(valueProgess);
    });
    $(document).on("click", selector + " .pn-share-link", function (event) {
        event.preventDefault();
        var valueProgess = $(this).attr("href");
        sp.brand.generateNavigateTrackedPinterestContent(valueProgess);
    });
    $(document).on("click", selector + " .tm-share-link", function (event) {
        event.preventDefault();
        var valueProgess = $(this).attr("href");
        sp.brand.generateNavigateTrackedTumblrContent(valueProgess);
    });
    $(document).on("click", selector + " .email-share-link", function (event) {
        event.preventDefault();
        var valueProgess = $(this).attr("href");
        sp.brand.generateNavigateTrackedEmailContent(valueProgess);
    });
}, sp.clipboard = function (element, options) {
    options = typeof options != "undefined" ? options : 2e3;
    var clipboard = new Clipboard(element);
    return clipboard.on("success", function (_itemList) {
        pm.flashMessage.push({
            text: "Copied!",
            duration: options
        });
        $(element).closest(".modal").modal("hide");
        _itemList.clearSelection();
    }), clipboard.on("error", function (a) {
        if (/iPhone|iPad/i.test(navigator.userAgent)) {
            /** @type {string} */
            actionMsg = "No support :(";
        } else {
            if (/Mac/i.test(navigator.userAgent)) {
                /** @type {string} */
                actionMsg = "Press &#8984;-C to Copy";
            } else {
                /** @type {string} */
                actionMsg = "Press Ctrl-C to Copy";
            }
        }
        pm.flashMessage.push({
            text: actionMsg,
            duration: options
        });
    }), clipboard;
}, sp.setSharePopupData = function () {
    /** @type {string} */
    var pix_color = "";
    /** @type {string} */
    var th_field = "";
    if (sp.data["price"] != null) {
        /** @type {string} */
        pix_color = '<li class="price"><span class="actual">' + sp.data.price + "</span></li>";
    }
    if (sp.data["size"] != null) {
        /** @type {string} */
        pix_color = pix_color + ('<li class="size">Size: <span class="val">' + sp.data.size + "</span></li>");
    }
    if (sp.data["brand"] != null) {
        /** @type {string} */
        th_field = '<li class="brand" >' + sp.data.brand + "</li>";
    }
    if (pix_color != null) {
        /** @type {string} */
        sp.data.details_html = pix_color;
    }
    if (th_field != null) {
        /** @type {string} */
        sp.data.brand_html = th_field;
    }
}, sp.networkTable = {
    pn: {
        name: "Pinterest"
    },
    fb: {
        name: "Facebook"
    },
    tw: {
        name: "Twitter"
    },
    tm: {
        name: "Tumblr"
    },
    ig: {
        name: "Instagram"
    },
    yt: {
        name: "Youtube"
    }
}, sp.shareSettings.unlinkPopup = function (isLeft, id) {
    var phl1 = sp.networkTable[id].name;
    /** @type {string} */
    title_txt = "Unlink " + phl1;
    /** @type {string} */
    body_txt = "Are you sure you want to unlink your " + phl1 + " account?";
    $("#unlink-account .modal-header").text(title_txt);
    $("#unlink-account .modal-body .body-text").text(body_txt);
    $("#unlink-account #unlink-account-btn").data("ext-id", id);
    $("#unlink-account #unlink-account-btn").text(title_txt);
}, sp.shareSettings.confirmUnlink = function (s) {
    sp.unlinkAccount(s);
}, sp.shareSettings.linkAccount = function (h, name) {
    if (name == "fb") {
        sp.linkFbAccount("#fb-link-ext-account-form", h);
    } else {
        window.open(pm.routes.extServiceConnect(name), "_blank", "width=500,height=600,popup");
        window.addEventListener("message", sp.shareSettings.updateExtServices, false);
    }
}, sp.shareSettings.updateExtServices = function (res) {
    res.source.close();
    if (res.data.error) {
        pm.flashMessage.push({
            text: "Unable to process your request, please try again later",
            duration: 3e3
        });
    } else {
        $(document).trigger("account_linked", res.data.channel);
    }
}, $("#unlink-account-btn").on("click", function (event) {
    var id = $(event.currentTarget).data("ext-id");
    return sp.shareSettings.confirmUnlink(id), false;
}), $(".connect-now-link").on("click", function (event) {
    var id = $(event.currentTarget).data("ext-id");
    return sp.shareSettings.linkAccount(event, id), false;
}), $(".unlink-account-link").on("click", function (e) {
    var id = $(e.currentTarget).data("ext-id");
    sp.shareSettings.unlinkPopup(e, id);
    $("#unlink-account").modal("show");
}), sp.populateSignupValues = function (data) {
    if (data && data.success) {
        if (data.redirect_url) {
            return window.location = data.redirect_url, false;
        }
        $("#new_sign_up_form #sign_up_form_email").val(data.email);
        $("#new_sign_up_form #sign_up_form_first_name").val(data.first_name);
        $("#new_sign_up_form #sign_up_form_last_name").val(data.last_name);
        if (data.gender == "male" || data.gender == "female") {
            $("#new_sign_up_form .dropdown-toggle #gender-selection").text(data.gender);
            $("#new_sign_up_form #sign_up_form_gender").val(data.gender);
        }
        $("#new_sign_up_form #sign_up_form_ext_access_token").val(data.ext_access_token);
        $("#new_sign_up_form #sign_up_form_ext_user_id").val(data.ext_user_id);
        $("#new_sign_up_form #sign_up_form_ext_service_id").val(data.ext_service_id);
    }
    return true;
};
var recentItemsObj = recentItemsObj || {};
recentItemsObj.maxRecentItems = 12, recentItemsObj.setRecentItems = function (name, parent) {
    var p = recentItemsObj.getRecentItems() || {};
    p[name] = p[name] || [];
    /** @type {number} */
    var nClauseIdx = -1;
    /** @type {boolean} */
    var e = false;
    /** @type {number} */
    var i = 0;
    for (; i < p[name].length; i++) {
        if (p[name][i]["url"] == parent["url"]) {
            /** @type {number} */
            nClauseIdx = i;
            break;
        }
    }
    if (nClauseIdx > -1) {
        p[name].splice(nClauseIdx, 1);
        /** @type {boolean} */
        e = true;
    }
    p[name].unshift(parent);
    p[name] = p[name].slice(0, recentItemsObj.maxRecentItems);
    $.jStorage.set("recently_viewed_items", p);
    if (e) {
        pm.yaq.push({
            eventType: "wri",
            data: {
                s: "ad",
                t: name.substring(0, 2)
            }
        });
    }
}, recentItemsObj.getRecentItems = function () {
    return $.jStorage.get("recently_viewed_items");
}, recentItemsObj.setRecentTileViewedPosts = function (variable) {
    return $.jStorage.set("recent_tile_viewed_posts", variable);
}, recentItemsObj.ListingExistsInRecentTileViewedItems = function (a) {
    var queryStringKeysArray = $.jStorage.get("recent_tile_viewed_posts");
    /** @type {boolean} */
    var c = false;
    if (queryStringKeysArray) {
        /** @type {number} */
        var i = 0;
        for (; i < queryStringKeysArray.length; i++) {
            if (queryStringKeysArray[i].indexOf(a) > -1) {
                /** @type {boolean} */
                c = true;
                break;
            }
        }
    }
    return c;
}, recentItemsObj.orderPlaced = function (data, value) {
    if (recentItemsObj.ListingExistsInRecentTileViewedItems(data)) {
        pm.yaq.push({
            eventType: "wri",
            data: {
                s: "oc",
                oid: value,
                uid: pm.userInfo.userId()
            }
        });
    }
}, recentItemsObj.initRecentItemsTile = function (a) {
    var obj = recentItemsObj.getRecentItems();
    var filteredView = a.find(".template-con");
    /** @type {!Array} */
    var d = [];
    if (obj && Object.keys(obj).length > 0) {
        if (obj.listing && obj.listing.length > 0) {
            var e = filteredView.find(".last-viewed-item").html();
            var layersLi = a.find(".recent-viewed-con.listings ul.recent-viewed-items");
            $(obj.listing).each(function (b, options) {
                if (options.image_url && options.url && options.title) {
                    var markerNav = $($(e)).appendTo(layersLi);
                    markerNav.find("img").attr("src", options.image_url);
                    markerNav.find("a").attr({
                        href: options.url,
                        title: options.title,
                        "data-pa-name": "recent_listings",
                        "data-pa-attr-location": "recent_listings_widget"
                    });
                    d.push(options.url);
                }
            });
            if (obj.listing.length < 7) {
                a.find(".recent-viewed-con.listings").find(".more-less-con").addClass("hidden");
            }
            recentItemsObj.setRecentTileViewedPosts(d);
        } else {
            a.find(".recent-viewed-con.listings").addClass("hidden");
        }
        if (obj.brand && obj.brand.length > 0) {
            var uiMessageId = filteredView.find(".last-viewed-brand").html();
            var layersLi = a.find(".recent-viewed-con.brands ul.recent-viewed-items");
            $(obj.brand).each(function (a, data) {
                if (data.url && data.text) {
                    var markerNav = $($(uiMessageId)).appendTo(layersLi);
                    markerNav.find("a").attr("href", data.url).html(utils.escapeHTML(data.text));
                }
            });
            if (obj.brand.length < 6) {
                a.find(".recent-viewed-con.brands").find(".more-less-con").addClass("hidden");
            }
        } else {
            a.find(".last-viewed-con.brands").addClass("hidden");
        }
        if (obj.showroom && obj.showroom.length > 0) {
            var i = filteredView.find(".last-viewed-showroom").html();
            var layersLi = a.find(".recent-viewed-con.showrooms ul.recent-viewed-items");
            $(obj.showroom).each(function (b, data) {
                if (data.image_url && data.url && data.text) {
                    var markerNav = $($(i)).appendTo(layersLi);
                    markerNav.find("a").attr({
                        href: data.url,
                        "data-pa-name": "recent_showrooms",
                        "data-pa-attr-location": "recent_showrooms_widget"
                    }).find("span").html(utils.escapeHTML(data.text));
                    markerNav.find("img").attr("src", data.image_url);
                }
            });
            if (obj.showroom.length < 6) {
                a.find(".recent-viewed-con.showrooms").find(".more-less-con").addClass("hidden");
            }
        } else {
            a.find(".recent-viewed-con.showrooms").addClass("hidden");
        }
    } else {
        a.find(".recent-viewed-con.listings").addClass("hidden");
        a.find(".recent-viewed-con.showrooms").addClass("hidden");
    }
    a.on("click", ".more-less-con a.more", function () {
        $(this).parents(".recent-viewed-con").addClass("expanded");
    });
    a.on("click", ".more-less-con a.less", function () {
        $(this).parents(".recent-viewed-con").removeClass("expanded");
    });
    pm.yaq.push({
        eventType: "wri",
        data: {
            s: "vi"
        }
    });
}, recentItemsObj.populateRecentItemsStore = function () {
    /** @type {string} */
    var res = document.location.pathname;
    if (res.indexOf("/listing/") == 0 && $(".listing-wrapper").length > 0) {
        var data = {
            url: res
        };
        data.image_url = $(".listing-wrapper .covershot").attr("src");
        data.title = $('meta[property="og:title"]').attr("content");
        recentItemsObj.setRecentItems("listing", data);
    } else {
        if (res.indexOf("/showroom/") == 0) {
            data = {
                url: res
            };
            var c = $("#page-headers h1");
            data.image_url = c.data("showroom-image");
            data.text = c.text();
            recentItemsObj.setRecentItems("showroom", data);
        } else {
            if (res.indexOf("/order/") == 0 && res.indexOf("/checkout") > 0) {
                var valueProgess = $(".order-summary-widget .listing-details-con a.image-con").attr("href").split("listing/")[1];
                var label = $("#checkout_summary_form .form-actions a").attr("track_label");
                if (recentItemsObj.ListingExistsInRecentTileViewedItems(valueProgess)) {
                    pm.yaq.push({
                        eventType: "wri",
                        data: {
                            s: "os",
                            oid: label,
                            uid: pm.userInfo.userId()
                        }
                    });
                }
            }
        }
    }
}, recentItemsObj.initRecentItems = function () {
    try {
        recentItemsObj.populateRecentItemsStore();
        var a = $(".feed-widget");
        recentItemsObj.initRecentItemsTile(a);
    } catch (conv_reverse_sort) {
        console.log(conv_reverse_sort);
    }
};
var recentlyViewedBundlesV3Obj = recentlyViewedBundlesV3Obj || {};
recentlyViewedBundlesV3Obj.maxRecentItems = 6, recentlyViewedBundlesV3Obj.setRecentItems = function (data) {
    var b = recentlyViewedBundlesV3Obj.getRecentItems() || [];
    /** @type {number} */
    var c = -1;
    /** @type {boolean} */
    var d = false;
    /** @type {number} */
    var i = 0;
    for (; i < b.length; i++) {
        if (b[i]["id"] == data["id"]) {
            /** @type {number} */
            c = i;
            break;
        }
    }
    if (c > -1) {
        b.splice(c, 1);
        /** @type {boolean} */
        d = true;
    }
    b.unshift(data);
    b = b.slice(0, recentlyViewedBundlesV3Obj.maxRecentItems);
    $.jStorage.set("recently_viewed_bundles_v3", b);
}, recentlyViewedBundlesV3Obj.getRecentItems = function () {
    return $.jStorage.get("recently_viewed_bundles_v3");
}, recentlyViewedBundlesV3Obj.populateRecentlyViewedBuyerStore = function (buttonData) {
    var user = {};
    user.id = buttonData.attr("data-buyer-id");
    user.username = buttonData.attr("data-buyer-username");
    user.display_handle = buttonData.attr("data-buyer-display-handle");
    user.full_name = buttonData.attr("data-buyer-full-name");
    user.picture_url = buttonData.attr("data-buyer-picture-url");
    recentlyViewedBundlesV3Obj.setRecentItems(user);
}, recentlyViewedBundlesV3Obj.initRecentlyViewedBundlesV3 = function () {
    try {
        var element = $(".user-bundle");
        if ($(".user-bundle").data("bundleV3") && element.attr("data-user-view") == "seller") {
            recentlyViewedBundlesV3Obj.populateRecentlyViewedBuyerStore(element);
        }
    } catch (b) {
    }
}, pm.party = function () {
    var ret = $("#refresh-wrap");
    var _this = $("#tiles-con");
    /**
     * @return {undefined}
     */
    var success = function () {
        /** @type {boolean} */
        var runIsolated = $("#party-header").attr("data-poll-for-updates") == "true";
        var daywidth = $(".party-time").attr("data-party-time");
        if (daywidth >= 0) {
            /** @type {number} */
            var passedValue1 = (new Date).getTime() + Math.floor(daywidth);
            setTimeout(function () {
                f(passedValue1);
            }, daywidth < 75e3 ? 1e3 : 15e3);
            if (runIsolated) {
                setTimeout(function () {
                    load();
                }, 1e4);
            }
        }
        ret.find(".refresh-con").click(done);
    };
    /**
     * @return {?}
     */
    var done = function () {
        ret.find(".refresh-text").hide();
        ret.find(".loading-img").show();
        /** @type {string} */
        var murl = window.location.href;
        return $.ajax({
            url: murl,
            data: {
                format: "json"
            },
            contentType: "application/json",
            type: "GET",
            dataType: "json",
            success: function (args) {
                _this.html(args.html);
                _this.data("max-id", args.max_id);
                ret.data("count", args.listing_count);
                ret.find(".refresh-con").hide();
                setTimeout(function () {
                    load();
                }, 1e4);
                (function resizeHandler() {
                    /** @type {number} */
                    var duration = document.documentElement.scrollTop || document.body.scrollTop;
                    if (duration > 0) {
                        window.requestAnimationFrame(resizeHandler);
                        window.scrollTo(0, duration - duration / 5);
                    }
                })();
            }
        });
    };
    /**
     * @return {undefined}
     */
    var load = function () {
        $.ajax({
            url: pm.routes.partyListingCountPath($("#party-header").attr("data-event-id")),
            type: "GET",
            dataType: "json",
            success: function (obj) {
                /** @type {number} */
                var formattedChosenQuestion = parseInt(obj.new_listings_count) - ret.data("count");
                if (formattedChosenQuestion > 0) {
                    if (formattedChosenQuestion > 99) {
                        ret.find(".count").html("99+");
                    } else {
                        ret.find(".count").html(formattedChosenQuestion);
                        setTimeout(function () {
                            load();
                        }, 1e4);
                    }
                    ret.find(".refresh-text .text").html(formattedChosenQuestion > 1 ? "New Listings" : "New Listing");
                    ret.find(".loading-img").hide();
                    ret.find(".refresh-text").show();
                    ret.find(".refresh-con").show();
                } else {
                    setTimeout(function () {
                        load();
                    }, 1e4);
                }
            },
            error: function (obj, a, fn) {
                setTimeout(function () {
                    load();
                }, 1e4);
            }
        });
    };
    /**
     * @param {number} b
     * @return {undefined}
     */
    var f = function (b) {
        var formattedChosenQuestion;
        /** @type {number} */
        var c = b - (new Date).getTime();
        if (c <= 1e3) {
            /** @type {string} */
            formattedChosenQuestion = "Party has ended";
        } else {
            if (c < 6e4) {
                /** @type {string} */
                formattedChosenQuestion = "Ends in " + Math.floor(c / 1e3) + " sec";
                setTimeout(function () {
                    f(b);
                }, 1e3);
            } else {
                /** @type {number} */
                var candidatesWidth = Math.floor(c / 1e3 / 60);
                if (candidatesWidth > 60) {
                    /** @type {string} */
                    formattedChosenQuestion = "Ends in " + Math.floor(candidatesWidth / 60) + " hr " + candidatesWidth % 60 + " min";
                } else {
                    /** @type {string} */
                    formattedChosenQuestion = "Ends in " + candidatesWidth + " min";
                }
                setTimeout(function () {
                    f(b);
                }, c % 6e4 + 1);
            }
        }
        $(".party-time").find("span").html(formattedChosenQuestion);
    };
    return {
        initParty: success
    };
}(), pm.My_Size_Obj = pm.My_Size_Obj || {}, pm.My_Size_Obj.openSizeCategory = function (event, switcherWindowId) {
    var c = $(".tabContent");
    /** @type {number} */
    i = 0;
    for (; i < c.length; i++) {
        if (c[i].id == switcherWindowId) {
            /** @type {string} */
            c[i].style.display = "block";
        } else {
            /** @type {string} */
            c[i].style.display = "none";
        }
    }
    /** @type {!NodeList<Element>} */
    var elementLinks = document.getElementsByClassName("tablinks");
    /** @type {number} */
    i = 0;
    for (; i < elementLinks.length; i++) {
        elementLinks[i].className = elementLinks[i].className.replace(" active", "");
    }
    event.currentTarget.className += " active";
}, pm.My_Size_Obj.initEditSize = function () {
    /** @type {!NodeList<Element>} */
    var elementLinks = document.getElementsByClassName("tablinks");
    if (elementLinks.length > 0) {
        elementLinks[0].className += " active";
    }
    $(".my-sizes-category li , .nav.nav-list li").click(function (a) {
        var c = $(this).closest("div").attr("id");
        if (c != undefined) {
            $("#" + c + " .my-sizes-category li").removeClass("active");
            $("#" + c + " ul.my-sizes-options").addClass("hide");
            $("#" + c + " .my-sizes-size-set").addClass("hide");
        } else {
            $(".my-sizes-category li").removeClass("active");
            $("ul.my-sizes-options").addClass("hide");
            $(".my-sizes-size-set").addClass("hide");
        }
        $(this).addClass("active");
        notify();
        var conid = $(this).data("toggle-size-set");
        var e = $(this).data("num-size-sets");
        $("#" + conid).removeClass("hide");
        /** @type {number} */
        var button = 0;
        for (; button < e; button++) {
            var str = $(this).data("toggle-size") + "_" + button;
            /** @type {string} */
            var id = $(this).data("toggle-size") + "_" + button + "_title";
            var flag = $("#" + id + " .selected-sizes").text();
            $("#" + id).removeClass("hide");
            if (flag || !flag && button == 0) {
                $("#" + str).removeClass("hide");
            } else {
                $("#" + id + " i").removeClass("bottom");
                $("#" + id + " i").addClass("right");
            }
        }
    });
    $(".size-set-header").click(function (a) {
        var header = $(this).attr("id");
        var title = header.replace("_title", "");
        /** @type {string} */
        var ol_el = "#" + header + " i";
        if ($("#" + title).css("display") === "none") {
            $("#" + title).toggle();
            $(ol_el).removeClass("right");
            $(ol_el).addClass("bottom");
        } else {
            $("#" + title).hide();
            $(ol_el).removeClass("bottom");
            $(ol_el).addClass("right");
        }
    });
    /**
     * @return {?}
     */
    var notify = function () {
        var readersLength = $('input[name="' + $(this).attr("name") + '"]:checked').length;
        if (readersLength > 4) {
            return $(".my-sizes-options-con p").addClass("notify"), false;
        }
        $(".my-sizes-options-con p").removeClass("notify");
    };
    $(".update-my-size-form input[type=checkbox]").on("click", function (a) {
        var masterVideoId = $(".tablinks.active").html().toLowerCase();
        var patchLen = $('input[name="' + $(this).attr("name") + '"]:checked').length;
        var $tipBox = $("#" + masterVideoId + " .my-sizes-category li.active .incomplete");
        if (patchLen == 0) {
            $tipBox.removeClass("hide");
        } else {
            $tipBox.addClass("hide");
        }
        if (patchLen > 4) {
            return $(".my-sizes-options-con p").addClass("notify"), false;
        }
        $(".my-sizes-options-con p").removeClass("notify");
        var result = this.id.split("_");
        var index = result.length;
        var paneHeading = $("div#my_size_category_" + result[0] + "_" + result[index - 3] + "_" + result[index - 2] + "_title div.selected-sizes");
        var h = $(this).siblings("label").text();
        var exMap = $(paneHeading).find("#ss-" + $(this).attr("value").replace(/\.| /g, "_"));
        if ($(this).is(":not(:checked)")) {
            exMap.remove();
            if ($(paneHeading).find(".selected-size").length >= 1 && $(paneHeading).find(".selected-size").last().text().indexOf(",") > -1) {
                var currentMessage = $(paneHeading).find(".selected-size").last().text();
                $(paneHeading).find(".selected-size").last().text(currentMessage.substring(0, currentMessage.length - 2));
            }
        } else {
            if ($(paneHeading).find(".selected-size").length >= 1) {
                currentMessage = $(paneHeading).find(".selected-size").last().text();
                $(paneHeading).find(".selected-size").last().html(currentMessage + ",&nbsp;");
                $(paneHeading).append($("<div class='selected-size' id='ss-" + $(this).attr("value").replace(/\.| /g, "_") + "'>" + h + "</div>"));
            } else {
                $(paneHeading).append($("<div class='selected-size' id='ss-" + $(this).attr("value").replace(/\.| /g, "_") + "'>" + h + "</div>"));
            }
        }
        return true;
    });
}, pm.twoFactorAuth = function () {
    /** @type {!Array} */
    var infoMesssages = ["InvalidMultiFactorToken", "MissingMultiFactorToken", "ExpiredMultiFactorToken"];
    /** @type {boolean} */
    var b = false;
    var x;
    /**
     * @return {undefined}
     */
    var open = function () {
        var selector = $("body");
        selector.on("click", "#otp .get-code-email", function (a) {
            var passedValue1 = $("#otp form").data("otpCall");
            $otp = $("#otp");
            $otp.modal("toggle");
            $otp.on("hidden.bs.modal", function () {
                $otp.remove();
                f(passedValue1, "email");
                $otp.off("hidden.bs.modal");
            });
        });
        selector.on("show.bs.modal", "#otp", callback);
        selector.on("click", "a[data-mft-required=true], button[data-mft-required=true]", function (event) {
            var passedValue1 = $(event.currentTarget).data("otpCall");
            if (!loadAlertsConfig()) {
                f(passedValue1);
            }
        });
        var mypldiv = selector.find("[data-show-otp=true]");
        if (mypldiv.length > 0) {
            var passedValue1 = mypldiv.data("otpCall");
            if (!loadAlertsConfig()) {
                f(passedValue1);
            }
        }
        selector.on("remoteAction", "#new_otp_verify_form", function (jEvent, res) {
            if ($(jEvent.target).is("form")) {
                if (!res.success && res.errors) {
                    show(res);
                } else {
                    var elementToHilight = $(jEvent.target);
                    hideProgress(elementToHilight);
                    setEditable();
                    if (b) {
                        onPickerClose();
                    }
                }
            }
        });
        selector.on("remoteAction", "a.resend-code", function (a, result) {
            if (result.success) {
                pm.flashMessage.push({
                    text: "Verification Code sent"
                });
            } else {
                show(result);
            }
        });
        selector.on("click", '#otp [data-dismiss="modal"]', highlight);
        selector.on("remoteAction", "form[data-mft-required=true]", function (results, json) {
            if (!json.success && json.error_type && failWhale(json.error_type)) {
                create(results, json);
            }
        });
    };
    /**
     * @param {!Object} result
     * @return {undefined}
     */
    var show = function (result) {
        $otpForm = $("#new_otp_verify_form");
        pm.validate.clearFormErrors($otpForm.attr("id"));
        pm.validate.addErrors($otpForm, $otpForm.data("selector"), result.errors);
    };
    /**
     * @param {string} b
     * @param {string} name
     * @return {undefined}
     */
    var f = function (b, name) {
        if ($("#otp").length > 0) {
            $("#new_otp_verify_form").trigger("reset");
            $("#otp").modal();
        } else {
            $.ajax({
                method: "GET",
                url: pm.routes.getOneTimePasswordModal(b, name),
                success: function (obj) {
                    if (obj.success) {
                        $("main").append(obj.html);
                        $("#otp").modal();
                        _disableQuiz();
                    }
                }
            });
        }
    };
    /**
     * @return {undefined}
     */
    var callback = function () {
        var levelID = $("#new_otp_verify_form").data("otpCall");
        var server = $("#otp").data("otpType");
        $.ajax({
            type: "POST",
            url: pm.routes.sendOneTimePassword(levelID, server),
            success: function (obj) {
                if (!obj.success && obj.errors) {
                    pm.validate.clearFormErrors($("#new_otp_verify_form").attr("id"));
                    pm.validate.addErrors($("#new_otp_verify_form"), $("#new_otp_verify_form").data("selector"), obj.errors);
                }
            }
        });
    };
    /**
     * @param {?} msg
     * @return {?}
     */
    var failWhale = function (msg) {
        return infoMesssages.indexOf(msg) > -1;
    };
    /**
     * @return {?}
     */
    var loadAlertsConfig = function () {
        return document.cookie.indexOf("mft_exp") > -1;
    };
    /**
     * @return {undefined}
     */
    var _disableQuiz = function () {
        $("form[data-mft-required] input").attr("readonly", true);
    };
    /**
     * @return {undefined}
     */
    var setEditable = function () {
        $("form[data-mft-required] input[readonly]:not(.f-readonly)").attr("readonly", false);
        $("form[data-mft-required] .modal-footer .btn, .modal-footer a, .modal-footer p").show();
        $("form[data-mft-required] .form-progress-msg").hide();
    };
    /**
     * @param {!Event} event
     * @param {!Object} data
     * @return {undefined}
     */
    var create = function (event, data) {
        event.stopImmediatePropagation();
        var lines = $(event.currentTarget);
        x = lines;
        /** @type {boolean} */
        b = true;
        pm.validate.clearFormErrors(lines.attr("id"));
        if (data.errors) {
            try {
                var g = $.parseJSON(data.errors);
                if ($(".help-banner").length > 0) {
                    save();
                }
                if (g.mf_token) {
                    pm.validate.addBaseErrors(lines, g.mf_token);
                } else {
                    pm.validate.addErrors(lines, lines.data("selector"), data.errors);
                }
            } catch (h) {
            }
        } else {
            $("form.mft-required").trigger("reset");
        }
        f();
    };
    /**
     * @return {undefined}
     */
    var onPickerClose = function () {
        if (x) {
            x.trigger("submit");
            /** @type {boolean} */
            b = false;
        }
    };
    /**
     * @return {undefined}
     */
    var closeModalSideeffect = function () {
        $(".modal.in").modal("hide");
    };
    /**
     * @return {undefined}
     */
    var save = function () {
        $(".help-banner").show();
    };
    /**
     * @return {undefined}
     */
    var highlight = function () {
        var clicked = $("form[data-mft-required]");
        pm.validate.clearFormErrors(clicked.attr("id"));
        if ($(".help-banner").length > 0) {
            save();
            $(clicked).closest(".modal.in").modal("hide");
        } else {
            closeModalSideeffect();
        }
    };
    return {
        initTwoFactorAuth: open
    };
}(), pm.yaq = function () {
    /**
     * @param {!Object} data
     * @return {undefined}
     */
    var callback = function (data) {
        $.get(pm.routes.yagaTrackEvent(), {
            event_type: data.eventType,
            event_group: data.eventGroup,
            data: JSON.stringify(data.data)
        });
    };
    /**
     * @param {!Object} a
     * @return {?}
     */
    var parse = function (a) {
        /** @type {!Object} */
        var options = new Object;
        return options.data = {}, options.eventType = $(a).attr("yae"), options.eventGroup = $(a).attr("yagr") || "", $(a.attributes).each(function () {
            if (this.nodeName.indexOf("yad_") > -1) {
                options.data[this.nodeName.replace("yad_", "")] = this.nodeValue;
            }
        }), options;
    };
    /**
     * @param {!Object} path
     * @param {boolean} name
     * @return {undefined}
     */
    var handler = function (path, name) {
        name = typeof name != "undefined" ? name : false;
        try {
            if ($(path).attr("yalo")) {
                if (!pm.userInfo.isLoggedIn()) {
                    callback(parse(path));
                }
            } else {
                callback(parse(path));
            }
            if (name && !$(path).attr("data-ajax") && $(path).attr("href") !== undefined && $(path).attr("href").indexOf("#") != 0 && $(path).attr("target") !== "_blank") {
                setTimeout('document.location = "' + $(path).attr("href") + '"', 250);
                event.preventDefault();
            }
        } catch (conv_reverse_sort) {
            console.log("yaga_track_error");
            console.log(conv_reverse_sort);
        }
    };
    return {
        track: handler,
        push: callback
    };
}();
try {
    $(document).ready(function () {
        $("body").on("click", "a[yae],input[yae],textarea[yae]", function (a) {
            pm.yaq.track(this, true);
        });
    });
} catch (e) {
    console.log("yaga tracking error");
}
var allPixel = allPixel || {};
allPixel.pageView = function () {
    allPixel.trackEvent("pageView", {});
    allPixel.is_login_or_logout();
}, allPixel.listingView = function (seconds, category, brand, extra, value, opt_pass) {
    allPixel.trackEvent("listingView", {
        listing_id: seconds,
        content_category: category,
        brand: brand,
        price: extra,
        content_type: "product",
        currency: value,
        seller_id: opt_pass
    });
}, allPixel.addToCart = function (cart, newCartItems, callback, type, value) {
    allPixel.trackEvent("addToCart", {
        listing_id: cart,
        price: newCartItems,
        content_category: callback,
        brand: type,
        content_type: "product",
        currency: value
    });
}, allPixel.purchased = function (order_id, discount_id, data, value) {
    allPixel.trackEvent("purchased", {
        order_id: order_id,
        order_value: discount_id,
        items: data,
        currency: value,
        content_type: "product"
    });
}, allPixel.d1Purchase = function (order_id, discount_id, data) {
    allPixel.trackEvent("d1Purchase", {
        order_id: order_id,
        order_value: discount_id,
        items: data
    });
}, allPixel.liked = function (userId) {
    allPixel.trackEvent("liked", {
        listing_id: userId
    });
}, allPixel.registration_complete = function () {
    allPixel.trackEvent("signup", {});
}, allPixel.is_login_or_logout = function () {
    if (utils.getUrlParams(window.location.href).logout) {
        allPixel.trackEvent("logout", {});
    } else {
        if (utils.getUrlParams(window.location.href).login) {
            allPixel.trackEvent("login", {});
        }
    }
}, allPixel.get_referrer_sources = function () {
    /** @type {!Array} */
    var newNodeLists = [];
    if (utils.getCookie("rt")) {
        var imgsrc = JSON.parse(utils.getCookie("rt")).src;
        /** @type {number} */
        var i = 0;
        for (; i < imgsrc.length; i++) {
            newNodeLists.push(imgsrc[i].rs);
        }
    }
    return newNodeLists;
}, allPixel.get_top_three_listings = function (b) {
    /** @type {!Array} */
    var favoriteIds = [];
    if (b && ["category", "closet", "showrooms", "browse", "search", "brand"].indexOf(b) > -1 && $("#tiles-con .tile").get(2) !== undefined) {
        /** @type {number} */
        var tagName = 0;
        for (; tagName < 3; tagName++) {
            favoriteIds.push($("#tiles-con .tile").get(tagName).id);
        }
    }
    return favoriteIds;
}, allPixel.add_common_params_to = function (data) {
    data.user_id = pm.userInfo.isLoggedIn() ? pm.userInfo.userId() : pm.userInfo.ps().bid;
    data.referrer_sources = allPixel.get_referrer_sources();
    data.screen_name = pm.pageInfo.paTrackerData && pm.pageInfo.paTrackerData.screen_name;
    data.list_view_items = allPixel.get_top_three_listings(pm.pageInfo.paTrackerData && pm.pageInfo.paTrackerData.screen_name);
}, allPixel.trackEvent = function (name, data) {
    allPixel.add_common_params_to(data);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: name,
        attributes: data
    });
}, pm.textAreaGrow = function () {
    /**
     * @return {undefined}
     */
    var init = function () {
        $(document).on("keyup paste", "textarea[data-grow=true]", function () {
            var target = $(this);
            if (target.innerHeight() < this.scrollHeight) {
                activate(target);
            } else {
                check(target);
            }
        });
    };
    /**
     * @param {!Object} el
     * @return {undefined}
     */
    var check = function (el) {
        /** @type {number} */
        var inc = el.innerHeight() - el.height();
        el.height(1);
        el.height(el[0].scrollHeight - inc);
    };
    /**
     * @param {!Object} element
     * @return {undefined}
     */
    var activate = function (element) {
        /** @type {number} */
        var offset = element.innerHeight() - element.height();
        element.height(element[0].scrollHeight - offset);
    };
    return {
        init: init,
        grow: activate,
        shrink: check
    };
}(), pm.header = function () {
    var div = $(div);
    var $targetSpan = $("#overlay-main");
    /**
     * @return {undefined}
     */
    var init = function () {
        $(".search-box .dropdown-item, .search-box.m .dropdown-item").click(function (event) {
            event.preventDefault();
            $(".search-box .dropdown-item").removeClass("selection");
            $(this).addClass("selection");
            var b = $(this).text();
            $(".search-box .dropdown-toggle").text(b);
            pm.search.setSearchPreference(b);
            $("#user-search-box").data("pa-attr-content_type", b);
            if (b == pm.constants.searchTypeListings) {
                pm.search.autoComplete.init(".search-entry");
            } else {
                pm.search.autoComplete.init(".search-entry", true);
            }
        });
        pm.search.updateMarketsSearchPlaceholder(pm.userInfo.experience());
        $(".search-section form, #search-box form").submit(function () {
            if ($.trim($(this).find("input.search-entry").val()) === "") {
                return false;
            }
            var kermit = pm.search.getSearchPreference();
            var b = kermit.type || pm.constants.searchTypeListings;
            $(this).append("<input name='type' type='hidden' value='" + b + "'>");
        });
    };
    /**
     * @return {undefined}
     */
    var link = function () {
        var $target = $("nav.fixed #search-box");
        var $mobileMenu = $("nav.fixed li.search.m a");
        var inlineEditor2 = $target.find("#user-search-box");
        var target = $("header .hamburger-menu");
        var $inputElt = $("nav.fixed li .close");
        var d = $("nav.fixed li .hamburger");
        /**
         * @param {!Event} e
         * @return {undefined}
         */
        var init = function (e) {
            if (!($mobileMenu.is(e.target) || $mobileMenu.has(e.target).length > 0) && $target.has(e.target).length === 0) {
                close();
            }
            if (!(d.is(e.target) || d.has(e.target).length > 0) && target.has(e.target).length === 0) {
                set_state();
            }
        };
        /**
         * @return {undefined}
         */
        var close = function () {
            $target.addClass("collapsed");
            if ($target.hasClass("collapsed") && target.hasClass("collapsed")) {
                $targetSpan.addClass("collapsed");
            }
        };
        /**
         * @return {undefined}
         */
        var set_state = function () {
            target.addClass("collapsed");
            d.removeClass("hide");
            $inputElt.addClass("hide");
            div.removeClass("scroll-lock");
            if ($target.hasClass("collapsed") && target.hasClass("collapsed")) {
                $targetSpan.addClass("collapsed");
            }
        };
        /**
         * @param {?} operator
         * @return {undefined}
         */
        var insert = function (operator) {
            $target.toggleClass("collapsed");
            if ($target.hasClass("collapsed")) {
                $targetSpan.addClass("collapsed");
            } else {
                $targetSpan.removeClass("collapsed");
            }
            if (!$target.hasClass("collapsed")) {
                inlineEditor2.focus();
            }
        };
        /**
         * @return {undefined}
         */
        var initialize = function () {
            target.toggleClass("collapsed");
            d.toggleClass("hide");
            $inputElt.toggleClass("hide");
            div.toggleClass("scroll-lock");
            if (target.hasClass("collapsed")) {
                $targetSpan.addClass("collapsed");
            } else {
                $targetSpan.removeClass("collapsed");
            }
        };
        $mobileMenu.click(function (obj) {
            insert(obj);
        });
        $("nav.fixed li .hamburger, nav.fixed li .close").click(function () {
            initialize();
        });
        target.find("li.submenu").click(function () {
            if ($(this).find("ul").css("display") == "none") {
                $("header .hamburger-menu li.submenu ul").hide();
                $("header .hamburger-menu li.submenu > span").text("+");
                $("header .hamburger-menu li.submenu").removeClass("selection");
                $(this).find("ul").show();
                $(this).children("span").text("-");
                $(this).addClass("selection");
            } else {
                $("header .hamburger-menu li.submenu ul").hide();
                $("header .hamburger-menu li.submenu > span").text("+");
                $("header .hamburger-menu li.submenu").removeClass("selection");
                $(this).find("ul").hide();
                $(this).children("span").text("+");
                $(this).removeClass("selection");
            }
        });
        $(document).on("click", init);
        $(document).on("show.bs.dropdown", init);
    };
    /**
     * @return {undefined}
     */
    var initialize = function () {
        /**
         * @param {!Object} time
         * @return {undefined}
         */
        var pause = function (time) {
            time.find(".dropdown-menu").addClass("hover");
            $targetSpan.removeClass("collapsed");
        };
        /**
         * @param {!Object} time
         * @return {undefined}
         */
        var initialize = function (time) {
            time.find(".dropdown-menu").removeClass("hover");
            $targetSpan.addClass("collapsed");
        };
        /**
         * @param {!Object} options
         * @param {boolean} i
         * @return {undefined}
         */
        var find = function (options, i) {
            if (i) {
                pause(options);
            } else {
                initialize(options);
            }
        };
        var _takingTooLongTimeout;
        $(".scrollable-nav-dropdown").hover(function () {
            var a = $(this);
            /** @type {number} */
            _takingTooLongTimeout = setTimeout(function () {
                find(a, true);
            }, 300);
        }, function () {
            clearTimeout(_takingTooLongTimeout);
            var a = $(this);
            /** @type {number} */
            _takingTooLongTimeout = setTimeout(function () {
                find(a, false);
            }, 300);
            a.parent().find(".dropdown-menu").hover(function () {
                clearTimeout(_takingTooLongTimeout);
            }, function () {
                find(a, false);
            });
        });
        $(document).on("click", ".scrollable-nav-dropdown", function (event) {
            if ($("nav.scrollable ul .dropdown").not(this).find(".dropdown-menu").hasClass("hover")) {
                initialize($("nav.scrollable ul .dropdown").not(this));
            }
            if ($(this).find(".dropdown-menu").css("visibility") === "hidden") {
                find($(this), true);
                event.preventDefault();
            }
        });
    };
    return {
        initCommonHeader: init,
        initMobileHeader: link,
        initDesktopHeader: initialize
    };
}(), pm.experiences = function () {
    var detailViewItem = $(".exp-switcher .checkmark");
    var b = $("#selected-experience");
    /**
     * @param {!Object} name
     * @param {!Object} type
     * @return {undefined}
     */
    var remove = function (name, type) {
        var data = pm.meta.experienceToDisplayName[name];
        if (name && type && data) {
            detailViewItem.addClass("f-hide");
            type.find(".checkmark").removeClass("f-hide");
            b.text(data);
        }
        var downloadStat = $.jStorage.get("tooltip-state");
        $.jStorage.set("tooltip-state", {
            show: true,
            count: downloadStat.count
        });
        window.location.reload();
    };
    /**
     * @param {?} event
     * @return {?}
     */
    var update = function (event) {
        return pm.userInfo.experience() === event;
    };
    /**
     * @return {undefined}
     */
    var link = function () {
        var data = $.jStorage.get("tooltip-state");
        if (!data || data && data.show && data.count > 0) {
            $.jStorage.set("tooltip-state", {
                show: false,
                count: data && data.count ? data.count - 1 : 2
            });
            setTimeout(function () {
                $("#experience-tooltip .tooltip-dropdown").dropdown("toggle");
            }, 1e3);
        }
    };
    /**
     * @return {undefined}
     */
    var build = function () {
        $("body").on("click", ".no-results-search .btn", function (a) {
            find("all", null, remove);
        });
        get();
        link();
        $(".exp-switcher").on("click", "[data-exp]", function (event) {
            var to = $(event.currentTarget);
            var name = to.data("exp");
            var funcExpr = pm.meta.experienceToPossessiveDisplayName[name];
            /** @type {boolean} */
            var h = name === "wholesale" && to.attr("data-exp-authorized") === "false";
            if (!update(name) && !h) {
                pm.hudMessage.push({
                    type: 1,
                    text: "Switching to " + funcExpr + " Market"
                });
                find(name, to, remove);
            }
        });
    };
    /**
     * @param {string} a
     * @param {!Object} b
     * @param {!Function} fun
     * @return {undefined}
     */
    var find = function (a, b, fun) {
        if (pm.userInfo.isLoggedIn()) {
            $.ajax({
                url: pm.routes.updateUserExperience(),
                method: "POST",
                type: "POST",
                data: {
                    exp: a
                },
                success: function (obj) {
                    if (obj.success) {
                        fun(a, b);
                    } else {
                        if (obj.error) {
                            pm.hudMessage.dismiss();
                            pm.flashMessage.push({
                                text: obj.error
                            });
                        }
                    }
                }
            });
        } else {
            pm.userInfo.setExperience(a);
            fun(a, b);
        }
    };
    /**
     * @return {undefined}
     */
    var get = function () {
        if (pm.userInfo.isLoggedIn()) {
            var obj = $.jStorage.get("experiences");
            if (obj && pm.userInfo.userId() === obj.userId && obj.experienceData.length > 0) {
                f(obj.experienceData);
            } else {
                $.ajax({
                    url: pm.routes.userExperiences(),
                    method: "GET",
                    success: function (args) {
                        if (args.success && args.user_experiences) {
                            _save(args.user_experiences);
                            f(args.user_experiences);
                        }
                    }
                });
            }
        }
    };
    /**
     * @param {!Object} saveNow
     * @return {undefined}
     */
    var _save = function (saveNow) {
        $.jStorage.set("experiences", {
            experienceData: saveNow,
            userId: pm.userInfo.userId()
        }, {
            TTL: pm.constants.localExperienceTTL
        });
    };
    /**
     * @param {!Array} substitution
     * @return {undefined}
     */
    var f = function (substitution) {
        substitution.forEach(function (a) {
            var that = $(".exp-switcher [data-exp=" + a.short_name + "]");
            that.attr("data-ajax-modal", !a.caller_authorized);
            that.attr("data-exp-authorized", a.caller_authorized);
            if (a.caller_authorized) {
                that.attr("href", "#");
            }
        });
    };
    return {
        initExperiences: build
    };
}(), domReady(pmInit), $(".confirm-email-btn").on("click", function () {
    $.ajax({
        url: $(".confirm-email-btn").data("url"),
        type: "POST",
        success: function () {
            $("#confirm-email").modal("show");
        }
    });
}), $(document).on("click", ".mark-listing-for-sale", function () {
    var editingEl = $(".order-details.listing-for-details");
    var http_url = editingEl.data("closet-url");
    var c = $(".mark-listing-for-sale").data("url");
    $.ajax({
        url: c,
        type: "POST",
        success: function (obj) {
            if (obj.success) {
                return window.location = http_url;
            }
            var capture_headings = obj.error || "Something went wrong. Please try again later.";
            pm.flashMessage.push({
                text: capture_headings,
                duration: 5e3
            });
        },
        error: function () {
            pm.flashMessage.push({
                text: "Something went wrong, please try again later",
                duration: 5e3
            });
        }
    });
});
