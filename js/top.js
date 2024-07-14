$(window).on('load',function() {

    var hashString = location.hash.substr(1); // remove '#'
    history.replaceState('', document.title, window.location.pathname);

    const profile = $('#profile');
    const glossary = $('#glossary');
    const utakoswitch = $('#switch');
    const activities = $('#activities');
    const fanart = $('#fanart');

    var windowHeight = $(window).height();
    var pos1 = Math.ceil(profile.offset().top);
    var pos2 = Math.ceil(glossary.offset().top);
    var pos3 = Math.ceil(utakoswitch.offset().top);
    var pos4 = Math.ceil(activities.offset().top);
    var pos5 = Math.ceil(fanart.offset().top);

    var scn = $(window).scrollTop();

    if(scn >= pos5){
    }else if(scn <= pos1){
    }else if(scn >= pos4 - windowHeight - 1000){
        $("#bgfix").addClass("v4");
    }else if(scn >= pos3 - windowHeight - 1000){
        $("#bgfix").addClass("v3");
    }else if(scn >= pos2 - windowHeight - 1000){
        $("#bgfix").addClass("v2");
    }else if(scn >= pos1 - windowHeight){
        $("#bgfix").addClass("v1");
    }

// 画面をスクロールをしたら動かしたい場合の記述
$(window).scroll(function (){
    fadeAnime();/* アニメーション用の関数を呼ぶ*/

    if (Math.ceil($(this).scrollTop()) >= pos5) {
        $("#bgfix").removeClass("v4");
        $("#bgfix").removeClass("v3");
        $("#bgfix").removeClass("v2");
        $("#bgfix").removeClass("v1");
    } else if (Math.ceil($(this).scrollTop()) >= pos4 - windowHeight - 1000) {
        $("#bgfix").addClass("v4");
        $("#bgfix").removeClass("v3");
    } else if(Math.ceil($(this).scrollTop()) >= pos3 - windowHeight - 1000){
        $("#bgfix").removeClass("v4");
        $("#bgfix").addClass("v3");
        $("#bgfix").removeClass("v2");
    } else if(Math.ceil($(this).scrollTop()) >= pos2 - windowHeight - 1000){
        $("#bgfix").removeClass("v3");
        $("#bgfix").addClass("v2");
        $("#bgfix").removeClass("v1");
    } else if(Math.ceil($(this).scrollTop()) >= pos1 - windowHeight){
        $("#bgfix").addClass("v1");
        $("#bgfix").removeClass("v2");
    }
    if(Math.ceil($(this).scrollTop()) <= pos1){
            $("#bgfix").removeClass("v1");
    }
/*
    if (Math.ceil($(this).scrollTop()) >= pos1 - windowHeight) {
        $("#bgfix").addClass("v1");
        $("#bgfix").removeClass("v2");
    } else {
        $("#bgfix").removeClass("v1");
    }
    if (Math.ceil($(this).scrollTop()) >= pos2 - windowHeight - 1000) {
        $("#bgfix").addClass("v1");
        $("#bgfix").removeClass("v2");
    } else {
        $("#bgfix").removeClass("v1");
    }*/
/*
    if (Math.ceil($(this).scrollTop()) >= pos2 - windowHeight - 1000) {
        $("#bgfix").addClass("v2");
        $("#bgfix").removeClass("v1");
    } else {
        $("#bgfix").removeClass("v2");
    }

    if (Math.ceil($(this).scrollTop()) >= pos2) {
        $("#bgfix").removeClass("v1");
        $("#bgfix").removeClass("v2");
    }
*/
})

function fadeAnime(){

$('#history .event').each(function(){
    var elemPos = $(this).offset().top - 20;//要素より上
    var scroll = $(window).scrollTop();
    var windowHeight = $(window).height();
    if (scroll >= elemPos - windowHeight){
        $(this).addClass('is-on');
    }
});

$('#glossary .list dl').each(function(){
    var elemPos = $(this).offset().top - 20;//要素より上
    var scroll = $(window).scrollTop();
    var windowHeight = $(window).height();
    if (scroll >= elemPos - windowHeight){
        $(this).addClass('is-on');
    }
});

$('#message .box li').each(function(){
    var elemPos = $(this).offset().top - 20;//要素より上
    var scroll = $(window).scrollTop();
    var windowHeight = $(window).height();
    if (scroll >= elemPos - windowHeight){
        $(this).addClass('is-on');
    }
});

$('.openModal').on("click", function() {
	$('#modalArea').fadeIn(150);
	$('#js-art').attr("src",$(this).find("img").attr("src"));
});
$('#closeModal , #modalBg').on("click", function() {
	$('#modalArea').fadeOut(150);
});
$(".gallery").modaal({
	type: 'image',
	overlay_close:true, //モーダル背景クリック時に閉じるか
});
$('.modaal-btn').modaal({
	overlay_close:true, //モーダル背景クリック時に閉じるか
});


}//
});