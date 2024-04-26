(self.webpackChunktdr=self.webpackChunktdr||[]).push([[183],{2999:(e,t,s)=>{"use strict";s.d(t,{R:()=>c,T:()=>l});var n=s(952),a=s(3070),r=s(1958),i=s(184);function c(e){let{isLoading:t,isIdle:s,error:a,isDirty:r,isError:c,hasResponseData:l}=e;return s?(0,i.jsx)(n.Z,{children:"No Data yet"}):t?(0,i.jsx)(n.Z,{color:"blue",children:"Loading..."}):a||c?(0,i.jsx)(n.Z,{color:"red",children:"Error"}):r?(0,i.jsx)(n.Z,{color:"orange",children:"Modified"}):l?(0,i.jsx)(n.Z,{color:"green",children:"Loaded"}):(0,i.jsx)(n.Z,{children:"No Data"})}function l(e){return(0,i.jsx)(r.Pd,{children:(0,i.jsx)(a.Z.Item,{label:"Status",children:(0,i.jsx)(c,{...e})})})}},8866:(e,t,s)=>{"use strict";s.d(t,{N:()=>r});var n=s(8914),a=s(184);function r(e){let{children:t,level:s,...r}=e;return(0,a.jsx)(n.Z.Title,{level:null!==s&&void 0!==s?s:3,...r,children:t})}},6173:(e,t,s)=>{"use strict";s.d(t,{xh:()=>u,zE:()=>d,Do:()=>h,Th:()=>m.T,F6:()=>r});s(8866);var n=s(3733),a=s(184);const r=e=>{let{children:t,active:s=!1,activeClass:r="",className:i="",hoverType:c="scale",...l}=e;return(0,a.jsx)("button",{className:(0,n.Z)("transparent-button","transparent-button--".concat(c),s&&(r||"transparent-button--active"),i),...l,children:t})};var i=s(3070),c=s(1766),l=s(492),o=s(5922);function d(e){let{label:t,value:s,onChange:n,options:r,placeholder:l}=e;return(0,a.jsx)(i.Z.Item,{label:t,children:(0,a.jsxs)(c.Z,{style:{minWidth:"150px"},onChange:n,value:s,children:[l&&(0,a.jsx)(c.Z.Option,{value:"",disabled:!0,children:"placeholder"}),r.map((e=>"object"===typeof e?(0,a.jsx)(c.Z.Option,{value:e.value,children:e.label},"".concat(t,"-").concat(e.value)):(0,a.jsx)(c.Z.Option,{value:e,children:e},"".concat(t,"-").concat(e))))]})})}function u(e){let{label:t,value:s,onChange:n,min:r=0,max:c=100,step:o}=e;return(0,a.jsx)(i.Z.Item,{label:t,children:(0,a.jsx)(l.Z,{min:r,max:c,value:s,onChange:e=>n(null!==e&&void 0!==e?e:c),style:{minWidth:"150px",width:"100%"},step:o})})}function h(e){let{label:t,value:s,onChange:n,className:r}=e;return(0,a.jsx)(i.Z.Item,{label:t,valuePropName:"checked",className:r,children:(0,a.jsx)(o.Z,{checked:s,onChange:n,size:"small"})})}var m=s(2999)},2128:(e,t,s)=>{"use strict";s.d(t,{T:()=>l});var n=s(43),a=s(3990),r=s(1234),i=s(4664),c=s(184);function l(e){let{isLoading:t,isIdle:s,error:l,hasResponseData:o,children:d}=e;return!s&&t?(0,c.jsx)(n.Z,{tip:"Loading",children:d}):l?(0,c.jsx)(a.Z.Content,{className:"content content-center",children:(0,c.jsx)(r.Z,{message:"Error",description:l.message,type:"error",showIcon:!0})}):s||!1===o?(0,c.jsx)(a.Z.Content,{className:"content content-center",children:(0,c.jsx)(i.Z,{})}):(0,c.jsx)(c.Fragment,{children:d})}},6422:(e,t,s)=>{"use strict";s.d(t,{v:()=>u});var n=s(3070),a=s(1766),r=s(2556),i=s(2791),c=s(4766),l=s(6591),o=s(1958),d=s(184);function u(e){var t,s;let{resourceNames:u}=e;const{queryParams:h,addParam:m}=(0,c.K)(),[p]=n.Z.useForm(),[g,x]=(0,i.useState)(h.resourceName);return(0,d.jsx)(o.Pd,{children:(0,d.jsxs)(n.Z,{layout:"vertical",onFinish:e=>{const t=l.S.includes(e.resourceName);m("language",t?null:e.language),m("resourceName",e.resourceName)},size:"small",form:p,initialValues:{resourceName:null!==(t=h.resourceName)&&void 0!==t?t:"",language:null!==(s=h.language)&&void 0!==s?s:""},children:[(0,d.jsx)(n.Z.Item,{label:"Resource",name:"resourceName",children:(0,d.jsx)(a.Z,{style:{minWidth:"150px"},value:h.resourceName,onChange:e=>x(e),children:u.map((e=>(0,d.jsx)(a.Z.Option,{value:e,children:e},e)))})}),(0,d.jsx)(n.Z.Item,{label:"Language",name:"language",children:(0,d.jsx)(a.Z,{style:{minWidth:"150px"},disabled:l.S.includes(g),children:l.a2.map((e=>(0,d.jsx)(a.Z.Option,{value:e,children:e},e)))})}),(0,d.jsx)(n.Z.Item,{children:(0,d.jsx)(r.ZP,{type:"primary",htmlType:"submit",children:"Load"})})]})})}},3115:(e,t,s)=>{"use strict";s.d(t,{X:()=>o});var n=s(1692),a=s(2791),r=s(5850),i=s(6591),c=s(8866),l=s(184);function o(e){let{response:t,property:s}=e;const[o,d]=(0,a.useState)({});return(0,l.jsxs)("div",{className:"parser-flex-column",children:[(0,l.jsx)(c.N,{children:"Search Similar"}),(0,l.jsx)(n.Z,{type:"text",onChange:e=>{const{value:n=""}=e.target,a=(0,r.bU)(n.trim().toLowerCase());a&&a.length>=i.dX?d((0,r.Kn)(a,t,s)):d({})},placeholder:"Type here"}),(0,l.jsx)(n.Z.TextArea,{name:"search-results",id:"",cols:10,rows:10,readOnly:!0,value:JSON.stringify(o,null,4)})]})}},6020:(e,t,s)=>{"use strict";s.d(t,{o$:()=>u,dy:()=>h,rZ:()=>g,ck:()=>E});var n=s(7974),a=s(6807),r=s(43),i=s(1431),c=s(2606),l=s(184);function o(e){let{id:t,source:s,width:o=75,padding:d=6,title:u,className:h}=e;const{getUrl:m}=(0,c.n)("tdi"),{isLoading:p,data:g,isError:x}=(0,a.a)({queryKey:["sprite",s],queryFn:async()=>{const e=await fetch("".concat(m("sprites"),"/").concat(s,".svg"));return await e.text()},enabled:!!t&&!!s}),E=o-12;if(p)return(0,l.jsx)("span",{style:{width:"".concat(E,"px"),height:"".concat(E,"px"),padding:d,display:"grid",placeItems:"center"},className:h,children:(0,l.jsx)(r.Z,{})});const v=g;return x||!v?(0,l.jsx)("span",{style:{width:"".concat(E,"px"),height:"".concat(E,"px"),padding:d,display:"grid",placeItems:"center"},className:h,children:(0,l.jsx)(n.Z,{})}):(0,l.jsxs)("svg",{viewBox:"0 0 512 512",style:{width:"".concat(E,"px"),height:"".concat(E,"px"),padding:d},className:h,children:[(0,l.jsx)("use",{xlinkHref:"#".concat(t),dangerouslySetInnerHTML:{__html:v}}),(0,l.jsx)("foreignObject",{x:"0",y:"0",width:"100%",height:"100%",children:u&&(0,l.jsx)(i.Z,{title:u,children:(0,l.jsx)("div",{style:{background:"transparent",width:"100%",height:"100vh"}})})})]})}var d=s(3733);function u(e){let{id:t,width:s=75,className:n=""}=e;return(0,l.jsx)("div",{className:(0,d.Z)("sprite",n),style:{width:"".concat(s,"px"),height:"".concat(s,"px")},children:(0,l.jsx)("svg",{viewBox:"0 0 512 512",style:{width:"".concat(s-12,"px"),height:"".concat(s-12,"px")},children:(0,l.jsx)(o,{source:"alien-signs",id:t,width:s})})})}function h(e){let{id:t,width:s,className:n}=e;const a=t.startsWith("emoji")?t:"emoji-".concat(t);return(0,l.jsx)("div",{className:(0,d.Z)("sprite",n),style:{width:"".concat(s,"px"),height:"".concat(s,"px")},children:(0,l.jsx)(o,{source:"emojis",id:a,width:s})})}var m=s(763);const p=(0,m.memoize)((e=>{const t=e.match(/\d+/),s=t?parseInt(t[0],10):0,n="glyph-".concat(s),a=128*Math.ceil(s/128);return["glyphs-".concat(a),n]}));function g(e){let{id:t,width:s,className:n}=e;const[a,r]=p(t);return(0,l.jsx)("div",{className:(0,d.Z)("sprite",n),style:{width:"".concat(s,"px"),height:"".concat(s,"px")},children:(0,l.jsx)(o,{source:a,id:r,width:s,padding:0})})}const x=(0,m.memoize)((e=>{const t=e.match(/\d+/),s=t?parseInt(t[0],10):0,n="item-".concat(s),a=64*Math.ceil(s/64);return["items-".concat(a),n]}));function E(e){let{id:t,width:s,className:n,title:a}=e;const[r,i]=x(t);return(0,l.jsx)("div",{className:(0,d.Z)("sprite",n),style:{width:"".concat(null!==s&&void 0!==s?s:75,"px"),height:"".concat(null!==s&&void 0!==s?s:75,"px")},children:(0,l.jsx)(o,{source:r,id:i,width:s,title:a})})}},2606:(e,t,s)=>{"use strict";function n(e){let t="",s="";switch(e){case"tdi":t="https://www.kavispires.com",s="tdi/images";break;case"tdi-data":t="https://www.kavispires.com",s="tdi/data";break;default:t="https://www.kavispires.com",s="tdr/resources"}return{baseUrl:t,getUrl:e=>[t,s,e].join("/")}}s.d(t,{n:()=>n})},4766:(e,t,s)=>{"use strict";s.d(t,{K:()=>r});var n=s(2791),a=s(1087);function r(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};const[t,s]=(0,a.lr)(),r=(e,n)=>{void 0===n||""===n?t.delete(e):t.set(e,String(n)),s(t)},i=(e,n)=>{t.delete(e),s(t)};(0,n.useEffect)((()=>{Object.entries(e).forEach((e=>{let[s,n]=e;t.has(s)||r(s,n)}))}),[]);const c=t.toString().split("&").reduce(((e,t)=>{const[s,n]=t.split("=");return s&&void 0!==n&&(e[s]=n),e}),{});return{addParam:r,removeParam:i,queryParams:c}}},3473:(e,t,s)=>{"use strict";s.d(t,{R:()=>c});var n=s(6591),a=s(6807),r=s(2606),i=s(4766);function c(e){const{queryParams:{resourceName:t="",language:s=""}}=(0,i.K)(),{getUrl:c}=(0,r.n)("tdr"),l=!!t&&e.includes(t),{data:o,isLoading:d,error:u}=(0,a.a)({queryKey:["resource",t,s],queryFn:async()=>{const e=s&&!n.S.includes(t)?c("".concat(t,"-").concat(s,".json")):c("".concat(t,".json")),a=await fetch(e);return a.body?await a.json():{}},enabled:l});return{resourceName:t,language:s||null,response:o,isLoading:d,enabled:l,error:u,hasResponseData:Boolean(o)}}},6190:(e,t,s)=>{"use strict";s.r(t),s.d(t,{ArteRuimParser:()=>N,default:()=>j});var n=s(3990),a=s(1692),r=s(2791),i=s(8866),c=s(184);function l(e){let{data:t}=e;const{level0:s,level1:n,level2:a,level3:l,level4:o,total:d}=(0,r.useMemo)((()=>Object.values(t).reduce(((e,t)=>(e["level".concat(t.level)]+=1,e.total+=1,e)),{level0:0,level1:0,level2:0,level3:0,level4:0,total:0})),[t]);return(0,c.jsxs)("div",{className:"",children:[(0,c.jsxs)(i.N,{children:["Levels (",d,")"]}),(0,c.jsxs)("div",{style:{color:s>0?"red":"inherit"},children:["Level 0: ",s]}),(0,c.jsxs)("div",{children:["Level 1: ",n]}),(0,c.jsxs)("div",{children:["Level 2: ",a]}),(0,c.jsxs)("div",{children:["Level 3: ",l]}),(0,c.jsxs)("div",{children:["Level 4: ",o]})]})}var o=s(2128),d=s(1958),u=s(4562),h=s(6173),m=s(6422),p=s(3115),g=s(4766),x=s(3473),E=s(5850),v=s(6591);function N(){(0,g.K)({resourceName:v.mj.ARTE_RUIM_CARDS,language:"pt"});const[e,t]=(0,r.useState)({}),[s,N]=(0,r.useState)({}),[j,S]=(0,r.useState)({}),T="text",{resourceName:I,language:y,isLoading:f,error:R,hasResponseData:A,response:b}=(0,x.R)([v.mj.ARTE_RUIM_CARDS]);(0,r.useEffect)((()=>{b&&(S((0,E.zJ)(b,T)),N(b))}),[b]);return(0,c.jsx)(d.Xg,{title:"Arte Ruim",subtitle:Boolean(I&&y)?"Parser (".concat(y,")"):"",children:(0,c.jsxs)(n.Z,{hasSider:!0,children:[(0,c.jsxs)(u.p,{children:[(0,c.jsx)(h.Th,{hasResponseData:A,isLoading:f,error:R}),(0,c.jsx)(m.v,{resourceNames:[v.mj.ARTE_RUIM_CARDS]})]}),(0,c.jsx)(n.Z.Content,{className:"content",children:(0,c.jsx)(o.T,{isLoading:f,error:R,hasResponseData:A,children:(0,c.jsxs)("div",{className:"parser-container",children:[(0,c.jsxs)("div",{className:"parser-main",children:[(0,c.jsx)(i.N,{children:"Input New Data"}),(0,c.jsx)(a.Z.TextArea,{name:"input",id:"",cols:15,rows:5,onChange:e=>{const{value:s}=e.target,n=s.split("\n"),a=Object.values(null!==b&&void 0!==b?b:{}),r=Number(a[a.length-1].id.split("-")[1])||1;if(n.at(-1)&&n.at(-1).length>v.dX){const e=(0,E.bU)(n.at(-1).trim().toLowerCase());t((0,E.Kn)(e,b,T))}else t({});const i=n.reduce(((e,t,s)=>{if(t){const n="".concat(I[0],"-").concat(r+s+1,"-").concat(y);e[n]={id:n,text:t,level:0}}return e}),{...b});N(i)}}),(0,c.jsx)(i.N,{children:"Output"}),(0,c.jsx)(a.Z.TextArea,{name:"output",id:"",cols:15,rows:14,readOnly:!0,value:JSON.stringify(s,null,4)}),(0,c.jsx)(i.N,{children:"Duplicates"}),(0,c.jsx)(a.Z.TextArea,{name:"duplicates",id:"",cols:15,rows:3,readOnly:!0,value:JSON.stringify(j)})]}),(0,c.jsxs)("aside",{className:"parser-controls",children:[Boolean(b)&&(0,c.jsx)(l,{data:b}),(0,c.jsxs)(i.N,{children:["Similar Results for Last Entry (",Object.values(e).length,")"]}),(0,c.jsx)(a.Z.TextArea,{name:"search-results",id:"",cols:10,rows:5,readOnly:!0,value:JSON.stringify(e,null,4)}),(0,c.jsx)(p.X,{response:b,property:T})]})]})})})]})})}const j=N},6591:(e,t,s)=>{"use strict";s.d(t,{Hn:()=>m,NL:()=>p,S:()=>c,Ud:()=>x,VC:()=>u,ZI:()=>h,_9:()=>g,a2:()=>l,bs:()=>d,dX:()=>r,mj:()=>i,pZ:()=>o});var n=s(6020),a=s(763);const r=2,i={ADJECTIVES:"adjectives",ALIEN_ITEMS:"alien-items",ARTE_RUIM_CARDS:"arte-ruim-cards",ARTE_RUIM_GROUPS:"arte-ruim-groups",ARTE_RUIM_PAIRS:"arte-ruim-pairs",CATEGORIES:"categories",CHALLENGES:"challenges",CHARACTERS:"characters",CHOICES:"choices",CONTENDERS:"contenders",CRIME_EVIDENCE:"crime-evidence",CRIME_TILES:"crime-tiles",CRIME_WEAPONS:"crime-weapons",DATING_CANDIDATE:"dating-candidate",DATING_CANDIDATE_BODIES:"dating-candidate-bodies",DATING_CANDIDATE_HEADS:"dating-candidate-heads",DIAGRAM_TOPICS:"diagram-topics",DILEMMAS:"dilemmas",DRAWING_WORDS:"drawing-words",GROUP_QUESTIONS:"group-questions",ITEMS_ATTRIBUTES:"items-attributes",MONSTER_ORIENTATION:"monster-orientation",MOVIE_REVIEWS:"movie-reviews",MOVIES:"movies",NAMING_PROMPTS:"naming-prompts",OBJECT_FEATURES:"object-features",QUANTITATIVE_QUESTIONS:"quantitative-questions",SCENARIOS:"scenarios",SPECTRUMS:"spectrums",SINGLE_WORDS:"single-words",SPY_LOCATIONS:"spy-locations",SPY_QUESTIONS:"spy-questions",SUSPECTS:"suspects",TESTIMONY_QUESTIONS:"testimony-questions",THEME_WORDS:"theme-words",THING_PROMPTS:"thing-prompts",THINGS_QUALITIES:"things-qualities",TOPICS:"topics",TREE_WORDS:"tree-words",TWEETS:"tweets"},c=[i.ALIEN_ITEMS,i.CONTENDERS,i.CRIME_EVIDENCE,i.CRIME_TILES,i.CRIME_WEAPONS,i.DATING_CANDIDATE_BODIES,i.DATING_CANDIDATE_HEADS,i.ITEMS_ATTRIBUTES,i.MONSTER_ORIENTATION,i.OBJECT_FEATURES,i.SUSPECTS],l=["pt","en"],o={adjectives:"text","arte-ruim-cards":"text","arte-ruim-groups":"theme","arte-ruim-pairs":"values",categories:"text",challenges:"text",characters:"text",contenders:"","crime-tiles":"","diagram-topics":"text","galeria-de-sonhos":"text","group-questions":"text","linhas-cruzadas":"text","naming-prompts":"text",spectrums:"","single-words":"text","spy-locations":"","spy-questions":"","testimony-questions":"question","thing-prompts":"text",topics:"text"},d=(0,a.keyBy)([{key:"alien-signs",name:"Alien Signs",prefix:"sign",quantity:38,startAt:0,component:n.o$},{key:"emojis",name:"Emojis",prefix:"emoji",quantity:30,startAt:1,component:n.dy},{key:"glyphs",name:"Glyphs",prefix:"glyph",quantity:365,startAt:1,component:n.rZ}],"key"),u=[{label:"Any",value:""},{label:"= 0",value:0},{label:"< 3",value:3},{label:"< 5",value:5},{label:"< 10",value:10}],h=[{label:"9",value:9},{label:"15",value:15},{label:"30",value:30},{label:"50",value:50},{label:"100",value:100}],m=[{label:"Small",value:100},{label:"Medium",value:150},{label:"Large",value:200},{label:"X-Large",value:250}],p={OPPOSITE:-10,UNRELATED:-3,UNCLEAR:-1,RELATED:5,DETERMINISTIC:10},g=((0,a.invert)(p),{OPPOSITE:"^",UNRELATED:"!",UNCLEAR:"~",RELATED:"",DETERMINISTIC:"+"}),x=Object.keys(p).map((e=>({value:e.toLowerCase(),label:(0,a.capitalize)(e)})))},5850:(e,t,s)=>{"use strict";s.d(t,{Kn:()=>o,Mg:()=>x,R1:()=>d,Tj:()=>h,VL:()=>p,ZN:()=>u,bU:()=>c,dK:()=>g,sB:()=>E,tt:()=>v,xE:()=>m,zJ:()=>l});var n=s(763),a=s(6591),r=s(1291),i=s.n(r);function c(e){return e.normalize("NFD").replace(/[\u0300-\u036f]/g,"")}const l=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"text";const s={},n={};return Object.values(e).forEach((e=>{e[t]||console.error("Property ".concat(t," does not exist in ").concat(e));const a=c(e[t].toLowerCase());s[a]?(void 0===n[a]&&(n[a]=[s[a].id]),n[a].push(e.id)):s[a]=e})),n},o=function(e,t){let s=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"text";const n={},r=c(e.trim().toLowerCase());return!r||r.length<a.dX?{}:(Object.values(t).forEach((t=>{const a="string"===typeof t[s]?t[s]:JSON.stringify(t[s]),l=c(a.toLowerCase());(l.includes(r)||i().compareTwoStrings(e,l)>.5)&&(n[t.id]=a)})),n)},d=e=>Array.from(new Set(e));function u(e,t){const s=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),n=document.createElement("a");n.href=window.URL.createObjectURL(s),n.download=t,n.click(),window.URL.revokeObjectURL(n.href)}const h=e=>function e(t){if((0,n.isObject)(t)&&!Array.isArray(t)){const s=Object.keys(t).filter((e=>["id","name","title","type"].includes(e))).concat(Object.keys(t).filter((e=>!["id","name","title","type"].includes(e))).sort());return(0,n.chain)(t).toPairs().sortBy((e=>{let[t,n]=e;return s.indexOf(t)})).map((t=>{let[s,n]=t;return[s,e(n)]})).fromPairs().value()}return t}(e),m=()=>{const e=new Date,t=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0"),n=String(e.getDate()).padStart(2,"0"),a=String(e.getHours()).padStart(2,"0"),r=String(e.getMinutes()).padStart(2,"0");return"".concat(t,"/").concat(s,"/").concat(n," ").concat(a,":").concat(r)},p=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return(0,n.cloneDeep)((0,n.merge)({id:"",name:{en:"",pt:""},groups:[],attributes:{}},e))},g=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return(0,n.cloneDeep)((0,n.merge)({id:"",attributes:{}},e))},x=(e,t)=>{const s=(0,n.orderBy)(Object.values(t),["priority","id"],["asc","asc"]).map((e=>e.id));function r(e,t){return(0,n.orderBy)(e,(e=>s.indexOf(e)),["asc"]).map((e=>"".concat(t).concat(e)))}let i=[],c=[],l=[],o=[],d=[];return Object.entries(e.attributes).forEach((e=>{let[s,n]=e;if(t[s])switch(n){case a.NL.OPPOSITE:i.push(s);break;case a.NL.DETERMINISTIC:c.push(s);break;case a.NL.RELATED:l.push(s);break;case a.NL.UNRELATED:o.push(s);break;case a.NL.UNCLEAR:default:d.push(s)}})),[...r(i,a._9.OPPOSITE),...r(c,a._9.DETERMINISTIC),...r(l,a._9.RELATED),...r(o,a._9.UNRELATED),...r(d,a._9.UNCLEAR)]},E=(0,n.memoize)((e=>{if(3===e.length)return{key:e,className:"",text:""};const t=e[0];return{key:e.slice(1,4),className:{[a._9.DETERMINISTIC]:"deterministic",[a._9.UNRELATED]:"unrelated",[a._9.UNCLEAR]:"unclear",[a._9.OPPOSITE]:"opposite"}[t],text:{[a._9.DETERMINISTIC]:"very",[a._9.UNRELATED]:"not",[a._9.UNCLEAR]:"maybe",[a._9.OPPOSITE]:"very not"}[t]}})),v=(e,t,s)=>e.filter((e=>!(!t&&e.includes(a._9.UNCLEAR))&&!(!s&&e.includes(a._9.UNRELATED))))},7974:(e,t,s)=>{"use strict";s.d(t,{Z:()=>l});var n=s(7462),a=s(2791);const r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M464 720a48 48 0 1096 0 48 48 0 10-96 0zm16-304v184c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V416c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8zm475.7 440l-416-720c-6.2-10.7-16.9-16-27.7-16s-21.6 5.3-27.7 16l-416 720C56 877.4 71.4 904 96 904h832c24.6 0 40-26.6 27.7-48zm-783.5-27.9L512 239.9l339.8 588.2H172.2z"}}]},name:"warning",theme:"outlined"};var i=s(4315),c=function(e,t){return a.createElement(i.Z,(0,n.Z)({},e,{ref:t,icon:r}))};const l=a.forwardRef(c)},1291:e=>{function t(e,t){if((e=e.replace(/\s+/g,""))===(t=t.replace(/\s+/g,"")))return 1;if(e.length<2||t.length<2)return 0;let s=new Map;for(let a=0;a<e.length-1;a++){const t=e.substring(a,a+2),n=s.has(t)?s.get(t)+1:1;s.set(t,n)}let n=0;for(let a=0;a<t.length-1;a++){const e=t.substring(a,a+2),r=s.has(e)?s.get(e):0;r>0&&(s.set(e,r-1),n++)}return 2*n/(e.length+t.length-2)}e.exports={compareTwoStrings:t,findBestMatch:function(e,s){if(!function(e,t){return"string"===typeof e&&(!!Array.isArray(t)&&(!!t.length&&!t.find((function(e){return"string"!==typeof e}))))}(e,s))throw new Error("Bad arguments: First argument should be a string, second should be an array of strings");const n=[];let a=0;for(let i=0;i<s.length;i++){const r=s[i],c=t(e,r);n.push({target:r,rating:c}),c>n[a].rating&&(a=i)}const r=n[a];return{ratings:n,bestMatch:r,bestMatchIndex:a}}}}}]);
//# sourceMappingURL=ArteRuimParser.30e8ad95.chunk.js.map