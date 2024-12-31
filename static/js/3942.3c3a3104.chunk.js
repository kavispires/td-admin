"use strict";(self.webpackChunktd_admin=self.webpackChunktd_admin||[]).push([[3942],{7018:(e,t,n)=>{n.d(t,{o:()=>c});var a=n(1413),l=n(4925),r=n(9475),s=n(5850),i=n(184);const o=["data","fileName","loading","children"];function c(e){let{data:t,fileName:n,loading:c,children:d}=e,u=(0,l.Z)(e,o);return(0,i.jsx)(r.ZP,(0,a.Z)((0,a.Z)({onClick:()=>(0,s.ZN)("function"===typeof t?t():t,n),loading:c},u),{},{children:null!==d&&void 0!==d?d:"Download JSON"}))}},2043:(e,t,n)=>{n.d(t,{Do:()=>v,H:()=>m,tj:()=>g,xh:()=>h,zE:()=>u});var a=n(3070),l=n(906),r=n(9793),s=n(5922),i=n(9862),o=n(4248),c=n(1431),d=n(184);function u(e){let{label:t,value:n,onChange:r,options:s,placeholder:i}=e;return(0,d.jsx)(a.Z.Item,{label:t,children:(0,d.jsxs)(l.Z,{style:{minWidth:"150px"},onChange:r,value:n,children:[i&&(0,d.jsx)(l.Z.Option,{value:"",disabled:!0,children:"placeholder"}),s.map((e=>"object"===typeof e?(0,d.jsx)(l.Z.Option,{value:e.value,children:e.label},"".concat(t,"-").concat(e.value)):(0,d.jsx)(l.Z.Option,{value:e,children:e},"".concat(t,"-").concat(e))))]})})}function h(e){let{label:t,value:n,onChange:l,min:s=0,max:i=100,step:o}=e;return(0,d.jsx)(a.Z.Item,{label:t,children:(0,d.jsx)(r.Z,{min:s,max:i,value:n,onChange:e=>l(null!==e&&void 0!==e?e:i),style:{minWidth:"150px",width:"100%"},step:o})})}function v(e){let{label:t,value:n,onChange:l,className:r,disabled:i}=e;return(0,d.jsx)(a.Z.Item,{label:t,valuePropName:"checked",className:r,children:(0,d.jsx)(s.Z,{checked:n,onChange:l,size:"small",disabled:i})})}function g(e){let{label:t,value:n,onChange:l,disabled:r,className:s}=e;return(0,d.jsx)(a.Z.Item,{label:t,valuePropName:"checked",className:s,children:(0,d.jsx)(i.Z,{checked:n,onChange:e=>l(e.target.checked),disabled:r})})}function m(e){let{value:t,label:n,onChange:l,options:r}=e;return(0,d.jsx)(a.Z.Item,{label:n,layout:r.length>2?"vertical":"horizontal",children:(0,d.jsx)(o.Z,{block:!0,value:t,onChange:l,options:r.map((e=>({label:(0,d.jsx)(c.Z,{arrow:!0,trigger:"hover",title:e.title,children:e.icon}),value:e.value})))})})}},7340:(e,t,n)=>{n.d(t,{k:()=>g});var a=n(1413),l=n(4925),r=n(9475),s=n(2426),i=n.n(s),o=n(2791),c=n(8211),d=n(4483),u=n(4841),h=n(184);const v=["isDirty","onSave","isSaving","dirt","interval"];function g(e){let{isDirty:t,onSave:n,isSaving:s,dirt:g,interval:m=6e5}=e,f=(0,l.Z)(e,v);const{togglePendingSave:p}=(0,u.b)(),[,Z,j]=(0,c.Z)((()=>{t&&n()}),m);return(0,o.useEffect)((()=>{t?(p(!0),console.log("Save Reset",i()(Date.now()).format("MM/DD/YYYY HH:mm:ss")),j()):(p(!1),Z())}),[t,j,Z,g]),(0,o.useEffect)((()=>{const e=e=>{if(t){const t="You have unsaved changes, are you sure you want to leave?";return e.returnValue=t,t}};return window.addEventListener("beforeunload",e),()=>{window.removeEventListener("beforeunload",e)}}),[t]),(0,h.jsx)(r.ZP,(0,a.Z)((0,a.Z)({type:"primary",size:"large",icon:(0,h.jsx)(d.Z,{}),onClick:n,disabled:!t,loading:s,danger:!0,block:!0},f),{},{children:"Save"}))}},8866:(e,t,n)=>{n.d(t,{N:()=>o});var a=n(1413),l=n(4925),r=n(6178),s=n(184);const i=["children","level"];function o(e){let{children:t,level:n}=e,o=(0,l.Z)(e,i);return(0,s.jsx)(r.Z.Title,(0,a.Z)((0,a.Z)({level:null!==n&&void 0!==n?n:3},o),{},{children:t}))}},8357:(e,t,n)=>{n.d(t,{tj:()=>c.tj,xh:()=>c.xh,H:()=>c.H,zE:()=>c.zE,Do:()=>c.Do,Th:()=>g,F6:()=>o});n(8866);var a=n(1413),l=n(4925),r=n(3733),s=n(184);const i=["children","active","activeClass","className","hoverType"],o=e=>{let{children:t,active:n=!1,activeClass:o="",className:c="",hoverType:d="scale"}=e,u=(0,l.Z)(e,i);return(0,s.jsx)("button",(0,a.Z)((0,a.Z)({className:(0,r.Z)("transparent-button","transparent-button--".concat(d),n&&(o||"transparent-button--active"),c)},u),{},{children:t}))};var c=n(2043),d=n(952),u=n(3070),h=n(7965);function v(e){let{isLoading:t,isIdle:n,error:a,isDirty:l,isError:r,hasResponseData:i}=e;return n?(0,s.jsx)(d.Z,{children:"No Data yet"}):t?(0,s.jsx)(d.Z,{color:"blue",children:"Loading..."}):a||r?(0,s.jsx)(d.Z,{color:"red",children:"Error"}):l?(0,s.jsx)(d.Z,{color:"orange",children:"Modified"}):i?(0,s.jsx)(d.Z,{color:"green",children:"Loaded"}):(0,s.jsx)(d.Z,{children:"No Data"})}function g(e){return(0,s.jsx)(h.Pd,{children:(0,s.jsx)(u.Z.Item,{label:"Status",children:(0,s.jsx)(v,(0,a.Z)({},e))})})}},145:(e,t,n)=>{n.d(t,{f:()=>i});var a=n(2241),l=n(3733),r=n(2606),s=n(184);const i=e=>{let{id:t,width:n=200,className:i="",preview:o=!0,fileExtension:c="jpg"}=e;const{getUrl:d}=(0,r.n)("images"),u=t.replace(/-/g,"/");return(0,s.jsx)("div",{className:(0,l.Z)("image-card",i),children:(0,s.jsx)(a.Z,{width:n,src:d("".concat(u,".").concat(c)),fallback:d("back/default.jpg"),preview:o})})}},4249:(e,t,n)=>{n.d(t,{c:()=>s});var a=n(1492),l=n(952),r=n(184);function s(e){let{card:t}=e;const n=t.length>10?"red":t.length>5?"blue":t.length>0?"green":void 0;return(0,r.jsx)("div",{children:(0,r.jsxs)(l.Z,{color:n,icon:(0,r.jsx)(a.Z,{}),children:[" ",t.length]})})}},2671:(e,t,n)=>{n.d(t,{AZ:()=>f,gU:()=>m,IN:()=>p});var a=n(4747),l=n(9631),r=n(763),s=n(2791),i=n(2592),o=n(5850),c=n(3713),d=n(2010),u=n(8556),h=n(4766);const v=()=>(0,r.padStart)(String((0,r.random)(1,252)),2,"0"),g=()=>(0,r.random)(1,12);function m(e,t){var n,a,l;const[r,i]=(0,s.useState)(g()),[c,d]=(0,s.useState)(v()),[u,m]=(0,s.useState)(g()),[f,p]=(0,s.useState)(v()),Z="td-d".concat(r,"-").concat(c),j="td-d".concat(u,"-").concat(f),[x,b]=(0,s.useState)(0),{queryParams:S}=(0,h.K)(),y=Number(null!==(n=S.get("cycle"))&&void 0!==n?n:3),C=null!==(a=null===e||void 0===e?void 0:e[Z])&&void 0!==a?a:[],E=null!==(l=null===e||void 0===e?void 0:e[j])&&void 0!==l?l:[],N=()=>{b(0),i(g()),d(v()),m(g()),p(v())};return(0,s.useEffect)((()=>{Z===j&&p(v())}),[Z,j]),{cardAId:Z,cardA:C,cardBId:j,cardB:E,relate:()=>{b(0),C.push(j),e[Z]=(0,o.R1)(C),E.push(Z),e[j]=(0,o.R1)(E),t(!0),i(u),d(f),m(g()),p(v())},unrelate:()=>{x>=y?(b(0),N()):(b((e=>e+1)),m(g()),p(v()))},areRelated:C.includes(j),onRandomCards:N}}function f(){const[e,t]=(0,s.useState)(!1),n=["data/imageCardsRelationships"],r=(0,c.NL)(),{notification:o}=a.Z.useApp(),[h,v]=(0,s.useState)({total:0,overdone:0,complete:0,single:0}),{data:g={},isLoading:m,isSuccess:f,isError:p,error:Z,isFetched:j,isRefetching:x,refetch:b}=(0,d.a)({queryKey:n,queryFn:async()=>{var e;const t=(0,l.JU)(i.RZ,"data/imageCardsRelationships");return null!==(e=(await(0,l.QT)(t)).data())&&void 0!==e?e:{}}}),{isPending:S,isError:y,isSuccess:C,mutate:E}=(0,u.D)({mutationKey:n,mutationFn:async()=>{const e=(0,l.JU)(i.RZ,"data/imageCardsRelationships");return await(0,l.pl)(e,g),g},onSuccess:()=>{o.success({message:"Saved",placement:"bottomLeft"}),r.refetchQueries({queryKey:n}),t(!1)}});return(0,s.useEffect)((()=>{if(!x&&j){const e=Object.keys(g).length;let t=0,n=0,a=0;Object.values(g).forEach((e=>{e.length>8&&(t+=1),1===e.length&&(a+=1),e.length>2&&(n+=1)})),v({total:e,overdone:t,complete:n,single:a})}}),[j,x]),{data:g,isLoading:m,isSuccess:f,isError:p,error:Z,hasData:f&&Object.keys(g).length>0,refetch:b,isSaving:S,isMutationError:y,isSaved:C,save:E,setDirty:t,isDirty:e,stats:h}}function p(e,t,n,a){const[l,r]=(0,s.useState)([]),[i,c]=(0,s.useState)([]),[d,u]=(0,s.useState)([]),[h,m]=(0,s.useState)(0),[f,p]=(0,s.useState)(!0),[Z,j]=(0,s.useState)([]),x=t=>{c((null!==t&&void 0!==t?t:l).map((t=>{var n;return null!==(n=null===e||void 0===e?void 0:e[t])&&void 0!==n?n:[]})))},b=()=>{const t=[...Z];let l=0;const s=d.length<2e3?d:[];let i=0;for(;i<400&&t.length<n;){var o;const n="td-d".concat(g(),"-").concat(v()),r=null!==(o=e[n])&&void 0!==o?o:[],c=!(a>0)||r.length<a,d=!!f&&s.includes(n);t.includes(n)||d||!c||(t.push(n),l+=1),i+=1}r(t),u((e=>[...e,...t])),x(t),m((e=>e+l))};(0,s.useEffect)((()=>{0===l.length&&b()}),[l]);return{cardIds:l,cards:i,selection:Z,onSelect:e=>{j((t=>{const n=[...t],a=n.indexOf(e);return a>-1?n.splice(a,1):n.push(e),n}))},relate:()=>{Z.forEach((t=>{var n;const a=null!==(n=e[t])&&void 0!==n?n:[];a.push(...Z.filter((e=>e!==t))),e[t]=(0,o.R1)(a)})),t(!0),j([]),x(),u([]),m(0)},nextSet:b,deselectAll:()=>{j([])},cycles:h,filters:{useCycles:f,toggleUseCycles:()=>{p((e=>!e))}}}}},4766:(e,t,n)=>{n.d(t,{K:()=>r});var a=n(1087),l=n(263);function r(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};const[t,n]=(0,a.lr)(),r=(e,a,l)=>{void 0===a||""===a||a===l?t.delete(e):t.set(e,String(a)),n(t)},s=function(e){let a=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};Object.entries(e).forEach((e=>{let[n,l]=e;a[n]===l?t.delete(n):t.set(n,String(l))})),n(t)},i=e=>{t.delete(e),n(t)},o=function(e){let n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"true";return t.get(e)===String(n)};return(0,l.Z)((()=>{Object.entries(e).forEach((e=>{let[n,a]=e;t.has(n)||r(n,a)}))})),{addParam:r,addParams:s,removeParam:i,queryParams:t,is:o}}}}]);
//# sourceMappingURL=3942.3c3a3104.chunk.js.map