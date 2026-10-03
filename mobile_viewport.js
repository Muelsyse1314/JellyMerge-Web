/* Touch/mobile Web only; desktop canvas policy is unchanged. */
(() => {
  const mobile = navigator.userAgentData?.mobile === true ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 0 && matchMedia('(pointer:coarse)').matches);
  window.softJellyMobile = mobile;
  if (!mobile) return;
  document.documentElement.classList.add('mobile-web');
  const canvas = document.getElementById('canvas');
  const safe = document.createElement('div');
  safe.id = 'soft-jelly-safe-area';
  safe.style.cssText = 'position:fixed;inset:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
  document.body.appendChild(safe);
  function update() {
    const vv = window.visualViewport, area = getComputedStyle(safe);
    const left = parseFloat(area.paddingLeft)||0, right = parseFloat(area.paddingRight)||0;
    const top = parseFloat(area.paddingTop)||0, bottom = parseFloat(area.paddingBottom)||0;
    const width = Math.max(1,(vv?.width||innerWidth)-left-right);
    const height = Math.max(1,(vv?.height||innerHeight)-top-bottom);
    const low = new URLSearchParams(location.search).get('quality') === 'low';
    const cap = low ? [960,540] : [1280,720];
    const density = Math.min(devicePixelRatio||1,cap[0]/width,cap[1]/height);
    const w = Math.max(1,Math.floor(width*density)), h = Math.max(1,Math.floor(height*density));
    canvas.style.cssText = `position:fixed;left:${(vv?.offsetLeft||0)+left}px;top:${(vv?.offsetTop||0)+top}px;width:${width}px;height:${height}px;touch-action:none`;
    if(canvas.width!==w) canvas.width=w;
    if(canvas.height!==h) canvas.height=h;
    document.documentElement.style.setProperty('--visible-height',`${vv?.height||innerHeight}px`);
    document.documentElement.style.setProperty('--visible-width',`${vv?.width||innerWidth}px`);
    window.softJellyViewport={width,height,renderWidth:w,renderHeight:h,dpr:devicePixelRatio,left,right,top,bottom};
  }
  window.softJellyResize=update;
  addEventListener('resize',update);
  addEventListener('orientationchange',()=>{update();requestAnimationFrame(update);});
  addEventListener('fullscreenchange',update);
  window.visualViewport?.addEventListener('resize',update);
  window.visualViewport?.addEventListener('scroll',update);
  update();
})();
