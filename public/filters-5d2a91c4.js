'use strict';
/* Filter buttons for pages built from sections (e.g. the Arabic projects page).
   Buttons: [data-filter="<category>|all"]. Items: [data-project-category]. Count: #project-count. */
(()=>{
 const buttons=[...document.querySelectorAll('button[data-filter]')];if(!buttons.length)return;
 const arabic=document.documentElement.lang==='ar',items=[...document.querySelectorAll('[data-project-category]')],count=document.getElementById('project-count');
 const label=n=>arabic?(n===1?'مشروع مرجعي واحد':n===2?'مشروعان مرجعيان':n+' مشروعات مرجعية'):n+' reference project'+(n===1?'':'s');
 const apply=value=>{let shown=0;items.forEach(el=>{const show=value==='all'||el.getAttribute('data-project-category')===value;el.hidden=!show;if(show)shown++;});
  buttons.forEach(b=>{const on=b.getAttribute('data-filter')===value;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  if(count)count.textContent=label(shown);};
 buttons.forEach(b=>{b.type='button';b.addEventListener('click',()=>apply(b.getAttribute('data-filter')));});
})();
