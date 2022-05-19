$(document).ready(function() {
	js_gnb ();
});
function js_gnb(){
	var dtxt01 = $(".depth01").text();
	var dtxt02 = $(".depth02").text();
	var dtxt03 = $(".depth03").text();
	var dtxt04 = $("#contents .path strong").text();
	
	var gnb_obj = $(".nav > .gnb ");
		gnb_obj.intervals = "";
		gnb_obj.li = gnb_obj.find(">li"); 
		gnb_obj.li.a = gnb_obj.li.find(">a");
		gnb_obj.li.ul = gnb_obj.li.find(">ul");
		gnb_obj.li.ul.li = gnb_obj.li.ul.find(">li"); 
		gnb_obj.li.ul.li.a = gnb_obj.li.ul.li.find(">a");
		// gnb_obj.h = $("#header_2017 #nav"); 
		// gnb_obj.blind = $("#nav > #blind"); 
		
	//default
	gnb_obj.li.each(function(e){
		$(this).addClass("num"+(e+1));	
	});
	setTimeout(function(){gnb_def();},100);
	
	gnb_obj.mouseenter(function(){
		clearTimeout(gnb_obj.intervals);
	});	
	
	gnb_obj.mouseleave(function(){
		gnb_obj.intervals = setTimeout(function(){
			gnb_def(gnb_obj);
		},300);
	});
		
	gnb_obj.li.a.on("mouseover focus",function(){
		var idx = gnb_obj.li.index($(this).parent());
		gnb_open(idx);
	});
	
	gnb_obj.li.ul.mouseenter(function(){
		gnb_obj.li.find(">a.ov").removeClass("ov");
		$(this).siblings("a").addClass("ov");
		gnb_obj.li.ul.not($(this)).removeClass("ov");
		$(this).addClass("ov");
	});
	
	gnb_obj.li.ul.li.a.on("mouseover focus",function(){
		gnb_obj.li.find(">a.ov").removeClass("ov");
		$(this).parent().parent().siblings("a").addClass("ov");
		gnb_obj.li.find(">ul.ov").removeClass("ov");
		$(this).parent().parent().addClass("ov");
	});	
	
	gnb_obj.li.eq(5).find(">ul>li").last().find(">a").on("focusout",function(){
		gnb_obj.intervals = setTimeout(function(){
			gnb_def(gnb_obj);
		},300);
	});
	
	function gnb_def(){
		gnb_obj.li.find("a").removeClass("ov");
		if(dtxt01.length!=0){
			gnb_obj.li.a.removeClass("ov");
			gnb_obj.li.a.each(function(){
				var dt = $(this).text();
				if(dt==dtxt01){
					$(this).addClass("ov");
				}
			});
			if(dtxt02.length!=0){
				gnb_obj.li.ul.li.a.find(">strong").each(function(){
					var dt = $(this).text();
					if(dt==dtxt02){
						$(this).parent("a").addClass("ov");
					}
				});
			}
		}
		gnb_obj.li.ul.stop().animate({"opacity":0},150,function(){$(this).hide();});
		gnb_obj.h.stop().animate({"height":gnb_obj.li.a.height()+"px"},300);
	}
	
	function gnb_open(idx){
		gnb_obj.li.find(">a").removeClass("ov");
		gnb_obj.li.eq(idx).find(">a").addClass("ov");
		gnb_obj.li.find(">ul").removeClass("ov");
		gnb_obj.li.eq(idx).find(">ul").addClass("ov");
		
		gnb_obj.maxH = 0;
		for(var i=0; i<gnb_obj.li.size(); i++){
			gnb_obj.maxH = Math.max(gnb_obj.maxH,gnb_obj.li.eq(i).find(">ul").removeAttr("style").innerHeight());
		}
		gnb_obj.li.ul.height(gnb_obj.maxH).show().stop().animate({"opacity":1},300);
		gnb_obj.maxH = gnb_obj.maxH + gnb_obj.li.a.height();
		gnb_obj.h.stop().animate({"height":gnb_obj.maxH+"px"},300);
		gnb_obj.blind.stop().animate({"height":100+"%"},300);
	}
	
	$(".gnb").clone(false).appendTo($(".site_link2 .sitemap_list"));
	$(".site_other >li").clone(false).appendTo($(".site_link2 .sitemap_list >.group"));	