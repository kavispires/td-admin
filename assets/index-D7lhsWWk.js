import{r as S,a as He,_ as Ie,R as u,a1 as le,aC as N,Z as $e,X as F,aD as ne,a2 as re,$ as _e,aE as Ee,g as De,m as Ve,e as pe,d as Fe,C as Ne,a7 as Oe,c as Le,y as Me}from"./index-BeoNBKs9.js";var je={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 00.6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0046.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z"}}]},name:"star",theme:"filled"},Te=function(t,r){return S.createElement(He,Ie({},t,{ref:r,icon:je}))},ke=S.forwardRef(Te);function Be(e,t){var r=e.disabled,a=e.prefixCls,l=e.character,y=e.characterRender,o=e.index,H=e.count,c=e.value,I=e.allowHalf,h=e.focused,$=e.onHover,_=e.onClick,m=function(f){$(f,o)},E=function(f){_(f,o)},D=function(f){f.keyCode===N.ENTER&&_(f,o)},R=o+1,d=new Set([a]);c===0&&o===0&&h?d.add("".concat(a,"-focused")):I&&c+.5>=R&&c<R?(d.add("".concat(a,"-half")),d.add("".concat(a,"-active")),h&&d.add("".concat(a,"-focused"))):(R<=c?d.add("".concat(a,"-full")):d.add("".concat(a,"-zero")),R===c&&h&&d.add("".concat(a,"-focused")));var s=typeof l=="function"?l(e):l,w=u.createElement("li",{className:le(Array.from(d)),ref:t},u.createElement("div",{onClick:r?null:E,onKeyDown:r?null:D,onMouseMove:r?null:m,role:"radio","aria-checked":c>o?"true":"false","aria-posinset":o+1,"aria-setsize":H,tabIndex:r?-1:0},u.createElement("div",{className:"".concat(a,"-first")},s),u.createElement("div",{className:"".concat(a,"-second")},s)));return y&&(w=y(w,e)),w}const Ke=u.forwardRef(Be);function Pe(){var e=S.useRef({});function t(a){return e.current[a]}function r(a){return function(l){e.current[a]=l}}return[t,r]}function ze(e){var t=e.pageXOffset,r="scrollLeft";if(typeof t!="number"){var a=e.document;t=a.documentElement[r],typeof t!="number"&&(t=a.body[r])}return t}function Xe(e){var t,r,a=e.ownerDocument,l=a.body,y=a&&a.documentElement,o=e.getBoundingClientRect();return t=o.left,r=o.top,t-=y.clientLeft||l.clientLeft||0,r-=y.clientTop||l.clientTop||0,{left:t,top:r}}function Ae(e){var t=Xe(e),r=e.ownerDocument,a=r.defaultView||r.parentWindow;return t.left+=ze(a),t.left}var We=["prefixCls","className","defaultValue","value","count","allowHalf","allowClear","keyboard","character","characterRender","disabled","direction","tabIndex","autoFocus","onHoverChange","onChange","onFocus","onBlur","onKeyDown","onMouseLeave"];function Ge(e,t){var r=e.prefixCls,a=r===void 0?"rc-rate":r,l=e.className,y=e.defaultValue,o=e.value,H=e.count,c=H===void 0?5:H,I=e.allowHalf,h=I===void 0?!1:I,$=e.allowClear,_=$===void 0?!0:$,m=e.keyboard,E=m===void 0?!0:m,D=e.character,R=D===void 0?"★":D,d=e.characterRender,s=e.disabled,w=e.direction,x=w===void 0?"ltr":w,f=e.tabIndex,O=f===void 0?0:f,L=e.autoFocus,V=e.onHoverChange,M=e.onChange,j=e.onFocus,T=e.onBlur,k=e.onKeyDown,B=e.onMouseLeave,oe=$e(e,We),ce=Pe(),z=F(ce,2),se=z[0],ie=z[1],K=u.useRef(null),X=function(){if(!s){var n;(n=K.current)===null||n===void 0||n.focus()}};u.useImperativeHandle(t,function(){return{focus:X,blur:function(){if(!s){var n;(n=K.current)===null||n===void 0||n.blur()}}}});var ue=ne(y||0,{value:o}),A=F(ue,2),b=A[0],de=A[1],fe=ne(null),W=F(fe,2),ve=W[0],P=W[1],G=function(n,C){var i=x==="rtl",v=n+1;if(h){var ee=se(n),ae=Ae(ee),te=ee.clientWidth;(i&&C-ae>te/2||!i&&C-ae<te/2)&&(v-=.5)}return v},p=function(n){de(n),M==null||M(n)},me=u.useState(!1),Z=F(me,2),ge=Z[0],q=Z[1],Ce=function(){q(!0),j==null||j()},be=function(){q(!1),T==null||T()},ye=u.useState(null),J=F(ye,2),Q=J[0],U=J[1],he=function(n,C){var i=G(C,n.pageX);i!==ve&&(U(i),P(null)),V==null||V(i)},Y=function(n){s||(U(null),P(null),V==null||V(void 0)),n&&(B==null||B(n))},Se=function(n,C){var i=G(C,n.pageX),v=!1;_&&(v=i===b),Y(),p(v?0:i),P(v?i:null)},Re=function(n){var C=n.keyCode,i=x==="rtl",v=h?.5:1;E&&(C===N.RIGHT&&b<c&&!i?(p(b+v),n.preventDefault()):C===N.LEFT&&b>0&&!i||C===N.RIGHT&&b>0&&i?(p(b-v),n.preventDefault()):C===N.LEFT&&b<c&&i&&(p(b+v),n.preventDefault())),k==null||k(n)};u.useEffect(function(){L&&!s&&X()},[]);var we=new Array(c).fill(0).map(function(g,n){return u.createElement(Ke,{ref:ie(n),index:n,count:c,disabled:s,prefixCls:"".concat(a,"-star"),allowHalf:h,value:Q===null?b:Q,onClick:Se,onHover:he,key:g||n,character:R,characterRender:d,focused:ge})}),xe=le(a,l,re(re({},"".concat(a,"-disabled"),s),"".concat(a,"-rtl"),x==="rtl"));return u.createElement("ul",_e({className:xe,onMouseLeave:Y,tabIndex:s?-1:O,onFocus:s?null:Ce,onBlur:s?null:be,onKeyDown:s?null:Re,ref:K},Ee(oe,{aria:!0,data:!0,attr:!0})),we)}const Ze=u.forwardRef(Ge),qe=e=>{const{componentCls:t}=e;return{[`${t}-star`]:{position:"relative",display:"inline-block",color:"inherit",cursor:"pointer","&:not(:last-child)":{marginInlineEnd:e.marginXS},"> div":{transition:`all ${e.motionDurationMid}, outline 0s`,"&:hover":{transform:e.starHoverScale},"&:focus":{outline:0},"&:focus-visible":{outline:`${Fe(e.lineWidth)} dashed ${e.starColor}`,transform:e.starHoverScale}},"&-first, &-second":{color:e.starBg,transition:`all ${e.motionDurationMid}`,userSelect:"none"},"&-first":{position:"absolute",top:0,insetInlineStart:0,width:"50%",height:"100%",overflow:"hidden",opacity:0},[`&-half ${t}-star-first, &-half ${t}-star-second`]:{opacity:1},[`&-half ${t}-star-first, &-full ${t}-star-second`]:{color:"inherit"}}}},Je=e=>({[`&-rtl${e.componentCls}`]:{direction:"rtl"}}),Qe=e=>{const{componentCls:t}=e;return{[t]:Object.assign(Object.assign(Object.assign(Object.assign({},pe(e)),{display:"inline-block",margin:0,padding:0,color:e.starColor,fontSize:e.starSize,lineHeight:1,listStyle:"none",outline:"none",[`&-disabled${t} ${t}-star`]:{cursor:"default","> div:hover":{transform:"scale(1)"}}}),qe(e)),Je(e))}},Ue=e=>({starColor:e.yellow6,starSize:e.controlHeightLG*.5,starHoverScale:"scale(1.1)",starBg:e.colorFillContent}),Ye=De("Rate",e=>{const t=Ve(e,{});return[Qe(t)]},Ue);var ea=function(e,t){var r={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(r[a]=e[a]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var l=0,a=Object.getOwnPropertySymbols(e);l<a.length;l++)t.indexOf(a[l])<0&&Object.prototype.propertyIsEnumerable.call(e,a[l])&&(r[a[l]]=e[a[l]]);return r};const ta=S.forwardRef((e,t)=>{const{prefixCls:r,className:a,rootClassName:l,style:y,tooltips:o,character:H=S.createElement(ke,null),disabled:c}=e,I=ea(e,["prefixCls","className","rootClassName","style","tooltips","character","disabled"]),h=(f,O)=>{let{index:L}=O;return o?S.createElement(Me,{title:o[L]},f):f},{getPrefixCls:$,direction:_,rate:m}=S.useContext(Ne),E=$("rate",r),[D,R,d]=Ye(E),s=Object.assign(Object.assign({},m==null?void 0:m.style),y),w=S.useContext(Oe),x=c??w;return D(S.createElement(Ze,Object.assign({ref:t,character:H,characterRender:h,disabled:x},I,{className:Le(a,l,R,d,m==null?void 0:m.className),style:s,prefixCls:E,direction:_})))});export{ta as R};
