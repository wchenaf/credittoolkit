$(document).ready(function(){
    $(".YTW_slider").ionRangeSlider({
        min: 0,
        max: 20,
        step: 0.1,
        type: 'double',
        prefix: "",
        postfix: " %",
        max_postfix: "+",
        prettify_enabled: true,
        grid: true
    });

    $(".TENOR_slider").ionRangeSlider({
        min: 0,
        max: 30,
        step: 0.1,
        type: 'double',
        prefix: "",
        postfix: " years",
        max_postfix: "+",
        prettify_enabled: true,
        grid: true
    });

    $(".RATING_slider").ionRangeSlider({
        prettify_enabled: true,
        type: 'double',
        grid: true,
        from: 0,
        to: 17,
        values: ["AAA", "AA+", "AA", "AA-", "A+", "A", "A-", "BBB+", "BBB", "BBB-", "BB+", "BB", "BB-", "B+", "B", "B-", "CCC", "C"]
    });

});