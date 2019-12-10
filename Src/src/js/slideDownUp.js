(function ($) {
    $.fn.slideDown = function (duration) {
        // show element if it is hidden (it is needed if display is none)
        this.show();

        // get naturally height
        var height = this.height();

        // set initial css for animation
        this.css({
            height: 0
        });

        // animate to gotten height
        this.animate({
            height: height
        }, duration);
    };

    $.fn.slideUp = function (duration) {
        // keep pointer to restore hidden height later
        var target = this;

        // get natural height
        var height = this.height();

        // set initial css for animation
        this.css({
            height: height
        });

        // animate to gotten height
        this.animate({
            height: 0
        },
        duration,
            '',

        function () {    // callback to 'reset' the height for the next slideDown event
            target.css({
                display: 'none',
                height: ''    
            });
        });
    };
})(Zepto);