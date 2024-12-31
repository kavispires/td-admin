(self.webpackChunktd_admin=self.webpackChunktd_admin||[]).push([[1853],{2043:(e,t,n)=>{"use strict";n.d(t,{Do:()=>h,H:()=>m,tj:()=>p,xh:()=>g,zE:()=>u});var r=n(3070),o=n(906),a=n(9793),l=n(5922),c=n(9862),s=n(4248),i=n(1431),d=n(184);function u(e){let{label:t,value:n,onChange:a,options:l,placeholder:c}=e;return(0,d.jsx)(r.Z.Item,{label:t,children:(0,d.jsxs)(o.Z,{style:{minWidth:"150px"},onChange:a,value:n,children:[c&&(0,d.jsx)(o.Z.Option,{value:"",disabled:!0,children:"placeholder"}),l.map((e=>"object"===typeof e?(0,d.jsx)(o.Z.Option,{value:e.value,children:e.label},"".concat(t,"-").concat(e.value)):(0,d.jsx)(o.Z.Option,{value:e,children:e},"".concat(t,"-").concat(e))))]})})}function g(e){let{label:t,value:n,onChange:o,min:l=0,max:c=100,step:s}=e;return(0,d.jsx)(r.Z.Item,{label:t,children:(0,d.jsx)(a.Z,{min:l,max:c,value:n,onChange:e=>o(null!==e&&void 0!==e?e:c),style:{minWidth:"150px",width:"100%"},step:s})})}function h(e){let{label:t,value:n,onChange:o,className:a,disabled:c}=e;return(0,d.jsx)(r.Z.Item,{label:t,valuePropName:"checked",className:a,children:(0,d.jsx)(l.Z,{checked:n,onChange:o,size:"small",disabled:c})})}function p(e){let{label:t,value:n,onChange:o,disabled:a,className:l}=e;return(0,d.jsx)(r.Z.Item,{label:t,valuePropName:"checked",className:l,children:(0,d.jsx)(c.Z,{checked:n,onChange:e=>o(e.target.checked),disabled:a})})}function m(e){let{value:t,label:n,onChange:o,options:a}=e;return(0,d.jsx)(r.Z.Item,{label:n,layout:a.length>2?"vertical":"horizontal",children:(0,d.jsx)(s.Z,{block:!0,value:t,onChange:o,options:a.map((e=>({label:(0,d.jsx)(i.Z,{arrow:!0,trigger:"hover",title:e.title,children:e.icon}),value:e.value})))})})}},8866:(e,t,n)=>{"use strict";n.d(t,{N:()=>s});var r=n(1413),o=n(4925),a=n(6178),l=n(184);const c=["children","level"];function s(e){let{children:t,level:n}=e,s=(0,o.Z)(e,c);return(0,l.jsx)(a.Z.Title,(0,r.Z)((0,r.Z)({level:null!==n&&void 0!==n?n:3},s),{},{children:t}))}},8357:(e,t,n)=>{"use strict";n.d(t,{tj:()=>i.tj,xh:()=>i.xh,H:()=>i.H,zE:()=>i.zE,Do:()=>i.Do,Th:()=>p,F6:()=>s});n(8866);var r=n(1413),o=n(4925),a=n(3733),l=n(184);const c=["children","active","activeClass","className","hoverType"],s=e=>{let{children:t,active:n=!1,activeClass:s="",className:i="",hoverType:d="scale"}=e,u=(0,o.Z)(e,c);return(0,l.jsx)("button",(0,r.Z)((0,r.Z)({className:(0,a.Z)("transparent-button","transparent-button--".concat(d),n&&(s||"transparent-button--active"),i)},u),{},{children:t}))};var i=n(2043),d=n(952),u=n(3070),g=n(7965);function h(e){let{isLoading:t,isIdle:n,error:r,isDirty:o,isError:a,hasResponseData:c}=e;return n?(0,l.jsx)(d.Z,{children:"No Data yet"}):t?(0,l.jsx)(d.Z,{color:"blue",children:"Loading..."}):r||a?(0,l.jsx)(d.Z,{color:"red",children:"Error"}):o?(0,l.jsx)(d.Z,{color:"orange",children:"Modified"}):c?(0,l.jsx)(d.Z,{color:"green",children:"Loaded"}):(0,l.jsx)(d.Z,{children:"No Data"})}function p(e){return(0,l.jsx)(g.Pd,{children:(0,l.jsx)(u.Z.Item,{label:"Status",children:(0,l.jsx)(h,(0,r.Z)({},e))})})}},6422:(e,t,n)=>{"use strict";n.d(t,{v:()=>u});var r=n(3070),o=n(906),a=n(9475),l=n(2791),c=n(7965),s=n(4766),i=n(6591),d=n(184);function u(e){var t,n,u;let{resourceNames:g}=e;const{queryParams:h,addParam:p}=(0,s.K)(),[m]=r.Z.useForm(),[b,v]=(0,l.useState)(null!==(t=h.get("resourceName"))&&void 0!==t?t:"");return(0,d.jsx)(c.Pd,{children:(0,d.jsxs)(r.Z,{layout:"vertical",onFinish:e=>{const t=i.S.includes(e.resourceName);p("language",t?null:e.language),p("resourceName",e.resourceName)},size:"small",form:m,initialValues:{resourceName:null!==(n=h.get("resourceName"))&&void 0!==n?n:"",language:null!==(u=h.get("language"))&&void 0!==u?u:""},children:[(0,d.jsx)(r.Z.Item,{label:"Resource",name:"resourceName",children:(0,d.jsx)(o.Z,{style:{minWidth:"150px"},value:h.get("resourceName"),onChange:e=>v(e),children:g.map((e=>(0,d.jsx)(o.Z.Option,{value:e,children:e},e)))})}),(0,d.jsx)(r.Z.Item,{label:"Language",name:"language",children:(0,d.jsx)(o.Z,{style:{minWidth:"150px"},disabled:i.S.includes(b),children:i.a2.map((e=>(0,d.jsx)(o.Z.Option,{value:e,children:e},e)))})}),(0,d.jsx)(r.Z.Item,{children:(0,d.jsx)(a.ZP,{type:"primary",htmlType:"submit",children:"Load"})})]})})}},3115:(e,t,n)=>{"use strict";n.d(t,{X:()=>i});var r=n(7515),o=n(2791),a=n(5850),l=n(6591),c=n(8866),s=n(184);function i(e){let{response:t,property:n}=e;const[i,d]=(0,o.useState)({});return(0,s.jsxs)("div",{className:"parser-flex-column",children:[(0,s.jsx)(c.N,{children:"Search Similar"}),(0,s.jsx)(r.Z,{type:"text",onChange:e=>{const{value:r=""}=e.target,o=(0,a.bU)(r.trim().toLowerCase());o&&o.length>=l.dX?d((0,a.Kn)(o,t,n)):d({})},placeholder:"Type here"}),(0,s.jsx)(r.Z.TextArea,{name:"search-results",id:"",cols:10,rows:10,readOnly:!0,value:JSON.stringify(i,null,4)})]})}},4766:(e,t,n)=>{"use strict";n.d(t,{K:()=>a});var r=n(1087),o=n(263);function a(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};const[t,n]=(0,r.lr)(),a=(e,r,o)=>{void 0===r||""===r||r===o?t.delete(e):t.set(e,String(r)),n(t)},l=function(e){let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};Object.entries(e).forEach((e=>{let[n,o]=e;r[n]===o?t.delete(n):t.set(n,String(o))})),n(t)},c=e=>{t.delete(e),n(t)},s=function(e){let n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"true";return t.get(e)===String(n)};return(0,o.Z)((()=>{Object.entries(e).forEach((e=>{let[n,r]=e;t.has(n)||a(n,r)}))})),{addParam:a,addParams:l,removeParam:c,queryParams:t,is:s}}},3473:(e,t,n)=>{"use strict";n.d(t,{R:()=>c});var r=n(6591),o=n(2010),a=n(2606),l=n(4766);function c(e){var t;const{queryParams:n}=(0,l.K)(),{getUrl:c}=(0,a.n)("resources"),s=null!==(t=n.get("resourceName"))&&void 0!==t?t:"",i=n.get("language"),d=!!s&&e.includes(s),{data:u,isLoading:g,error:h}=(0,o.a)({queryKey:["resource",s,i],queryFn:async()=>{const e=i&&!r.S.includes(s)?c("".concat(s,"-").concat(i,".json")):c("".concat(s,".json")),t=await fetch(e);return t.body?await t.json():{}},enabled:d});return{resourceName:s,language:i||null,response:u,isLoading:g,enabled:d,error:h,hasResponseData:Boolean(u)}}},4497:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>y});var r=n(1413),o=n(6178),a=n(1790),l=n(7515),c=n(8357),s=n(8866),i=n(7965),d=n(4562),u=n(4766),g=n(2791),h=n(2128),p=n(6422),m=n(3115),b=n(3473),v=n(5850),x=n(6591),f=n(184);const{Text:j}=o.Z;const y=function(){(0,u.K)({resourceName:x.mj.SINGLE_WORDS,language:"pt"});const[e,t]=(0,g.useState)({}),[n,o]=(0,g.useState)({}),[y,Z]=(0,g.useState)({}),N="text",{language:S,isLoading:k,error:O,hasResponseData:w,response:E}=(0,b.R)([x.mj.SINGLE_WORDS]);return(0,g.useEffect)((()=>{if(E){const e={},n={},a=Object.values(E).filter((t=>{const r=(0,v.bU)(t.text).toLowerCase();return e[r]?(n[t.id]=t.text,!1):(e[r]=!0,!0)})).map(((e,t)=>(0,r.Z)((0,r.Z)({},e),{},{id:"sw-".concat(t+1,"-").concat(S)}))).reduce(((e,t)=>(e[t.id]=t,e)),{});Z(a),o(n),t(a)}}),[E,S]),(0,f.jsx)(i.Xg,{title:"Single Word Expander",subtitle:S?"".concat(S):"",children:(0,f.jsxs)(a.Z,{hasSider:!0,children:[(0,f.jsxs)(d.p,{children:[(0,f.jsx)(c.Th,{hasResponseData:w,isLoading:k,error:O}),(0,f.jsx)(p.v,{resourceNames:[x.mj.SINGLE_WORDS]})]}),(0,f.jsx)(a.Z.Content,{className:"content",children:(0,f.jsx)(h.T,{isLoading:k,error:O,hasResponseData:w,children:(0,f.jsxs)("div",{className:"parser-container",children:[(0,f.jsxs)("div",{className:"parser-main",children:[(0,f.jsx)(s.N,{children:"Input New Data"}),(0,f.jsx)(l.Z.TextArea,{name:"input",id:"",cols:15,rows:5,onChange:e=>{const{value:n}=e.target,o=n.split("\n"),a=Object.values(y),l=Number(a[a.length-1].id.split("-")[1])||1,c=o.reduce(((e,t,n)=>{const r=C(t,E,N);if(t&&!r){const r="sw-".concat(l+n+1,"-").concat(S);e[r]={id:r,text:t.toLowerCase()}}return e}),(0,r.Z)({},y));t(c)}}),(0,f.jsxs)(s.N,{children:["Output (",Object.keys(e).length,")"]}),(0,f.jsx)(l.Z.TextArea,{name:"output",id:"",cols:15,rows:13,readOnly:!0,value:JSON.stringify(e,null,4)}),(0,f.jsxs)(s.N,{children:["Duplicates (",Object.keys(n).length,")"]}),(0,f.jsx)(l.Z.TextArea,{name:"duplicates",id:"",cols:15,rows:3,readOnly:!0,value:JSON.stringify(n,null,4)})]}),(0,f.jsxs)("aside",{className:"parser-controls",children:[(0,f.jsx)(s.N,{children:"Database"}),(0,f.jsxs)(j,{children:[Object.keys(null!==E&&void 0!==E?E:{}).length," entries / ",Object.keys(null!==y&&void 0!==y?y:{}).length]}),(0,f.jsx)(m.X,{response:E,property:N})]})]})})})]})})},C=(e,t,n)=>{const r=(0,v.bU)(e.trim().toLowerCase());if(r.length>x.dX){const e=(0,v.Kn)(r,t,n);return Object.values(e).some((e=>(0,v.bU)(e)===r))}return!1}},398:(e,t,n)=>{"use strict";n.d(t,{Z:()=>s});var r=n(7460),o=n(2791);const a={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M464 720a48 48 0 1096 0 48 48 0 10-96 0zm16-304v184c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V416c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8zm475.7 440l-416-720c-6.2-10.7-16.9-16-27.7-16s-21.6 5.3-27.7 16l-416 720C56 877.4 71.4 904 96 904h832c24.6 0 40-26.6 27.7-48zm-783.5-27.9L512 239.9l339.8 588.2H172.2z"}}]},name:"warning",theme:"outlined"};var l=n(4790),c=function(e,t){return o.createElement(l.Z,(0,r.Z)({},e,{ref:t,icon:a}))};const s=o.forwardRef(c)},952:(e,t,n)=>{"use strict";n.d(t,{Z:()=>I});var r=n(2791),o=n(9809),a=n.n(o),l=n(1498),c=n(4466),s=n(922),i=n(1113),d=n(117),u=n(1929),g=n(3025),h=n(9391),p=n(7521),m=n(4628),b=n(6428);const v=e=>{const{lineWidth:t,fontSizeIcon:n,calc:r}=e,o=e.fontSizeSM;return(0,m.IX)(e,{tagFontSize:o,tagLineHeight:(0,g.bf)(r(e.lineHeightSM).mul(o).equal()),tagIconSize:r(n).sub(r(t).mul(2)).equal(),tagPaddingHorizontal:8,tagBorderlessBg:e.defaultBg})},x=e=>({defaultBg:new h.C(e.colorFillQuaternary).onBackground(e.colorBgContainer).toHexString(),defaultColor:e.colorText}),f=(0,b.I$)("Tag",(e=>(e=>{const{paddingXXS:t,lineWidth:n,tagPaddingHorizontal:r,componentCls:o,calc:a}=e,l=a(r).sub(n).equal(),c=a(t).sub(n).equal();return{[o]:Object.assign(Object.assign({},(0,p.Wf)(e)),{display:"inline-block",height:"auto",marginInlineEnd:e.marginXS,paddingInline:l,fontSize:e.tagFontSize,lineHeight:e.tagLineHeight,whiteSpace:"nowrap",background:e.defaultBg,border:"".concat((0,g.bf)(e.lineWidth)," ").concat(e.lineType," ").concat(e.colorBorder),borderRadius:e.borderRadiusSM,opacity:1,transition:"all ".concat(e.motionDurationMid),textAlign:"start",position:"relative",["&".concat(o,"-rtl")]:{direction:"rtl"},"&, a, a:hover":{color:e.defaultColor},["".concat(o,"-close-icon")]:{marginInlineStart:c,fontSize:e.tagIconSize,color:e.colorTextDescription,cursor:"pointer",transition:"all ".concat(e.motionDurationMid),"&:hover":{color:e.colorTextHeading}},["&".concat(o,"-has-color")]:{borderColor:"transparent",["&, a, a:hover, ".concat(e.iconCls,"-close, ").concat(e.iconCls,"-close:hover")]:{color:e.colorTextLightSolid}},"&-checkable":{backgroundColor:"transparent",borderColor:"transparent",cursor:"pointer",["&:not(".concat(o,"-checkable-checked):hover")]:{color:e.colorPrimary,backgroundColor:e.colorFillSecondary},"&:active, &-checked":{color:e.colorTextLightSolid},"&-checked":{backgroundColor:e.colorPrimary,"&:hover":{backgroundColor:e.colorPrimaryHover}},"&:active":{backgroundColor:e.colorPrimaryActive}},"&-hidden":{display:"none"},["> ".concat(e.iconCls," + span, > span + ").concat(e.iconCls)]:{marginInlineStart:l}}),["".concat(o,"-borderless")]:{borderColor:"transparent",background:e.tagBorderlessBg}}})(v(e))),x);var j=function(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]])}return n};const y=r.forwardRef(((e,t)=>{const{prefixCls:n,style:o,className:l,checked:c,onChange:s,onClick:i}=e,d=j(e,["prefixCls","style","className","checked","onChange","onClick"]),{getPrefixCls:g,tag:h}=r.useContext(u.E_),p=g("tag",n),[m,b,v]=f(p),x=a()(p,"".concat(p,"-checkable"),{["".concat(p,"-checkable-checked")]:c},null===h||void 0===h?void 0:h.className,l,b,v);return m(r.createElement("span",Object.assign({},d,{ref:t,style:Object.assign(Object.assign({},o),null===h||void 0===h?void 0:h.style),className:x,onClick:e=>{null===s||void 0===s||s(!c),null===i||void 0===i||i(e)}})))})),C=y;var Z=n(6356);const N=(0,b.bk)(["Tag","preset"],(e=>(e=>(0,Z.Z)(e,((t,n)=>{let{textColor:r,lightBorderColor:o,lightColor:a,darkColor:l}=n;return{["".concat(e.componentCls).concat(e.componentCls,"-").concat(t)]:{color:r,background:a,borderColor:o,"&-inverse":{color:e.colorTextLightSolid,background:l,borderColor:l},["&".concat(e.componentCls,"-borderless")]:{borderColor:"transparent"}}}})))(v(e))),x);const S=(e,t,n)=>{const r="string"!==typeof(o=n)?o:o.charAt(0).toUpperCase()+o.slice(1);var o;return{["".concat(e.componentCls).concat(e.componentCls,"-").concat(t)]:{color:e["color".concat(n)],background:e["color".concat(r,"Bg")],borderColor:e["color".concat(r,"Border")],["&".concat(e.componentCls,"-borderless")]:{borderColor:"transparent"}}}},k=(0,b.bk)(["Tag","status"],(e=>{const t=v(e);return[S(t,"success","Success"),S(t,"processing","Info"),S(t,"error","Error"),S(t,"warning","Warning")]}),x);var O=function(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]])}return n};const w=r.forwardRef(((e,t)=>{const{prefixCls:n,className:o,rootClassName:g,style:h,children:p,icon:m,color:b,onClose:v,bordered:x=!0,visible:j}=e,y=O(e,["prefixCls","className","rootClassName","style","children","icon","color","onClose","bordered","visible"]),{getPrefixCls:C,direction:Z,tag:S}=r.useContext(u.E_),[w,E]=r.useState(!0),I=(0,l.Z)(y,["closeIcon","closable"]);r.useEffect((()=>{void 0!==j&&E(j)}),[j]);const P=(0,c.o2)(b),T=(0,c.yT)(b),L=P||T,z=Object.assign(Object.assign({backgroundColor:b&&!L?b:void 0},null===S||void 0===S?void 0:S.style),h),D=C("tag",n),[B,R,H]=f(D),W=a()(D,null===S||void 0===S?void 0:S.className,{["".concat(D,"-").concat(b)]:L,["".concat(D,"-has-color")]:b&&!L,["".concat(D,"-hidden")]:!w,["".concat(D,"-rtl")]:"rtl"===Z,["".concat(D,"-borderless")]:!x},o,g,R,H),M=e=>{e.stopPropagation(),null===v||void 0===v||v(e),e.defaultPrevented||E(!1)},[,F]=(0,s.Z)((0,s.w)(e),(0,s.w)(S),{closable:!1,closeIconRender:e=>{const t=r.createElement("span",{className:"".concat(D,"-close-icon"),onClick:M},e);return(0,i.wm)(e,t,(e=>({onClick:t=>{var n;null===(n=null===e||void 0===e?void 0:e.onClick)||void 0===n||n.call(e,t),M(t)},className:a()(null===e||void 0===e?void 0:e.className,"".concat(D,"-close-icon"))})))}}),q="function"===typeof y.onClick||p&&"a"===p.type,A=m||null,X=A?r.createElement(r.Fragment,null,A,p&&r.createElement("span",null,p)):p,K=r.createElement("span",Object.assign({},I,{ref:t,className:W,style:z}),X,F,P&&r.createElement(N,{key:"preset",prefixCls:D}),T&&r.createElement(k,{key:"status",prefixCls:D}));return B(q?r.createElement(d.Z,{component:"Tag"},K):K)})),E=w;E.CheckableTag=C;const I=E},1291:e=>{function t(e,t){if((e=e.replace(/\s+/g,""))===(t=t.replace(/\s+/g,"")))return 1;if(e.length<2||t.length<2)return 0;let n=new Map;for(let o=0;o<e.length-1;o++){const t=e.substring(o,o+2),r=n.has(t)?n.get(t)+1:1;n.set(t,r)}let r=0;for(let o=0;o<t.length-1;o++){const e=t.substring(o,o+2),a=n.has(e)?n.get(e):0;a>0&&(n.set(e,a-1),r++)}return 2*r/(e.length+t.length-2)}e.exports={compareTwoStrings:t,findBestMatch:function(e,n){if(!function(e,t){return"string"===typeof e&&(!!Array.isArray(t)&&(!!t.length&&!t.find((function(e){return"string"!==typeof e}))))}(e,n))throw new Error("Bad arguments: First argument should be a string, second should be an array of strings");const r=[];let o=0;for(let l=0;l<n.length;l++){const a=n[l],c=t(e,a);r.push({target:a,rating:c}),c>r[o].rating&&(o=l)}const a=r[o];return{ratings:r,bestMatch:a,bestMatchIndex:o}}}}}]);
//# sourceMappingURL=SingleWordsExpander.90241609.chunk.js.map