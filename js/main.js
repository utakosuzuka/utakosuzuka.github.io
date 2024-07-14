$(window).on('load',function() {

    $("#splash").delay(1500).fadeOut('slow', function() {
        $("#mv").addClass("is-on");
    });
    $("#splash_logo").delay(1200).fadeOut('slow');

    var debug = false;
    if(debug){
        var result = prompt("パスワードを入力してください");
        if(result == '801'){
            $("#TOP").addClass("is-on");
        }else {
            $('body').remove();
        }
    }else {
        $("#TOP").addClass("is-on");
    }

	$('a[href^="#"]').on("click", function() {

		var speed = 400;// ミリ秒
		var href= $(this).attr("href");
		var target = $(href == "#" || href == "" ? 'html' : href);
		var position = target.offset().top;

        if(href != "#TOP" && position == 0){
            return false;
        }
		// スクロール調整
		if($('body,html').scrollTop() > 800 && position == 0){
			$('body,html').scrollTop(position-800);
		}
		// スムーススクロール easeOutExpo
		$('body,html').animate({scrollTop:position}, speed, 'swing');
		return false;
	});

    $('.menu').on("click", function() {
        $('#spWraper').slideDown();
        $('#spWraper .nav').addClass("is-on");
        $('#spWraper .close').addClass("is-on");
    });
    $('.close').on("click", function() {
        $('#spWraper').slideUp(function(){
            $('#spWraper .nav').removeClass("is-on");
            $('#spWraper .close').removeClass("is-on");
        });
    });
    if ($(window).width() <= 768) {
        $('#header a').on("click", function() {
            $('#spWraper').hide();
            $('#spWraper .nav').removeClass("is-on");
            $('#spWraper .close').removeClass("is-on");
        });
    }

});