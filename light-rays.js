(() => {
  const canvas = document.querySelector('.network-canvas');
  const intro = document.querySelector('.intro');
  const ctx = canvas?.getContext('2d');
  if (!ctx || !intro) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width=0,height=0,time=0,last=0,frame=null,resizeFrame=null,visible=true;
  function draw() {
    ctx.clearRect(0,0,width,height);
    const dark=document.body.classList.contains('morkt');
    const color=(alpha,light=false)=>`rgba(${light?(dark?'189,227,255':'255,255,255'):(dark?'111,168,233':'46,109,180')},${alpha})`;
    ctx.save();ctx.translate(width*.5,height*.5);
    for(let i=0;i<5;i++) {
      ctx.save();ctx.rotate(-.45+Math.sin(time*.11+i)*.18);
      const x=(i-2)*width*.3+Math.sin(time*.15+i)*width*.08;
      const gradient=ctx.createLinearGradient(x-width*.11,0,x+width*.11,0);
      gradient.addColorStop(0,color(0));
      gradient.addColorStop(.48,color(dark?.10:.08));
      gradient.addColorStop(.55,color(dark?.16:.13,true));
      gradient.addColorStop(1,color(0));
      ctx.fillStyle=gradient;ctx.fillRect(x-width*.11,-height*1.5,width*.22,height*3);
      ctx.restore();
    }
    ctx.restore();
  }
  function fit() {
    const bounds=canvas.parentElement.getBoundingClientRect();
    width=bounds.width;height=bounds.height;
    const ratio=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);draw();
  }
  function resize() {
    if(resizeFrame!==null)return;
    resizeFrame=requestAnimationFrame(()=>{resizeFrame=null;fit();});
  }
  function tick(now) {
    frame=null;
    if(document.hidden||reduced.matches||!visible)return;
    if(!last||now-last>=1000/30) {
      time+=last?Math.min((now-last)/1000,.1):0;last=now;draw();
    }
    frame=requestAnimationFrame(tick);
  }
  function restart() {
    if(frame!==null)cancelAnimationFrame(frame);
    frame=null;last=0;draw();
    if(!document.hidden&&!reduced.matches&&visible)frame=requestAnimationFrame(tick);
  }
  document.addEventListener('visibilitychange',restart);
  reduced.addEventListener('change',restart);
  new MutationObserver(draw).observe(document.body,{attributes:true,attributeFilter:['class']});
  new ResizeObserver(resize).observe(canvas.parentElement);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;restart();}).observe(intro);
  window.addEventListener('resize',resize,{passive:true});
  window.visualViewport?.addEventListener('resize',resize,{passive:true});
  window.visualViewport?.addEventListener('scroll',resize,{passive:true});
  function watchDensity() {
    matchMedia(`(resolution: ${devicePixelRatio}dppx)`).addEventListener('change',()=>{resize();watchDensity();},{once:true});
  }
  watchDensity();fit();restart();
})();
