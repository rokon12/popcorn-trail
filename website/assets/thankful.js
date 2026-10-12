'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const total = 30;
  let language = new URLSearchParams(location.search).get('lang') === 'bn' ? 'bn' : 'en';
  let flip = null, current = 0, sound = true, audio = null, buildId = 0, resizeTimer, lastSize = '', pageImages = [];
  const labels = {
    en: {home:'← Home', pages:'All pages', previous:'Previous page', next:'Next page', full:'Fullscreen', close:'Close', soundOn:'Turn sound on', soundOff:'Turn sound off', pdf:'Download English PDF', title:'One Thankful Word: An Alhamdulillah Story', opening:'Opening your book…', page:'Page'},
    bn: {home:'← শুরু', pages:'সব পাতা', previous:'আগের পাতা', next:'পরের পাতা', full:'পূর্ণ পর্দা', close:'বন্ধ করো', soundOn:'শব্দ চালু করো', soundOff:'শব্দ বন্ধ করো', pdf:'বাংলা PDF ডাউনলোড', title:'শোকরের কথা: আলহামদুলিল্লাহর গল্প', opening:'বই খুলছে…', page:'পাতা'}
  };
  const digits = n => language === 'bn' ? String(n).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]) : String(n);
  const pageURL = (i,lang=language) => `books/one-thankful-word/${lang}/page-${String(i+1).padStart(2,'0')}.webp`;
  function label(id,text){$(id).title=text;$(id).setAttribute('aria-label',text);}
  function loadNearby(index){
    for(let i=Math.max(0,index-2);i<=Math.min(total-1,index+3);i++){
      const img=pageImages[i];if(img&&!img.getAttribute('src'))img.src=img.dataset.src;
    }
  }
  function localize(){
    const t=labels[language];
    document.documentElement.lang=language;
    document.title=t.title+' | Story Time';
    $('book-title').textContent=t.title;
    $('home').textContent=t.home;
    $('english').setAttribute('aria-pressed',String(language==='en'));
    $('bangla').setAttribute('aria-pressed',String(language==='bn'));
    ['pages','previous','next','fullscreen','close-thumbnails'].forEach((id,i)=>label(id,[t.pages,t.previous,t.next,t.full,t.close][i]));
    $('thumbnails-title').textContent=t.pages;
    $('loading').textContent=t.opening;
    $('download').href=`pdf/One-Thankful-Word-${language}.pdf`;
    label('download',t.pdf);
    label('sound',sound?t.soundOff:t.soundOn);
    $('sound').setAttribute('aria-pressed',String(sound));
    $('sound-waves').setAttribute('d',sound?'M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12':'M17 9l5 6M22 9l-5 6');
  }
  function center(){
    if(!flip)return;
    let shift=0;
    if(flip.getOrientation()==='landscape'){
      const half=flip.getBoundsRect().pageWidth/2;
      if(current===0)shift=-half;
      else if(current===total-1)shift=half;
    }
    $('book-frame').style.transform=`translateX(${shift}px)`;
  }
  function update(){
    current=flip?flip.getCurrentPageIndex():current;
    const spread=flip&&flip.getOrientation()==='landscape'&&current>0&&current<total-1;
    const first=spread?(current%2===1?current:current-1):current;
    const last=spread?Math.min(first+1,total-1):first;
    const number=first===last?digits(first+1):digits(first+1)+'–'+digits(last+1);
    $('page-label').textContent=number+(language==='bn'?' / ':' of ')+digits(total);
    $('previous').disabled=current===0;
    $('next').disabled=current>=total-1;
    $('page-text').textContent=(window.THANKFUL_TEXT[language]||[]).slice(first,last+1).join('\n\n');
    loadNearby(current);center();
  }
  function swish(){
    if(!sound)return;
    try{
      audio ||= new (window.AudioContext||window.webkitAudioContext)();
      if(audio.state==='suspended')audio.resume().catch(()=>{});
      const duration=.32, buffer=audio.createBuffer(1,Math.floor(audio.sampleRate*duration),audio.sampleRate), data=buffer.getChannelData(0);
      for(let i=0;i<data.length;i++){const t=i/data.length;data[i]=(Math.random()*2-1)*Math.sin(Math.PI*t)*(1-t);}
      const source=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain();
      source.buffer=buffer;filter.type='bandpass';filter.frequency.value=1600;gain.gain.value=.16;
      source.connect(filter).connect(gain).connect(audio.destination);source.start();
    }catch{}
  }
  async function build(start=current){
    const token=++buildId;
    $('loading').hidden=false;
    $('load-error').hidden=true;
    if(flip){flip.destroy();flip=null;}
    const frame=$('book-frame');
    frame.style.transform='none';
    frame.replaceChildren();
    const book=document.createElement('div');book.id='book';frame.append(book);
    const stage=$('stage'),style=getComputedStyle(stage);
    const availableWidth=stage.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
    const availableHeight=stage.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
    const portrait=availableWidth<620;
    const width=Math.max(1,Math.floor(Math.min(840,availableWidth/(portrait?1:2),availableHeight*.8)));
    const height=Math.round(width*1.25);
    frame.style.width=(width*(portrait?1:2))+'px';
    frame.style.height=height+'px';
    lastSize=stage.clientWidth+'x'+stage.clientHeight;
    const images=[];pageImages=images;
    for(let i=0;i<total;i++){
      const page=document.createElement('div');page.className='book-page';
      if(i===0||i===total-1)page.dataset.density='hard';
      const img=new Image();img.dataset.src=pageURL(i);img.width=1440;img.height=1800;
      img.alt=labels[language].page+' '+digits(i+1);img.draggable=false;
      img.addEventListener('error',()=>{if(token===buildId)$('load-error').hidden=false;});
      page.append(img);book.append(page);images.push(img);
    }
    loadNearby(start);
    try{await images[start].decode();}catch{}
    if(token!==buildId)return;
    if(!window.St){$('loading').textContent='The reader could not load. Use the PDF download above.';return;}
    flip=new St.PageFlip(book,{width,height,size:'fixed',showCover:true,usePortrait:true,startPage:start,maxShadowOpacity:.4,mobileScrollSupport:false,flippingTime:matchMedia('(prefers-reduced-motion: reduce)').matches?1:750,drawShadow:true});
    flip.loadFromHTML(book.querySelectorAll('.book-page'));
    flip.on('flip',update);flip.on('changeOrientation',update);
    flip.on('changeState',e=>{if(e.data==='flipping')swish();});
    $('loading').hidden=true;update();
  }
  function setLanguage(next){
    if(next===language)return;
    language=next;
    const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);
    localize();build(current);
  }
  function thumbnails(){
    const grid=$('thumbnail-grid');grid.replaceChildren();
    for(let i=0;i<total;i++){
      const button=document.createElement('button');button.type='button';
      button.setAttribute('aria-label',labels[language].page+' '+digits(i+1));
      if(i===current)button.setAttribute('aria-current','page');
      const image=new Image();image.src=pageURL(i).replace('/page-','/thumb-');image.alt='';image.loading='lazy';image.width=256;image.height=320;
      const number=document.createElement('span');number.textContent=digits(i+1);
      button.append(image,number);button.addEventListener('click',()=>{loadNearby(i);flip?.turnToPage(i);update();$('thumbnails').close();});grid.append(button);
    }
    $('thumbnails').showModal();
  }
  $('english').addEventListener('click',()=>setLanguage('en'));
  $('bangla').addEventListener('click',()=>setLanguage('bn'));
  $('previous').addEventListener('click',()=>flip?.flipPrev());
  $('next').addEventListener('click',()=>flip?.flipNext());
  $('pages').addEventListener('click',thumbnails);
  $('close-thumbnails').addEventListener('click',()=>$('thumbnails').close());
  $('thumbnails').addEventListener('click',event=>{if(event.target===$('thumbnails')){const b=event.target.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)event.target.close();}});
  $('sound').addEventListener('click',()=>{sound=!sound;localize();});
  $('fullscreen').hidden=!document.fullscreenEnabled;
  $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{}});
  document.addEventListener('keydown',event=>{
    if($('thumbnails').open||event.altKey||event.ctrlKey||event.metaKey||event.target.matches('input,select,textarea'))return;
    if(event.key==='ArrowRight'){event.preventDefault();flip?.flipNext();}
    if(event.key==='ArrowLeft'){event.preventDefault();flip?.flipPrev();}
  });
  new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{const s=$('stage');if(lastSize!==s.clientWidth+'x'+s.clientHeight)build(current);},120);}).observe($('stage'));
  localize();build(0);
})();
