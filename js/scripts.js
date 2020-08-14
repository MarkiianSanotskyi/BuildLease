/*placeholder*/
$(document).ready(function(){
        $.Placeholder.init({ color : "#9ba893" });
 });
 
 $(document).ready(function() {
  var flip = new FlipClock({
    isCountdown: true,
    startTime: '11:08:54:54',
    containerElement: $('.countdown'),
    face: {
      days: {
        maxValue: 31
      },
      hours: {
        maxValue: 23
      },
      minutes: {
        maxValue: 59
      },
      seconds: {
        maxValue: 59
      }
    }
  });
});

/**
 * FlipClock
 * @param options
 * @constructor
 */
FlipClock = function (options) {
    this.tickInterval = false;
    this.digitSelectors = [];
    this.options = this.createConfig(options);

    this.init();
};

/**
 * returns merged config based on passed config + default config
 * @param options - config object
 * @returns options merged config objects
 */
FlipClock.prototype.createConfig = function(options) {
    return $.extend( {}, this.getDefaultConfig(), options );
};

/**
 * returns default config object
 */
FlipClock.prototype.getDefaultConfig = function() {
    return {
        tickDuration: 1000,
        isCountdown: false,
        startTime: '23:59:51',
        maxTime: '23:59:59',
        minTime: '00:00:00',
        containerElement: $('.container'),
        segmentSelectorPrefix: 'flipclock-',
        face: {
            hours: {
                maxValue: 23
            },
            minutes: {
                maxValue: 59
            },
            seconds: {
                maxValue: 59
            }
        }
    };
};

/**
 * check browser feature support
 */
FlipClock.prototype.initFeatureDetection = function() {
    $.support.transition = (function(){
        var thisBody = document.body || document.documentElement,
            thisStyle = thisBody.style,
            support = thisStyle.transition !== undefined || thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.MsTransition !== undefined || thisStyle.OTransition !== undefined;
        return support;
    })();
};

/**
 * return browser support for given feature
 * @param feature
 * @returns {*}
 */
FlipClock.prototype.isFeatureSupported = function(feature) {
    if(feature && typeof $.support !== undefined && typeof $.support[feature] !== undefined) {
        return $.support[feature];
    }

    return false;
};

/**
 * init
 */
FlipClock.prototype.init = function() {
    this.options.containerElement.empty();

    if (this.tickInterval !== false) {
        clearInterval(this.tickInterval);
        this.tickInterval = false;
    }

    this.appendMarkupToContainer();
    this.setDimensions();

    this.setupFallbacks();

    this.start();
};

/**
 * setupFallbacks
 */
FlipClock.prototype.setupFallbacks = function() {
    this.initFeatureDetection();

    if (this.isFeatureSupported('transition')) {
        $('ul.flip li:first-child', this.options.containerElement).css("z-index", 2);
    } else {
        // < IE9 can't do css animations (@keyframe) - need to fix z-index here since we're setting z-indices inside the keyframe-steps
        $('ul.flip li:first-child', this.options.containerElement).css("z-index", 3);

        // < IE9 doesn't understand nth-child css selector => fallback class that has to be addressed via css separatly
        $('ul.flip:nth-child(2n+2):not(:last-child)', this.options.containerElement).addClass('nth-child-2np2-notlast');
    }
};

/**
 * Sets digit dimensions based on its containers height
 */
FlipClock.prototype.setDimensions = function() {
    var flipHeight = this.options.containerElement.height(),
        flipWidth = flipHeight/1.5;

    $('ul.flip', this.options.containerElement).css({
        width: flipWidth,
        fontSize: (flipHeight - 10) + 'px'
    }).find('li').css({
        lineHeight: (flipHeight) + 'px'
    });
};

/**
 * Creates segments out of 'digits', calculates ticks per digit based on segment maxValue
 * @param faceSegmentGroupName
 * @returns {Array}
 */
