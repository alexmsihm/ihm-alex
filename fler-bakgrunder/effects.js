(() => {
  const canvas = document.querySelector('.network-canvas');
  const ctx = canvas.getContext('2d');
  const select = document.querySelector('#background-choice');
  const description = document.querySelector('#effect-description');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const descriptions = {
    rays:'Mjuka blå ljusstrålar sveper långsamt över sidan.',
    stars:'Tre lager av stjärnor ger olika hastighet och djup.',
    topography:'Höjdkurvor böjer sig som ett levande landskap.',
    trails:'Små ljussignaler färdas längs tunna digitala spår.',
    ribbon:'Ett genomskinligt blått band veckar sig som siden.',
    grid:'Ett lugnt rutnät där korsningarna lyser upp i följd.',
    ripples:'Ringar växer och tonar bort. Prova att röra pekaren eller trycka på sidan.',
    glass:'Genomskinliga glasformer svävar med mjuka ljuskanter.'
  };
  let w=0,h=0,frame=null,last=0,time=0,resizeFrame=null;
  let rings=[];
  let lastRing=-10;
  const seeds=Array.from({length:100},(_,i)=>({x:((i*0.61803398875+.13)%1),y:((i*.41421356237+.27)%1),size:.6+(i%5)*.35,phase:i*1.73}));
  const dark=()=>document.body.classList.contains('morkt');
  const color=(alpha,light=false)=>`rgba(${light?(dark()?'189,227,255':'255,255,255'):(dark()?'111,168,233':'46,109,180')},${alpha})`;
  function stroke(alpha,width=1){ctx.strokeStyle=color(alpha);ctx.lineWidth=width;}
  function fit(){
    const v=visualViewport;
    const zoom=v?.scale||1;
    const width=v?.width||innerWidth,height=v?.height||innerHeight;
    const back=canvas.parentElement;
    back.style.width=`${width}px`;back.style.height=`${height}px`;
    back.style.transform=`translate(${v?.offsetLeft||0}px,${v?.offsetTop||0}px)`;
    w=width*zoom;h=height*zoom;
    const dpr=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);draw();
  }
  function rays(){
    ctx.save();ctx.translate(w*.5,h*.5);
    for(let i=0;i<5;i++){
      ctx.save();ctx.rotate(-.45+Math.sin(time*.11+i)*.18);
      const x=(i-2)*w*.3+Math.sin(time*.15+i)*w*.08;
      const g=ctx.createLinearGradient(x-w*.11,0,x+w*.11,0);
      g.addColorStop(0,color(0));g.addColorStop(.48,color(dark()?.16:.12));g.addColorStop(.55,color(dark()?.22:.18,true));g.addColorStop(1,color(0));
      ctx.fillStyle=g;ctx.fillRect(x-w*.11,-h*1.5,w*.22,h*3);ctx.restore();
    }ctx.restore();
  }
  function stars(){
    for(let i=0;i<seeds.length;i++){
      const s=seeds[i],layer=i%3+1;
      const x=(s.x*w+time*layer*1.9)%(w+10)-5;
      const y=(s.y*h+Math.sin(time*.08+s.phase)*layer*6+h)%h;
      const a=(.3+.2*Math.sin(time*.7+s.phase))*(dark()?1:.8);
      ctx.fillStyle=color(a,true);if(!dark())ctx.fillStyle=color(a);
      ctx.shadowColor=dark()?'#8bc6ff':'#6a9fd0';ctx.shadowBlur=layer===3?7:0;
      ctx.beginPath();ctx.arc(x,y,s.size*layer*.4,0,Math.PI*2);ctx.fill();
      if(i%19===0){stroke(a*.8);ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);ctx.stroke();}
    }ctx.shadowBlur=0;
  }
  function topography(){
    const count=w<600?18:25;
    for(let i=0;i<count;i++){
      stroke(i%5===0?.24:.12,i%5===0?1.4:.8);ctx.beginPath();
      for(let x=-30;x<=w+30;x+=12){
        const y=(i/(count-1))*h+Math.sin(x/w*6.5+time*.13+i*.12)*h*.10+Math.sin(x/w*12-time*.09+i*.22)*h*.035;
        if(x===-30)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }ctx.stroke();
    }
  }
  function trails(){
    for(let i=0;i<12;i++){
      const s=seeds[i],y=s.y*h;
      stroke(.055);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w*.35,y);ctx.lineTo(w*.45,y+35);ctx.lineTo(w,y+35);ctx.stroke();
      const x=((time*(14+i*1.6)+s.x*w)%(w+180))-90;
      const g=ctx.createLinearGradient(x-85,0,x+5,0);g.addColorStop(0,color(0));g.addColorStop(1,color(.5));
      ctx.strokeStyle=g;ctx.lineWidth=1.4;ctx.beginPath();
      const pathY=pos=>pos<w*.35?y:pos<w*.45?y+(pos-w*.35)/(w*.1)*35:y+35;
      for(let p=x-85;p<=x;p+=5){if(p===x-85)ctx.moveTo(p,pathY(p));else ctx.lineTo(p,pathY(p));}ctx.stroke();
      ctx.fillStyle=color(.8,true);ctx.beginPath();ctx.arc(x,pathY(x),2,0,Math.PI*2);ctx.fill();
    }
  }
  function ribbon(){
    for(let i=0;i<28;i++){
      const p=i/27;
      ctx.strokeStyle=`rgba(${dark()?'109,157,229':'91,147,210'},${.025+Math.sin(p*Math.PI)*.065})`;
      ctx.lineWidth=5;ctx.beginPath();
      for(let x=-20;x<=w+20;x+=10){const y=h*.48+Math.sin(x/w*5.5+time*.17)*h*.17+Math.cos(x/w*9-time*.12)*40+(p-.5)*(80+Math.sin(x/w*7+time*.2)*65);if(x===-20)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
    }
  }
  function grid(){
    const gap=w<600?52:68;stroke(.08,.7);ctx.beginPath();
    for(let x=20;x<w;x+=gap){ctx.moveTo(x,0);ctx.lineTo(x,h);}for(let y=20;y<h;y+=gap){ctx.moveTo(0,y);ctx.lineTo(w,y);}ctx.stroke();
    for(let x=20;x<w;x+=gap)for(let y=20;y<h;y+=gap){const pulse=Math.max(0,Math.sin(time*.6-x*.009-y*.012))**10;if(pulse<.04)continue;
      const g=ctx.createRadialGradient(x,y,0,x,y,14);g.addColorStop(0,color(pulse*.38));g.addColorStop(1,color(0));ctx.fillStyle=g;ctx.fillRect(x-14,y-14,28,28);
      ctx.fillStyle=color(pulse*.65);ctx.beginPath();ctx.arc(x,y,1.8,0,Math.PI*2);ctx.fill();
    }
  }
  function ripples(){
    if(!reduced.matches&&time-lastRing>2.8){const s=seeds[Math.floor(time/2.8)%seeds.length];rings.push({x:s.x*w,y:s.y*h,start:time});lastRing=time;}
    if(reduced.matches&&rings.length===0)rings.push({x:w*.7,y:h*.35,start:time-2});
    rings=rings.filter(r=>time-r.start<7);
    for(const r of rings){const age=time-r.start;
      for(let i=0;i<3;i++){const radius=age*25-i*16;if(radius<2)continue;stroke((1-age/7)*(.23-i*.045),1.2);ctx.beginPath();ctx.ellipse(r.x,r.y,radius,radius*.65,0,0,Math.PI*2);ctx.stroke();}
    }
  }
  function glass(){
    const count=w<600?4:6;
    for(let i=0;i<count;i++){
      const s=seeds[i*7],x=s.x*w+Math.sin(time*.11+i)*25,y=s.y*h+Math.cos(time*.13+i)*30,r=40+(i%3)*24;
      const g=ctx.createRadialGradient(x-r*.4,y-r*.5,0,x,y,r);g.addColorStop(0,color(.12,true));g.addColorStop(.65,color(.025));g.addColorStop(1,color(.09));
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=color(.27,true);if(!dark())ctx.strokeStyle=color(.23);ctx.lineWidth=1;ctx.stroke();
      ctx.strokeStyle=color(.42,true);ctx.beginPath();ctx.arc(x,y,r-4,Math.PI*1.1,Math.PI*1.65);ctx.stroke();
    }
  }
  const renderers={rays,stars,topography,trails,ribbon,grid,ripples,glass};
  function draw(){ctx.clearRect(0,0,w,h);renderers[select.value]();}
  function tick(now){frame=null;if(document.hidden||reduced.matches)return;if(!last||now-last>=1000/30){time+=last?Math.min((now-last)/1000,.1):0;last=now;draw();}frame=requestAnimationFrame(tick);}
  function restart(){if(frame!==null)cancelAnimationFrame(frame);frame=null;last=0;draw();if(!document.hidden&&!reduced.matches)frame=requestAnimationFrame(tick);}
  function choose(){time=0;rings=[];lastRing=-10;description.textContent=descriptions[select.value];restart();}
  select.addEventListener('change',choose);
  document.addEventListener('visibilitychange',restart);reduced.addEventListener('change',restart);
  new MutationObserver(draw).observe(document.body,{attributes:true,attributeFilter:['class']});
  function resize(){if(resizeFrame!==null)return;resizeFrame=requestAnimationFrame(()=>{resizeFrame=null;fit();});}
  window.addEventListener('resize',resize,{passive:true});visualViewport?.addEventListener('resize',resize,{passive:true});visualViewport?.addEventListener('scroll',resize,{passive:true});
  function addRing(event){if(select.value!=='ripples'||reduced.matches||time-lastRing<.24||event.target.closest('.preview-controls'))return;const rect=canvas.getBoundingClientRect();rings.push({x:(event.clientX-rect.left)/rect.width*w,y:(event.clientY-rect.top)/rect.height*h,start:time});if(rings.length>14)rings.shift();lastRing=time;}
  window.addEventListener('pointermove',addRing,{passive:true});window.addEventListener('pointerdown',addRing,{passive:true});
  fit();choose();
})();
