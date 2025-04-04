import{R as D,r as L}from"./vendor-DbaM0uXi.js";function st(s,t,e){return Math.max(t,Math.min(s,e))}const p={toVector(s,t){return s===void 0&&(s=t),Array.isArray(s)?s:[s,s]},add(s,t){return[s[0]+t[0],s[1]+t[1]]},sub(s,t){return[s[0]-t[0],s[1]-t[1]]},addTo(s,t){s[0]+=t[0],s[1]+=t[1]},subTo(s,t){s[0]-=t[0],s[1]-=t[1]}};function P(s,t,e){return t===0||Math.abs(t)===1/0?Math.pow(s,e*5):s*t*e/(t+e*s)}function j(s,t,e,r=.15){return r===0?st(s,t,e):s<t?-P(t-s,e-t,r)+t:s>e?+P(s-e,e-t,r)+e:s}function rt(s,[t,e],[r,i]){const[[o,a],[h,u]]=s;return[j(t,o,a,r),j(e,h,u,i)]}function it(s,t){if(typeof s!="object"||s===null)return s;var e=s[Symbol.toPrimitive];if(e!==void 0){var r=e.call(s,t||"default");if(typeof r!="object")return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(s)}function nt(s){var t=it(s,"string");return typeof t=="symbol"?t:String(t)}function y(s,t,e){return t=nt(t),t in s?Object.defineProperty(s,t,{value:e,enumerable:!0,configurable:!0,writable:!0}):s[t]=e,s}function U(s,t){var e=Object.keys(s);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(s);t&&(r=r.filter(function(i){return Object.getOwnPropertyDescriptor(s,i).enumerable})),e.push.apply(e,r)}return e}function l(s){for(var t=1;t<arguments.length;t++){var e=arguments[t]!=null?arguments[t]:{};t%2?U(Object(e),!0).forEach(function(r){y(s,r,e[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(s,Object.getOwnPropertyDescriptors(e)):U(Object(e)).forEach(function(r){Object.defineProperty(s,r,Object.getOwnPropertyDescriptor(e,r))})}return s}const Z={pointer:{start:"down",change:"move",end:"up"},mouse:{start:"down",change:"move",end:"up"},touch:{start:"start",change:"move",end:"end"},gesture:{start:"start",change:"change",end:"end"}};function V(s){return s?s[0].toUpperCase()+s.slice(1):""}const ot=["enter","leave"];function at(s=!1,t){return s&&!ot.includes(t)}function ct(s,t="",e=!1){const r=Z[s],i=r&&r[t]||t;return"on"+V(s)+V(i)+(at(e,i)?"Capture":"")}const ht=["gotpointercapture","lostpointercapture"];function ut(s){let t=s.substring(2).toLowerCase();const e=!!~t.indexOf("passive");e&&(t=t.replace("passive",""));const r=ht.includes(t)?"capturecapture":"capture",i=!!~t.indexOf(r);return i&&(t=t.replace("capture","")),{device:t,capture:i,passive:e}}function lt(s,t=""){const e=Z[s],r=e&&e[t]||t;return s+r}function A(s){return"touches"in s}function N(s){return A(s)?"touch":"pointerType"in s?s.pointerType:"mouse"}function dt(s){return Array.from(s.touches).filter(t=>{var e,r;return t.target===s.currentTarget||((e=s.currentTarget)===null||e===void 0||(r=e.contains)===null||r===void 0?void 0:r.call(e,t.target))})}function pt(s){return s.type==="touchend"||s.type==="touchcancel"?s.changedTouches:s.targetTouches}function Y(s){return A(s)?pt(s)[0]:s}function ft(s){return dt(s).map(t=>t.identifier)}function I(s){const t=Y(s);return A(s)?t.identifier:t.pointerId}function R(s){const t=Y(s);return[t.clientX,t.clientY]}function yt(s){const t={};if("buttons"in s&&(t.buttons=s.buttons),"shiftKey"in s){const{shiftKey:e,altKey:r,metaKey:i,ctrlKey:o}=s;Object.assign(t,{shiftKey:e,altKey:r,metaKey:i,ctrlKey:o})}return t}function S(s,...t){return typeof s=="function"?s(...t):s}function mt(){}function gt(...s){return s.length===0?mt:s.length===1?s[0]:function(){let t;for(const e of s)t=e.apply(this,arguments)||t;return t}}function z(s,t){return Object.assign({},t,s||{})}const kt=32;class vt{constructor(t,e,r){this.ctrl=t,this.args=e,this.key=r,this.state||(this.state={},this.computeValues([0,0]),this.computeInitial(),this.init&&this.init(),this.reset())}get state(){return this.ctrl.state[this.key]}set state(t){this.ctrl.state[this.key]=t}get shared(){return this.ctrl.state.shared}get eventStore(){return this.ctrl.gestureEventStores[this.key]}get timeoutStore(){return this.ctrl.gestureTimeoutStores[this.key]}get config(){return this.ctrl.config[this.key]}get sharedConfig(){return this.ctrl.config.shared}get handler(){return this.ctrl.handlers[this.key]}reset(){const{state:t,shared:e,ingKey:r,args:i}=this;e[r]=t._active=t.active=t._blocked=t._force=!1,t._step=[!1,!1],t.intentional=!1,t._movement=[0,0],t._distance=[0,0],t._direction=[0,0],t._delta=[0,0],t._bounds=[[-1/0,1/0],[-1/0,1/0]],t.args=i,t.axis=void 0,t.memo=void 0,t.elapsedTime=t.timeDelta=0,t.direction=[0,0],t.distance=[0,0],t.overflow=[0,0],t._movementBound=[!1,!1],t.velocity=[0,0],t.movement=[0,0],t.delta=[0,0],t.timeStamp=0}start(t){const e=this.state,r=this.config;e._active||(this.reset(),this.computeInitial(),e._active=!0,e.target=t.target,e.currentTarget=t.currentTarget,e.lastOffset=r.from?S(r.from,e):e.offset,e.offset=e.lastOffset,e.startTime=e.timeStamp=t.timeStamp)}computeValues(t){const e=this.state;e._values=t,e.values=this.config.transform(t)}computeInitial(){const t=this.state;t._initial=t._values,t.initial=t.values}compute(t){const{state:e,config:r,shared:i}=this;e.args=this.args;let o=0;if(t&&(e.event=t,r.preventDefault&&t.cancelable&&e.event.preventDefault(),e.type=t.type,i.touches=this.ctrl.pointerIds.size||this.ctrl.touchIds.size,i.locked=!!document.pointerLockElement,Object.assign(i,yt(t)),i.down=i.pressed=i.buttons%2===1||i.touches>0,o=t.timeStamp-e.timeStamp,e.timeStamp=t.timeStamp,e.elapsedTime=e.timeStamp-e.startTime),e._active){const k=e._delta.map(Math.abs);p.addTo(e._distance,k)}this.axisIntent&&this.axisIntent(t);const[a,h]=e._movement,[u,d]=r.threshold,{_step:c,values:m}=e;if(r.hasCustomTransform?(c[0]===!1&&(c[0]=Math.abs(a)>=u&&m[0]),c[1]===!1&&(c[1]=Math.abs(h)>=d&&m[1])):(c[0]===!1&&(c[0]=Math.abs(a)>=u&&Math.sign(a)*u),c[1]===!1&&(c[1]=Math.abs(h)>=d&&Math.sign(h)*d)),e.intentional=c[0]!==!1||c[1]!==!1,!e.intentional)return;const f=[0,0];if(r.hasCustomTransform){const[k,et]=m;f[0]=c[0]!==!1?k-c[0]:0,f[1]=c[1]!==!1?et-c[1]:0}else f[0]=c[0]!==!1?a-c[0]:0,f[1]=c[1]!==!1?h-c[1]:0;this.restrictToAxis&&!e._blocked&&this.restrictToAxis(f);const w=e.offset,M=e._active&&!e._blocked||e.active;M&&(e.first=e._active&&!e.active,e.last=!e._active&&e.active,e.active=i[this.ingKey]=e._active,t&&(e.first&&("bounds"in r&&(e._bounds=S(r.bounds,e)),this.setup&&this.setup()),e.movement=f,this.computeOffset()));const[x,T]=e.offset,[[E,X],[Q,J]]=e._bounds;e.overflow=[x<E?-1:x>X?1:0,T<Q?-1:T>J?1:0],e._movementBound[0]=e.overflow[0]?e._movementBound[0]===!1?e._movement[0]:e._movementBound[0]:!1,e._movementBound[1]=e.overflow[1]?e._movementBound[1]===!1?e._movement[1]:e._movementBound[1]:!1;const tt=e._active?r.rubberband||[0,0]:[0,0];if(e.offset=rt(e._bounds,e.offset,tt),e.delta=p.sub(e.offset,w),this.computeMovement(),M&&(!e.last||o>kt)){e.delta=p.sub(e.offset,w);const k=e.delta.map(Math.abs);p.addTo(e.distance,k),e.direction=e.delta.map(Math.sign),e._direction=e._delta.map(Math.sign),!e.first&&o>0&&(e.velocity=[k[0]/o,k[1]/o],e.timeDelta=o)}}emit(){const t=this.state,e=this.shared,r=this.config;if(t._active||this.clean(),(t._blocked||!t.intentional)&&!t._force&&!r.triggerAllEvents)return;const i=this.handler(l(l(l({},e),t),{},{[this.aliasKey]:t.values}));i!==void 0&&(t.memo=i)}clean(){this.eventStore.clean(),this.timeoutStore.clean()}}function bt([s,t],e){const r=Math.abs(s),i=Math.abs(t);if(r>i&&r>e)return"x";if(i>r&&i>e)return"y"}class _t extends vt{constructor(...t){super(...t),y(this,"aliasKey","xy")}reset(){super.reset(),this.state.axis=void 0}init(){this.state.offset=[0,0],this.state.lastOffset=[0,0]}computeOffset(){this.state.offset=p.add(this.state.lastOffset,this.state.movement)}computeMovement(){this.state.movement=p.sub(this.state.offset,this.state.lastOffset)}axisIntent(t){const e=this.state,r=this.config;if(!e.axis&&t){const i=typeof r.axisThreshold=="object"?r.axisThreshold[N(t)]:r.axisThreshold;e.axis=bt(e._movement,i)}e._blocked=(r.lockDirection||!!r.axis)&&!e.axis||!!r.axis&&r.axis!==e.axis}restrictToAxis(t){if(this.config.axis||this.config.lockDirection)switch(this.state.axis){case"x":t[1]=0;break;case"y":t[0]=0;break}}}const wt=s=>s,q=.15,F={enabled(s=!0){return s},eventOptions(s,t,e){return l(l({},e.shared.eventOptions),s)},preventDefault(s=!1){return s},triggerAllEvents(s=!1){return s},rubberband(s=0){switch(s){case!0:return[q,q];case!1:return[0,0];default:return p.toVector(s)}},from(s){if(typeof s=="function")return s;if(s!=null)return p.toVector(s)},transform(s,t,e){const r=s||e.shared.transform;return this.hasCustomTransform=!!r,r||wt},threshold(s){return p.toVector(s,0)}},Mt=0,b=l(l({},F),{},{axis(s,t,{axis:e}){if(this.lockDirection=e==="lock",!this.lockDirection)return e},axisThreshold(s=Mt){return s},bounds(s={}){if(typeof s=="function")return o=>b.bounds(s(o));if("current"in s)return()=>s.current;if(typeof HTMLElement=="function"&&s instanceof HTMLElement)return s;const{left:t=-1/0,right:e=1/0,top:r=-1/0,bottom:i=1/0}=s;return[[t,e],[r,i]]}}),B={ArrowRight:(s,t=1)=>[s*t,0],ArrowLeft:(s,t=1)=>[-1*s*t,0],ArrowUp:(s,t=1)=>[0,-1*s*t],ArrowDown:(s,t=1)=>[0,s*t]};class xt extends _t{constructor(...t){super(...t),y(this,"ingKey","dragging")}reset(){super.reset();const t=this.state;t._pointerId=void 0,t._pointerActive=!1,t._keyboardActive=!1,t._preventScroll=!1,t._delayed=!1,t.swipe=[0,0],t.tap=!1,t.canceled=!1,t.cancel=this.cancel.bind(this)}setup(){const t=this.state;if(t._bounds instanceof HTMLElement){const e=t._bounds.getBoundingClientRect(),r=t.currentTarget.getBoundingClientRect(),i={left:e.left-r.left+t.offset[0],right:e.right-r.right+t.offset[0],top:e.top-r.top+t.offset[1],bottom:e.bottom-r.bottom+t.offset[1]};t._bounds=b.bounds(i)}}cancel(){const t=this.state;t.canceled||(t.canceled=!0,t._active=!1,setTimeout(()=>{this.compute(),this.emit()},0))}setActive(){this.state._active=this.state._pointerActive||this.state._keyboardActive}clean(){this.pointerClean(),this.state._pointerActive=!1,this.state._keyboardActive=!1,super.clean()}pointerDown(t){const e=this.config,r=this.state;if(t.buttons!=null&&(Array.isArray(e.pointerButtons)?!e.pointerButtons.includes(t.buttons):e.pointerButtons!==-1&&e.pointerButtons!==t.buttons))return;const i=this.ctrl.setEventIds(t);e.pointerCapture&&t.target.setPointerCapture(t.pointerId),!(i&&i.size>1&&r._pointerActive)&&(this.start(t),this.setupPointer(t),r._pointerId=I(t),r._pointerActive=!0,this.computeValues(R(t)),this.computeInitial(),e.preventScrollAxis&&N(t)!=="mouse"?(r._active=!1,this.setupScrollPrevention(t)):e.delay>0?(this.setupDelayTrigger(t),e.triggerAllEvents&&(this.compute(t),this.emit())):this.startPointerDrag(t))}startPointerDrag(t){const e=this.state;e._active=!0,e._preventScroll=!0,e._delayed=!1,this.compute(t),this.emit()}pointerMove(t){const e=this.state,r=this.config;if(!e._pointerActive)return;const i=I(t);if(e._pointerId!==void 0&&i!==e._pointerId)return;const o=R(t);if(document.pointerLockElement===t.target?e._delta=[t.movementX,t.movementY]:(e._delta=p.sub(o,e._values),this.computeValues(o)),p.addTo(e._movement,e._delta),this.compute(t),e._delayed&&e.intentional){this.timeoutStore.remove("dragDelay"),e.active=!1,this.startPointerDrag(t);return}if(r.preventScrollAxis&&!e._preventScroll)if(e.axis)if(e.axis===r.preventScrollAxis||r.preventScrollAxis==="xy"){e._active=!1,this.clean();return}else{this.timeoutStore.remove("startPointerDrag"),this.startPointerDrag(t);return}else return;this.emit()}pointerUp(t){this.ctrl.setEventIds(t);try{this.config.pointerCapture&&t.target.hasPointerCapture(t.pointerId)&&t.target.releasePointerCapture(t.pointerId)}catch{}const e=this.state,r=this.config;if(!e._active||!e._pointerActive)return;const i=I(t);if(e._pointerId!==void 0&&i!==e._pointerId)return;this.state._pointerActive=!1,this.setActive(),this.compute(t);const[o,a]=e._distance;if(e.tap=o<=r.tapsThreshold&&a<=r.tapsThreshold,e.tap&&r.filterTaps)e._force=!0;else{const[h,u]=e._delta,[d,c]=e._movement,[m,f]=r.swipe.velocity,[w,M]=r.swipe.distance,x=r.swipe.duration;if(e.elapsedTime<x){const T=Math.abs(h/e.timeDelta),E=Math.abs(u/e.timeDelta);T>m&&Math.abs(d)>w&&(e.swipe[0]=Math.sign(h)),E>f&&Math.abs(c)>M&&(e.swipe[1]=Math.sign(u))}}this.emit()}pointerClick(t){!this.state.tap&&t.detail>0&&(t.preventDefault(),t.stopPropagation())}setupPointer(t){const e=this.config,r=e.device;e.pointerLock&&t.currentTarget.requestPointerLock(),e.pointerCapture||(this.eventStore.add(this.sharedConfig.window,r,"change",this.pointerMove.bind(this)),this.eventStore.add(this.sharedConfig.window,r,"end",this.pointerUp.bind(this)),this.eventStore.add(this.sharedConfig.window,r,"cancel",this.pointerUp.bind(this)))}pointerClean(){this.config.pointerLock&&document.pointerLockElement===this.state.currentTarget&&document.exitPointerLock()}preventScroll(t){this.state._preventScroll&&t.cancelable&&t.preventDefault()}setupScrollPrevention(t){this.state._preventScroll=!1,Tt(t);const e=this.eventStore.add(this.sharedConfig.window,"touch","change",this.preventScroll.bind(this),{passive:!1});this.eventStore.add(this.sharedConfig.window,"touch","end",e),this.eventStore.add(this.sharedConfig.window,"touch","cancel",e),this.timeoutStore.add("startPointerDrag",this.startPointerDrag.bind(this),this.config.preventScrollDelay,t)}setupDelayTrigger(t){this.state._delayed=!0,this.timeoutStore.add("dragDelay",()=>{this.state._step=[0,0],this.startPointerDrag(t)},this.config.delay)}keyDown(t){const e=B[t.key];if(e){const r=this.state,i=t.shiftKey?10:t.altKey?.1:1;this.start(t),r._delta=e(this.config.keyboardDisplacement,i),r._keyboardActive=!0,p.addTo(r._movement,r._delta),this.compute(t),this.emit()}}keyUp(t){t.key in B&&(this.state._keyboardActive=!1,this.setActive(),this.compute(t),this.emit())}bind(t){const e=this.config.device;t(e,"start",this.pointerDown.bind(this)),this.config.pointerCapture&&(t(e,"change",this.pointerMove.bind(this)),t(e,"end",this.pointerUp.bind(this)),t(e,"cancel",this.pointerUp.bind(this)),t("lostPointerCapture","",this.pointerUp.bind(this))),this.config.keys&&(t("key","down",this.keyDown.bind(this)),t("key","up",this.keyUp.bind(this))),this.config.filterTaps&&t("click","",this.pointerClick.bind(this),{capture:!0,passive:!1})}}function Tt(s){"persist"in s&&typeof s.persist=="function"&&s.persist()}const _=typeof window<"u"&&window.document&&window.document.createElement;function G(){return _&&"ontouchstart"in window}function Ct(){return G()||_&&window.navigator.maxTouchPoints>1}function St(){return _&&"onpointerdown"in window}function At(){return _&&"exitPointerLock"in window.document}function Et(){try{return"constructor"in GestureEvent}catch{return!1}}const g={isBrowser:_,gesture:Et(),touch:G(),touchscreen:Ct(),pointer:St(),pointerLock:At()},Dt=250,Lt=180,It=.5,Ot=50,Pt=250,jt=10,K={mouse:0,touch:0,pen:8},Ut=l(l({},b),{},{device(s,t,{pointer:{touch:e=!1,lock:r=!1,mouse:i=!1}={}}){return this.pointerLock=r&&g.pointerLock,g.touch&&e?"touch":this.pointerLock?"mouse":g.pointer&&!i?"pointer":g.touch?"touch":"mouse"},preventScrollAxis(s,t,{preventScroll:e}){if(this.preventScrollDelay=typeof e=="number"?e:e||e===void 0&&s?Dt:void 0,!(!g.touchscreen||e===!1))return s||(e!==void 0?"y":void 0)},pointerCapture(s,t,{pointer:{capture:e=!0,buttons:r=1,keys:i=!0}={}}){return this.pointerButtons=r,this.keys=i,!this.pointerLock&&this.device==="pointer"&&e},threshold(s,t,{filterTaps:e=!1,tapsThreshold:r=3,axis:i=void 0}){const o=p.toVector(s,e?r:i?1:0);return this.filterTaps=e,this.tapsThreshold=r,o},swipe({velocity:s=It,distance:t=Ot,duration:e=Pt}={}){return{velocity:this.transform(p.toVector(s)),distance:this.transform(p.toVector(t)),duration:e}},delay(s=0){switch(s){case!0:return Lt;case!1:return 0;default:return s}},axisThreshold(s){return s?l(l({},K),s):K},keyboardDisplacement(s=jt){return s}});l(l({},F),{},{device(s,t,{shared:e,pointer:{touch:r=!1}={}}){if(e.target&&!g.touch&&g.gesture)return"gesture";if(g.touch&&r)return"touch";if(g.touchscreen){if(g.pointer)return"pointer";if(g.touch)return"touch"}},bounds(s,t,{scaleBounds:e={},angleBounds:r={}}){const i=a=>{const h=z(S(e,a),{min:-1/0,max:1/0});return[h.min,h.max]},o=a=>{const h=z(S(r,a),{min:-1/0,max:1/0});return[h.min,h.max]};return typeof e!="function"&&typeof r!="function"?[i(),o()]:a=>[i(a),o(a)]},threshold(s,t,e){return this.lockDirection=e.axis==="lock",p.toVector(s,this.lockDirection?[.1,3]:0)},modifierKey(s){return s===void 0?"ctrlKey":s},pinchOnWheel(s=!0){return s}});l(l({},b),{},{mouseOnly:(s=!0)=>s});l(l({},b),{},{mouseOnly:(s=!0)=>s});const W=new Map,O=new Map;function Vt(s){W.set(s.key,s.engine),O.set(s.key,s.resolver)}const Rt={key:"drag",engine:xt,resolver:Ut};function zt(s,t){if(s==null)return{};var e={},r=Object.keys(s),i,o;for(o=0;o<r.length;o++)i=r[o],!(t.indexOf(i)>=0)&&(e[i]=s[i]);return e}function qt(s,t){if(s==null)return{};var e=zt(s,t),r,i;if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(s);for(i=0;i<o.length;i++)r=o[i],!(t.indexOf(r)>=0)&&Object.prototype.propertyIsEnumerable.call(s,r)&&(e[r]=s[r])}return e}const Bt={target(s){if(s)return()=>"current"in s?s.current:s},enabled(s=!0){return s},window(s=g.isBrowser?window:void 0){return s},eventOptions({passive:s=!0,capture:t=!1}={}){return{passive:s,capture:t}},transform(s){return s}},Kt=["target","eventOptions","window","enabled","transform"];function C(s={},t){const e={};for(const[r,i]of Object.entries(t))switch(typeof i){case"function":e[r]=i.call(e,s[r],r,s);break;case"object":e[r]=C(s[r],i);break;case"boolean":i&&(e[r]=s[r]);break}return e}function Ht(s,t,e={}){const r=s,{target:i,eventOptions:o,window:a,enabled:h,transform:u}=r,d=qt(r,Kt);if(e.shared=C({target:i,eventOptions:o,window:a,enabled:h,transform:u},Bt),t){const c=O.get(t);e[t]=C(l({shared:e.shared},d),c)}else for(const c in d){const m=O.get(c);m&&(e[c]=C(l({shared:e.shared},d[c]),m))}return e}class ${constructor(t,e){y(this,"_listeners",new Set),this._ctrl=t,this._gestureKey=e}add(t,e,r,i,o){const a=this._listeners,h=lt(e,r),u=this._gestureKey?this._ctrl.config[this._gestureKey].eventOptions:{},d=l(l({},u),o);t.addEventListener(h,i,d);const c=()=>{t.removeEventListener(h,i,d),a.delete(c)};return a.add(c),c}clean(){this._listeners.forEach(t=>t()),this._listeners.clear()}}class Zt{constructor(){y(this,"_timeouts",new Map)}add(t,e,r=140,...i){this.remove(t),this._timeouts.set(t,window.setTimeout(e,r,...i))}remove(t){const e=this._timeouts.get(t);e&&window.clearTimeout(e)}clean(){this._timeouts.forEach(t=>void window.clearTimeout(t)),this._timeouts.clear()}}class Nt{constructor(t){y(this,"gestures",new Set),y(this,"_targetEventStore",new $(this)),y(this,"gestureEventStores",{}),y(this,"gestureTimeoutStores",{}),y(this,"handlers",{}),y(this,"config",{}),y(this,"pointerIds",new Set),y(this,"touchIds",new Set),y(this,"state",{shared:{shiftKey:!1,metaKey:!1,ctrlKey:!1,altKey:!1}}),Yt(this,t)}setEventIds(t){if(A(t))return this.touchIds=new Set(ft(t)),this.touchIds;if("pointerId"in t)return t.type==="pointerup"||t.type==="pointercancel"?this.pointerIds.delete(t.pointerId):t.type==="pointerdown"&&this.pointerIds.add(t.pointerId),this.pointerIds}applyHandlers(t,e){this.handlers=t,this.nativeHandlers=e}applyConfig(t,e){this.config=Ht(t,e,this.config)}clean(){this._targetEventStore.clean();for(const t of this.gestures)this.gestureEventStores[t].clean(),this.gestureTimeoutStores[t].clean()}effect(){return this.config.shared.target&&this.bind(),()=>this._targetEventStore.clean()}bind(...t){const e=this.config.shared,r={};let i;if(!(e.target&&(i=e.target(),!i))){if(e.enabled){for(const a of this.gestures){const h=this.config[a],u=H(r,h.eventOptions,!!i);if(h.enabled){const d=W.get(a);new d(this,t,a).bind(u)}}const o=H(r,e.eventOptions,!!i);for(const a in this.nativeHandlers)o(a,"",h=>this.nativeHandlers[a](l(l({},this.state.shared),{},{event:h,args:t})),void 0,!0)}for(const o in r)r[o]=gt(...r[o]);if(!i)return r;for(const o in r){const{device:a,capture:h,passive:u}=ut(o);this._targetEventStore.add(i,a,"",r[o],{capture:h,passive:u})}}}}function v(s,t){s.gestures.add(t),s.gestureEventStores[t]=new $(s,t),s.gestureTimeoutStores[t]=new Zt}function Yt(s,t){t.drag&&v(s,"drag"),t.wheel&&v(s,"wheel"),t.scroll&&v(s,"scroll"),t.move&&v(s,"move"),t.pinch&&v(s,"pinch"),t.hover&&v(s,"hover")}const H=(s,t,e)=>(r,i,o,a={},h=!1)=>{var u,d;const c=(u=a.capture)!==null&&u!==void 0?u:t.capture,m=(d=a.passive)!==null&&d!==void 0?d:t.passive;let f=h?r:ct(r,i,c);e&&m&&(f+="Passive"),s[f]=s[f]||[],s[f].push(o)};function Ft(s,t={},e,r){const i=D.useMemo(()=>new Nt(s),[]);if(i.applyHandlers(s,r),i.applyConfig(t,e),D.useEffect(i.effect.bind(i)),D.useEffect(()=>i.clean.bind(i),[]),t.target===void 0)return i.bind.bind(i)}function Xt(s,t){return Vt(Rt),Ft({drag:s},{},"drag")}/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Gt={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wt=s=>s.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),n=(s,t)=>{const e=L.forwardRef(({color:r="currentColor",size:i=24,strokeWidth:o=2,absoluteStrokeWidth:a,className:h="",children:u,...d},c)=>L.createElement("svg",{ref:c,...Gt,width:i,height:i,stroke:r,strokeWidth:a?Number(o)*24/Number(i):o,className:["lucide",`lucide-${Wt(s)}`,h].join(" "),...d},[...t.map(([m,f])=>L.createElement(m,f)),...Array.isArray(u)?u:[u]]));return e.displayName=`${s}`,e};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qt=n("AlertCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jt=n("AlertTriangle",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",key:"c3ski4"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const te=n("BarChart2",[["line",{x1:"18",x2:"18",y1:"20",y2:"10",key:"1xfpm4"}],["line",{x1:"12",x2:"12",y1:"20",y2:"4",key:"be30l9"}],["line",{x1:"6",x2:"6",y1:"20",y2:"14",key:"1r4le6"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee=n("Brain",[["path",{d:"M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",key:"l5xja"}],["path",{d:"M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z",key:"ep3f8r"}],["path",{d:"M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4",key:"1p4c4q"}],["path",{d:"M17.599 6.5a3 3 0 0 0 .399-1.375",key:"tmeiqw"}],["path",{d:"M6.003 5.125A3 3 0 0 0 6.401 6.5",key:"105sqy"}],["path",{d:"M3.477 10.896a4 4 0 0 1 .585-.396",key:"ql3yin"}],["path",{d:"M19.938 10.5a4 4 0 0 1 .585.396",key:"1qfode"}],["path",{d:"M6 18a4 4 0 0 1-1.967-.516",key:"2e4loj"}],["path",{d:"M19.967 17.484A4 4 0 0 1 18 18",key:"159ez6"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const se=n("Bug",[["path",{d:"m8 2 1.88 1.88",key:"fmnt4t"}],["path",{d:"M14.12 3.88 16 2",key:"qol33r"}],["path",{d:"M9 7.13v-1a3.003 3.003 0 1 1 6 0v1",key:"d7y7pr"}],["path",{d:"M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6",key:"xs1cw7"}],["path",{d:"M12 20v-9",key:"1qisl0"}],["path",{d:"M6.53 9C4.6 8.8 3 7.1 3 5",key:"32zzws"}],["path",{d:"M6 13H2",key:"82j7cp"}],["path",{d:"M3 21c0-2.1 1.7-3.9 3.8-4",key:"4p0ekp"}],["path",{d:"M20.97 5c0 2.1-1.6 3.8-3.5 4",key:"18gb23"}],["path",{d:"M22 13h-4",key:"1jl80f"}],["path",{d:"M17.2 17c2.1.1 3.8 1.9 3.8 4",key:"k3fwyw"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const re=n("Calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ie=n("Camera",[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ne=n("CheckCircle",[["path",{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14",key:"g774vq"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const oe=n("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ae=n("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ce=n("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const he=n("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ue=n("ChevronUp",[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const le=n("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const de=n("Cpu",[["rect",{x:"4",y:"4",width:"16",height:"16",rx:"2",key:"1vbyd7"}],["rect",{x:"9",y:"9",width:"6",height:"6",key:"o3kz5p"}],["path",{d:"M15 2v2",key:"13l42r"}],["path",{d:"M15 20v2",key:"15mkzm"}],["path",{d:"M2 15h2",key:"1gxd5l"}],["path",{d:"M2 9h2",key:"1bbxkp"}],["path",{d:"M20 15h2",key:"19e6y8"}],["path",{d:"M20 9h2",key:"19tzq7"}],["path",{d:"M9 2v2",key:"165o2o"}],["path",{d:"M9 20v2",key:"i2bqo8"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pe=n("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fe=n("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ye=n("Image",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const me=n("Info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ge=n("KeyRound",[["path",{d:"M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z",key:"167ctg"}],["circle",{cx:"16.5",cy:"7.5",r:".5",fill:"currentColor",key:"w0ekpg"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ke=n("Languages",[["path",{d:"m5 8 6 6",key:"1wu5hv"}],["path",{d:"m4 14 6-6 2-3",key:"1k1g8d"}],["path",{d:"M2 5h12",key:"or177f"}],["path",{d:"M7 2h1",key:"1t2jsx"}],["path",{d:"m22 22-5-10-5 10",key:"don7ne"}],["path",{d:"M14 18h6",key:"1m8k6r"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ve=n("Link",[["path",{d:"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",key:"1cjeqo"}],["path",{d:"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",key:"19qd67"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const be=n("Loader2",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _e=n("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const we=n("LogIn",[["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",key:"u53s6r"}],["polyline",{points:"10 17 15 12 10 7",key:"1ail0h"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12",key:"v6grx8"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Me=n("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xe=n("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Te=n("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ce=n("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Se=n("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ae=n("Moon",[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ee=n("Newspaper",[["path",{d:"M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2",key:"7pis2x"}],["path",{d:"M18 14h-8",key:"sponae"}],["path",{d:"M15 18h-5",key:"95g1m2"}],["path",{d:"M10 6h8v4h-8V6Z",key:"smlsk5"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const De=n("Quote",[["path",{d:"M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z",key:"4rm80e"}],["path",{d:"M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z",key:"10za9r"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Le=n("RefreshCcw",[["path",{d:"M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"14sxne"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16",key:"1hlbsb"}],["path",{d:"M16 16h5v5",key:"ccwih5"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ie=n("Scissors",[["circle",{cx:"6",cy:"6",r:"3",key:"1lh9wr"}],["path",{d:"M8.12 8.12 12 12",key:"1alkpv"}],["path",{d:"M20 4 8.12 15.88",key:"xgtan2"}],["circle",{cx:"6",cy:"18",r:"3",key:"fqmcym"}],["path",{d:"M14.8 14.8 20 20",key:"ptml3r"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oe=n("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pe=n("ShieldAlert",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const je=n("ShieldCheck",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ue=n("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ve=n("Sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re=n("ThumbsDown",[["path",{d:"M17 14V2",key:"8ymqnk"}],["path",{d:"M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z",key:"s6e0r"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ze=n("ThumbsUp",[["path",{d:"M7 10v12",key:"1qc93n"}],["path",{d:"M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z",key:"y3tblf"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qe=n("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Be=n("UserPlus",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"19",x2:"19",y1:"8",y2:"14",key:"1bvyxn"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ke=n("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const He=n("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ze=n("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ne=n("Zap",[["polygon",{points:"13 2 3 14 12 14 11 22 21 10 12 10 13 2",key:"45s27k"}]]);export{Qt as A,ee as B,oe as C,Ce as D,le as E,pe as F,fe as G,me as H,ye as I,se as J,ge as K,_e as L,xe as M,Ee as N,He as O,Se as P,De as Q,Le as R,Ve as S,qe as T,Ke as U,Ze as X,Ne as Z,be as a,we as b,Be as c,Me as d,ke as e,Ae as f,Te as g,Ue as h,ve as i,he as j,je as k,Pe as l,ne as m,Oe as n,ue as o,ae as p,ce as q,re as r,de as s,Jt as t,Xt as u,ie as v,Ie as w,te as x,ze as y,Re as z};
//# sourceMappingURL=ui-XlSEt7C2.js.map