FlipClock.prototype.createSegment = function(faceSegmentGroupName) {
    var faceSegmentGroup = this.options.face[faceSegmentGroupName],
        segmentSelectorAddons = ['-ten', '-one'],
        rounded = Math.ceil(faceSegmentGroup.maxValue/10),
        segment = [];

    if (faceSegmentGroup.maxValue/10 > 1) {
        segment = [
            {
                selector: this.options.segmentSelectorPrefix + faceSegmentGroupName + segmentSelectorAddons[0],
                ticks: rounded
            },{
                selector: this.options.segmentSelectorPrefix + faceSegmentGroupName + segmentSelectorAddons[1],
                ticks: 10
            }
        ];
    } else {
        segment = [
            {
                selector: this.options.segmentSelectorPrefix + faceSegmentGroupName + segmentSelectorAddons[1],
                ticks: 10
            }
        ]
    }

    return segment;
};

/**
 * Appends the markup for each digit to the container
 */
FlipClock.prototype.appendMarkupToContainer = function() {
    var baseZIndex = 0;
    
    for (var faceSegmentGroup in this.options.face) {
        this.options.face[faceSegmentGroup].segments = this.createSegment(faceSegmentGroup);

        for (var i=0; i < this.options.face[faceSegmentGroup].segments.length; i++) {
            var faceSegmentElement = this.createFaceSegment( this.options.face[faceSegmentGroup].segments[i] );

            this.digitSelectors.push(this.options.face[faceSegmentGroup].segments[i].selector);
            this.options.containerElement.append( faceSegmentElement );

            // assign common data-attribute to segments of the same group
            faceSegmentElement.data('face-segment-group', faceSegmentGroup);
            faceSegmentElement.addClass(faceSegmentGroup);
            faceSegmentElement.css("z-index", baseZIndex++);
        }
    }

    this.digitSelectors.reverse();

//    var self = this;
//    $(document).on('keyup', function(e) {
//        if(e.keyCode === 13) {
//            self.stop();
//        }
//    });
};

/**
 * Creates face segments
 * @param faceSegment
 * @returns {*|jQuery|HTMLElement}
 */
FlipClock.prototype.createFaceSegment = function(faceSegment) {
    var faceElement = $('<ul>', {
        "class": "flip " + faceSegment.selector
    });

    for (var i = 0; i < faceSegment.ticks; i++) {
        var digit = i;

        faceElement.append( this.createFaceDigit(digit) );
    }

    return faceElement;
};

/**
 * Creates digit markup
 * @param digit
 * @returns {string}
 */
FlipClock.prototype.createFaceDigit = function(digit) {
    var digitInnerFragment = '<div class="shadow"></div><div class="inn">' + digit + '</div>';

    return '<li data-digit=' + digit + ' ><span>' +
            '<div class="up">' + digitInnerFragment + '</div>' +
            '<div class="down">' + digitInnerFragment + '</div>' +
           '</span></li>';
};

/**
 * Starts the clock
 */
FlipClock.prototype.start = function() {
    this.setToTime(this.options.startTime);

    var self = this;

    this.tickInterval = setInterval(function () {
        self.tick();
    }, this.options.tickDuration);
};

/**
 * Stops the Clock after the current interval is finished
 */
FlipClock.prototype.stop = function() {
    clearInterval(this.tickInterval);
};

/**
 * Resets to 00:00:00....
 * needed when using this as an actual clock - e.g. can reset to 0 after 23:59:59
 */
FlipClock.prototype.resetDigits = function() {
    this.options.containerElement.removeClass('play');

    for (var i=0; i<this.digitSelectors.length; i++) {
        var active = $(this.getDigitSelectorByIndex(i) + ".current", this.options.containerElement),
            all = $(this.getDigitSelectorByIndex(i), this.options.containerElement),
            first = $(this.getDigitSelectorByIndex(i) + ":first-child", this.options.containerElement);

        all.eq(0).addClass("clockFix");
        all.removeClass("current");

        first.addClass("current");

        all.removeClass("previous");
        active.addClass("previous");
    }

    this.options.containerElement.addClass('play');
};

/**
 * Sets the clock to a time based on passed string
 * @param time {string} 00:00:00...
 */
