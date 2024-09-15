"use strict";(self.webpackChunktd_admin=self.webpackChunktd_admin||[]).push([[8724],{6989:(e,n,s)=>{s.r(n),s.d(n,{default:()=>ae});var i=s(3990),t=s(1046),l=s(2128),a=s(4031),d=s(6106),c=s(914),r=s(3105),o=s(1105),m=s(7765),u=s(4520),h=s(5225),p=s(5922),x=s(9228),j=s(2556),g=s(1310),v=s(2997),f=s(4766),k=s(8938),y=s(763),Z=s(2791),w=s(184);const b=(0,Z.createContext)({items:{},isLoading:!0,error:null,hasResponseData:!1,decksDict:{},decks:[],listing:[],isDirty:!1,addItemToUpdate:()=>{},itemsToUpdate:{},isSaving:!1,save:()=>{},newId:"-1"}),N=e=>{var n;let{children:s}=e;const{queryParams:i}=(0,f.K)(),{data:t,isLoading:l,error:a,isSaving:d,save:c,addEntryToUpdate:r,entriesToUpdate:o,isDirty:m}=(0,k.i)({tdrResourceName:"items",firebaseDataCollectionName:"items"}),{decksDict:u,decks:h}=(0,Z.useMemo)((()=>{console.log("Recomputing item decks typeahead...");const e={},n={},s={},i=[];Object.values(t).forEach((t=>{var l;const a="".concat(t.name.en," (").concat(t.id,")"),d="".concat(t.name.pt," (").concat(t.id,")");n[t.name.en]?i.push(["".concat(t.name.en," (").concat(n[t.name.en],")"),a]):n[t.name.en]=t.id,s[t.name.pt]?i.push(["".concat(t.name.pt," (").concat(s[t.name.pt],")"),d]):s[t.name.pt]=t.id,null===t||void 0===t||null===(l=t.decks)||void 0===l||l.forEach((n=>{e[n]=n}))}));const l=(0,y.orderBy)(Object.keys(e)).map((e=>({value:e})));return i.length>0&&console.warn("Possible duplicated items",i),{decksDict:e,decks:l}}),[t,d,l]),p=null!==(n=i.get("deck"))&&void 0!==n?n:"all",x=(0,Z.useMemo)((()=>{const e=(0,y.orderBy)(Object.values(t),[e=>Number(e.id)],"asc");switch(p){case"all":return e;case"!all":return e.filter((e=>{var n,s;return null===(n=!(null!==e&&void 0!==e&&null!==(s=e.decks)&&void 0!==s&&s.length))||void 0===n||n}));case"nsfw":return e.filter((e=>e.nsfw));case"!nsfw":return e.filter((e=>!e.nsfw));default:return p.startsWith("!")?e.filter((e=>{var n;return!(null!==e&&void 0!==e&&null!==(n=e.decks)&&void 0!==n&&n.includes(p.slice(1)))})):e.filter((e=>{var n;return null===e||void 0===e||null===(n=e.decks)||void 0===n?void 0:n.includes(p)}))}}),[t,p]),j=(0,Z.useMemo)((()=>{var e;const n=(0,y.orderBy)(Object.keys(o),[e=>Number(e)],"asc"),s=null===(e=x[x.length-1])||void 0===e?void 0:e.id,i=(0,y.orderBy)([...n,s],[e=>Number(e)],"desc")[0];return String(Number(i)+1)}),[x,o]);return(0,w.jsx)(b.Provider,{value:{items:t,listing:x,isLoading:l,error:a,decksDict:u,decks:h,hasResponseData:x.length>0,isDirty:m,addItemToUpdate:r,isSaving:d,save:c,itemsToUpdate:o,newId:j},children:s})},C=()=>(0,Z.useContext)(b);var S=s(7134);var D=s(3834),T=s(4483),O=s(7747),z=s(8955),P=s(6324),I=s(2675);function E(e){let{item:n,editMode:s=!1,simplified:i}=e;const{decks:l}=C(),{isEditing:d,toggleEditMode:c,onEdit:x,isDirty:j,onModify:k,onReset:b,editableItem:N}=function(e){var n;let s=arguments.length>1&&void 0!==arguments[1]&&arguments[1];const{addItemToUpdate:i,itemsToUpdate:t}=C(),[l,a]=(0,Z.useState)(s),[d,c]=(0,Z.useState)((0,y.cloneDeep)(e)),r=null!==(n=t[e.id])&&void 0!==n?n:e,o=e=>{const n={...(0,y.cloneDeep)(d),...e};Object.keys(e).includes("nsfw")&&!1===e.nsfw&&delete n.nsfw,c(n)},m=async()=>{i(d.id,d)},u=()=>{c((0,y.cloneDeep)(e)),a(!1)},h=JSON.stringify(r)!==JSON.stringify(d);return{isEditing:l,toggleEditMode:()=>a((e=>!e)),editableItem:d,onEdit:o,isDirty:h,onModify:m,onReset:u}}(n,s),P=(0,S._)(),{is:I}=(0,f.K)();return(0,w.jsxs)(r.Z,{title:(0,w.jsx)(a.Z.Text,{onClick:()=>P(n.id),children:n.id}),extra:(0,w.jsx)(M,{item:n}),style:{maxWidth:250},size:i?"small":"default",actions:i?void 0:j?[(0,w.jsx)(D.Z,{onClick:b},"reset"),(0,w.jsx)(T.Z,{onClick:k},"save")]:[(0,w.jsx)(O.Z,{onClick:c},"edit")],children:[(0,w.jsx)(v.ck,{id:n.id,width:i?75:125,title:"".concat(n.name.en," | ").concat(n.name.pt)}),(0,w.jsxs)(t.Z,{size:"small",direction:"vertical",className:"my-4",children:[(0,w.jsx)(o.Z,{prefix:(0,w.jsx)(g.H,{language:"en",width:"1em"}),placeholder:"Name in EN",variant:d?"outlined":"borderless",size:"small",defaultValue:n.name.en,readOnly:!d,onChange:e=>x({name:{...N.name,en:e.target.value}})},"en-".concat(n.name.en)),(0,w.jsx)(o.Z,{prefix:(0,w.jsx)(g.H,{language:"pt",width:"1em"}),placeholder:"Name in PT",variant:d?"outlined":"borderless",size:"small",defaultValue:n.name.pt,readOnly:!d,onChange:e=>x({name:{...N.name,pt:e.target.value}})},"pt-".concat(n.name.pt)),!i&&(0,w.jsxs)(w.Fragment,{children:[!I("simplified")&&(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)("div",{children:(0,w.jsx)(m.Z,{mode:"multiple",style:{width:"100%"},placeholder:"Select a deck",defaultValue:n.decks,disabled:!d,options:l,variant:d?"outlined":"borderless",size:"small",onChange:e=>x({decks:e.sort()})},String(n.decks))}),(0,w.jsxs)(u.Z,{gap:6,children:[(0,w.jsx)(g.H,{language:"en",width:"1em"}),(0,w.jsx)(m.Z,{mode:"tags",style:{width:"100%"},placeholder:"Other names EN",defaultValue:n.aliasesEn,options:[],size:"small",onChange:e=>x({aliasesEn:e.sort()})})]}),(0,w.jsxs)(u.Z,{gap:6,children:[(0,w.jsx)(g.H,{language:"pt",width:"1em"}),(0,w.jsx)(m.Z,{mode:"tags",style:{width:"100%"},placeholder:"Other names PT",defaultValue:n.aliasesPt,options:[],size:"small",onChange:e=>x({aliasesPt:e.sort()})})]})]}),I("showVerifyThing")&&(0,w.jsx)("div",{children:(0,w.jsx)(R,{item:n})}),(d||n.nsfw)&&(0,w.jsx)("div",{children:(0,w.jsx)(h.Z.Item,{label:"nsfw",valuePropName:"checked",children:(0,w.jsx)(p.Z,{checked:n.nsfw,onChange:e=>x({nsfw:e}),size:"small",checkedChildren:(0,w.jsx)(z.Z,{style:{color:"hotpink"}}),disabled:!d})})})]})]})]})}const _=(0,y.memoize)((e=>{var n,s;const i=!(null===(n=e.decks)||void 0===n||!n.includes("thing")),t=!(null===(s=e.decks)||void 0===s||!s.includes("manufactured")),l=1===e.name.en.split(" ").length,a=1===e.name.pt.split(" ").length,d={en:i||l&&t,pt:i||a&&t};return d.pt||d.en?(0,w.jsxs)(w.Fragment,{children:[d.en&&(0,w.jsx)(g.H,{language:"en",width:"1em"}),d.pt&&(0,w.jsx)(g.H,{language:"pt",width:"1em"})]}):""})),R=e=>{let{item:n}=e;const s=_(n);return s?(0,w.jsxs)(u.Z,{gap:6,children:["Thing: ",s]}):(0,w.jsx)(w.Fragment,{})};function M(e){let{item:n}=e;const[s,i]=(0,I.Z)(!1),l=(0,S._)();return(0,w.jsx)(x.Z,{content:(0,w.jsxs)(t.Z,{direction:"vertical",children:[(0,w.jsx)(j.ZP,{size:"small",onClick:()=>l(JSON.stringify(n,null,2)),children:"Complete Item"}),(0,w.jsx)(j.ZP,{size:"small",onClick:()=>l(n.name.en),children:"EN Name"}),(0,w.jsx)(j.ZP,{size:"small",onClick:()=>l(n.name.pt),children:"PT Name"}),(0,w.jsx)(j.ZP,{size:"small",onClick:()=>l(JSON.stringify((e=>({id:e.id,type:"item",header:{title:{en:"Item",pt:"Item"},iconId:"2077"},metadata:{level:"basic",keyword:(0,y.snakeCase)(e.name.en).toUpperCase()},content:{itemId:e.id,caption:e.name}}))(n),null,2)),children:"Escape Room Item"})]}),title:"Copy",trigger:"click",open:s,onOpenChange:i,children:(0,w.jsx)(j.ZP,{type:"text",icon:(0,w.jsx)(P.Z,{})})})}var U=s(4290),F=s(2228);function V(){var e;const{queryParams:n}=(0,f.K)(),s=null!==(e=n.get("type"))&&void 0!==e?e:"all",{listing:i}=C(),{page:t,pagination:l}=(0,U.e)({data:i,resetter:s}),{is:r}=(0,f.K)(),o=r("simplified"),m=o?{xs:24,sm:12,md:8,lg:4,xl:3}:{xs:24,sm:24,md:12,lg:6,xl:4};return(0,w.jsxs)(w.Fragment,{children:[(0,w.jsxs)(a.Z.Title,{level:2,children:["Listing - ",(0,y.capitalize)(s)," items (",i.length,")"]}),(0,w.jsx)(F.N,{pagination:l,className:"full-width",children:(0,w.jsx)(d.Z,{gutter:[16,16],className:"my-4",children:t.map((e=>(0,w.jsx)(c.Z,{...m,children:(0,w.jsx)(E,{item:e,simplified:o})},e.id)))})})]})}var J=s(7128),L=s(6173),B=s(7018),H=s(1958),K=s(959);const W={id:"",name:{en:"",pt:""},groups:[]};function q(e){let{isModalOpen:n,handleOk:s,handleCancel:i,newId:t}=e;const[l]=(0,Z.useState)((0,y.cloneDeep)({...W,id:t}));return(0,w.jsx)(K.Z,{title:"Add new item",open:n,onOk:s,onCancel:i,children:(0,w.jsx)(E,{item:l,editMode:!0})})}function A(){const[e,n]=(0,Z.useState)(!1),{newId:s}=C();return(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(j.ZP,{block:!0,onClick:()=>{n(!0)},children:"Add New Item"}),e&&(0,w.jsx)(q,{isModalOpen:e,handleOk:()=>{n(!1)},handleCancel:()=>{n(!1)},newId:s},s)]})}var G=s(5850),Q=s(7340);function X(){var e;const{isDirty:n,save:s,items:i,decks:t,itemsToUpdate:l,isSaving:d}=C(),{queryParams:c,is:r,addParam:o}=(0,f.K)(),m=(0,Z.useMemo)((()=>{const e=(0,y.orderBy)(t.map((e=>{let{value:n}=e;return{label:(0,y.capitalize)(n),value:n}})),"label"),n=e.map((e=>{let{label:n,value:s}=e;return{label:"NOT ".concat(n),value:"!".concat(s)}}));return[...e,...n]}),[t]);return(0,w.jsxs)(H.Pd,{children:[(0,w.jsxs)(u.Z,{vertical:!0,gap:6,children:[(0,w.jsx)(Q.k,{isDirty:n,dirt:JSON.stringify(l),onSave:s,isSaving:d}),(0,w.jsx)(B.o,{data:()=>function(e){return(0,G.Tj)(Object.values(e).reduce(((e,n)=>{var s;return n.decks=(null!==(s=null===n||void 0===n?void 0:n.decks)&&void 0!==s?s:[]).sort(),0===n.decks.length?(delete n.decks,e[n.id]=n,e):(n.decks.includes("thing")&&1===n.name.en.split(" ").length&&1===n.name.pt.split(" ").length&&((n.decks.includes("evidence")||n.decks.includes("dream")||n.decks.includes("alien")||n.decks.includes("manufactured"))&&(n.decks=n.decks.filter((e=>"thing"!==e))),e[n.id]=n),e[n.id]=n,e)}),{}))}(i),fileName:"items.json",disabled:n,block:!0})]}),(0,w.jsx)(J.Z,{className:"my-4"}),(0,w.jsx)(a.Z.Text,{type:"secondary",children:"Tools"}),(0,w.jsx)(L.Do,{label:"Show Search",value:!r("hideSearch"),onChange:e=>o("hideSearch",e?"":"true",""),className:"full-width m-0"}),(0,w.jsx)(L.Do,{label:"Show Randomizer",value:r("showRandomizer"),onChange:e=>o("showRandomizer",e?"true":"",""),className:"full-width m-0"}),(0,w.jsx)(a.Z.Text,{type:"secondary",children:"Display"}),(0,w.jsx)(L.Do,{label:"Simplified UI",value:r("simplified"),onChange:e=>o("simplified",e?"true":""),className:"full-width m-0"}),(0,w.jsx)(L.Do,{label:"Thing Verifier",value:r("showVerifyThing"),onChange:e=>o("showVerifyThing",e?"true":""),className:"full-width m-0",disabled:r("simplified")}),(0,w.jsx)(L.Do,{label:"Other Names",value:r("showOtherNames"),onChange:e=>o("showOtherNames",e?"true":""),className:"full-width m-0",disabled:!0}),(0,w.jsx)(J.Z,{className:"my-4"}),(0,w.jsx)(L.zE,{label:"Deck",value:null!==(e=c.get("deck"))&&void 0!==e?e:"all",onChange:e=>o("deck",e,"all"),options:[{label:"All",value:"all"},{label:"NSFW",value:"nsfw"},{label:"SFW",value:"!nsfw"},...m,{label:"No decks",value:"!all"}]}),(0,w.jsx)(J.Z,{className:"my-4"}),(0,w.jsx)(A,{})]})}var Y=s(2326),$=s(1583),ee=s(5657);function ne(){const{listing:e}=C(),[n,s]=(0,Z.useState)([]),i=(0,S._)(),[l,d]=(0,Z.useState)(5);return(0,w.jsxs)("div",{children:[(0,w.jsxs)(a.Z.Title,{level:2,children:["Randomized Sample"," ",(0,w.jsx)(j.ZP,{size:"small",icon:(0,w.jsx)(ee.Z,{}),onClick:()=>{const n=(0,y.chunk)((0,y.sampleSize)(e,15*l),l).map((e=>e.filter((e=>!e.nsfw)))).map((e=>e.map((e=>e.name.en)).join(", "))).map(((e,n)=>"".concat(n+1,") ").concat(e))).join("\n");i(n)},children:"MJ"})]}),(0,w.jsxs)(u.Z,{gap:12,children:[(0,w.jsx)(h.Z.Item,{label:"Quantity"}),(0,w.jsx)("div",{children:(0,w.jsx)(Y.Z,{min:3,max:15,value:l,onChange:e=>d(Number(e)),style:{minWidth:"100px"}})}),(0,w.jsx)(j.ZP,{onClick:()=>{s((0,y.sampleSize)(e,l))},type:"primary",children:"Get Sample"}),(0,w.jsx)($.Z.Button,{menu:{items:[{label:"Copy IDs",key:"copy_ids"},{label:"Copy Names EN",key:"copy_names_en"},{label:"Copy Names PT",key:"copy_names_pt"}],onClick:e=>{let{key:s}=e;if("copy_ids"!==s)if("copy_names_en"!==s)if("copy_names_pt"!==s);else{const e=n.map((e=>e.name.pt)).join(", ");i(e)}else{const e=n.map((e=>e.name.en)).join(", ");i(e)}else{const e=n.map((e=>e.id));i(JSON.stringify(e))}}},disabled:0===n.length,onClick:()=>i(JSON.stringify(n,null,2)),icon:(0,w.jsx)(ee.Z,{}),children:"Copy"})]}),(0,w.jsx)(t.Z,{wrap:!0,className:"my-4",children:n.map((e=>(0,w.jsx)(E,{item:e,simplified:!0},e.id)))}),(0,w.jsx)(J.Z,{})]})}var se=s(8178);function ie(){const{items:e,isLoading:n,isSaving:s}=C(),[i,l]=(0,Z.useState)(null);return(0,w.jsxs)(Z.Fragment,{children:[(0,w.jsx)(a.Z.Title,{level:2,children:"Search for an item"}),(0,w.jsx)("div",{children:(0,w.jsx)(se.i,{items:e,isPending:n||s,onFinish:n=>l(e[n])})}),Boolean(i)&&(0,w.jsx)(t.Z,{direction:"vertical",className:"my-4",children:(0,w.jsx)(E,{item:i})},null===i||void 0===i?void 0:i.id),(0,w.jsx)(J.Z,{})]},"item-search-".concat(n))}var te=s(4562);function le(){const{isLoading:e,error:n,hasResponseData:s}=C(),{is:a}=(0,f.K)();return(0,w.jsx)(H.Xg,{title:"Items",subtitle:"Listing",children:(0,w.jsxs)(i.Z,{hasSider:!0,children:[(0,w.jsx)(te.p,{children:(0,w.jsx)(X,{})}),(0,w.jsx)(i.Z.Content,{className:"content",children:(0,w.jsxs)(l.T,{isLoading:e,error:n,hasResponseData:s,children:[!e&&(0,w.jsxs)(t.Z,{size:"large",children:[!a("hideSearch")&&(0,w.jsx)(ie,{}),a("showRandomizer")&&(0,w.jsx)(ne,{})]}),(0,w.jsx)(V,{})]})})]})})}const ae=function(){return(0,w.jsx)(N,{children:(0,w.jsx)(le,{})})}}}]);
//# sourceMappingURL=Items.69d1d57e.chunk.js.map