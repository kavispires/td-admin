/*! For license information please see 482.c33c3b5d.chunk.js.LICENSE.txt */
(self.webpackChunktdr=self.webpackChunktdr||[]).push([[482],{9862:(e,n,t)=>{"use strict";t.d(n,{Z:()=>S});var o=t(2791),r=t(9809),a=t.n(r),c=t(9590),i=t(117),l=t(417),s=t(1929),u=t(9125),d=t(7838),f=t(1940);const p=o.createContext(null);var b=t(7295),v=function(e,n){var t={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&n.indexOf(o)<0&&(t[o]=e[o]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)n.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(t[o[r]]=e[o[r]])}return t};const h=(e,n)=>{var t;const{prefixCls:r,className:h,rootClassName:g,children:m,indeterminate:y=!1,style:C,onMouseEnter:k,onMouseLeave:x,skipGroup:O=!1,disabled:S}=e,w=v(e,["prefixCls","className","rootClassName","children","indeterminate","style","onMouseEnter","onMouseLeave","skipGroup","disabled"]),{getPrefixCls:E,direction:j,checkbox:Z}=o.useContext(s.E_),P=o.useContext(p),{isFormItemInput:N}=o.useContext(f.aM),I=o.useContext(u.Z),R=null!==(t=(null===P||void 0===P?void 0:P.disabled)||S)&&void 0!==t?t:I,z=o.useRef(w.value);o.useEffect((()=>{null===P||void 0===P||P.registerValue(w.value)}),[]),o.useEffect((()=>{if(!O)return w.value!==z.current&&(null===P||void 0===P||P.cancelValue(z.current),null===P||void 0===P||P.registerValue(w.value),z.current=w.value),()=>null===P||void 0===P?void 0:P.cancelValue(w.value)}),[w.value]);const D=E("checkbox",r),M=(0,d.Z)(D),[B,V,A]=(0,b.ZP)(D,M),T=Object.assign({},w);P&&!O&&(T.onChange=function(){w.onChange&&w.onChange.apply(w,arguments),P.toggleOption&&P.toggleOption({label:m,value:w.value})},T.name=P.name,T.checked=P.value.includes(w.value));const W=a()("".concat(D,"-wrapper"),{["".concat(D,"-rtl")]:"rtl"===j,["".concat(D,"-wrapper-checked")]:T.checked,["".concat(D,"-wrapper-disabled")]:R,["".concat(D,"-wrapper-in-form-item")]:N},null===Z||void 0===Z?void 0:Z.className,h,g,A,M,V),q=a()({["".concat(D,"-indeterminate")]:y},l.A,V),G=y?"mixed":void 0;return B(o.createElement(i.Z,{component:"Checkbox",disabled:R},o.createElement("label",{className:W,style:Object.assign(Object.assign({},null===Z||void 0===Z?void 0:Z.style),C),onMouseEnter:k,onMouseLeave:x},o.createElement(c.Z,Object.assign({"aria-checked":G},T,{prefixCls:D,className:q,disabled:R,ref:n})),void 0!==m&&o.createElement("span",null,m))))};const g=o.forwardRef(h);var m=t(6622),y=t(1498),C=function(e,n){var t={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&n.indexOf(o)<0&&(t[o]=e[o]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)n.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(t[o[r]]=e[o[r]])}return t};const k=o.forwardRef(((e,n)=>{const{defaultValue:t,children:r,options:c=[],prefixCls:i,className:l,rootClassName:u,style:f,onChange:v}=e,h=C(e,["defaultValue","children","options","prefixCls","className","rootClassName","style","onChange"]),{getPrefixCls:k,direction:x}=o.useContext(s.E_),[O,S]=o.useState(h.value||t||[]),[w,E]=o.useState([]);o.useEffect((()=>{"value"in h&&S(h.value||[])}),[h.value]);const j=o.useMemo((()=>c.map((e=>"string"===typeof e||"number"===typeof e?{label:e,value:e}:e))),[c]),Z=k("checkbox",i),P="".concat(Z,"-group"),N=(0,d.Z)(Z),[I,R,z]=(0,b.ZP)(Z,N),D=(0,y.Z)(h,["value","disabled"]),M=c.length?j.map((e=>o.createElement(g,{prefixCls:Z,key:e.value.toString(),disabled:"disabled"in e?e.disabled:h.disabled,value:e.value,checked:O.includes(e.value),onChange:e.onChange,className:"".concat(P,"-item"),style:e.style,title:e.title,id:e.id,required:e.required},e.label))):r,B={toggleOption:e=>{const n=O.indexOf(e.value),t=(0,m.Z)(O);-1===n?t.push(e.value):t.splice(n,1),"value"in h||S(t),null===v||void 0===v||v(t.filter((e=>w.includes(e))).sort(((e,n)=>j.findIndex((n=>n.value===e))-j.findIndex((e=>e.value===n)))))},value:O,disabled:h.disabled,name:h.name,registerValue:e=>{E((n=>[].concat((0,m.Z)(n),[e])))},cancelValue:e=>{E((n=>n.filter((n=>n!==e))))}},V=a()(P,{["".concat(P,"-rtl")]:"rtl"===x},l,u,z,N,R);return I(o.createElement("div",Object.assign({className:V,style:f},D,{ref:n}),o.createElement(p.Provider,{value:B},M)))})),x=k,O=g;O.Group=x,O.__ANT_CHECKBOX=!0;const S=O},7295:(e,n,t)=>{"use strict";t.d(n,{C2:()=>l,ZP:()=>s});var o=t(909),r=t(7521),a=t(9922),c=t(6562);const i=e=>{const{checkboxCls:n}=e,t="".concat(n,"-wrapper");return[{["".concat(n,"-group")]:Object.assign(Object.assign({},(0,r.Wf)(e)),{display:"inline-flex",flexWrap:"wrap",columnGap:e.marginXS,["> ".concat(e.antCls,"-row")]:{flex:1}}),[t]:Object.assign(Object.assign({},(0,r.Wf)(e)),{display:"inline-flex",alignItems:"baseline",cursor:"pointer","&:after":{display:"inline-block",width:0,overflow:"hidden",content:"'\\a0'"},["& + ".concat(t)]:{marginInlineStart:0},["&".concat(t,"-in-form-item")]:{'input[type="checkbox"]':{width:14,height:14}}}),[n]:Object.assign(Object.assign({},(0,r.Wf)(e)),{position:"relative",whiteSpace:"nowrap",lineHeight:1,cursor:"pointer",borderRadius:e.borderRadiusSM,alignSelf:"center",["".concat(n,"-input")]:{position:"absolute",inset:0,zIndex:1,cursor:"pointer",opacity:0,margin:0,["&:focus-visible + ".concat(n,"-inner")]:Object.assign({},(0,r.oN)(e))},["".concat(n,"-inner")]:{boxSizing:"border-box",display:"block",width:e.checkboxSize,height:e.checkboxSize,direction:"ltr",backgroundColor:e.colorBgContainer,border:"".concat((0,o.bf)(e.lineWidth)," ").concat(e.lineType," ").concat(e.colorBorder),borderRadius:e.borderRadiusSM,borderCollapse:"separate",transition:"all ".concat(e.motionDurationSlow),"&:after":{boxSizing:"border-box",position:"absolute",top:"50%",insetInlineStart:"25%",display:"table",width:e.calc(e.checkboxSize).div(14).mul(5).equal(),height:e.calc(e.checkboxSize).div(14).mul(8).equal(),border:"".concat((0,o.bf)(e.lineWidthBold)," solid ").concat(e.colorWhite),borderTop:0,borderInlineStart:0,transform:"rotate(45deg) scale(0) translate(-50%,-50%)",opacity:0,content:'""',transition:"all ".concat(e.motionDurationFast," ").concat(e.motionEaseInBack,", opacity ").concat(e.motionDurationFast)}},"& + span":{paddingInlineStart:e.paddingXS,paddingInlineEnd:e.paddingXS}})},{["\n        ".concat(t,":not(").concat(t,"-disabled),\n        ").concat(n,":not(").concat(n,"-disabled)\n      ")]:{["&:hover ".concat(n,"-inner")]:{borderColor:e.colorPrimary}},["".concat(t,":not(").concat(t,"-disabled)")]:{["&:hover ".concat(n,"-checked:not(").concat(n,"-disabled) ").concat(n,"-inner")]:{backgroundColor:e.colorPrimaryHover,borderColor:"transparent"},["&:hover ".concat(n,"-checked:not(").concat(n,"-disabled):after")]:{borderColor:e.colorPrimaryHover}}},{["".concat(n,"-checked")]:{["".concat(n,"-inner")]:{backgroundColor:e.colorPrimary,borderColor:e.colorPrimary,"&:after":{opacity:1,transform:"rotate(45deg) scale(1) translate(-50%,-50%)",transition:"all ".concat(e.motionDurationMid," ").concat(e.motionEaseOutBack," ").concat(e.motionDurationFast)}}},["\n        ".concat(t,"-checked:not(").concat(t,"-disabled),\n        ").concat(n,"-checked:not(").concat(n,"-disabled)\n      ")]:{["&:hover ".concat(n,"-inner")]:{backgroundColor:e.colorPrimaryHover,borderColor:"transparent"}}},{[n]:{"&-indeterminate":{["".concat(n,"-inner")]:{backgroundColor:e.colorBgContainer,borderColor:e.colorBorder,"&:after":{top:"50%",insetInlineStart:"50%",width:e.calc(e.fontSizeLG).div(2).equal(),height:e.calc(e.fontSizeLG).div(2).equal(),backgroundColor:e.colorPrimary,border:0,transform:"translate(-50%, -50%) scale(1)",opacity:1,content:'""'}}}}},{["".concat(t,"-disabled")]:{cursor:"not-allowed"},["".concat(n,"-disabled")]:{["&, ".concat(n,"-input")]:{cursor:"not-allowed",pointerEvents:"none"},["".concat(n,"-inner")]:{background:e.colorBgContainerDisabled,borderColor:e.colorBorder,"&:after":{borderColor:e.colorTextDisabled}},"&:after":{display:"none"},"& + span":{color:e.colorTextDisabled},["&".concat(n,"-indeterminate ").concat(n,"-inner::after")]:{background:e.colorTextDisabled}}}]};function l(e,n){const t=(0,a.TS)(n,{checkboxCls:".".concat(e),checkboxSize:n.controlInteractiveSize});return[i(t)]}const s=(0,c.I$)("Checkbox",((e,n)=>{let{prefixCls:t}=n;return[l(t,e)]}))},9590:(e,n,t)=>{"use strict";t.d(n,{Z:()=>m});var o=t(7462),r=t(1413),a=t(4942),c=t(9439),i=t(4925),l=t(536),s=t.n(l),u=t(2791);function d(e){var n=u.useRef();n.current=e;var t=u.useCallback((function(){for(var e,t=arguments.length,o=new Array(t),r=0;r<t;r++)o[r]=arguments[r];return null===(e=n.current)||void 0===e?void 0:e.call.apply(e,[n].concat(o))}),[]);return t}var f="undefined"!==typeof window&&window.document&&window.document.createElement?u.useLayoutEffect:u.useEffect,p=function(e,n){var t=u.useRef(!0);f((function(){return e(t.current)}),n),f((function(){return t.current=!1,function(){t.current=!0}}),[])},b=function(e,n){p((function(n){if(!n)return e()}),n)};function v(e){var n=u.useRef(!1),t=u.useState(e),o=(0,c.Z)(t,2),r=o[0],a=o[1];return u.useEffect((function(){return n.current=!1,function(){n.current=!0}}),[]),[r,function(e,t){t&&n.current||a(e)}]}function h(e){return void 0!==e}var g=["prefixCls","className","style","checked","disabled","defaultChecked","type","title","onChange"];const m=(0,u.forwardRef)((function(e,n){var t=e.prefixCls,l=void 0===t?"rc-checkbox":t,f=e.className,p=e.style,m=e.checked,y=e.disabled,C=e.defaultChecked,k=void 0!==C&&C,x=e.type,O=void 0===x?"checkbox":x,S=e.title,w=e.onChange,E=(0,i.Z)(e,g),j=(0,u.useRef)(null),Z=function(e,n){var t=n||{},o=t.defaultValue,r=t.value,a=t.onChange,i=t.postState,l=v((function(){return h(r)?r:h(o)?"function"===typeof o?o():o:"function"===typeof e?e():e})),s=(0,c.Z)(l,2),u=s[0],f=s[1],p=void 0!==r?r:u,g=i?i(p):p,m=d(a),y=v([p]),C=(0,c.Z)(y,2),k=C[0],x=C[1];return b((function(){var e=k[0];u!==e&&m(u,e)}),[k]),b((function(){h(r)||f(r)}),[r]),[g,d((function(e,n){f(e,n),x([p],n)}))]}(k,{value:m}),P=(0,c.Z)(Z,2),N=P[0],I=P[1];(0,u.useImperativeHandle)(n,(function(){return{focus:function(e){var n;null===(n=j.current)||void 0===n||n.focus(e)},blur:function(){var e;null===(e=j.current)||void 0===e||e.blur()},input:j.current}}));var R=s()(l,f,(0,a.Z)((0,a.Z)({},"".concat(l,"-checked"),N),"".concat(l,"-disabled"),y));return u.createElement("span",{className:R,title:S,style:p},u.createElement("input",(0,o.Z)({},E,{className:"".concat(l,"-input"),ref:j,onChange:function(n){y||("checked"in e||I(n.target.checked),null===w||void 0===w||w({target:(0,r.Z)((0,r.Z)({},e),{},{type:O,checked:n.target.checked}),stopPropagation:function(){n.stopPropagation()},preventDefault:function(){n.preventDefault()},nativeEvent:n.nativeEvent}))},disabled:y,checked:!!N,type:O})),u.createElement("span",{className:"".concat(l,"-inner")}))}))},536:(e,n)=>{var t;!function(){"use strict";var o={}.hasOwnProperty;function r(){for(var e=[],n=0;n<arguments.length;n++){var t=arguments[n];if(t){var a=typeof t;if("string"===a||"number"===a)e.push(t);else if(Array.isArray(t)){if(t.length){var c=r.apply(null,t);c&&e.push(c)}}else if("object"===a){if(t.toString!==Object.prototype.toString&&!t.toString.toString().includes("[native code]")){e.push(t.toString());continue}for(var i in t)o.call(t,i)&&t[i]&&e.push(i)}}}return e.join(" ")}e.exports?(r.default=r,e.exports=r):void 0===(t=function(){return r}.apply(n,[]))||(e.exports=t)}()},3733:(e,n,t)=>{"use strict";function o(e){var n,t,r="";if("string"==typeof e||"number"==typeof e)r+=e;else if("object"==typeof e)if(Array.isArray(e)){var a=e.length;for(n=0;n<a;n++)e[n]&&(t=o(e[n]))&&(r&&(r+=" "),r+=t)}else for(t in e)e[t]&&(r&&(r+=" "),r+=t);return r}t.d(n,{Z:()=>r});const r=function(){for(var e,n,t=0,r="",a=arguments.length;t<a;t++)(e=arguments[t])&&(n=o(e))&&(r&&(r+=" "),r+=n);return r}}}]);
//# sourceMappingURL=482.c33c3b5d.chunk.js.map