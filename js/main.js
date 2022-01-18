$(function(){
  $(".web .page1").mouseenter(function(){
    $(".title > h4").text("궁디팡팡 캣페스타");
    $(".title > p").text("적응형 홈페이지 | Html CSS | 3일");
    $(".title > p").show();
  });
  $(".web .page2").mouseenter(function(){
    $(".title > h4").text("A'ddict");
    $(".title > p").text("적응형 홈페이지 | Html CSS | 2일");
    $(".title > p").show();
  });
  $(".web .page3").mouseenter(function(){
    $(".title > h4").text("NAVER CLOVER");
    $(".title > p").text("적응형 홈페이지 | Html CSS | 3일");
    $(".title > p").show();
  });
  $(".web .page4").mouseenter(function(){
    $(".title > h4").text("당신을 듣다");
    $(".title > p").text("적응형 홈페이지 | Html CSS | 3일");
    $(".title > p").show();
  });
  $(".web .Typo").mouseleave(function(){
    $(".title > h4").text("이미지에 마우스를 올려보세요!");
    $(".title > p").hide();
  });

  $(".Typo").hover(function(){
    $(this).children().eq(0).children().eq(1).show();
  }, function(){
    $(this).children().eq(0).children().eq(1).hide();
  });
 
  $('.update').bxSlider({
    auto: true,
    autoControls: false,
    stopAutoOnClick: false,
    pager: false,
    speed: 100,
    slideWidth: 800,
    autoHover: false,
    captions: true,
    loop: true
  });

  $(window).scroll(function(){
    var height= $(document).scrollTop();
    //console.log(height);
    if(height > 500) {
      $(".topMenu").show();
    } else {
      $(".topMenu").hide();
    }
  });
});