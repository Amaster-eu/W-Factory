var winH, winW, minSize,
    $body = $("body"),
    nextSlide = 1,
    slideActive = 1,
    session = null,
    homeCycle = null,
    contactCycle = null,
    destroyH = 440; // fullpage.destroy

function getWinProps() {
    winW = $(window).width();
    winH = $(window).height();
    if ( winW >= winH ) minSize = winH;
    else minSize = winW;
//console.log('winW: '+winW+' winH: '+winH+' minSize: '+minSize);
    return winW, winH, minSize;
}

$(document).ready(function() {
    createFullpage();
    // Animation Cycle
    homeCycle = new WordCycle($(".home").find(".cycle-content")).start();
    contactCycle = new WordCycle($(".contact").find(".cycle-content")).start();
    initialize();
    $('#menu li a').click(function () {
        ballsInit();
    });
});
function ballsInit() {
    getWinProps();
    initialize();
    balls();
}
$(window).bind('resize orientationchange', function(e) {
    ballsInit();
});
$(window).bind('wheel touchmove', function(e) {
    ballsInit();
});

function balls() {
    // Falling balls -- Restart (Resize)
    if ( winH >= destroyH && winH >= $('.home .intro').outerHeight() ) {
        teaser_animated.set(0);
        setTimeout(function() {
            teaser_animated.set(nextSlide);
            textBall();
        }, 500);
        $('.balls').hide();
    } else {
        // Falling balls -- Non visible
        teaser_animated.set(0);
        $('.balls').show();
    }
    return false;
}

function initialize() {
    getWinProps();
    // If window small --> fullpage slider in common mode
    if (winH < destroyH) {
        $body.addClass('non-fullpage').removeClass('background-dark');
        $('.section').addClass('anchor');
    } else {
        $.fn.fullpage.reBuild();
        $body.removeClass('non-fullpage');
        $('.section').removeClass('anchor');
    }
    $('a.scroll').css( 'left', winW/2 - $('a.scroll').width()/2 );

    balls();

    // Falling balls -- Resize
    if (minSize >= 500 && minSize < 926) {
        $('#ball1').css({
            'width': minSize * 0.26,
            'height': minSize * 0.26,
            'top': -minSize * 0.13,
            'left': -minSize * 0.13
        });
        $('#ball2').css({
            'width': minSize * 0.3,
            'height': minSize * 0.3,
            'top': -minSize * 0.15,
            'left': -minSize * 0.15
        });
    } else if (minSize < 500) {
        $('#ball1').css({
            'width': 130,
            'height': 130,
            'top': -65,
            'left': -65
        });
        $('#ball2').css({
            'width': 150,
            'height': 150,
            'top': -75,
            'left': -75
        });
    }
    // Flash "Click Me"
    session = sessionStorage.getItem('session');
    setTimeout(function() {
        if (session == null) $('#ball2').addClass('click-me');
    }, 3000);
    setTimeout(function() {
        $('#ball2').removeClass('click-me');
    }, 4000);
    setTimeout(function() {
        if (session == null) $('#ball1').addClass('click-me');
    }, 4500);
    setTimeout(function() {
        $('#ball1').removeClass('click-me');
    }, 5500);
}

function createFullpage() {
    $('main').fullpage({
        // Navigation
        menu: '#menu',
        anchors: ['home', 'work', 'services', 'team', 'contact'],
        slidesNavigation: true,
        // Scrolling
        css3: true,
        loopBottom: true,
        scrollOverflow: true,
        loopHorizontal: true,
        //Accessibility
        keyboardinitializeolling: true,
        animateAnchor: true,
        recordHistory: true,
        // Design
        controlArrows: true,
        verticalCentered: true,
        // Custom selectors
        sectionSelector: '.section',
        slideSelector: '.slide',
        lazyLoading: true,
        // Events
        onLeave: function(index, nextIndex, direction) {
            $body.removeClass("background-dark background-bright");
            var bg_color = "";
            // BackgroundDark Pages
            if (nextIndex == 5 && winH >= destroyH) { // [2]Work [5]Contact Info
                bg_color = "background-dark";
            }
            $body.addClass(bg_color);

            slideActive = nextIndex;
            nextSlide = nextIndex;

            // Falling balls -- Restart (Next Slide)
            sessionStorage.setItem('session', 'not-first');
            if ( winH >= destroyH && winH >= $('.home .intro').outerHeight() ) {
                teaser_animated.set(nextSlide);
                textBall();
            }
        },
        afterSlideLoad: function( anchorLink, index, slideAnchor, slideIndex){
            var loadedSlide = $(this);
            var lengthSlides = $('.fp-section.active .fp-slide').length;

            //after loading the 0th (first) slide
            if (slideIndex == 0) {
                $('div.fp-controlArrow.fp-prev').fadeOut();
            } else {
                $('div.fp-controlArrow.fp-prev').fadeIn();
            }
            // Last slide
            if ( (loadedSlide.index()+1) == lengthSlides ) {
                $('div.fp-controlArrow.fp-next').addClass('down');
            } else {
                $('div.fp-controlArrow.fp-next').removeClass('down');
            }

         }
    });
}

