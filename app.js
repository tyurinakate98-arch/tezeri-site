'use strict';
(() => {
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const icons={arrow:'M4 12h16m-6-6 6 6-6 6',left:'M20 12H4m6-6-6 6 6 6',menu:'M4 8h16M4 16h16',plus:'M12 5v14M5 12h14',download:'M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5',window:'M4 3h16v18H4zM12 3v18M4 13h16',layers:'m3 7 9-4 9 4-9 4zm0 5 9 4 9-4m-18 5 9 4 9-4',document:'M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6',calculator:'M5 3h14v18H5zM8 7h8M8 11h1m4 0h1m-6 4h1m4 0h1'};
$$('[data-icon]').forEach(el=>{const k=el.dataset.icon;if(icons[k])el.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+icons[k]+'"/></svg>';});
const menu=$('.menu-toggle'),mobileNav=$('#mobile-nav');
function closeMenu(){if(!menu)return;menu.setAttribute('aria-expanded','false');mobileNav.hidden=true;}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));mobileNav.hidden=!open;});
mobileNav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
document.addEventListener('click',e=>{if(menu&&!e.target.closest('.site-header'))closeMenu();});
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),wide=matchMedia('(min-width: 801px)');
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
const money=n=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(n)+' ₽';
const catalog={oak:{title:'Панели под дуб',short:'под дуб',price:1250,scene:'assets/scene/loggia-oak-clear.webp',pdf:'assets/documents/passport-oak.pdf'},white:{title:'Светлые панели',short:'светлая',price:850,scene:'assets/scene/loggia-white-clear.webp',pdf:'assets/documents/passport-white.pdf'}};
const state={finish:'oak',calcFinish:'oak',price:1250,valid:true,passport:null,story:0,direction:0,storyLock:0,directionLock:0};
const story=$('.story-scroll'),sticky=$('.story-sticky'),storyPanels=$$('.demo-panel'),storyTabs=$$('[data-story]');
const summaries=['Сначала согласуйте будущий результат','Проверьте состав и расходы по объекту','Передайте сформированный документ бригаде'];
const nextLabels=['Дальше — расчёт','Дальше — паспорт','Вернуться к проекту'];
function freshCalc(){return state.finish===state.calcFinish&&state.valid;}
function showStory(index,scroll=false,focus=false){
 if(!story)return;index=clamp(index,0,2);state.story=index;
 storyPanels.forEach((panel,i)=>{panel.hidden=i!==index;panel.inert=i!==index;});
 storyTabs.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});
 $('#story-summary').textContent=summaries[index];$('#story-next').innerHTML=nextLabels[index]+' <svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+icons.arrow+'"/></svg>';
 if(scroll){state.storyLock=performance.now()+900;const top=window.scrollY+story.getBoundingClientRect().top;if(wide.matches&&!reduced.matches){const range=Math.max(0,story.offsetHeight-sticky.offsetHeight);window.scrollTo({top:top-20+range*((index+.08)/3),behavior:'smooth'});}else{sticky.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});}setTimeout(requestTick,950);}
 if(focus)storyTabs[index].focus({preventScroll:true});
}
function renderCalculation(){
 const item=catalog[state.calcFinish];$$('[data-calc-finish]').forEach(el=>el.textContent=item.title);
 const finishTotal=18*state.price,materials=69540+finishTotal;
 $$('[data-finish-total]').forEach(el=>el.textContent=money(finishTotal));$$('[data-material-total]').forEach(el=>el.textContent=money(materials));$$('[data-expense-total]').forEach(el=>el.textContent=money(materials+26000));
 $('#calc-status').textContent=!state.valid?'Исправьте цену отделки перед формированием паспорта.':freshCalc()?'Расчёт соответствует выбранной отделке.':'Проект изменён. Обновите расчёт перед формированием паспорта.';
 $('#refresh-calculation').hidden=state.finish===state.calcFinish;
 $('#make-passport').disabled=!freshCalc();
}
function renderPassport(){
 const snapshot=state.passport, item=catalog[snapshot?.finish||state.calcFinish];
 $$('[data-passport-finish]').forEach(el=>el.textContent=item.title);$$('[data-passport-scene]').forEach(el=>{el.src=item.scene;el.alt='Учебный паспорт: отделка стен '+item.short;});
 const download=$('#passport-download'),build=$('#passport-build');
 if(!snapshot){download.hidden=true;build.hidden=false;$('#passport-status').textContent='Сначала проверьте расчёт и сформируйте паспорт.';}
 else{const stale=snapshot.finish!==state.finish;download.href=item.pdf;download.hidden=stale;build.hidden=!stale;build.textContent=stale?'Сформировать новую версию':'Сформировать паспорт';$('#passport-status').textContent=stale?'Проект изменён. Здесь предыдущая версия паспорта; сформируйте новую.':'Паспорт сформирован. Можно скачать учебный документ для бригады.';}
}
function selectFinish(key){
 if(!catalog[key])return;state.finish=key;
 $$('[data-finish]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.finish===key)));
 $$('[data-demo-scene]').forEach(img=>{img.src=catalog[key].scene;img.alt='Учебный проект лоджии: отделка стен '+catalog[key].short;});
 $('#project-status').textContent=key===state.calcFinish?'Материал выбран. Можно проверить расчёт.':'Отделка изменена. Передайте новый вариант в расчёт.';
 renderCalculation();renderPassport();
}
function transferToCalculation(){state.calcFinish=state.finish;state.price=catalog[state.finish].price;state.valid=true;$('#unit-price').value=state.price;$('#unit-price').removeAttribute('aria-invalid');$('#price-error').textContent='';renderCalculation();showStory(1,true);}
function makePassport(){
 if(!freshCalc()){showStory(1,true);$('#calc-status').textContent='Сначала обновите расчёт из проекта и проверьте цену.';return;}
 state.passport={finish:state.calcFinish};renderPassport();showStory(2,true);
}
if(story){
 storyTabs.forEach(b=>b.addEventListener('click',()=>showStory(+b.dataset.story,true)));
 $$('[data-story-target]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();showStory(+a.dataset.storyTarget,true);}));
 $$('[data-start-demo]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();showStory(0,true);}));
 $$('[data-finish]').forEach(b=>b.addEventListener('click',()=>selectFinish(b.dataset.finish)));
 $('#to-calculation').addEventListener('click',transferToCalculation);$('#refresh-calculation').addEventListener('click',transferToCalculation);$('#make-passport').addEventListener('click',makePassport);$('#passport-build').addEventListener('click',makePassport);
 $('#story-next').addEventListener('click',()=>showStory((state.story+1)%3,true));
 $('#unit-price').addEventListener('input',e=>{const value=Number(e.target.value);state.valid=e.target.value!==''&&Number.isInteger(value)&&value>=1&&value<=100000;e.target.setAttribute('aria-invalid',String(!state.valid));$('#price-error').textContent=state.valid?'':'Введите целую цену от 1 до 100 000 ₽ за м².';if(state.valid)state.price=value;renderCalculation();});
 renderCalculation();renderPassport();
}
function keyboardTabs(tabs,activate){tabs.forEach((b,index)=>b.addEventListener('keydown',e=>{let next=index;if(e.key==='ArrowRight')next=(index+1)%tabs.length;else if(e.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();activate(next);tabs[next].focus({preventScroll:true});}));}
keyboardTabs(storyTabs,i=>showStory(i,true));
const flowData=[
 {title:'У заявки есть следующий шаг.',text:'Зафиксируйте обращение, назначьте ответственного и согласуйте замер. Если клиент не ответил — сохраните повторный контакт.',k1:'Ответственный',v1:'Менеджер или руководитель',k2:'Следующее действие',v2:'Согласовать время замера'},
 {title:'Обсудите результат на замере.',text:'Создайте проект и расчёт. Зафиксируйте решение клиента: договор, отказ или повторный контакт, если он хочет подумать.',k1:'Ответственный',v1:'Замерщик-бригадир',k2:'Результат',v2:'Проект, расчёт и решение клиента'},
 {title:'Комплектуйте по проекту.',text:'Параметры остекления и перечень материалов становятся основанием для заказа конструкций и подготовки комплектации объекта.',k1:'Основание',v1:'Проект и сохранённый расчёт',k2:'Результат',v2:'Конструкции и материалы для объекта'},
 {title:'Бригаде понятно, что делать.',text:'Передайте паспорт объекта, назначьте исполнителей и следите за сроками. После выполнения работ оформите закрывающие документы.',k1:'Для бригады',v1:'Паспорт с материалами и примечаниями',k2:'Контроль',v2:'Сроки, выполнение и закрытие работ'},
 {title:'Работы завершены. Оплата — под контролем.',text:'Учитывайте поступления, остаток и платежи по рассрочке. После сдачи объекта важно видеть, какие обязательства ещё не закрыты.',k1:'Учёт',v1:'Получено, осталось, следующий платёж',k2:'Результат',v2:'Полная оплата или график рассрочки'},
 {title:'Найдите этап, который требует внимания.',text:'Сопоставляйте движение заказов, расходы и финансовый результат. Показатель помогает найти задержку; причину нужно проверить в самой работе.',k1:'Продажи',v1:'Заявка → замер; замер → договор',k2:'Экономика',v2:'План и факт расходов, прибыль, долги'}
];
const flowTabs=$$('[data-flow]');
function showFlow(index){const d=flowData[index];if(!d||!$('#flow-panel'))return;flowTabs.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});$('#flow-panel').setAttribute('aria-labelledby','flow-tab-'+index);$('#flow-title').textContent=d.title;$('#flow-description').textContent=d.text;$('#flow-key-one').textContent=d.k1;$('#flow-value-one').textContent=d.v1;$('#flow-key-two').textContent=d.k2;$('#flow-value-two').textContent=d.v2;}
flowTabs.forEach(b=>b.addEventListener('click',()=>showFlow(+b.dataset.flow)));keyboardTabs(flowTabs,showFlow);
const dirScroll=$('.direction-scroll'),dirSticky=$('.direction-sticky'),track=$('.direction-track'),dirTabs=$$('[data-direction]'),dirPanels=$$('.direction-panel');
function markDirection(index){state.direction=index;dirTabs.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});dirPanels.forEach((p,i)=>{p.inert=i!==index;p.setAttribute('aria-hidden',String(i!==index));});$('[data-direction-prev]').disabled=index===0;$('[data-direction-next]').disabled=index===2;$('#direction-position').textContent=['Остекление','Балконы и лоджии','Следующее направление'][index]+' · '+(index+1)+' из 3';}
function showDirection(index,scroll=true){if(!track)return;index=clamp(index,0,2);markDirection(index);track.style.transform='translateX('+(-index*100)+'%)';if(scroll&&wide.matches&&!reduced.matches){state.directionLock=performance.now()+900;const top=window.scrollY+dirScroll.getBoundingClientRect().top-26,range=Math.max(0,dirScroll.offsetHeight-dirSticky.offsetHeight);window.scrollTo({top:top+range*(index/2),behavior:'smooth'});setTimeout(requestTick,950);}}
if(track){dirTabs.forEach(b=>b.addEventListener('click',()=>showDirection(+b.dataset.direction)));$('[data-direction-prev]').addEventListener('click',()=>showDirection(state.direction-1));$('[data-direction-next]').addEventListener('click',()=>showDirection(state.direction+1));keyboardTabs(dirTabs,i=>showDirection(i));let touchX=0,touchY=0;$('.direction-viewport').addEventListener('touchstart',e=>{touchX=e.touches[0].clientX;touchY=e.touches[0].clientY;},{passive:true});$('.direction-viewport').addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.4)showDirection(state.direction+(dx<0?1:-1),false);},{passive:true});markDirection(0);}
const assembly=$('.assembly-scroll'),assemblyStage=$('.assembly-stage');let ticking=false;
function onScroll(){ticking=false;const y=window.scrollY;
 $('.hero')?.style.setProperty('--hero-progress',clamp(y/700));
 if(wide.matches&&!reduced.matches){
  if(story&&performance.now()>state.storyLock&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){const top=y+story.getBoundingClientRect().top-20,range=Math.max(1,story.offsetHeight-sticky.offsetHeight);const p=clamp((y-top)/range);const i=clamp(Math.floor(p*3),0,2);if(i!==state.story)showStory(i);}
  if(track&&performance.now()>state.directionLock){const top=y+dirScroll.getBoundingClientRect().top-26,range=Math.max(1,dirScroll.offsetHeight-dirSticky.offsetHeight);const position=clamp((y-top)/range)*2;track.style.transform='translateX('+(-position*100)+'%)';const i=Math.round(position);if(i!==state.direction)markDirection(i);}
 }
 if(assembly&&!reduced.matches){const top=y+assembly.getBoundingClientRect().top,range=Math.max(1,assembly.offsetHeight-assemblyStage.offsetHeight);const p=clamp((y-top+innerHeight*.18)/range);assemblyStage.style.setProperty('--merge',clamp(p*1.6));assemblyStage.style.setProperty('--reveal',clamp((p-.4)/.6));}
}
function requestTick(){if(!ticking){ticking=true;requestAnimationFrame(onScroll);}}
window.addEventListener('scroll',requestTick,{passive:true});window.addEventListener('resize',()=>{if(!wide.matches||reduced.matches){if(track)showDirection(state.direction,false);}requestTick();},{passive:true});reduced.addEventListener('change',requestTick);requestTick();
const brief=$('#brief-form');brief?.addEventListener('submit',e=>{e.preventDefault();if(!brief.reportValidity())return;const data=new FormData(brief),company=String(data.get('company')).trim(),task=String(data.get('task')).trim();if(!company||task.length<10){$('#brief-status').textContent='Укажите компанию и опишите задачу хотя бы в 10 символах.';return;}const content='ТЕЗЕРИ — задача для обсуждения\n\nКомпания: '+company+'\nНаправление: '+data.get('direction')+'\n\nЗадача:\n'+task+'\n\nСохранено на устройстве. Никуда не отправлено.\n';const url=URL.createObjectURL(new Blob(['\ufeff'+content],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='tezeri-task.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);$('#brief-status').textContent='Файл подготовлен для скачивания. Отправка не выполнялась.';});
})();