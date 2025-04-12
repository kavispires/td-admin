import{r as y,a as he,_ as fe,j as n,ag as L,T as B,ab as Ie,B as J,aJ as re,aK as xe,aL as je,Q as Ae,O as Se,U as X,W as ee,V as se,P as ye,L as te}from"./index-DR-bKtYd.js";import{R as De}from"./ResponseState-D4cd9G1B.js";import{u as Ne}from"./useQueryParams-CilX3dkh.js";import{C as Ee,u as ae}from"./useArteRuimDrawings-GCdIp1-A.js";import{I as ie}from"./ImageCard-_EnZOZUt.js";import{f as Oe,W as be,d as k,g as Y,h as Ce}from"./constants-Bukqt1PU.js";import{I as q}from"./Item-DoGDcxAW.js";import{l as m}from"./lodash-7X0uo9vL.js";import{F as b}from"./index-CjSds9Ca.js";import{S as U}from"./index-mV1ddvS1.js";import{T as Te}from"./index-Cj5QPFzB.js";import{u as Le}from"./useGetFirebaseDoc-B24d1TAL.js";import{h as ne}from"./moment-C5S46NFB.js";import{I as ve}from"./index-Bxmjk3jW.js";import{F as oe}from"./Table-mi7pioC7.js";import{m as we,r as Q}from"./index-CrYoWaXD.js";import{u as _e}from"./daily-teoria-de-conjuntos-DUGw-8pz.js";import{u as Re}from"./useMutation-B_3B_bq4.js";import{u as M,D as p,g as G,c as le,L as ce}from"./constants-BZ08vo6O.js";import{u as v}from"./useTDResource-JIAXcSBb.js";import{u as de}from"./useDailyHistoryQuery-B9esS11u.js";import{R as Me}from"./SaveOutlined-BD-eqkti.js";import{a as Z}from"./FilterEntries-UhkU006b.js";import{S as Ge}from"./SiderContent-BhVFP80X.js";import{u as K}from"./useLoadWordLibrary-CWyKIu0e.js";import{D as ke}from"./DataLoadingWrapper-il0Wn8Us.js";import{P as Qe}from"./useBaseUrl-KlB5gb15.js";import"./index-CjkS7F4v.js";import"./gapSize-U1swVQyS.js";import"./Input-CS8ZSUpo.js";import"./index-CzhWSFX_.js";import"./index-CO0-upqR.js";import"./index-BXEMAZy-.js";import"./index-C1QAA0OT.js";import"./scrollTo-D6w3ySMz.js";import"./Pagination-rsNPmw_I.js";import"./extendsObject-keMuGWqj.js";import"./index-nRqnMAf0.js";var Ue={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M396 512a112 112 0 10224 0 112 112 0 10-224 0zm546.2-25.8C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 000 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM508 688c-97.2 0-176-78.8-176-176s78.8-176 176-176 176 78.8 176 176-78.8 176-176 176z"}}]},name:"eye",theme:"filled"},Pe=function(a,r){return y.createElement(he,fe({},a,{ref:r,icon:Ue}))},qe=y.forwardRef(Pe);function w({children:t}){return n.jsx(U,{direction:"vertical",style:{maxWidth:120},children:t})}function _({children:t}){return n.jsxs(Te,{color:"cyan",children:["#",t]})}function O({label:t,children:a}){return n.jsxs(B.Text,{children:[n.jsxs("strong",{children:[t,":"]})," ",a]})}function R({children:t}){return n.jsx(Ie,{trigger:"click",content:t,title:"Sneak Peek",children:n.jsx(J,{icon:n.jsx(qe,{})})})}const ue=[{title:"Id",dataIndex:"id",key:"id",fixed:"left"},{title:"Arte Ruim",dataIndex:"arte-ruim",key:"arte-ruim",render:t=>{if(!t)return n.jsx(L,{message:"No entry",type:"error"});const{number:a,cardId:r,text:l,drawings:e}=t;return n.jsxs(w,{children:[n.jsx(_,{children:a}),n.jsx(O,{label:"CardId",children:r}),n.jsx(O,{label:"Drawings",children:e.length}),n.jsx(R,{children:n.jsxs(b,{gap:6,vertical:!0,children:[n.jsxs("div",{children:['"',l.split("").map((s,o)=>o<2||s===" "?s:"⏹").join(""),'"']}),n.jsx(U,{wrap:!0,children:e.map(s=>n.jsx(Ee,{drawing:s,width:75,height:75,className:"canvas"},s))})]})})]})}},{title:"Aqui O",dataIndex:"aqui-o",key:"aqui-o",render:t=>{if(!t)return n.jsx(L,{message:"No entry",type:"error"});const{number:a,setId:r,title:l,itemsIds:e}=t;return n.jsxs(w,{children:[n.jsx(_,{children:a}),n.jsx(O,{label:"SetId",children:r}),n.jsx(O,{label:"Title",children:l.pt}),n.jsx(O,{label:"Items",children:e.length}),n.jsx(R,{children:n.jsx(b,{gap:6,wrap:!0,style:{maxWidth:500},children:e.map(s=>n.jsx(q,{id:s,width:50},s))})})]})}},{title:"Alienígena",dataIndex:"comunicacao-alienigena",key:"comunicacao-alienigena",render:t=>{if(!t)return n.jsx(L,{message:"No entry",type:"error"});const{number:a,itemsIds:r,attributes:l}=t;return n.jsxs(w,{children:[n.jsx(_,{children:a}),n.jsx(O,{label:"Items",children:r.length}),n.jsx(R,{children:n.jsxs(b,{gap:6,style:{maxWidth:"300px"},vertical:!0,children:[n.jsx(U,{wrap:!0,children:l.map(e=>n.jsx(Oe,{id:`sign-${e.spriteId}`,width:50},e.spriteId))}),n.jsx(U,{wrap:!0,children:r.map(e=>n.jsx(q,{id:e,width:50},e))})]})})]})}},{title:"Conjuntos",dataIndex:"teoria-de-conjuntos",key:"teoria-de-conjuntos",render:t=>{if(!t)return n.jsx(L,{message:"No entry",type:"error"});const{number:a,rule1:r,intersectingThing:l,rule2:e,title:s}=t;return n.jsxs(w,{children:[n.jsx(_,{children:a}),n.jsx(O,{label:"Title",children:s}),n.jsx(R,{children:n.jsxs(b,{gap:6,children:[n.jsx(q,{id:r.thing.id,width:50}),n.jsx(q,{id:l.id,width:50}),n.jsx(q,{id:e.thing.id,width:50})]})})]})}},{title:"Estoque",dataIndex:"controle-de-estoque",key:"controle-de-estoque",render:t=>{if(!t)return n.jsx(L,{message:"No entry",type:"error"});const{number:a,title:r,goods:l}=t;return n.jsxs(w,{children:[n.jsx(_,{children:a}),n.jsx(O,{label:"Title",children:r}),n.jsx(O,{label:"Goods",children:l.length}),n.jsx(R,{children:n.jsx(b,{gap:6,wrap:!0,style:{maxWidth:245},children:l.map(e=>n.jsx(be,{id:e,width:50},e))})})]})}},{title:"Filmaço",dataIndex:"filmaco",key:"filmaco",render:t=>{if(!t)return n.jsx(L,{message:"No entry",type:"error"});const{number:a,setId:r,title:l,year:e}=t;return n.jsxs(w,{children:[n.jsx(_,{children:a}),n.jsx(O,{label:"SetId",children:r}),n.jsx(R,{children:n.jsxs(b,{gap:6,vertical:!0,children:[n.jsxs("span",{children:["Year: ",e]}),n.jsxs("span",{children:["Title:"," ",l.split("").map((s,o)=>o<1||s===" "?s:"⏹").join("")]})]})})]})}},{title:"Palavreado",dataIndex:"palavreado",key:"palavreado",render:t=>{if(!t)return n.jsx(L,{message:"No entry",type:"error"});const{number:a,letters:r,keyword:l,words:e}=t;return n.jsxs(w,{children:[n.jsx(_,{children:a}),n.jsx(O,{label:"Letters",children:r.length}),n.jsx(O,{label:"Keyword",children:l}),n.jsx(R,{children:n.jsx(U,{direction:"vertical",children:e.map((s,o)=>n.jsx("span",{children:s.split("").map((c,i)=>i===o||c===" "?c:"⏹").join("")},`${a}-${s}`))})})]})}},{title:"Portais",dataIndex:"portais-magicos",key:"portais-magicos",render:t=>{if(!t)return n.jsx(L,{message:"No entry",type:"error"});const{number:a,setId:r,corridors:l}=t;return n.jsxs(w,{children:[n.jsx(_,{children:a}),n.jsx(O,{label:"SetId",children:m.truncate(r,{length:9})}),n.jsx(R,{children:n.jsx(b,{gap:6,vertical:!0,children:l.map(e=>n.jsxs(b,{gap:6,vertical:!0,children:[n.jsxs("span",{children:["Passcode: ",e.passcode]}),n.jsx(b,{children:e.imagesIds.map(s=>n.jsx(ie,{id:s,width:50},s))})]},e.passcode))})})]})}},{title:"Quartetos",dataIndex:"quartetos",key:"quartetos",render:t=>{if(!t)return n.jsx(L,{message:"No entry",type:"error"});const{number:a,setId:r,sets:l}=t;return n.jsxs(w,{children:[n.jsx(_,{children:a}),n.jsx(O,{label:"SetId",children:m.truncate(r,{length:9})}),n.jsx(R,{children:n.jsx(b,{gap:6,children:l.map(e=>n.jsx(b,{gap:6,vertical:!0,children:e.itemsIds.map(s=>n.jsx(q,{id:s,width:50},s))},e.id))})})]})}},{title:"Picaço",dataIndex:"artista",key:"artista",render:t=>{if(!t)return n.jsx(L,{message:"No entry",type:"error"});const{number:a,cards:r}=t;return n.jsxs(w,{children:[n.jsx(_,{children:a}),n.jsx(O,{label:"Cards",children:r.length}),n.jsx(R,{children:n.jsx(b,{gap:6,vertical:!0,style:{maxHeight:500,overflowY:"auto"},children:r.map((l,e)=>n.jsx("span",{children:l.text},`${l.id}-${e}`))})})]})}},{title:"Tá Na Cara",dataIndex:"ta-na-cara",key:"ta-na-cara",render:t=>{if(!t)return n.jsx(L,{message:"No entry",type:"error"});const{number:a,suspectsIds:r,testimonies:l}=t;return n.jsxs(w,{children:[n.jsx(_,{children:a}),n.jsx(O,{label:"Suspects",children:r==null?void 0:r.length}),n.jsx(O,{label:"Questions",children:l.length}),n.jsx(R,{children:n.jsxs(b,{vertical:!0,children:[n.jsx(U,{direction:"vertical",style:{maxHeight:100,overflowY:"auto"},children:l.map(e=>n.jsx("span",{children:e.question},e.testimonyId))}),n.jsx(U,{wrap:!0,style:{maxHeight:200,maxWidth:"500px",overflowY:"auto"},children:r==null?void 0:r.map(e=>n.jsx(ie,{id:e,width:48},e))})]})})]})}}];function Ve(){const[t,a]=y.useState(""),[r,l]=y.useState(!1),{isLoading:e,data:s}=Le("diario",t,{enabled:!!t&&r}),o=y.useMemo(()=>s?[s]:[],[s]),c=d=>{l(!1),a(d.trim())},i=()=>{console.log(t,ne(t,"YYYY-MM-DD",!0).isValid()),l(ne(t,"YYYY-MM-DD",!0).isValid())};return console.log(s),n.jsxs("div",{children:[n.jsx(B.Title,{level:2,children:"Data Verification"}),n.jsx(re,{to:"/game/daily-setup",children:"Go to Setup"}),n.jsxs(b,{justify:"space-between",align:"center",className:"mb-2",children:[n.jsxs(U.Compact,{children:[n.jsx(ve,{placeholder:"YYYY-MM-DD",onChange:d=>c(d.target.value)}),n.jsx(J,{type:"primary",onClick:i,children:"Load"})]}),t," ",r?"Valid":"Invalid",n.jsx(J,{disabled:!0,type:"primary",size:"large",children:"Save"})]}),n.jsx(oe,{loading:e,columns:ue,dataSource:o,scroll:{x:"max-content"}})]})}const W=new je({}),z=(t,a)=>{W.setState(r=>({...r,[t]:a}))},Fe=()=>{W.setState(()=>({}))},Be=()=>xe(W,()=>W.state),Je=(t,a,r,l)=>{const[e]=M(p.AQUI_O,l),s=v("items",t),o=v("daily-disc-sets",t);return{entries:y.useMemo(()=>!t||!o.isSuccess||!e||!s.isSuccess?{}:We(r,e,o.data,s.data),[t,o,s,e,r]),isLoading:s.isLoading||o.isLoading}},We=(t,a,r,l)=>{console.count("Creating Aqui Ó...");const e=m.shuffle(Object.values(r).filter(d=>d.itemsIds.filter(Boolean).length>=20)),s=e.filter(d=>!a.used.includes(d.id));s.length<t&&(console.log("🔆 Not enough aqui-o sets left, shuffling..."),z("aqui-o","Not enough aqui-o sets left"),s.push(...m.shuffle(e)));const o=Object.values(l).filter(d=>d!=null&&d.nsfw?!1:m.intersection(d.decks??[],["alien","dream","thing"]).length>0);let c=a.latestDate;const i={};for(let d=0;d<t;d++){const g=s[d];g||console.error("No aqui-o sets left");const u=G(c),I=le(u);c=u,I?i[u]={id:u,type:"aqui-o",number:a.latestNumber+d+1,setId:"special",title:{pt:"Especial Fim de Semana",en:"Weekend Special"},itemsIds:["0",...m.sampleSize(o,25).map(x=>x.id)]}:i[u]={id:u,type:"aqui-o",number:a.latestNumber+d+1,setId:g.id,title:g.title,itemsIds:["0",...m.sampleSize(g.itemsIds,20)]}}return i},Ye=(t,a,r,l)=>{const[e]=M(p.ARTE_RUIM,l),s=ae(t,a);return{entries:y.useMemo(()=>!t||s.isLoading||!e?[]:$e(r,e,s,a),[t,s,a,e,r,s.isLoading]),isLoading:s.isLoading}},$e=(t,a,r,l)=>{console.count("Creating Arte Ruim...");const e=Object.values(r.drawings).filter(i=>!(a.used.includes(i.id)||i.drawings.length<3)).map(i=>({id:i.id,type:"arte-ruim",language:l??"pt",cardId:i.id,text:i.text,drawings:i.drawings.map(d=>d.drawing),number:0,dataIds:i.drawings.map(d=>d.id)})),s=m.sampleSize(m.shuffle(e),t);let o=a.latestDate;return s.map((i,d)=>{const g=G(o);return o=g,{...i,id:g,number:a.latestNumber+d+1}})},He=(t,a,r,l,e)=>{const[s]=M(p.ARTISTA,l),[o]=M(p.ARTE_RUIM,l),c=v(`arte-ruim-cards-${a}`,t),i=ae(t,a);return{entries:y.useMemo(()=>{if(!t||!c.isSuccess||i.isLoading||!s)return{};const g=e.map(u=>u.cardId);return Ze(r,s,o,c.data,g,i.drawings)},[t,c,o,s,r,e,i.drawings,i.isLoading]),isLoading:c.isLoading||i.isLoading}},Ze=(t,a,r,l,e,s)=>{console.count("Creating Artista...");let o=a.latestDate;const c={};for(let i=0;i<t;i++){const d=G(o),g=Object.keys(l??{}).filter(I=>{var x,A;return!r.used.includes(I)&&!e.includes(I)&&((A=(x=s==null?void 0:s[I])==null?void 0:x.drawings)==null?void 0:A.length)<3}),u=m.sampleSize(g,20).map(I=>l[I]);o=d,c[d]={id:d,type:"artista",number:a.latestNumber+i+1,cards:u}}return c},Ke=(t,a,r,l)=>{const[e]=M(p.COMUNICACAO_ALIENIGENA,l),s=v("items",t),o=v("items-attributes",t),c=v("items-attribute-values",t);return{entries:y.useMemo(()=>!t||!e||!o.isSuccess||!c.isSuccess||!s.isSuccess?{}:ze(r,e,o.data,c.data,s.data),[t,r,e,e,o,c,s]),isLoading:s.isLoading||o.isLoading||c.isLoading}},ze=(t,a,r,l,e)=>{console.count("Creating Comunicacao Alienigena...");let s=a.latestDate;const o=m.values(r),c=m.values(l).filter(u=>{var I;return u.complete&&((I=e==null?void 0:e[u.id])==null?void 0:I.nsfw)!==!0}),i={};let d=0;for(;m.keys(i).length<t&&d<100;){const u=Xe(o,c);if(u.valid&&!i[u.setId]&&!a.used.includes(u.setId)&&(i[u.setId]=u),m.keys(i).length>=t)break;d+=1}console.log(`🔆 Generating this batch took ${d} tries`),d>=100&&z("comunicacao-alienigena","Not enough valid comunicacao alienigena games (over 100 attempts)");const g={};return Object.values(i).forEach((u,I)=>{const x=G(s);s=x,g[x]={...u,id:x,number:a.latestNumber+I+1}}),g},Xe=(t,a)=>{const r=m.shuffle(a),l=m.shuffle(we(50,0)),e=m.sampleSize(t,3).map(h=>({...h,spriteId:`${l.pop()}`})),s=[],o=[],c=[],i=[],d=[],g=[],u=[],I=[];r.forEach(h=>{const P=[k.DETERMINISTIC,k.RELATED],j=h.attributes[e[0].id]===k.DETERMINISTIC,C=P.includes(h.attributes[e[0].id]),T=h.attributes[e[0].id]===k.UNRELATED,pe=h.attributes[e[1].id]===k.DETERMINISTIC,$=P.includes(h.attributes[e[1].id]),V=h.attributes[e[1].id]===k.UNRELATED,ge=h.attributes[e[2].id]===k.DETERMINISTIC,H=P.includes(h.attributes[e[2].id]),F=h.attributes[e[2].id]===k.UNRELATED;if(T&&V&&F)return I.push(h.id);j&&V&&F&&s.push(h.id),T&&pe&&F&&o.push(h.id),T&&V&&ge&&c.push(h.id),C&&$&&F&&i.push(h.id),C&&V&&H&&d.push(h.id),T&&$&&H&&g.push(h.id),C&&$&&H&&u.push(h.id)});const x=e.map(h=>({id:h.id,name:h.name.pt,description:h.description.pt,spriteId:h.spriteId,itemsIds:[]}));x[0].itemsIds=m.sampleSize(s,s.length>3?3:Math.max(s.length-1,1)),x[1].itemsIds=m.sampleSize(o,o.length>3?3:Math.max(s.length-1,1)),x[2].itemsIds=m.sampleSize(c,c.length>3?3:Math.max(s.length-1,1));const A=[];x.forEach(h=>{A.push(...h.itemsIds)});const N=[];i.length>0&&N.push({spritesIds:[e[0].spriteId,e[1].spriteId],itemId:m.sample(i)??""}),d.length>0&&N.push({spritesIds:[e[0].spriteId,e[2].spriteId],itemId:m.sample(d)??""}),g.length>0&&N.push({spritesIds:[e[1].spriteId,e[2].spriteId],itemId:m.sample(g)??""}),u.length>0&&N.push({spritesIds:e.map(h=>h.spriteId),itemId:m.sample(u)??""});const D=[];s.length>0&&D.push({spritesIds:[e[0].spriteId],itemId:s.filter(h=>!A.includes(h))[0]}),o.length>0&&D.push({spritesIds:[e[1].spriteId],itemId:o.filter(h=>!A.includes(h))[0]}),c.length>0&&D.push({spritesIds:[e[2].spriteId],itemId:c.filter(h=>!A.includes(h))[0]});let E=m.sampleSize(N,4);E.length<3&&E.push(...m.sampleSize(D,4-E.length)),E.length<4&&console.log("🔆 Not enough requests for an alien communication, marking it as invalid"),E=m.shuffle(E);const S=E.map(h=>h.itemId),f={id:"0000-00-00",setId:x.map(h=>h.id).sort().join("-"),number:0,type:"comunicação-alienígena",attributes:x,requests:E,solution:S.join("-"),itemsIds:m.shuffle([...S,...m.sampleSize([I[0],I[1],I[2],I[3]],m.random(1,3))]).filter(Boolean),valid:!1};return f.valid=[f.attributes.length===3,f.requests.length===4,f.itemsIds.length>4,f.attributes.every(h=>h.itemsIds.length>0),f.requests.every(h=>h.itemId)].every(Boolean),f},es=(t,a,r,l)=>{const[e]=M(p.CONTROLE_DE_ESTOQUE,l);return{entries:y.useMemo(()=>!t||!e?{}:ss(r,e),[t,r,e]),isLoading:!1}},ss=(t,a)=>{console.count("Creating Controle de Estoque...");let r=a.latestDate;const l={};for(let e=0;e<t;e++){const s=G(r);r=s,l[s]=as(s,a.latestNumber+e+1)}return l},ts=256,is=16,ns=4,rs=1,as=(t,a)=>{const[r,l,e]=t.split("-").map(Number),o=new Date(r,l-1,e).getDay(),c=["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"][o],i={id:t,number:a,type:"controle-de-estoque",language:"pt",title:c,goods:[],orders:[]},d=m.sampleSize(Array(ts).fill("").map((u,I)=>`good-${I+1}`),is+rs),g=d.pop();if(i.goods=d,i.orders=m.sampleSize(i.goods,ns),!g)throw new Error("No out of stock good");return i.orders.push(g),i.orders=m.shuffle(i.orders),i},os=(t,a,r,l)=>{const[e]=M(p.FILMACO,l),s=v("daily-movie-sets",t);return{entries:y.useMemo(()=>!t||!s.isSuccess||!e?{}:(Object.values(s.data).filter(i=>i.itemsIds.length>0&&!e.used.includes(i.id)).length<=r&&z("filmaco","Not enough unused films"),ls(r,e,s.data)),[t,s,e,r]),isLoading:s.isLoading}},ls=(t,a,r)=>{console.count("Creating Filmaço...");const l=m.shuffle(Object.values(r).filter(c=>c.itemsIds.filter(Boolean).length>0)),e=l.filter(c=>!a.used.includes(c.id));e.length<t&&e.push(...m.shuffle(l));let s=a.latestDate;const o={};for(let c=0;c<t;c++){const i=e[c];if(!i){console.error("No filmaço sets left");break}const d=G(s);s=d,o[d]={id:d,type:"filmaco",number:a.latestNumber+c+1,setId:i.id,title:i.title,itemsIds:i.itemsIds,year:i.year}}return o},cs=(t,a,r,l)=>{const[e]=M(p.PALAVREADO,l),s=K(4,a,t),o=K(5,a,t);return{entries:y.useMemo(()=>!t||!s.data||!s.data.length||!o.data||!o.data.length||!e?{}:ds(r,e,s.data,o.data),[t,s,o,e,r]),isLoading:s.isLoading||o.isLoading}},ds=(t,a,r,l)=>{console.count("Creating Palavreado...");let e=a.latestDate;const s=[],o={};for(let c=0;c<t;c++){const i=G(e),d=le(i),g=d?5:4;e=i,o[i]={id:i,type:"palavreado",number:a.latestNumber+c+1,...us(d?l:r,[...Object.values(o).map(u=>u.keyword),...a.used],s,g)}}return o},us=(t,a,r,l=4,e)=>{let s=m.shuffle(m.difference(t,r,a));const o=e||(s.pop()??""),c=[];for(let i=0;i<l;i++){const d=ms(t,o,c,i);c.push(d)}return r.push(o,...c),{keyword:o,words:c,letters:ps(c,o.length)}},ms=(t,a,r,l)=>{const e=m.uniq([...m.flatMap(r.map(c=>c.split(""))),...a.split("")]),s=m.shuffle(t.filter(c=>c[l]===a[l]&&!r.includes(c)));return m.sortBy(s,c=>m.intersection(c.split(""),e).length)[0]},ps=(t,a)=>{const r=m.flatMap(t.map(o=>o.split(""))),l=a===4?[0,5,10,15]:[0,6,12,18,24],e=m.shuffle(r.filter((o,c)=>!l.includes(c))),s=[];for(let o=0;o<r.length;o++)l.includes(o)?s.push(r[o]):s.push(e.shift()??"");return s},gs=(t,a,r,l)=>{const[e]=M(p.PORTAIS_MAGICOS,l),s=v("daily-passcode-sets",t),o=K(3,a,t);return{entries:y.useMemo(()=>{if(!t||!s.isSuccess||!o.isSuccess||!e)return{};const i=o.data.reduce((d,g)=>(g.split("").forEach(u=>{d[u]||(d[u]=[]),d[u].push(g)}),d),{" ":["  "],"-":[" - "]});return hs(r,e,s.data,i)},[t,r,s.isSuccess,s.data,o.isSuccess,o.data,e]),isLoading:s.isLoading||o.isLoading}},hs=(t,a,r,l)=>{console.count("Creating Portais Mágicos...");let e=a.latestDate;const s=a.used,o={};let c=m.shuffle(Object.values(r).filter(d=>d.imageCardsIds.length>0));const i={};for(let d=0;d<t;d++){const g=G(e),u=[];let I=[...c];const x=[];for(;x.length<3;){const A=I.pop();if(!A)throw new Error("Not enough sets available");const N=m.sample(A.passcode.filter(f=>f.length<=12&&!s.includes(f)))||"";if(!N)continue;const D=x.length+1;u.push(A.id),o[A.id]=!0;const E=N.split("").map(f=>m.sample(l[f])||` ${f} `),S=m.sampleSize(A.imageCardsIds,D);x.push({passcode:N,imagesIds:S,words:E}),I=I.filter(f=>!o[f.id]&&f.imageCardsIds.length>D)}e=g,i[g]={id:g,type:"portais-magicos",setId:u.join(Y),number:a.latestNumber+d+1,corridors:x.reverse()},c=c.filter(A=>!o[A.id])}return i},fs=(t,a,r,l)=>{const[e]=M(p.QUARTETOS,l),s=v("daily-quartet-sets",t),o=v("items-groups",t);return{entries:y.useMemo(()=>!t||s.isLoading||o.isLoading||!e?{}:Is(r,e,a,s.data,o.data),[t,a,e,r,s,o]),isLoading:s.isLoading||o.isLoading}},Is=(t,a,r,l,e)=>{console.count("Creating Quartetos...");let s=Object.values(l).filter(i=>i.itemsIds.length>=4&&!a.used.includes(i.id)&&!i.flagged),o=a.latestDate;const c={};return Array.from({length:t}).forEach((i,d)=>{const g=[],u={};let I=m.cloneDeep(s),x=0;for(;g.length<3&&x<500;){const j=m.sample(I);if(!j)throw Error("No potential set found for Quartetos game");I=I.filter(T=>T.id!==j.id);const C=m.orderBy(m.sampleSize(j.itemsIds,4),T=>Number(T));if(C.some(T=>u[T])){x++;continue}j.itemsIds.forEach(T=>{u[T]=!0}),g.push({id:j.id,title:j.title,itemsIds:C,level:j.level??1}),x=0}const A=g.map(j=>j.id);s=s.filter(j=>!A.includes(j.id));const N=Object.values(e).filter(j=>j.itemsIds.some(C=>!u[C])&&j.itemsIds.length>=4&&j.nsfw!==!0),D=m.sample(N);if(!D)throw Error("No eligible group found for Quartetos game");g.push({id:D.id,title:m.capitalize(D.name[r]),itemsIds:m.sampleSize(D.itemsIds,4),level:1});const E=Math.ceil(g.reduce((j,C)=>j+C.level,0)/g.length),S=m.orderBy(g,["level"],["desc"]).map((j,C)=>(j.level=C,j)),f=g.map(j=>j.id).join(Y),h=m.shuffle(g.flatMap(j=>j.itemsIds)),P=G(o);o=P,c[P]={id:P,number:a.latestNumber+d+1,setId:f,type:"quartetos",grid:h,difficulty:E,sets:S}}),c},xs=(t,a)=>Q([...t,...a.flatMap(r=>r.sets.map(l=>l.id))]),js=(t,a,r,l)=>{const[e]=M(p.TA_NA_CARA,l),s=v("suspects",t),o=v(`testimony-questions-${a}`,t);return{entries:y.useMemo(()=>!t||!s.isSuccess||!o.isSuccess||!e?{}:ys(r,e,s.data,o.data),[t,s,o,e,r]),isLoading:s.isLoading||o.isLoading}},As=15,Ss=13,ys=(t,a,r,l)=>{console.count("Creating Tá Na Cara...");const e=me(a.used),s=m.orderBy(m.shuffle(Object.values(r)).map(d=>{const[,g]=d.id.split("-");return`us-ct-${g}`}),[d=>e==null?void 0:e[d]],["asc"]),o=m.shuffle(Object.values(l));let c=a.latestDate;const i={};for(let d=0;d<t;d++){const g=m.sampleSize(o,As).map(I=>({testimonyId:I.id,question:I.question,nsfw:!!I.nsfw})),u=G(c);c=u,i[u]={id:u,type:"ta-na-cara",number:a.latestNumber+d+1,suspectsIds:m.sampleSize(s,Ss),testimonies:g}}return i},me=t=>t.reduce((a,r)=>{const l=r.split(Y),e=l[0],s=Number(l[1]);return a[e]=s||0,a},{}),Ds=(t,a)=>{const r=me(t);return a.forEach(l=>{var e;l.testimonies.forEach(s=>{var o;r[s.testimonyId]===void 0&&(r[s.testimonyId]=0),r[s.testimonyId]+=1,(o=s==null?void 0:s.suspectsIds)==null||o.forEach(c=>{r[c]===void 0&&(r[c]=0),r[c]+=1})}),(e=l.suspectsIds)==null||e.forEach(s=>{r[s]===void 0&&(r[s]=0),r[s]+=1})}),Object.entries(r).map(([l,e])=>`${l}${Y}${e}`)};function Ns(t,a,r){const l=ce.DAILY[a??"pt"],e=de(l,{enabled:t});y.useEffect(()=>{Fe()},[r,a]);const s=t&&e.isSuccess,o=Je(s,a,r,e.data??{}),c=Ye(s,a,r,e.data??{}),i=Ke(s,a,r,e.data??{}),d=es(s,a,r,e.data??{}),g=os(s,a,r,e.data??{}),u=cs(s,a,r,e.data??{}),I=fs(s,a,r,e.data??{}),x=_e(s,a,r,e.data??{}),A=gs(s,a,r,e.data??{}),N=He(s,a,r,e.data??{},c.entries),D=js(s,a,r,e.data??{}),E=y.useMemo(()=>c.entries.length===0?[]:(console.count("Bundling entries..."),c.entries.map(S=>({id:S.id,"arte-ruim":S,"aqui-o":o.entries[S.id],"comunicacao-alienigena":i.entries[S.id],"controle-de-estoque":d.entries[S.id],filmaco:g.entries[S.id],palavreado:u.entries[S.id],"portais-magicos":A.entries[S.id],quartetos:I.entries[S.id],"teoria-de-conjuntos":x.entries[S.id],artista:N.entries[S.id],"ta-na-cara":D.entries[S.id]}))),[c.entries,o.entries,g.entries,i.entries,d.entries,u.entries,A.entries,I.entries,x.entries,N.entries,D.entries]);return{isLoading:e.isLoading||o.isLoading||c.isLoading||i.isLoading||d.isLoading||g.isLoading||u.isLoading||A.isLoading||I.isLoading||x.isLoading||N.isLoading||D.isLoading,entries:E}}function Es(t){const{notification:a}=Ae.useApp(),r=Se(),l=ce.DAILY[t??"pt"],[e,s]=y.useState(!1),o=de(l,{enabled:!!l}),c=Re({mutationFn:async i=>{var x,A,N,D,E,S;const d=i.map(f=>{const h=X(ee,`${l}/${f.id}`);return se(h,f)}),g=X(ee,`${l}/history`),u=o.data;if(!u)throw new Error("No previous history");const I={...u,[p.ARTE_RUIM]:{latestDate:i[i.length-1].id,latestNumber:i[i.length-1][p.ARTE_RUIM].number,used:JSON.stringify(Q([...JSON.parse(u[p.ARTE_RUIM].used),...i.map(f=>f[p.ARTE_RUIM].cardId)]))},[p.AQUI_O]:{latestDate:i[i.length-1].id,latestNumber:i[i.length-1][p.AQUI_O].number,used:JSON.stringify(Q([...JSON.parse(u[p.AQUI_O].used??"[]"),...i.map(f=>f[p.AQUI_O].setId)]))},[p.PALAVREADO]:{latestDate:i[i.length-1].id,latestNumber:i[i.length-1][p.PALAVREADO].number,used:JSON.stringify(Q([...JSON.parse(u.palavreado.used),...i.map(f=>f[p.PALAVREADO].keyword)]))},[p.ARTISTA]:{latestDate:i[i.length-1].id,latestNumber:i[i.length-1][p.ARTISTA].number,used:"[]"},[p.FILMACO]:{latestDate:i[i.length-1].id,latestNumber:i[i.length-1][p.FILMACO].number,used:JSON.stringify(Q([...JSON.parse(((x=u==null?void 0:u[p.FILMACO])==null?void 0:x.used)??"[]"),...i.map(f=>f[p.FILMACO].setId)]))},[p.CONTROLE_DE_ESTOQUE]:{latestDate:i[i.length-1].id,latestNumber:i[i.length-1][p.CONTROLE_DE_ESTOQUE].number,used:"[]"},[p.TEORIA_DE_CONJUNTOS]:{latestDate:i[i.length-1].id,latestNumber:i[i.length-1][p.TEORIA_DE_CONJUNTOS].number,used:JSON.stringify(Q([...JSON.parse(((A=u==null?void 0:u[p.TEORIA_DE_CONJUNTOS])==null?void 0:A.used)??"[]"),...i.map(f=>f[p.TEORIA_DE_CONJUNTOS].setId),...i.map(f=>f[p.TEORIA_DE_CONJUNTOS].intersectingThing.id)]))},[p.COMUNICACAO_ALIENIGENA]:{latestDate:i[i.length-1].id,latestNumber:i[i.length-1][p.COMUNICACAO_ALIENIGENA].number,used:JSON.stringify(Q([...JSON.parse(((N=u==null?void 0:u[p.COMUNICACAO_ALIENIGENA])==null?void 0:N.used)??"[]"),...i.map(f=>f[p.COMUNICACAO_ALIENIGENA].setId)]))},[p.QUARTETOS]:{latestDate:i[i.length-1].id,latestNumber:i[i.length-1][p.QUARTETOS].number,used:JSON.stringify(xs(JSON.parse(((D=u==null?void 0:u[p.QUARTETOS])==null?void 0:D.used)??"[]"),i.map(f=>f[p.QUARTETOS])))},[p.TA_NA_CARA]:{latestDate:i[i.length-1].id,latestNumber:i[i.length-1][p.TA_NA_CARA].number,used:JSON.stringify(Ds(JSON.parse(((E=u==null?void 0:u[p.TA_NA_CARA])==null?void 0:E.used)??"[]"),i.map(f=>f[p.TA_NA_CARA])))},[p.PORTAIS_MAGICOS]:{latestDate:i[i.length-1].id,latestNumber:i[i.length-1][p.PORTAIS_MAGICOS].number,used:JSON.stringify(Q([...JSON.parse(((S=u==null?void 0:u[p.PORTAIS_MAGICOS])==null?void 0:S.used)??"[]"),...i.map(f=>f[p.PORTAIS_MAGICOS].corridors.map(h=>h.passcode))]))}};return se(g,I),Promise.all(d)},onSuccess:()=>{a.info({message:"Data saved",placement:"bottomLeft"}),r.invalidateQueries({queryKey:[l,"history"]}),s(!1)},onError:()=>{a.error({message:"Error saving data",placement:"bottomLeft"})}});return{isDirty:e,setIsDirty:s,save:c.mutateAsync,isPending:c.isPending}}function Os({language:t,dataLoad:a}){const r=t,{is:l}=Ne(),e=Be();console.log(e);const{save:s,isPending:o}=Es(r??"pt");return l("dataCheck")?n.jsx(Ve,{}):n.jsxs("div",{children:[n.jsx(B.Title,{level:2,children:"Data Population"}),a.isLoading&&n.jsx("div",{children:"Loading..."}),n.jsxs(b,{justify:"space-between",align:"center",children:[n.jsxs("span",{children:[n.jsx(re,{to:"/game/daily-setup?dataCheck=true",children:"Go to Check"}),n.jsxs(B.Title,{level:4,children:["Total: ",a.entries.length]})]}),n.jsx(J,{onClick:()=>s(a.entries),loading:o,disabled:(a.entries??[]).length===0,type:"primary",size:"large",icon:n.jsx(Me,{}),children:"Save"})]}),Object.values(e).map(c=>n.jsx(L,{message:c,type:"warning",showIcon:!0,banner:!0},c)),n.jsx(oe,{columns:ue,dataSource:a.entries??[],scroll:{x:"max-content"}})]})}function bs({language:t,setLanguage:a,drawingsCount:r,setDrawingsCount:l,batchSize:e,setBatchSize:s}){return n.jsxs(Ge,{children:[n.jsx(Z,{label:"Language",value:t,onChange:a,options:[Ce],placeholder:"Select a language"}),n.jsx(Z,{label:"Minimum Drawings",value:r,onChange:l,options:[2,3,4],placeholder:"Select a number"}),n.jsx(Z,{label:"Batch Size",value:e,onChange:s,options:[3,7,14,21,28],placeholder:"Select a number"})]})}function mt(){const[t,a]=y.useState(""),[r,l]=y.useState(3),[e,s]=y.useState(7),o=Ns(!!t,t,e);return n.jsx(ye,{title:"Daily Setup",children:n.jsxs(te,{hasSider:!0,children:[n.jsxs(Qe,{children:[n.jsx(De,{isLoading:o.isLoading,error:null,hasResponseData:!o.isLoading}),n.jsx(bs,{language:t,setLanguage:a,drawingsCount:r,setDrawingsCount:l,batchSize:e,setBatchSize:s})]}),n.jsx(te.Content,{className:"content",children:n.jsx(ke,{isLoading:o.isLoading,error:null,hasResponseData:!o.isLoading,children:n.jsx(Os,{language:t,dataLoad:o})})})]})},e)}export{mt as default};