/** Animation words */
var WordCycle = function($element, options) {
    if (!$element || !$element.length) return;
    var contents = JSON.parse($element.attr("data-word-cycle"));
    if (!contents.length) return;
    var self = this;
    var paused = true;
    var $list;
    var winWordOut = null;
    var tl = null;
    var cycles = -1;
    var words = [];
    var letters = [];
    var index = 0;
    var cycle_timeout = null;
    var _o = {};
    var running = false;

    function update_options(options) {
        _o.direction = options && options.direction == "backwards" ? -1 : 1;
        _o.loop = options && typeof options.loop != "undefined" && Number(options.loop) ? options.loop : -1;
        _o.animation = {};
        _o.animation.char_time = options && options.animation && Number(options.animation.char_time) ? options.animation.char_time : .4;
        _o.animation.stagger_time = options && options.animation && Number(options.animation.stagger_time) ? options.animation.stagger_time : .04
    }
    update_options();

    function create_markup() {
        $list = $("<ul>");
        var i = -1;
        for (var key in contents) {
            i++;
            var chars = contents[key].split("");
            var winWord = $("<li>");
            words[i] = winWord;
            for (var char in chars) {
                if (chars[char] === " ") chars[char] = "&nbsp;";
                winWord.append("<span>" + chars[char] + "</span>")
            }
            letters[i] = winWord.find("span");
            $list.append(winWord)
        }
        $element.removeAttr("data-word-cycle");
        $element.empty().append($list);
        $list.width($list.width() + 8);
        for (var i = 0, len = words.length; i < len; i++) words[i][0].style.position = "absolute"
    }

    function init() {
        create_markup();
        TweenLite.set(letters, {
            transformOrigin: "0% 50% " + words[0].height() / -2 + "",
            opacity: 0
        });
        TweenLite.set(letters[0], {
            opacity: 1
        })
    }

    function nextWord() {
        if (running) return;
        running = true;
        cycles--;
        var current = index;
        index += words.length + 1;
        index = index % words.length;
        var $l = letters[current],
            $n = letters[index];
        tl = new TimelineLite({
            onComplete: function() {
                if (tl) tl.kill();
                tl = null;
                running = false;
                if (cycles == 0) {
                    paused = true;
                    return
                }
                cycle_timeout = setTimeout(function() {
                    cycle_timeout = null;
                    if (!paused) nextWord()
                }, 1500)
            }
        });
        tl.set($n, {
            rotationX: _o.direction * 90
        }).staggerTo($l, _o.animation.char_time, {
            rotationX: _o.direction * -90,
            ease: Cubic.easeInOut,
            opacity: 0
        }, _o.animation.stagger_time, "+=0").staggerTo($n, _o.animation.char_time, {
            rotationX: 0,
            opacity: 1,
            ease: Back.easeOut
        }, _o.animation.stagger_time, "-=0.3")
    }
    this.stop = function() {
        paused = true
    };
    this.start = function(options) {
        if (!paused) return;
        if (options) update_options(options);
        cycles = _o.loop;
        paused = false;
        if (tl) {
            return
        } else {
            nextWord()
        }
    };
    init()
};

