"use strict";(self.webpackChunktd_admin=self.webpackChunktd_admin||[]).push([[1187],{2228:(e,t,s)=>{s.d(t,{N:()=>l});var i=s(1413),a=s(4925),n=s(2658),r=s(1046),o=s(184);const d=["children","pagination"];function l(e){let{children:t,pagination:s}=e,l=(0,a.Z)(e,d);const c=(0,o.jsx)(n.Z,(0,i.Z)((0,i.Z)({showQuickJumper:!0},s),{},{className:"fixed-pagination"}));return(0,o.jsxs)(r.Z,(0,i.Z)((0,i.Z)({direction:"vertical"},l),{},{children:[c,t,c]}))}},4850:(e,t,s)=>{s.d(t,{A:()=>o});var i=s(1046),a=s(9475),n=s(7134),r=s(184);function o(e){let{ids:t}=e;const s=(0,n._)();return(0,r.jsx)(i.Z,{direction:"vertical",size:"small",children:(0,r.jsx)(a.ZP,{size:"small",onClick:()=>s(JSON.stringify(t)),children:"Copy Ids"})})}},8158:(e,t,s)=>{s.d(t,{CQ:()=>g,bN:()=>m,cw:()=>x,hW:()=>h,xL:()=>p});var i=s(7515),a=s(9475),n=s(1310),r=s(2997),o=s(8955),d=s(5458),l=s(7134),c=s(1087),u=s(184);function p(e){let{item:t,width:s,className:i}=e;return(0,u.jsx)(r.ck,{id:t.id,width:s,title:"".concat(t.name.en," | ").concat(t.name.pt),className:i})}function m(e){let{item:t}=e;const s=(0,l._)();return(0,u.jsx)("span",{children:(0,u.jsx)(i.Z,{prefix:t.nsfw?(0,u.jsx)(o.Z,{style:{color:"hotPink"}}):(0,u.jsx)(d.Z,{}),placeholder:"Id",variant:"borderless",size:"small",value:t.id,readOnly:!0,style:{width:"8ch"},onClick:()=>s(t.id)})})}function g(e){let{item:t,language:s}=e;return(0,u.jsx)(i.Z,{prefix:(0,u.jsx)(n.H,{language:s,width:"1em"}),placeholder:"Name in ".concat(s.toUpperCase()),variant:"borderless",size:"small",value:t.name[s],readOnly:!0})}function h(e){let{item:t}=e;return t.nsfw?(0,u.jsx)(o.Z,{style:{color:"hotpink"}}):(0,u.jsx)(u.Fragment,{})}function x(e){let{item:t}=e;const[,s]=(0,c.lr)();return(0,u.jsx)("span",{children:(0,u.jsx)(a.ZP,{size:"small",shape:"round",onClick:()=>{s({itemId:t.id,view:"classifier"})},children:"Go to"})})}},4290:(e,t,s)=>{s.d(t,{e:()=>r});var i=s(2791),a=s(4421),n=s(4766);function r(e){var t,s;let{prefix:r="",data:o,defaultCurrent:d=1,defaultPageSize:l=64,pageSizeOptions:c=[16,32,64,128],resetter:u}=e;const{queryParams:p,addParam:m}=(0,n.K)(),g=Number(null!==(t=p.get("".concat(r,"page")))&&void 0!==t?t:String(d)),h=Number(null!==(s=p.get("".concat(r,"pageSize")))&&void 0!==s?s:String(l)),x=(0,a.Z)(u),j=(0,i.useMemo)((()=>{const e=(g-1)*h,t=e+h;return o.slice(e,t)}),[g,h,o]),y=e=>{m("".concat(r,"page"),e.toString(),String(d))};return u!==x&&y(d),{page:j,pagination:{current:g,pageSize:h,onChange:y,onShowSizeChange:(e,t)=>{m("".concat(r,"pageSize"),t.toString(),String(l))},defaultCurrent:d,defaultPageSize:l,pageSizeOptions:c,total:o.length,hideOnSinglePage:!0}}}},8938:(e,t,s)=>{s.d(t,{i:()=>p});var i=s(1413),a=s(4747),n=s(763),r=s(2791),o=s(3713),d=s(5850),l=s(8027),c=s(5529),u=s(2233);function p(e){let{tdrResourceName:t,firebaseDataCollectionName:s,serialize:p}=e;const{notification:m}=a.Z.useApp(),g=(0,o.NL)(),h=(0,c.N)(t),x=(0,l.X)("tdr",s,{select:p?d.d_:void 0}),[j,y]=(0,r.useState)({}),f=(0,u.B)("tdr",s,{onSuccess:()=>{m.success({message:"".concat(s," updated")}),g.refetchQueries({queryKey:["firebase","tdr",s]}),y({})},onError:e=>{m.error({message:"".concat(s," update failed"),description:e.message})}}),v=(0,r.useMemo)((()=>{var e,a;return h.isSuccess&&x.isSuccess&&!f.isPending?(console.log("%cMerging ".concat(t,"+").concat(s," data..."),"color: #f0f"),(0,n.cloneDeep)((0,i.Z)((0,i.Z)((0,i.Z)({},null!==(e=h.data)&&void 0!==e?e:{}),null!==(a=x.data)&&void 0!==a?a:{}),j))):{}}),[t,s,h.data,x.data,h.isSuccess,x.isSuccess,f.isPending,j]),S=!(0,n.isEmpty)(j),I=x.data;return{data:v,isLoading:h.isLoading||x.isLoading,error:h.error||x.error,firebaseData:I,isSaving:f.isPending,save:()=>{f.mutate(p?(0,d.aS)(j):j)},addEntryToUpdate:(e,t)=>{y((s=>(0,i.Z)((0,i.Z)({},s),{},{[e]:t})))},entriesToUpdate:j,isDirty:S}}},548:(e,t,s)=>{s.d(t,{P:()=>a});var i=s(4766);function a(e){var t,s;let{prefix:a="",defaultCurrent:n=1,defaultPageSize:r=10,pageSizeOptions:o=[10,20,50,100],total:d,showQuickJumper:l}=e;const{queryParams:c,addParam:u}=(0,i.K)();return{current:Number(null!==(t=c.get("".concat(a,"page")))&&void 0!==t?t:String(n)),pageSize:Number(null!==(s=c.get("".concat(a,"pageSize")))&&void 0!==s?s:String(r)),onChange:e=>{u("".concat(a,"page"),e.toString(),String(n))},onShowSizeChange:(e,t)=>{u("".concat(a,"pageSize"),t.toString(),String(r))},defaultCurrent:n,defaultPageSize:r,pageSizeOptions:o,total:d,hideOnSinglePage:!0,showQuickJumper:l}}},8440:(e,t,s)=>{s.r(t),s.d(t,{ItemsGroups:()=>J,default:()=>q});var i=s(1413),a=s(1790),n=s(2128),r=s(4520),o=s(6178),d=s(2786),l=s(3320),c=s(6106),u=s(914),p=s(2228),m=s(2997),g=s(7134),h=s(4290),x=s(4766),j=s(5529),y=s(763),f=s(2791),v=s(5850),S=s(8357),I=s(548),Z=s(4850),b=s(8178),C=s(6473),N=s(1046),k=s(906),w=s(8158),z=s(184);function G(e){let{item:t,itemGroups:s,groupsTypeahead:i,onUpdateItemGroups:a}=e;const n=(0,g._)();return(0,z.jsxs)(C.Z,{title:(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(o.Z.Text,{onClick:()=>n(t.id),children:t.id}),(0,z.jsx)(w.hW,{item:t})]}),style:{maxWidth:250},children:[(0,z.jsx)(w.xL,{item:t,width:75}),(0,z.jsxs)(N.Z,{size:"small",direction:"vertical",className:"my-4",children:[(0,z.jsx)(w.CQ,{item:t,language:"en"}),(0,z.jsx)(w.CQ,{item:t,language:"pt"}),(0,z.jsx)(k.Z,{mode:"tags",style:{width:"100%"},placeholder:"Select a group",defaultValue:s,options:i,showSearch:!0,size:"small",onChange:e=>a(t.id,e)},String(s))]})]})}function P(e){let{data:t,addEntryToUpdate:s}=e;const{is:i,queryParams:a}=(0,x.K)(),n=(0,j.N)("items"),r=(0,f.useMemo)((()=>Object.values(null!==t&&void 0!==t?t:[]).reduce(((e,t)=>(t.itemsIds||console.warn("Group without items",t),t.itemsIds.forEach((s=>{e[s]||(e[s]=[]),e[s].push(t.id)})),e)),{})),[t]),o=(0,f.useMemo)((()=>(0,y.orderBy)(Object.keys(t).map((e=>({label:e,value:e}))),"label")),[t]),d=(e,i)=>{var a;const n=null!==(a=r[e])&&void 0!==a?a:[],o=i.filter((e=>!n.includes(e))),d=n.filter((e=>!i.includes(e)));o.forEach((i=>{var a,n;s(i,{id:i,itemsIds:(0,v.R1)([...null!==(a=null===(n=t[i])||void 0===n?void 0:n.itemsIds)&&void 0!==a?a:[],e])})})),d.forEach((i=>{var a;s(i,{id:i,itemsIds:(0,v.R1)(null===(a=t[i])||void 0===a?void 0:a.itemsIds.filter((t=>t!==e)))})}))},l=(e,t)=>{s(e,{id:e,itemsIds:(0,v.R1)(t)})};return(0,z.jsxs)(z.Fragment,{children:[(i("display","group")||!a.has("display"))&&(0,z.jsx)(O,{data:t,items:n.data,grousByItem:r,groupsTypeahead:o,onUpdateItemGroups:d,onUpdateGroupItems:l}),i("display","item")&&(0,z.jsx)(T,{data:t,items:n.data,grousByItem:r,groupsTypeahead:o,onUpdateItemGroups:d,onUpdateGroupItems:l})]})}function O(e){let{data:t,items:s,grousByItem:i,groupsTypeahead:a,onUpdateItemGroups:n,onUpdateGroupItems:c}=e;const u=(0,g._)(),p=(0,j.N)("items"),[h,x]=(0,f.useState)(null),y=(0,I.P)({showQuickJumper:!0,total:Object.keys(t).length}),b=[{title:"id",dataIndex:"id",key:"id",render:e=>(0,z.jsx)("span",{children:e})},{title:"Items",dataIndex:"itemsIds",key:"itemsIds",render:(e,t)=>(0,z.jsx)(r.Z,{gap:6,wrap:"wrap",children:e.map((e=>(0,z.jsxs)(r.Z,{gap:2,vertical:!0,children:[(0,z.jsx)(S.F6,{onClick:()=>x(e),children:(0,z.jsx)(m.ck,{id:e,width:60})}),(0,z.jsx)(r.Z,{justify:"center",children:(0,z.jsx)(o.Z.Text,{onClick:()=>u(e),children:e})})]},"".concat(t.id,"-").concat(e))))},"items-".concat(t.id))},d.Z.EXPAND_COLUMN,{title:"Count",dataIndex:"itemsIds",key:"count",render:e=>(0,v.R1)(e).filter(Boolean).length},{title:"Actions",dataIndex:"itemsIds",key:"actions",render:e=>(0,z.jsx)(Z.A,{ids:e})}],C=h?s[h]:null;return(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(d.Z,{columns:b,dataSource:Object.values(t),className:"my-4",rowKey:"id",pagination:y,expandable:{expandedRowRender:e=>(0,z.jsx)(U,{group:e,onUpdateGroupItems:c}),rowExpandable:()=>p.isSuccess}}),(0,z.jsx)(l.Z,{title:"Edit Item Group",onClose:()=>x(null),open:!!C,children:C&&(0,z.jsx)(G,{item:C,itemGroups:i[C.id],groupsTypeahead:a,onUpdateItemGroups:n})})]})}function U(e){let{group:t,onUpdateGroupItems:s}=e;return(0,z.jsx)("div",{children:(0,z.jsx)(b.i,{onFinish:e=>{s(t.id,[...t.itemsIds,e])}})})}function T(e){let{items:t,grousByItem:s,groupsTypeahead:i,onUpdateItemGroups:a}=e;const{is:n}=(0,x.K)(),r=n("emptyOnly"),d=(0,f.useMemo)((()=>r?Object.values(t).filter((e=>!s[e.id])):Object.values(t)),[t,s,r]),{page:l,pagination:m}=(0,h.e)({data:d});return(0,z.jsxs)(z.Fragment,{children:[(0,z.jsxs)(o.Z.Title,{level:2,children:["Groups by Items (",d.length,")"]}),(0,z.jsx)(p.N,{pagination:m,children:(0,z.jsx)(c.Z,{gutter:[16,16],className:"my-4",children:l.map((e=>(0,z.jsx)(u.Z,{xs:24,sm:24,md:12,lg:6,xl:4,children:(0,z.jsx)(G,{item:e,itemGroups:s[e.id],groupsTypeahead:i,onUpdateItemGroups:a})},e.id)))})})]})}var E=s(7128),D=s(7018),B=s(7965),L=s(3660),R=s(9197),Q=s(7340);function _(e){var t;let{data:s,save:i,isDirty:a,isSaving:n,entriesToUpdate:o}=e;const{queryParams:d,addParam:l,addParams:c,is:u}=(0,x.K)();return(0,z.jsxs)(B.Pd,{children:[(0,z.jsxs)(r.Z,{vertical:!0,gap:12,children:[(0,z.jsx)(Q.k,{isDirty:a,onSave:i,isSaving:n,dirt:JSON.stringify(F(o))}),(0,z.jsx)(D.o,{data:()=>{return e=s,Object.keys(e).forEach((t=>{e[t].itemsIds=(0,v.E4)((0,v.R1)(e[t].itemsIds))})),(0,v.Tj)(F(e));var e},fileName:"items-groups.json",disabled:a,block:!0})]}),(0,z.jsx)(E.Z,{}),(0,z.jsx)(S.H,{label:"Display",value:null!==(t=d.get("display"))&&void 0!==t?t:"group",onChange:e=>c({display:e,page:1},{page:1}),options:[{title:"By Groups",icon:(0,z.jsx)(L.Z,{}),value:"group"},{title:"By Items",icon:(0,z.jsx)(R.Z,{}),value:"item"}]}),u("display","item")&&(0,z.jsx)(S.Do,{label:"No Groups Only",value:u("emptyOnly"),onChange:e=>l("emptyOnly",e,!1)})]})}function F(e){return(0,y.omitBy)((0,y.cloneDeep)(e),(e=>(0,y.isEmpty)(e.itemsIds)))}var K=s(4562),M=s(8938);function J(){const e=(0,M.i)({tdrResourceName:"items-groups",firebaseDataCollectionName:"itemsGroups",serialize:!0}),t=(0,j.N)("items");return(0,z.jsx)(B.Xg,{title:"Items",subtitle:"Groups Sets",children:(0,z.jsxs)(a.Z,{hasSider:!0,children:[(0,z.jsx)(K.p,{children:(0,z.jsx)(_,(0,i.Z)({},e))}),(0,z.jsx)(a.Z.Content,{className:"content",children:(0,z.jsx)(n.T,{isLoading:e.isLoading||t.isLoading,error:e.error||t.error,hasResponseData:!(0,y.isEmpty)(e.data)&&!(0,y.isEmpty)(t.data),children:(0,z.jsx)(P,(0,i.Z)({},e))})})]})})}const q=J}}]);
//# sourceMappingURL=ItemsGroups.46e28047.chunk.js.map