FlipClock.prototype.setToTime = function(time) {
    var timeArray = time.replace(/:/g, '').split('').reverse();

    for (var i=0; i<this.digitSelectors.length; i++) {
        var digit = $(this.getDigitSelectorByIndex(i), this.options.containerElement).eq(parseInt(timeArray[i]));

        this.options.containerElement.removeClass('play');

        digit.addClass("current");
        this.options.containerElement.addClass('play');
    }
};

/**
 * Set Segment to its maximum value
 * @param segmentGroupName
 */
FlipClock.prototype.setFaceSegmentGroupMaxValue = function(segmentGroupName) {
    var self = this;
    var group = this.getFaceSegmentGroupDom(segmentGroupName);

    group.each(function(idx) {
        self.options.containerElement.removeClass('play');

        var maxValue = self.options.face[segmentGroupName].maxValue.toString().split('');

        $(this).find('li.current').removeClass('current');
        $(this).find('li[data-digit="'+maxValue[idx]+'"]').addClass('current');

        self.options.containerElement.addClass('play');
    });
};

/**
 * actual callback for the tick/interval
 */
FlipClock.prototype.tick = function() {
    this.doTick(0);
};

/**
 * Returns current time as int
 * @returns {Number}
 */
FlipClock.prototype.getCurrentTime = function() {
    var currentTime = [];

    $('li.current', this.options.containerElement).each(function() {
        currentTime.push($(this).data('digit'));
    });

    return parseInt(currentTime.join(''), 10);
};

/**
 * gets digit selector string for the given index in the digitselectors array
 * @param digitIndex
 * @returns {string}
 */
FlipClock.prototype.getDigitSelectorByIndex = function(digitIndex) {
    return 'ul.' + this.digitSelectors[digitIndex] + ' li';
};

/**
 * Return the segment group name for a passed digit element
 * @param digitElement
 * @returns {*}
 */
FlipClock.prototype.getFaceSegmentGroupNameByDigitElement = function(digitElement) {
    return digitElement.parent().data('face-segment-group');
};

/**
 * Return the segment group object for a passed digit element
 * @param digitElement
 * @returns {*}
 */
FlipClock.prototype.getFaceSegmentByDigitElement = function(digitElement) {
    return this.options.face[this.getFaceSegmentGroupNameByDigitElement(digitElement)];
};

/**
 * Return segment group dom objects by segment group name
 * @param segmentGroupName
 * @returns {*|jQuery|HTMLElement}
 */
FlipClock.prototype.getFaceSegmentGroupDom = function(segmentGroupName) {
    return $('.' + segmentGroupName, this.options.containerElement)
};

/**
 * Return dom object for the currently active digit for a segment group name
 * @param segmentGroupName
 * @returns {*|jQuery|HTMLElement}
 */
FlipClock.prototype.getCurrentDigitDom = function(segmentGroupName) {
    return $('.' + segmentGroupName + ' li.current', this.options.containerElement)
};

/**
 * Returns the value a segment group is currently representing selected by digit element
 * @param digitElement
 * @returns {string}
 */
FlipClock.prototype.getCurrentFaceSegmentGroupValue = function(digitElement) {
    var segmentGroupName = this.getFaceSegmentGroupNameByDigitElement(digitElement),
        values = [];

    this.getCurrentDigitDom(segmentGroupName).each(function(idx) {
        values[idx] = $(this).data('digit');
    });

    return values.join('');
};

/**
 * handles the tick logic
 * @param digitIndex
 */