/** Falling balls */
var Teaser_animated = function() {
    var self = this;
    var physics_world = null;
    this.active = false;
    this.init = function() {
        physics_world = Physics(function(world) {
            var viewWidth = winW;
            var viewHeight = winH;
            var renderer = Physics.renderer("dom", {
                el: "viewport",
                width: viewWidth,
                height: viewHeight,
                meta: false
            });
            world.add(renderer);
            world.on("step", function() {
                world.render()
            });
            var viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);
            var edgeBounce = Physics.behavior("edge-collision-detection", {
                aabb: viewportBounds,
                restitution: .8,
                cof: .99
            });
            world.add(edgeBounce);
            Physics.body("wheel", "circle", function(parent) {
                return {
                    spin: function(speed) {
                        this.state.angular.vel = speed
                    }
                }
            });
            var x_start = $(window).width() - 280;
            var ball1 = Physics.body("wheel", {
                x: x_start,
                y: getRandomArbitary(0, 400), //100,
                radius: $('#ball1').width() / 2, // 120,
                restitution: .9,
                vx: -.4,
                fixed: false
            });
            var $ball1 = document.getElementById("ball1");
            ball1.view = $ball1;
            world.add(ball1);
            var ball2 = Physics.body("wheel", {
                x: -900,
                y: getRandomArbitary(-400, 0), //-400,
                radius: $('#ball2').width() / 2, // 138
                restitution: .9,
                vx: .8,
                fixed: false
            });
            var $ball2 = document.getElementById("ball2");
            ball2.view = $ball2;
            world.add(ball2);

            window.addEventListener("resize", function() {
                viewportBounds = Physics.aabb(0, 0, renderer.width, renderer.height);
                edgeBounce.setAABB(viewportBounds);
            }, true);

            function addInteraction(world, Physics) {
                world.add(Physics.behavior("interactive", {
                    el: world.renderer().container
                }))
            }

            addInteraction(world, Physics);
            world.add([
                Physics.behavior('sweep-prune'),
                Physics.behavior('body-collision-detection'),
                Physics.behavior('body-impulse-response'),
                Physics.behavior('constant-acceleration'),
                renderer
            ]);
            Physics.util.ticker.on(function(time) {
                world.step(time)
            })

            /* Stop move Balls */
            setTimeout(function() {
                world.pause();
                var transformBall1y = parseInt($('#ball1').css('transform').split(',')[4]);
                var transformBall1x = parseInt($('#ball1').css('transform').split(',')[5]);
                $('#ball1').css({'-webkit-transform':'translate('+transformBall1y+'px, '+transformBall1x+'px) rotate(0rad) translate(0px, 0px)', 'transform':'translate('+transformBall1y+'px, '+transformBall1x+'px) rotate(0rad) translate(0px, 0px)'});
                var transformBall2y = parseInt($('#ball2').css('transform').split(',')[4]);
                var transformBall2x = parseInt($('#ball2').css('transform').split(',')[5]);
                $('#ball2').css({'-webkit-transform':'translate('+transformBall2y+'px, '+transformBall2x+'px) rotate(0rad) translate(0px, 0px)', 'transform':'translate('+transformBall2y+'px, '+transformBall2x+'px) rotate(0rad) translate(0px, 0px)'});
            //    console.log('Timeout! '+transformBall1x+' | '+transformBall1y);
            }, 60000);   // 1.0 min


        });
        if ( winW >= 768 ) {
            setTimeout(function () {
                $("#viewport").css({
                    position: "absolute",
                    display: "block",
                });
            }, 100);
        } else {
            $("#viewport").css({ display: "none" });
        }
        var lastClick, t = 0
    };
    this.set = function(index) {
        if (index == 1 && !self.active_teaser) {
            self.init();
            self.active_teaser = true;

            $("#viewport").on("mousedown", function() {
                var d = new Date;
                lastClick = d.getTime()
            }).on("mouseup", function() {
                var d = new Date;
                t = d.getTime();
                if (t - lastClick < 500) self.active = false;
                else self.active = true;
                lastClick = t
            })



        } else if (index != 1) {
            physics_world = null;
            self.active_teaser = false;
            $("#viewport").hide();
            $(".joboffer-ball").off("mouseup");
            $("#viewport").off("mousedown mouseup")
        }
    }
};
var teaser_animated = new Teaser_animated;

function getRandomArbitary(min, max) {
    return Math.random() * (max - min) + min;
}

/** random number without repeating */
var uniqueRandoms = [];
var numRandoms = $('.work .slide').length;
function makeUniqueRandom() {
    // refill the array if needed
    if (!uniqueRandoms.length) {
        for (var i = 1; i <= numRandoms; i++) {
            uniqueRandoms.push(i);
        }
    }
    var index = Math.floor(Math.random() * uniqueRandoms.length);
    var val = uniqueRandoms[index];

    // now remove that value from the array
    uniqueRandoms.splice(index, 1);

    return val;
}

