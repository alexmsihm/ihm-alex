(() => {
const canvas = document.querySelector('.network-canvas');
const context = canvas.getContext('2d');
const still = matchMedia('(prefers-reduced-motion: reduce)');
let animationId = null;
let viewWidth = 0;
let viewHeight = 0;
let points = [];
let lastTime = null;
function fitDemo() {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  viewWidth = innerWidth;
  viewHeight = innerHeight;
  canvas.width = Math.round(viewWidth * ratio);
  canvas.height = Math.round(viewHeight * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  points = Array.from({length: viewWidth < 600 ? 28 : 52}, () => ({x: Math.random()*viewWidth, y: Math.random()*viewHeight, vx:(Math.random()-.5)*15, vy:(Math.random()-.5)*12, radius:1.5+Math.random()*2}));
  renderDemo(0);
}
function renderDemo(delta) {
  context.clearRect(0,0,viewWidth,viewHeight);
  const dark = document.body.classList.contains('morkt');
  const network = true;
  for (const point of points) {
    point.x = (point.x + point.vx*delta + viewWidth) % viewWidth;
    point.y = (point.y + point.vy*delta + viewHeight) % viewHeight;
  }
  if (network) {
    for (let i=0;i<points.length;i++) for (let j=i+1;j<points.length;j++) {
      const a=points[i], b=points[j], distance=Math.hypot(a.x-b.x,a.y-b.y);
      if (distance < 155) {
        context.strokeStyle = `rgba(${dark?'133,190,244':'49,111,174'},${(1-distance/155)*(dark?.28:.23)})`;
        context.lineWidth=1;
        context.beginPath();context.moveTo(a.x,a.y);context.lineTo(b.x,b.y);context.stroke();
      }
    }
  }
  for (const point of points) {
    context.fillStyle = dark ? 'rgba(180,218,255,.65)' : 'rgba(72,132,195,.48)';
    context.shadowColor=dark?'#91caff':'#9bcaff';
    context.shadowBlur=network?0:9;
    context.beginPath();context.arc(point.x,point.y,network?2:point.radius,0,Math.PI*2);context.fill();
  }
  context.shadowBlur=0;
}
function animateDemo(now) {
  animationId=null;
  const delta=lastTime===null?0:Math.min((now-lastTime)/1000,.05);
  lastTime=now;
  renderDemo(delta);
  if (!document.hidden && !still.matches) animationId=requestAnimationFrame(animateDemo);
}
function chooseDemo() {
  if (animationId!==null) cancelAnimationFrame(animationId);
  animationId=null;lastTime=null;
  renderDemo(0);
  if (!document.hidden && !still.matches) animationId=requestAnimationFrame(animateDemo);
}
still.addEventListener('change',chooseDemo);
document.addEventListener('visibilitychange',chooseDemo);
new MutationObserver(()=>renderDemo(0)).observe(document.body,{attributes:true,attributeFilter:['class']});
window.addEventListener('resize',fitDemo,{passive:true});
fitDemo();chooseDemo();

})();
