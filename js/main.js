(function(){
  // mobile nav
  var toggle=document.getElementById('navToggle'),gnb=document.getElementById('gnb');
  toggle.addEventListener('click',function(){
    var open=gnb.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded',open);
    toggle.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');
  });
  gnb.addEventListener('click',function(e){ if(e.target.tagName==='A'){gnb.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');} });

  // active nav by section
  var links=[].slice.call(gnb.querySelectorAll('a'));
  var sections=links.map(function(a){return document.querySelector(a.getAttribute('href'));}).filter(Boolean);
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          links.forEach(function(a){a.classList.toggle('is-active',a.getAttribute('href')==='#'+en.target.id);});
        }
      });
    },{rootMargin:'-40% 0px -55% 0px'});
    sections.forEach(function(s){io.observe(s);});

    // reveal (resting state is fully visible; only a small slide)
    var ro=new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){en.target.classList.add('in');ro.unobserve(en.target);} });
    },{threshold:.15});
    document.querySelectorAll('.reveal').forEach(function(el){ro.observe(el);});
  }else{
    document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in');});
  }

  // dialogs
  document.querySelectorAll('[data-open]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var d=document.getElementById(btn.getAttribute('data-open'));
      if(d&&typeof d.showModal==='function'){d.showModal();}
    });
  });
  document.querySelectorAll('dialog.sheet').forEach(function(d){
    d.querySelector('[data-close]').addEventListener('click',function(){d.close();});
    d.addEventListener('click',function(e){ if(e.target===d) d.close(); });
  });

  // copy email
  document.querySelectorAll('.copy').forEach(function(b){
    b.addEventListener('click',function(){
      var el=document.querySelector(b.getAttribute('data-copy')),text=el.textContent.trim();
      var done=function(){b.textContent='복사됨';setTimeout(function(){b.textContent='복사';},1500);};
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(done,function(){selectText(el);});
      }else{selectText(el);}
    });
  });
  function selectText(el){var r=document.createRange();r.selectNodeContents(el);var s=window.getSelection();s.removeAllRanges();s.addRange(r);}

  // to top
  var top=document.getElementById('toTop');
  window.addEventListener('scroll',function(){top.classList.toggle('is-visible',window.scrollY>600);},{passive:true});
  top.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
})();
