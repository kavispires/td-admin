"use strict";(self.webpackChunktd_admin=self.webpackChunktd_admin||[]).push([[7250],{7340:(e,t,n)=>{n.d(t,{k:()=>u});var a=n(2556),r=n(2426),i=n.n(r),o=n(2791),s=n(8211),l=n(4483),d=n(4841),c=n(184);function u(e){let{isDirty:t,onSave:n,isSaving:r,dirt:u,interval:v=6e5,...m}=e;const{togglePendingSave:p}=(0,d.b)(),[,h,g]=(0,s.Z)((()=>{t&&n()}),v);return(0,o.useEffect)((()=>{t?(p(!0),console.log("Save Reset",i()(Date.now()).format("MM/DD/YYYY HH:mm:ss")),g()):(p(!1),h())}),[t,g,h,u]),(0,o.useEffect)((()=>{const e=e=>{if(t){const t="You have unsaved changes, are you sure you want to leave?";return e.returnValue=t,t}};return window.addEventListener("beforeunload",e),()=>{window.removeEventListener("beforeunload",e)}}),[t]),(0,c.jsx)(a.ZP,{type:"primary",size:"large",icon:(0,c.jsx)(l.Z,{}),onClick:n,disabled:!t,loading:r,danger:!0,block:!0,...m,children:"Save"})}},8866:(e,t,n)=>{n.d(t,{N:()=>i});var a=n(8252),r=n(184);function i(e){let{children:t,level:n,...i}=e;return(0,r.jsx)(a.Z.Title,{level:null!==n&&void 0!==n?n:3,...i,children:t})}},3166:(e,t,n)=>{n.d(t,{tj:()=>g,xh:()=>p,H:()=>f,zE:()=>m,Do:()=>h,Th:()=>b,F6:()=>i});n(8866);var a=n(3733),r=n(184);const i=e=>{let{children:t,active:n=!1,activeClass:i="",className:o="",hoverType:s="scale",...l}=e;return(0,r.jsx)("button",{className:(0,a.Z)("transparent-button","transparent-button--".concat(s),n&&(i||"transparent-button--active"),o),...l,children:t})};var o=n(5225),s=n(5437),l=n(4003),d=n(5922),c=n(9862),u=n(4248),v=n(1431);function m(e){let{label:t,value:n,onChange:a,options:i,placeholder:l}=e;return(0,r.jsx)(o.Z.Item,{label:t,children:(0,r.jsxs)(s.Z,{style:{minWidth:"150px"},onChange:a,value:n,children:[l&&(0,r.jsx)(s.Z.Option,{value:"",disabled:!0,children:"placeholder"}),i.map((e=>"object"===typeof e?(0,r.jsx)(s.Z.Option,{value:e.value,children:e.label},"".concat(t,"-").concat(e.value)):(0,r.jsx)(s.Z.Option,{value:e,children:e},"".concat(t,"-").concat(e))))]})})}function p(e){let{label:t,value:n,onChange:a,min:i=0,max:s=100,step:d}=e;return(0,r.jsx)(o.Z.Item,{label:t,children:(0,r.jsx)(l.Z,{min:i,max:s,value:n,onChange:e=>a(null!==e&&void 0!==e?e:s),style:{minWidth:"150px",width:"100%"},step:d})})}function h(e){let{label:t,value:n,onChange:a,className:i,disabled:s}=e;return(0,r.jsx)(o.Z.Item,{label:t,valuePropName:"checked",className:i,children:(0,r.jsx)(d.Z,{checked:n,onChange:a,size:"small",disabled:s})})}function g(e){let{label:t,value:n,onChange:a,disabled:i,className:s}=e;return(0,r.jsx)(o.Z.Item,{label:t,valuePropName:"checked",className:s,children:(0,r.jsx)(c.Z,{checked:n,onChange:e=>a(e.target.checked),disabled:i})})}function f(e){let{value:t,label:n,onChange:a,options:i}=e;return(0,r.jsx)(o.Z.Item,{label:n,layout:i.length>2?"vertical":"horizontal",children:(0,r.jsx)(u.Z,{block:!0,value:t,onChange:a,options:i.map((e=>({label:(0,r.jsx)(v.Z,{arrow:!0,trigger:"hover",title:e.title,children:e.icon}),value:e.value})))})})}var y=n(952),x=n(7965);function j(e){let{isLoading:t,isIdle:n,error:a,isDirty:i,isError:o,hasResponseData:s}=e;return n?(0,r.jsx)(y.Z,{children:"No Data yet"}):t?(0,r.jsx)(y.Z,{color:"blue",children:"Loading..."}):a||o?(0,r.jsx)(y.Z,{color:"red",children:"Error"}):i?(0,r.jsx)(y.Z,{color:"orange",children:"Modified"}):s?(0,r.jsx)(y.Z,{color:"green",children:"Loaded"}):(0,r.jsx)(y.Z,{children:"No Data"})}function b(e){return(0,r.jsx)(x.Pd,{children:(0,r.jsx)(o.Z.Item,{label:"Status",children:(0,r.jsx)(j,{...e})})})}},537:(e,t,n)=>{n.d(t,{Y:()=>l});var a=n(4747),r=n(8027),i=n(2791),o=n(2010),s=n(8172);function l(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};const{notification:n}=a.Z.useApp(),l=(0,o.a)({queryKey:[e,"history"],queryFn:(0,r.A)(e,"history"),...t});return(0,i.useEffect)((()=>{l.isSuccess&&(0,s.tS)("Loaded daily/history")}),[l.isSuccess]),(0,i.useEffect)((()=>{l.isError&&n.error({message:"Error loading daily/history",placement:"bottomLeft"})}),[l.isError]),l}},4609:(e,t,n)=>{n.d(t,{J:()=>i});var a=n(2791),r=n(6728);function i(e,t){const n=(0,a.useMemo)((()=>{var n;return null!==(n=null===t||void 0===t?void 0:t[e])&&void 0!==n?n:{latestDate:(0,r.hD)(),latestNumber:0,used:"[]"}}),[t,e]);return[(0,a.useMemo)((()=>{var e,t,a;return{latestNumber:null!==(e=null===n||void 0===n?void 0:n.latestNumber)&&void 0!==e?e:0,latestDate:null!==(t=null===n||void 0===n?void 0:n.latestDate)&&void 0!==t?t:(0,r.hD)(),used:JSON.parse(null!==(a=null===n||void 0===n?void 0:n.used)&&void 0!==a?a:"[]")}}),[n]),n]}},9079:(e,t,n)=>{n.d(t,{C:()=>a});const a={SUFFIX_DATA:{pt:"drawingsPT",en:"drawingsEN"},DAILY:{pt:"diario",en:"daily"}}},6728:(e,t,n)=>{n.d(t,{A5:()=>s,ao:()=>o,hD:()=>i});n(763);var a=n(2426),r=n.n(a);function i(){return r()().subtract(1,"days").format("YYYY-MM-DD")}function o(e){return r()(e,"YYYY-MM-DD").add(1,"days").format("YYYY-MM-DD")}function s(e){const t=r()(e,"YYYY-MM-DD");return[6,0].includes(t.day())}},8178:(e,t,n)=>{n.d(t,{i:()=>c});var a=n(5),r=n(1105),i=n(5529),o=n(763),s=n(2791),l=n(5675),d=n(184);function c(e){let{items:t,isPending:n,style:c,size:u,placeholder:v,allowClear:m,onFinish:p,...h}=e;const g=(0,i.N)("items",!Boolean(t)&&!n),{namesDict:f,options:y}=(0,s.useMemo)((()=>{var e;console.log("Recomputing item names typeahead...");const n=Object.values(null!==(e=null!==t&&void 0!==t?t:g.data)&&void 0!==e?e:{}).reduce(((e,t)=>{const n="".concat(t.name.en," (").concat(t.id,")"),a="".concat(t.name.pt," (").concat(t.id,")");return e[n]=t.id,e[a]=t.id,t.aliasesEn&&t.aliasesEn.forEach((n=>{e["".concat(n," (").concat(t.id,")*")]=t.id})),t.aliasesPt&&t.aliasesPt.forEach((n=>{e["".concat(n," (").concat(t.id,")*")]=t.id})),e}),{});return{namesDict:n,options:(0,o.orderBy)(Object.keys(n),[e=>e.toLowerCase()]).map((e=>({value:e})))}}),[t,n]),[x,j]=(0,s.useState)([]),[b,S]=(0,s.useState)("");(0,l.Z)((()=>{b&&Z(b)}),500,[b]);const Z=e=>{if(!e)return void j([]);const t=e.trim().toUpperCase(),n=y.filter((e=>{var n;return String(null!==(n=null===e||void 0===e?void 0:e.value)&&void 0!==n?n:"").toUpperCase().includes(t)})),a=(0,o.orderBy)(n,[e=>{var n;const a=String(null!==(n=null===e||void 0===e?void 0:e.value)&&void 0!==n?n:"").toUpperCase();if(a===t)return 0;const r=a.match(/\((.*?)\)/);if(r&&r[1]===t)return 1;const i=a.indexOf(t);return 0===i?2:i>0?3:4}]);j(a)};return(0,d.jsx)(a.Z,{options:x,style:{width:250,...c},allowClear:null===m||void 0===m||m,placeholder:null!==v&&void 0!==v?v:"Search by name or id...",filterOption:(e,t)=>{var n;return-1!==String(null!==(n=null===t||void 0===t?void 0:t.value)&&void 0!==n?n:"").toUpperCase().indexOf(null===e||void 0===e?void 0:e.toUpperCase())},onSearch:S,notFoundContent:b.length>0?"No items found":"Type to search...",onSelect:e=>{void 0!==f[e]&&p(f[e])},...h,children:(0,d.jsx)(r.Z,{onPressEnter:()=>{if(x.length>0){const e=x[0].value;void 0!==f[e]&&p(f[e])}}})})}},7134:(e,t,n)=>{n.d(t,{_:()=>s});var a=n(4747),r=n(763),i=n(2791),o=n(3250);function s(){const[e,t]=(0,o.Z)(),{message:n}=a.Z.useApp();return(0,i.useEffect)((()=>{e.value&&(e.value.length>20?n.info("Copied to clipboard: ".concat((0,r.truncate)(e.value,{length:30,omission:"..."}))):n.success("Copied"))}),[e,n]),t}},8027:(e,t,n)=>{n.d(t,{A:()=>s,X:()=>l});var a=n(9631),r=n(8172),i=n(2010),o=n(5850);function s(e,t){return async()=>{var n;console.log("%cQuerying ".concat(e,"/").concat(t," from firebase: ").concat((0,o.xE)()),"color: #f0f");const i=(0,a.JU)(r.RZ,"".concat(e,"/").concat(t));return null!==(n=(await(0,a.QT)(i)).data())&&void 0!==n?n:{}}}function l(e,t,n){return(0,i.a)({queryKey:["firebase",e,t],queryFn:s(e,t),...n})}},4766:(e,t,n)=>{n.d(t,{K:()=>i});var a=n(2791),r=n(1087);function i(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};const[t,n]=(0,r.lr)(),i=(e,a,r)=>{void 0===a||""===a||a===r?t.delete(e):t.set(e,String(a)),n(t)},o=function(e){let a=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};Object.entries(e).forEach((e=>{let[n,r]=e;a[n]===r?t.delete(n):t.set(n,String(r))})),n(t)},s=e=>{t.delete(e),n(t)},l=function(e){let n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"true";return t.get(e)===String(n)};return(0,a.useEffect)((()=>{Object.entries(e).forEach((e=>{let[n,a]=e;t.has(n)||i(n,a)}))}),[]),{addParam:i,addParams:o,removeParam:s,queryParams:t,is:l}}},8938:(e,t,n)=>{n.d(t,{i:()=>u});var a=n(4747),r=n(763),i=n(2791),o=n(3713),s=n(8027),l=n(5529),d=n(2233),c=n(5850);function u(e){let{tdrResourceName:t,firebaseDataCollectionName:n,serialize:u}=e;const{notification:v}=a.Z.useApp(),m=(0,o.NL)(),p=(0,l.N)(t),h=(0,s.X)("tdr",n,{select:u?c.d_:void 0}),[g,f]=(0,i.useState)({}),y=(0,d.B)("tdr",n,{onSuccess:()=>{v.success({message:"".concat(n," updated")}),m.refetchQueries({queryKey:["firebase","tdr",n]}),f({})},onError:e=>{v.error({message:"".concat(n," update failed"),description:e.message})}}),x=(0,i.useMemo)((()=>{var e,a;return p.isSuccess&&h.isSuccess&&!y.isPending?(console.log("%cMerging ".concat(t,"+").concat(n," data..."),"color: #f0f"),(0,r.cloneDeep)({...null!==(e=p.data)&&void 0!==e?e:{},...null!==(a=h.data)&&void 0!==a?a:{},...g})):{}}),[t,n,p.data,h.data,p.isSuccess,h.isSuccess,y.isPending,g]),j=!(0,r.isEmpty)(g),b=h.data;return{data:x,isLoading:p.isLoading||h.isLoading,error:p.error||h.error,firebaseData:b,isSaving:y.isPending,save:()=>{y.mutate(u?(0,c.aS)(g):g)},addEntryToUpdate:(e,t)=>{f((n=>({...n,[e]:t})))},entriesToUpdate:g,isDirty:j}}},5529:(e,t,n)=>{n.d(t,{N:()=>o,Y:()=>s});var a=n(763),r=n(2010),i=n(2606);function o(e){var t;let n=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];const{getUrl:o}=(0,i.n)("resources"),s=(0,r.a)({queryKey:[e],queryFn:async()=>{const t=await fetch(o("".concat(e,".json")));return await t.json()},enabled:n}),l=!(0,a.isEmpty)(s.data);return{...s,data:null!==(t=s.data)&&void 0!==t?t:{},hasResponseData:l}}function s(e){let t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];const{getUrl:n}=(0,i.n)("resources"),o=(0,r.a)({queryKey:[e],queryFn:async()=>{const t=await fetch(n("".concat(e,".json")));return await t.json()},enabled:t}),s=!(0,a.isEmpty)(o.data);return{...o,data:o.data,hasResponseData:s}}},548:(e,t,n)=>{n.d(t,{P:()=>r});var a=n(4766);function r(e){var t,n;let{prefix:r="",defaultCurrent:i=1,defaultPageSize:o=10,pageSizeOptions:s=[10,20,50,100],total:l,showQuickJumper:d}=e;const{queryParams:c,addParam:u}=(0,a.K)();return{current:Number(null!==(t=c.get("".concat(r,"page")))&&void 0!==t?t:String(i)),pageSize:Number(null!==(n=c.get("".concat(r,"pageSize")))&&void 0!==n?n:String(o)),onChange:e=>{u("".concat(r,"page"),e.toString(),String(i))},onShowSizeChange:(e,t)=>{u("".concat(r,"pageSize"),t.toString(),String(o))},defaultCurrent:i,defaultPageSize:o,pageSizeOptions:s,total:l,hideOnSinglePage:!0,showQuickJumper:d}}},2233:(e,t,n)=>{n.d(t,{B:()=>s});var a=n(9631),r=n(8172),i=n(8556);function o(e,t,n){console.log("%cUpdating ".concat(e,"/").concat(t," from firebase"),"color: #f00");const i=(0,a.JU)(r.RZ,"".concat(e,"/").concat(t));return(0,a.r7)(i,n)}function s(e,t){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return(0,i.D)({mutationFn:async n=>o(e,t,n),...n})}},126:(e,t,n)=>{n.r(t),n.d(t,{ItemsMovieSets:()=>R,default:()=>A});var a=n(3990),r=n(1046),i=n(2128),o=n(4520),s=n(7128),l=n(3166),d=n(7018),c=n(7340),u=n(7965),v=n(4766),m=n(5850),p=n(184);function h(e){let{data:t,save:n,isDirty:a,isSaving:r,entriesToUpdate:i}=e;const{is:h,addParam:g}=(0,v.K)();return(0,p.jsxs)(u.Pd,{children:[(0,p.jsxs)(o.Z,{vertical:!0,gap:12,children:[(0,p.jsx)(c.k,{isDirty:a,onSave:n,isSaving:r,dirt:JSON.stringify(i)}),(0,p.jsx)(d.o,{data:()=>{return e=t,(0,m.Tj)(e);var e},fileName:"daily-movie-sets.json",disabled:a,block:!0})]}),(0,p.jsx)(s.Z,{}),(0,p.jsx)(l.Do,{label:"Pending Only",value:h("emptyOnly"),onChange:e=>g("emptyOnly",e,!1)})]})}var g=n(9481),f=n(2556),y=n(7134),x=n(5529),j=n(763),b=n(2791),S=n(8252),Z=n(1082),C=n(2997),E=n(548),I=n(8862),D=n(8178),N=n(537),w=n(4609),T=n(9079);function U(e){let{data:t,addEntryToUpdate:n}=e;const a=(0,y._)(),i=(0,x.N)("items"),o=function(){const e=T.C.DAILY.pt,t=(0,N.Y)(e,{enabled:!0}),[n]=(0,w.J)("filmaco",t.data);return(0,b.useMemo)((()=>{var e;return(0,j.mapValues)((0,j.keyBy)(null!==(e=null===n||void 0===n?void 0:n.used)&&void 0!==e?e:[]),(()=>!0))}),[n])}(),{is:s}=(0,v.K)(),l=s("emptyOnly"),d=(0,b.useMemo)((()=>{const e=t?(n=Object.values(t),(0,j.orderBy)(n,[e=>e.title]).map((e=>({...e,itemsIds:(0,j.orderBy)(e.itemsIds,(e=>Number(e)))})))):[];var n;return l?e.filter((e=>0===e.itemsIds.length)):e}),[t,l]),c=d.filter((e=>e.itemsIds.length>0)).length,u=(0,E.P)({total:d.length,showQuickJumper:!0}),h=[{title:"Title",dataIndex:"title",render:(e,t)=>(0,p.jsx)(M,{property:"title",value:e,movie:t,addEntryToUpdate:n}),sorter:(e,t)=>e.title.localeCompare(t.title)},{title:"Year",dataIndex:"year",render:(e,t)=>(0,p.jsx)(M,{property:"year",value:e,movie:t,addEntryToUpdate:n}),sorter:(e,t)=>e.year-t.year},g.Z.EXPAND_COLUMN,{title:"Items",dataIndex:"itemsIds",key:"itemsIds",render:(e,t)=>(0,p.jsx)(k,{movie:t,itemsIds:e,copyToClipboard:a,addEntryToUpdate:n}),sorter:(e,t)=>e.itemsIds.length-t.itemsIds.length},{title:"Count",dataIndex:"itemsIds",render:e=>(0,m.R1)(e).filter(Boolean).length},{title:"Used",dataIndex:"id",render:e=>o[e]?"Yes":"No",sorter:(e,t)=>o[e.id]&&!o[t.id]?-1:!o[e.id]&&o[t.id]?1:t.itemsIds.length-e.itemsIds.length}];return(0,p.jsxs)(r.Z,{direction:"vertical",children:[(0,p.jsxs)(S.Z.Title,{level:5,children:["Total Movies: ",d.length," | Complete Movies: ",c]}),(0,p.jsx)(g.Z,{columns:h,rowKey:"id",dataSource:d,expandable:{expandedRowRender:e=>(0,p.jsx)(P,{movie:e,addEntryToUpdate:n}),rowExpandable:()=>i.isSuccess},pagination:u})]})}function P(e){let{movie:t,addEntryToUpdate:n}=e;return(0,p.jsx)("div",{children:(0,p.jsx)(D.i,{onFinish:e=>{n(t.id,{...t,itemsIds:[...t.itemsIds,e]})}})})}function Y(e){let{movie:t,addEntryToUpdate:n,itemId:a}=e;return(0,p.jsx)(Z.Z,{title:"Are you sure you want to remove this item?",onConfirm:()=>{n(t.id,{...t,itemsIds:t.itemsIds.filter((e=>e!==a))})},okText:"Yes",cancelText:"No",children:(0,p.jsx)(f.ZP,{icon:(0,p.jsx)(I.Z,{}),size:"small",type:"text"})})}function k(e){let{movie:t,itemsIds:n,copyToClipboard:a,addEntryToUpdate:r}=e;return(0,p.jsx)(o.Z,{gap:6,wrap:"wrap",children:n.map(((e,n)=>(0,p.jsxs)(o.Z,{gap:2,vertical:!0,children:[(0,p.jsx)(C.ck,{id:e,width:60}),(0,p.jsxs)(o.Z,{justify:"center",children:[(0,p.jsx)(S.Z.Text,{onClick:()=>a(e),children:e}),(0,p.jsx)(Y,{movie:t,addEntryToUpdate:r,itemId:e})]})]},"".concat(t.title,"-").concat(e,"-").concat(n))))},"items-".concat(t.title))}function M(e){let{value:t,movie:n,addEntryToUpdate:a,property:i}=e;return(0,p.jsx)(r.Z,{children:(0,p.jsx)(S.Z.Text,{editable:{onChange:e=>"number"===typeof t?e!==String(t)?a(n.id,{...n,[i]:Number(e)}):null:e!==t?a(n.id,{...n,[i]:e.trim()}):null},children:String(t)})})}function O(e){let{data:t,addEntryToUpdate:n}=e;const[a,i]=(0,b.useState)(null),o=(0,x.N)("items"),l=(0,y._)(),d=[{title:"Title",dataIndex:"title",render:(e,t)=>(0,p.jsx)(M,{property:"title",value:e,movie:t,addEntryToUpdate:n})},{title:"Year",dataIndex:"year",render:(e,t)=>(0,p.jsx)(M,{property:"year",value:e,movie:t,addEntryToUpdate:n})},g.Z.EXPAND_COLUMN,{title:"Items",dataIndex:"itemsIds",key:"itemsIds",render:(e,t)=>(0,p.jsx)(k,{movie:t,itemsIds:e,copyToClipboard:l,addEntryToUpdate:n})},{title:"Count",dataIndex:"itemsIds",render:e=>(0,m.R1)(e).filter(Boolean).length}];return(0,p.jsxs)(r.Z,{direction:"vertical",className:"my-4",children:[(0,p.jsx)(f.ZP,{onClick:()=>{var e;let n=(0,j.sample)(Object.keys(null!==t&&void 0!==t?t:{})),a=0;for(;a<15&&(null!==(r=null===(o=t[String(n)])||void 0===o?void 0:o.itemsIds)&&void 0!==r?r:[]).length>0;){var r,o;n=(0,j.sample)(Object.keys(null!==t&&void 0!==t?t:{})),a++}if(a>=15)return console.warn("Could not find a sample with no itemsIds");i(null!==(e=n)&&void 0!==e?e:null)},children:"Get Sample"}),a&&(0,p.jsx)(g.Z,{columns:d,rowKey:"id",dataSource:[t[a]],expandable:{expandedRowRender:e=>(0,p.jsx)(P,{movie:e,addEntryToUpdate:n}),rowExpandable:()=>o.isSuccess},pagination:!1},String(a)),(0,p.jsx)(s.Z,{})]})}var L=n(4562),z=n(8938);function R(){const e=(0,z.i)({tdrResourceName:"daily-movie-sets",firebaseDataCollectionName:"movieSets"});return(0,p.jsx)(u.Xg,{title:"Items",subtitle:"Movie Sets",children:(0,p.jsxs)(a.Z,{hasSider:!0,children:[(0,p.jsx)(L.p,{children:(0,p.jsx)(h,{...e})}),(0,p.jsx)(a.Z.Content,{className:"content",children:(0,p.jsx)(i.T,{isLoading:e.isLoading,error:e.error,hasResponseData:!(0,j.isEmpty)(e.data),children:(0,p.jsxs)(r.Z,{direction:"vertical",children:[(0,p.jsx)(O,{...e}),(0,p.jsx)(U,{...e})]})})})]})})}const A=R},8862:(e,t,n)=>{n.d(t,{Z:()=>l});var a=n(7460),r=n(2791);const i={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M864 256H736v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zm-200 0H360v-72h304v72z"}}]},name:"delete",theme:"filled"};var o=n(4508),s=function(e,t){return r.createElement(o.Z,(0,a.Z)({},e,{ref:t,icon:i}))};const l=r.forwardRef(s)}}]);
//# sourceMappingURL=ItemsMovieSets.8fe0d0b8.chunk.js.map