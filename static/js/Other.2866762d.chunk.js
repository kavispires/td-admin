"use strict";(self.webpackChunktd_admin=self.webpackChunktd_admin||[]).push([[8407],{9961:(e,t,s)=>{s.d(t,{m:()=>o});var n=s(2556),a=s(5657),c=s(7134),l=s(184);function o(e){let{content:t,shape:s,icon:o,size:i,...u}=e;const r=(0,c._)();return(0,l.jsx)(n.ZP,{shape:null!==s&&void 0!==s?s:"circle",icon:null!==o&&void 0!==o?o:(0,l.jsx)(a.Z,{}),size:null!==i&&void 0!==i?i:"small",onClick:()=>r(t),...u})}},7134:(e,t,s)=>{s.d(t,{_:()=>o});var n=s(4747),a=s(763),c=s(2791),l=s(3250);function o(){const[e,t]=(0,l.Z)(),{message:s}=n.Z.useApp();return(0,c.useEffect)((()=>{e.value&&(e.value.length>20?s.info("Copied to clipboard: ".concat((0,a.truncate)(e.value,{length:30,omission:"..."}))):s.success("Copied"))}),[e,s]),t}},5906:(e,t,s)=>{s.r(t),s.d(t,{default:()=>m});var n=s(4031),a=s(3990),c=s(7128),l=s(1105),o=s(2791),i=s(6509),u=(s(6591),s(2128),s(5850),s(9961));var r=s(6537),d=s(9547),h=s(184);const{Text:v}=n.Z;const m=function(){(0,i.Z)("Other");const{historyQuery:e,mutation:t}=(0,d.ve)();console.log(e.data);const s=(0,o.useMemo)((()=>JSON.stringify(e.data,null,4)),[e.data]);return(0,h.jsxs)(a.Z,{children:[(0,h.jsx)(r.h,{title:"Other"}),(0,h.jsx)(c.Z,{}),(0,h.jsx)(a.Z.Content,{className:"content",children:(0,h.jsxs)("div",{className:"a",children:[(0,h.jsx)("button",{onClick:()=>t.mutate(e.data),children:"save"}),(0,h.jsxs)(v,{children:["Output ",(0,h.jsx)(u.m,{content:s})]}),(0,h.jsx)(l.Z.TextArea,{name:"search-results",id:"",cols:"10",rows:"10",readOnly:!0,value:s})]})})]})}}}]);
//# sourceMappingURL=Other.2866762d.chunk.js.map