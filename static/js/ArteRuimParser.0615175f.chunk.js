(self.webpackChunktdr=self.webpackChunktdr||[]).push([[183],{6190:(e,t,s)=>{"use strict";s.r(t),s.d(t,{ArteRuimParser:()=>m,default:()=>N});var r=s(3990),n=s(1105),l=s(2791),a=s(8866),i=s(184);function c(e){let{data:t}=e;const{level0:s,level1:r,level2:n,level3:c,level4:o,total:u}=(0,l.useMemo)((()=>Object.values(t).reduce(((e,t)=>(e["level".concat(t.level)]+=1,e.total+=1,e)),{level0:0,level1:0,level2:0,level3:0,level4:0,total:0})),[t]);return(0,i.jsxs)("div",{className:"",children:[(0,i.jsxs)(a.N,{children:["Levels (",u,")"]}),(0,i.jsxs)("div",{style:{color:s>0?"red":"inherit"},children:["Level 0: ",s]}),(0,i.jsxs)("div",{children:["Level 1: ",r]}),(0,i.jsxs)("div",{children:["Level 2: ",n]}),(0,i.jsxs)("div",{children:["Level 3: ",c]}),(0,i.jsxs)("div",{children:["Level 4: ",o]})]})}var o=s(2128),u=s(1958),d=s(4562),h=s(6173),g=s(6422),v=s(3115),x=s(4766),f=s(3473),j=s(5850),p=s(6591);function m(){(0,x.K)({resourceName:p.mj.ARTE_RUIM_CARDS,language:"pt"});const[e,t]=(0,l.useState)({}),[s,m]=(0,l.useState)({}),[N,R]=(0,l.useState)({}),b="text",{resourceName:w,language:y,isLoading:A,error:L,hasResponseData:S,response:O}=(0,f.R)([p.mj.ARTE_RUIM_CARDS]);(0,l.useEffect)((()=>{O&&(R((0,j.zJ)(O,b)),m(O))}),[O]);return(0,i.jsx)(u.Xg,{title:"Arte Ruim",subtitle:Boolean(w&&y)?"Parser (".concat(y,")"):"",children:(0,i.jsxs)(r.Z,{hasSider:!0,children:[(0,i.jsxs)(d.p,{children:[(0,i.jsx)(h.Th,{hasResponseData:S,isLoading:A,error:L}),(0,i.jsx)(g.v,{resourceNames:[p.mj.ARTE_RUIM_CARDS]})]}),(0,i.jsx)(r.Z.Content,{className:"content",children:(0,i.jsx)(o.T,{isLoading:A,error:L,hasResponseData:S,children:(0,i.jsxs)("div",{className:"parser-container",children:[(0,i.jsxs)("div",{className:"parser-main",children:[(0,i.jsx)(a.N,{children:"Input New Data"}),(0,i.jsx)(n.Z.TextArea,{name:"input",id:"",cols:15,rows:5,onChange:e=>{const{value:s}=e.target,r=s.split("\n"),n=Object.values(null!==O&&void 0!==O?O:{}),l=Number(n[n.length-1].id.split("-")[1])||1;if(r.at(-1)&&r.at(-1).length>p.dX){const e=(0,j.bU)(r.at(-1).trim().toLowerCase());t((0,j.Kn)(e,O,b))}else t({});const a=r.reduce(((e,t,s)=>{if(t){const r="".concat(w[0],"-").concat(l+s+1,"-").concat(y);e[r]={id:r,text:t,level:0}}return e}),{...O});m(a)}}),(0,i.jsx)(a.N,{children:"Output"}),(0,i.jsx)(n.Z.TextArea,{name:"output",id:"",cols:15,rows:14,readOnly:!0,value:JSON.stringify(s,null,4)}),(0,i.jsx)(a.N,{children:"Duplicates"}),(0,i.jsx)(n.Z.TextArea,{name:"duplicates",id:"",cols:15,rows:3,readOnly:!0,value:JSON.stringify(N)})]}),(0,i.jsxs)("aside",{className:"parser-controls",children:[Boolean(O)&&(0,i.jsx)(c,{data:O}),(0,i.jsxs)(a.N,{children:["Similar Results for Last Entry (",Object.values(e).length,")"]}),(0,i.jsx)(n.Z.TextArea,{name:"search-results",id:"",cols:10,rows:5,readOnly:!0,value:JSON.stringify(e,null,4)}),(0,i.jsx)(v.X,{response:O,property:b})]})]})})})]})})}const N=m},7974:(e,t,s)=>{"use strict";s.d(t,{Z:()=>c});var r=s(7462),n=s(2791);const l={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M464 720a48 48 0 1096 0 48 48 0 10-96 0zm16-304v184c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V416c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8zm475.7 440l-416-720c-6.2-10.7-16.9-16-27.7-16s-21.6 5.3-27.7 16l-416 720C56 877.4 71.4 904 96 904h832c24.6 0 40-26.6 27.7-48zm-783.5-27.9L512 239.9l339.8 588.2H172.2z"}}]},name:"warning",theme:"outlined"};var a=s(4186),i=function(e,t){return n.createElement(a.Z,(0,r.Z)({},e,{ref:t,icon:l}))};const c=n.forwardRef(i)},1291:e=>{function t(e,t){if((e=e.replace(/\s+/g,""))===(t=t.replace(/\s+/g,"")))return 1;if(e.length<2||t.length<2)return 0;let s=new Map;for(let n=0;n<e.length-1;n++){const t=e.substring(n,n+2),r=s.has(t)?s.get(t)+1:1;s.set(t,r)}let r=0;for(let n=0;n<t.length-1;n++){const e=t.substring(n,n+2),l=s.has(e)?s.get(e):0;l>0&&(s.set(e,l-1),r++)}return 2*r/(e.length+t.length-2)}e.exports={compareTwoStrings:t,findBestMatch:function(e,s){if(!function(e,t){return"string"===typeof e&&(!!Array.isArray(t)&&(!!t.length&&!t.find((function(e){return"string"!==typeof e}))))}(e,s))throw new Error("Bad arguments: First argument should be a string, second should be an array of strings");const r=[];let n=0;for(let a=0;a<s.length;a++){const l=s[a],i=t(e,l);r.push({target:l,rating:i}),i>r[n].rating&&(n=a)}const l=r[n];return{ratings:r,bestMatch:l,bestMatchIndex:n}}}}}]);
//# sourceMappingURL=ArteRuimParser.0615175f.chunk.js.map