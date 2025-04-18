import{j as e,a9 as k,a7 as w,r as y,T as c,D as b,P as F,L as C}from"./index-DVQc80aL.js";import{u as S,D as L}from"./DataFilters-DksjSCJa.js";import{u as N,P}from"./useGridPagination-DnKJs3ky.js";import{l as m}from"./lodash-Cne9hxq2.js";import{L as x,D as g,N as T}from"./EditableFields-DcgO6tgJ.js";import{L as d}from"./LanguageFlag-AhCVBZy9.js";import{I as O}from"./ImageCard-CBpWbRjy.js";import{r as R,a as I,d as B}from"./index-BnFUJhch.js";import{P as D}from"./constants-BdgM9j1Q.js";import{C as j}from"./index-5TY1n3-z.js";import{F as n}from"./index-qapmTdyC.js";import{S as W}from"./index-BQj2rA2_.js";import{R as M}from"./index-Ci7BgAoR.js";import{D as A}from"./DataLoadingWrapper-DrZAP9Hg.js";import{D as G}from"./DownloadButton-_GflqSws.js";import{S as _}from"./SaveButton-8a4Lw99d.js";import{S as f}from"./SiderContent-DGYX1Rj7.js";import{P as z}from"./useBaseUrl-BLmwdZA9.js";import{u as H}from"./useResourceFirebaseData-DgXm7J1z.js";import"./useQueryParams-cZbALjai.js";import"./FilterEntries-BSVgz3Ob.js";import"./index-ZSSHW14X.js";import"./index-D5vZVq88.js";import"./index-CmE3exUg.js";import"./Pagination-D2MRnmnX.js";import"./index-DTVvqAJl.js";import"./gapSize-U1swVQyS.js";import"./useCopyToClipboardFunction-CkdXVpCi.js";import"./index-Bf_bgK0s.js";import"./Input-CXqvnCxL.js";import"./FireFilled-niw8qDHI.js";import"./IdcardOutlined-CF2fko07.js";import"./Item-dNxgMdgm.js";import"./index-DAdu6QfX.js";import"./PlusOutlined-DyphvtIW.js";import"./moment-C5S46NFB.js";import"./SaveOutlined-C8rMiad3.js";import"./useGetFirebaseDoc-DBDY5cQa.js";import"./useTDResource-CjZRhN2T.js";import"./useUpdateFirebaseDoc-DHL8Sbzz.js";import"./useMutation-D2a3OoZT.js";const h=[{value:"base",label:"Base"},{value:"anime",label:"Anime"},{value:"art",label:"Art"},{value:"cartoon",label:"Cartoon"},{value:"characters",label:"Characters"},{value:"comics",label:"Comics"},{value:"games",label:"Games"},{value:"history",label:"History"},{value:"internet",label:"Internet"},{value:"literature",label:"Literature"},{value:"movies",label:"Movies"},{value:"music",label:"Music"},{value:"mythology",label:"Mythology"},{value:"pop-culture",label:"Pop Culture"},{value:"random",label:"Random"},{value:"sports",label:"Sports"},{value:"television",label:"Television"},{value:"special-td",label:"Special TD"},{value:"special-td-bg",label:"Special TD BG"}],K=(s,l)=>{if(!s||s.length===0)return"warning";if(s.filter(r=>!h.some(t=>t.value===r)).length>0||l&&s.includes("base"))return"error"};function J({contender:s,addEntryToUpdate:l}){const a=(i,u,o)=>{l(s.id,m.merge({[u]:{en:"",pt:""}},s,{[u]:{[o]:i}}))},r=i=>{l(s.id,m.merge(s,{nsfw:i}))},t=i=>{l(s.id,{...s,decks:R(i).sort()})};return e.jsxs(j,{hoverable:!0,"style-":{width:240,maxWidth:240},cover:e.jsx(O,{id:s.id,width:240}),children:[e.jsx(j.Meta,{title:s.id,description:e.jsxs(n,{vertical:!0,children:[e.jsx(x,{children:"Name"}),e.jsx(g,{value:s.name,language:"en",onChange:i=>a(i.target.value,"name","en")}),e.jsx(g,{value:s.name,language:"pt",onChange:i=>a(i.target.value,"name","pt")}),e.jsx(x,{children:"Description"}),e.jsx(g,{value:s.description??D,language:"en",onChange:i=>a(i.target.value,"description","en")}),e.jsx(g,{value:s.description??D,language:"pt",onChange:i=>a(i.target.value,"description","pt")}),e.jsx(x,{children:"Decks"}),e.jsx(W,{mode:"multiple",defaultValue:s.decks??[],size:"small",options:h,onChange:i=>t(i),style:{maxWidth:"calc(100vw / 9)"},status:K(s.decks,s.exclusivity)}),e.jsxs(n,{align:"center",children:[e.jsx(x,{children:"NSFW"})," ",e.jsx(T,{value:s.nsfw,size:"small",onChange:i=>r(i)})]}),e.jsxs(n,{align:"center",gap:8,children:[e.jsx(x,{children:"Exclusivity"})," ",e.jsx(U,{contender:s,addEntryToUpdate:l})]})]})}),e.jsx(j.Meta,{})]})}function U({contender:s,addEntryToUpdate:l}){const a=i=>{l(s.id,m.merge(s,{exclusivity:i}))},r=[{value:"en",label:e.jsx(d,{language:"en",style:{width:24}})},{value:"pt",label:e.jsx(d,{language:"pt",style:{width:24}})},{value:"none",label:"None"}],t=e.jsx(n,{gap:8,children:e.jsx(M.Group,{options:r,onChange:i=>a(i.target.value),value:s==null?void 0:s.exclusivity})});return e.jsxs(n,{gap:8,children:[(s==null?void 0:s.exclusivity)==="en"&&e.jsx(d,{language:"en",style:{width:24}}),(s==null?void 0:s.exclusivity)==="pt"&&e.jsx(d,{language:"pt",style:{width:24}}),!(s!=null&&s.exclusivity)&&"None",e.jsx(k,{title:"Change exclusivity?",content:t,trigger:"click",children:e.jsx(w,{})})]})}function Y({data:s,addEntryToUpdate:l}){const a=S(s),{page:r,pagination:t}=N({data:a,resetter:"",defaultPageSize:32});return y.useEffect(()=>V(s),[s]),e.jsx(e.Fragment,{children:e.jsxs(e.Fragment,{children:[e.jsxs(c.Title,{level:2,children:["Listing - Contenders (",a.length," | ",Object.values(s??{}).length,")"]}),e.jsx(P,{pagination:t,className:"full-width",children:e.jsx(n,{gap:16,wrap:"wrap",children:r.map(i=>e.jsx(J,{contender:i,addEntryToUpdate:l},i.id))})})]})})}const Q=["random","cartoon","comics","pop-culture","movies","television"],V=s=>{const l=Object.values(m.cloneDeep(s)).reduce((r,t)=>{if(t.decks.includes("base"))return r.base.push(t),t.decks=["base"],r;if(t.exclusivity==="pt")return r;const i=t.decks.filter(o=>o!=="base");i.length>1&&console.log("Multiple decks",t.name.en,t.decks);const u=i.find(o=>Q.includes(o))||i[0];return r[u]||(r[u]=[]),t.decks=[u],r[u].push(t),r},{base:[]});Object.keys(l).forEach(r=>{console.log(r,l[r].length),console.log(l[r].map(t=>{var i;return{id:t.id,name:t.name.en,description:((i=t.description)==null?void 0:i.en)??"",deck:t.decks[0]}})),console.log("-----------------")});const a=[];Object.keys(l).forEach(r=>{a.push(...l[r].map(t=>{var i;return{id:t.id,name:t.name.en,description:((i=t.description)==null?void 0:i.en)??"",deck:t.decks[0]}}))}),console.log(a)};function q({data:s,isDirty:l,save:a,isSaving:r,entriesToUpdate:t,hasFirestoreData:i}){return e.jsxs(e.Fragment,{children:[e.jsx(f,{children:e.jsxs(n,{vertical:!0,gap:12,children:[e.jsx(_,{isDirty:l,onSave:a,isSaving:r,dirt:JSON.stringify(t)}),e.jsx(G,{data:()=>X(s),fileName:"contenders.json",disabled:l,hasNewData:i,block:!0})]})}),e.jsx(f,{children:e.jsx(L,{data:s,ignoreKeys:["description"]})}),e.jsx(f,{children:e.jsx(Z,{data:s})})]})}function X(s){console.log("Preparing file for download...");const l=m.cloneDeep(s);return Object.values(l).forEach(a=>{const r=a.exclusivity;(a.exclusivity===void 0||r==="none")&&(a.exclusivity=void 0)}),I(B(l))}function Z({data:s}){const l=y.useMemo(()=>{let a=0,r=0,t=0;const i=Object.values(s).reduce((o,p)=>((p.decks??[]).forEach((v,$,E)=>{(v==="base"||!E.includes("base"))&&(o[v]=o[v]?o[v]+1:1)}),p.exclusivity==="en"&&a++,p.exclusivity==="pt"&&r++,p.exclusivity||t++,o),{}),u=Object.keys(i).filter(o=>!h.some(p=>p.value===o));return{deckCounts:i,invalidDecks:u,englishExclusivity:a,portugueseExclusivity:r,bothExclusivity:t}},[s]);return e.jsxs(n,{vertical:!0,gap:8,children:[e.jsx(c.Text,{strong:!0,children:"Deck Counts"}),e.jsx(n,{vertical:!0,gap:8,style:{maxHeight:"300px",overflowY:"auto"},children:h.map(a=>e.jsxs(c.Text,{children:[a.label,": ",l.deckCounts[a.value]??0]},a.value))}),e.jsx(b,{className:"my-2"}),e.jsx(c.Text,{strong:!0,children:"Invalid Decks"}),e.jsx(n,{vertical:!0,gap:8,style:{maxHeight:"300px",overflowY:"auto"},children:l.invalidDecks.map(a=>e.jsx(c.Text,{children:a},a))}),e.jsx(b,{className:"my-2"}),e.jsx(c.Text,{strong:!0,children:"Exclusivity"}),e.jsxs(n,{vertical:!0,gap:8,children:[e.jsxs(c.Text,{children:["English: ",l.englishExclusivity]}),e.jsxs(c.Text,{children:["Portuguese: ",l.portugueseExclusivity]}),e.jsxs(c.Text,{children:["Both: ",l.bothExclusivity]})]})]})}function _e(){const s=H({tdrResourceName:"contenders",firebaseDataCollectionName:"contenders",serialize:!0});return e.jsx(F,{title:"Contenders",subtitle:"Characters, Celebrities, Personalities",children:e.jsxs(C,{hasSider:!0,children:[e.jsx(z,{children:e.jsx(q,{...s})}),e.jsx(C.Content,{className:"content",children:e.jsx(A,{isLoading:s.isLoading,error:s.error,hasResponseData:!m.isEmpty(s.data),children:e.jsx(Y,{...s})})})]})})}export{_e as Contenders,_e as default};