FlipClock.prototype.doTick = function(digitIndex) {
    var nextDigit, pseudoSelector;

    // check if we reached maxTime and start over at 00:00:00
    if ( this.options.isCountdown === false && this.isMaxTimeReached() ) {
        this.resetDigits();
        return;
    }

    this.options.containerElement.removeClass('play');

    if ( this.options.isCountdown === true ) {
        pseudoSelector = ":first-child";
    } else {
        pseudoSelector = ":last-child";
    }

    var activeDigit = $(this.getDigitSelectorByIndex(digitIndex) + ".current", this.options.containerElement);

    if (activeDigit.html() == undefined) {
        if (this.options.isCountdown) {
            activeDigit = $(this.getDigitSelectorByIndex(digitIndex) + ":last-child", this.options.containerElement);
            nextDigit = activeDigit.prev("li");
        } else {
            activeDigit = $(this.getDigitSelectorByIndex(digitIndex), this.options.containerElement).eq(0);
            nextDigit = activeDigit.next("li");
        }

        activeDigit.addClass("previous").removeClass("current");

        nextDigit.addClass("current");
    } else if (activeDigit.is(pseudoSelector)) {
        $(this.getDigitSelectorByIndex(digitIndex), this.options.containerElement).removeClass("previous");

        // countdown target reached, halt
        if (this.options.isCountdown === true && this.isMinTimeReached()) {
            this.stop();
            return;
        }

        activeDigit.addClass("previous").removeClass("current");

        if (this.options.isCountdown === true) {
            activeDigit.addClass("countdownFix");
            activeDigit = $(this.getDigitSelectorByIndex(digitIndex) + ":last-child", this.options.containerElement);
        } else {
            activeDigit = $(this.getDigitSelectorByIndex(digitIndex), this.options.containerElement).eq(0);
            activeDigit.addClass("clockFix");
        }

        activeDigit.addClass("current");

        // animate the next segment once (if there is one)
        if (typeof this.digitSelectors[digitIndex + 1] !== "undefined") {
            this.doTick(digitIndex + 1);
        }
    } else {
        $(this.getDigitSelectorByIndex(digitIndex), this.options.containerElement).removeClass("previous");

        activeDigit.addClass("previous").removeClass("current");

        if (this.options.isCountdown === true ) {
            nextDigit = activeDigit.prev("li");
        } else {
            nextDigit = activeDigit.next("li");
        }

        nextDigit.addClass("current");
    }

    // set segment to maxValue if it would move past it
    var group = this.getFaceSegmentByDigitElement(activeDigit);
    if (this.getCurrentFaceSegmentGroupValue(activeDigit) > group.maxValue) {
        this.setFaceSegmentGroupMaxValue(this.getFaceSegmentGroupNameByDigitElement(activeDigit));
    }

    this.options.containerElement.addClass('play');
    this.cleanZIndexFix(activeDigit, this.digitSelectors[digitIndex]);
};

/**
 * isMaxTimeReached
 * @returns {boolean}
 */
FlipClock.prototype.isMaxTimeReached = function() {
    return this.getCurrentTime() >= parseInt(this.options.maxTime.replace(/:/g, ''), 10);
};

/**
 * isMinTimeReached
 * @returns {boolean}
 */
FlipClock.prototype.isMinTimeReached = function() {
    return this.getCurrentTime() <= parseInt(this.options.minTime.replace(/:/g, ''), 10);
};

/**
 * Fixes flickering top half of digit
 *
 * @param activeDigit
 * @param selector
 */
FlipClock.prototype.cleanZIndexFix = function(activeDigit, selector) {
    if (this.options.isCountdown === true) {
        var fix = $('.' + selector + ' .countdownFix', this.options.containerElement);

        if (fix.length > 0 && !fix.hasClass("previous") && !fix.hasClass("current")) {
            fix.removeClass("countdownFix");
        }
    } else {
        activeDigit.siblings().removeClass("clockFix");
    }
};

 jQuery(document).ready(function($) {
    

//   $("a[href$='.jpg'], a[href$='.png']")
//           .addClass("fancybox");
          
           $("a[href$='.jpg'], a[href$='.png']").each(function() {
      $(this).addClass("fancybox");
       $(this).attr('rel', 'gallery');
     
});
 
 $(".fancybox").fancybox({
        padding: [0, 0, 0, 0],
        openEffect: 'elastic',
        openSpeed: 300,
//        closeEffect: 'elastic',
//        scrolling: 'visible',
        maxWidth: 800,
	arrows: true,
        fixed: false,
        autoCenter: false,
     
    });});
	