/** Insert text in Ball */
function textBall() {
    for (var i = 0; i < 2; i++) {
        var rand = makeUniqueRandom();
        if ( i == 0 ) {
            $('#ball1, #ball1-link a').attr('onclick', '$.fn.fullpage.moveTo(2,'+(rand-1)+');');
            $('#ball1 p, #ball1-link a').html( $('.work .slide:nth-child('+rand+') a').html() );
        }
        if ( i == 1 ) {
            $('#ball2, #ball2-link a').attr('onclick', '$.fn.fullpage.moveTo(2,'+(rand-1)+');');
            $('#ball2 p, #ball2-link a').html( $('.work .slide:nth-child('+rand+') a').html() );
        }
    }
}

/** Popup */
function PopUp(data, page){
    var $popup = $('.popup-'+page);
    this.show = function() {
        if (winH >= destroyH ) $.fn.fullpage.destroy('all');
        //console.log('fullpage.destroy');
        $('main').hide();
        if ( page == 'home') $('.task-section.'+data).show();
        $('.btn-close').show();
        $popup.addClass("open");
        if (winH >= destroyH ) $popup.addClass("fp-noscroll");
    };
    this.hide = function(page) {
        $('main').show();
        if (winH >= destroyH ) createFullpage();
        //console.log('createFullpage');
        $('.btn-close').hide();
        if ( slideActive == 1) {
            $('.frontend, .backend').css('display','none');
            // Falling balls -- Restart (Resize)
            if ( winH >= destroyH && winH >= $('.home .intro').outerHeight() ) {
                teaser_animated.set(0);
                teaser_animated.set(nextSlide);
                textBall();
            }
        }
        $('.popup .open').removeClass("open");
        if (winH >= destroyH ) $('.popup .open').removeClass("fp-noscroll");
    };
    return this;
}
var thePopUp = new PopUp;
$(document).on("click", ".btn-close", function(e) {
    e.preventDefault();
    PopUp().hide();
});
$(document).on("click", ".popup-home .btn-apply", function(e) {
    e.preventDefault();
    PopUp().hide();
    $.fn.fullpage.moveTo('contact');
});
$(document).on("click", ".link-services", function(e) {
    e.preventDefault();
    PopUp('', 'services').show();
});
$(document).on("click", ".work-with-us a", function(e) {
    e.preventDefault();
    PopUp().hide();
    $.fn.fullpage.moveTo('contact');
});
$(document).on("click", ".fp-controlArrow.fp-next.down", function() {
    $.fn.fullpage.moveSectionDown();
});
$(document).on("click", ".link-contact", function(e) {
  e.preventDefault();
  PopUp('', 'contact').show();
});


/** Team flip-container hover */
var pause = false;
var timeout = 0;
var t = 1;
$('.flip-container').each(function() {
    addHover(this);
});
$('.flip-container').hover(function(){
    pause = true;
}, function(){
    pause = false;
});
function addHover(td) {
    if (!pause) {
        t = Math.round(getRandomArbitary(1, 4));
        setTimeout(function() {
            $('.flip-container:nth-child(' + t + ')').addClass('hover');
        }, 3000);
        setTimeout(function() {
            $('.flip-container').removeClass('hover');
        }, 4000);
    }
    setTimeout(function() {
        addHover(td);
    }, timeout);
    timeout += 1500 + 1500;
}

/** Work "Click-Active" */

var pause2 = false;
var timeout2 = 0;
var t2 = 1;
$('.click-work li').each(function () {
    addActiveClick(this);
});
$('.click-work li').hover(function () {
    pause2 = true;
}, function () {
    pause2 = false;
});
function addActiveClick(td) {
    if (!pause2) {
        t2 = Math.round(getRandomArbitary(1, 6));
        setTimeout(function() {
            $('.click-work li:nth-child(' + t2 + ') .click-img').addClass('click-me-img');
        }, 3000);
        setTimeout(function() {
            $('.click-work li .click-img').removeClass('click-me-img');
        }, 5000);
    }
    setTimeout(function() {
        addActiveClick(td);
    }, timeout2);
    timeout2 += 1500 + 1500;
}