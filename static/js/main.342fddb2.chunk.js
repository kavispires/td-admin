(this.webpackJsonptdr=this.webpackJsonptdr||[]).push([[0],{142:function(e,t,a){},220:function(e,t,a){"use strict";a.r(t);var r=a(0),c=a.n(r),n=a(35),s=a.n(n),l=(a(142),a(40)),i=a(17),o=a(4),j=a.p+"static/media/logo.ca29fdd8.svg",u=a(232),d=a(65),b=a(6);function O(e){var t=e.ghost,a=void 0!==t&&t,r=Object(i.e)();return Object(b.jsxs)(u.b,{children:[Object(b.jsx)(l.b,{to:"/arte-ruim/parser",children:Object(b.jsx)(d.a,{disabled:"/arte-ruim/parser"===r.pathname,type:"link",ghost:a,children:"ARPD Parser"})}),Object(b.jsx)(l.b,{to:"/arte-ruim/level4",children:Object(b.jsx)(d.a,{disabled:"/arte-ruim/level4"===r.pathname,type:"link",ghost:a,children:"ARPD Level 4"})}),Object(b.jsx)(l.b,{to:"/resource",children:Object(b.jsx)(d.a,{disabled:"/resource"===r.pathname,type:"link",ghost:a,children:"Resource"})}),Object(b.jsx)(l.b,{to:"/other",children:Object(b.jsx)(d.a,{disabled:"/other"===r.pathname,type:"link",ghost:a,children:"Other"})})]})}var h=function(){var e=Object(r.useState)(0),t=Object(o.a)(e,2),a=t[0],c=t[1],n=Object(r.useState)(!1),s=Object(o.a)(n,2),l=s[0],i=s[1];Object(r.useEffect)((function(){6===a&&i(!0)}),[a]);var u=l?{minHeight:"94vh"}:{};return Object(b.jsx)("div",{className:"home",children:Object(b.jsxs)("header",{className:"home-header",style:u,onClick:function(){c(a+1)},children:[Object(b.jsx)("img",{src:j,className:"home-logo",alt:"logo"}),l&&Object(b.jsx)(O,{ghost:!0})]})})},x=a(2),v=a(227),m=a(222),p=a(230),g=a(224),f=a(223),N=a(125),y=a(229),S=a(66);function R(e){var t=e.loading,a=e.error,r=e.hasResponseData,c=e.children;return t?Object(b.jsx)(N.a,{tip:"Loading...",children:c}):a?Object(b.jsx)(m.a.Content,{className:"content",children:Object(b.jsx)(y.a,{message:"Error",description:a.message,type:"error"})}):!1===r?Object(b.jsx)(m.a.Content,{className:"content",children:Object(b.jsx)(S.a,{})}):Object(b.jsx)(b.Fragment,{children:c})}var T=["arte-ruim","arte-ruim-extra","linhas-cruzadas","mente-coletiva","onda-telepatica","polemica-da-vez","single-word","testemunha-ocular","themes","ue-so-isso"],L=["pt","en"];function w(e){return e.normalize("NFD").replace(/[\u0300-\u036f]/g,"")}var D=a(233),k=a(225),A=a(226),C=a(72),E=a(85);function P(e,t){var a=Object(i.e)(),c=Object(i.f)(),n=Object(r.useState)({}),s=Object(o.a)(n,2),l=s[0],j=s[1];Object(r.useEffect)((function(){if(a.search&&t){var r,c=new URLSearchParams(a.search),n={},s=Object(E.a)(c.entries());try{for(s.s();!(r=s.n()).done;){var l=r.value;n[l[0]]=l[1]}}catch(i){s.e(i)}finally{s.f()}n.resourceName===(null===e||void 0===e?void 0:e.resourceName)&&n.language===(null===e||void 0===e?void 0:e.language)||(t(n),j(n))}}),[a.search,e,t]);return{params:l,updateQueryParams:function(e){var t=new URLSearchParams;Object.entries(e).forEach((function(e){var a=Object(o.a)(e,2),r=a[0],c=a[1];t.append(r,c)})),j(e),c("".concat(a.pathname,"?").concat(t.toString()))}}}function J(e){var t=e.loading,a=e.error,r=e.hasResponseData;return t?Object(b.jsx)(D.a,{color:"blue",children:"Loading..."}):a?Object(b.jsx)(D.a,{color:"red",children:"Error"}):r?Object(b.jsx)(D.a,{color:"green",children:"Loaded"}):Object(b.jsx)(D.a,{children:"No Data"})}function I(e){var t=e.title,a=e.resourceNames,r=e.updateState,c=e.initialValues,n=void 0===c?{}:c,s=e.loading,l=e.error,o=e.hasResponseData,j=e.values,u=void 0===j?{}:j,h=Object(i.f)(),v=P().updateQueryParams;return Object(b.jsx)(k.a,{title:t,tags:Object(b.jsx)(J,{loading:s,error:l,hasResponseData:o}),onBack:function(){return h(-1)},extra:Object(b.jsx)(O,{}),children:Object(b.jsxs)(A.a,{layout:"inline",onFinish:function(e){r(Object(x.a)({},e)),v(Object(x.a)({},e))},size:"small",initialValues:Object(x.a)(Object(x.a)({},n),u),children:[Object(b.jsx)(A.a.Item,{label:"Resource",name:"resourceName",children:Object(b.jsx)(C.a,{style:{minWidth:"150px"},value:u.resourceName,children:a.map((function(e){return Object(b.jsx)(C.a.Option,{value:e,children:e},e)}))})}),Object(b.jsx)(A.a.Item,{label:"Language",name:"language",children:Object(b.jsx)(C.a,{style:{minWidth:"50px"},children:L.map((function(e){return Object(b.jsx)(C.a.Option,{value:e,children:e},e)}))})}),Object(b.jsx)(A.a.Item,{children:Object(b.jsx)(d.a,{type:"primary",htmlType:"submit",children:"Load"})})]})})}var F=a(38),B=a(26),z=a.n(B),U=a(231);function V(e){var t,a,c=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=Object(r.useState)(null!==(t=c.resourceName)&&void 0!==t?t:null),s=Object(o.a)(n,2),l=s[0],i=s[1],j=Object(r.useState)(null!==(a=c.language)&&void 0!==a?a:"pt"),u=Object(o.a)(j,2),d=u[0],b=u[1],O=Object(r.useState)({}),h=Object(o.a)(O,2),x=h[0],v=h[1],m=Object(U.a)(Object(F.a)(z.a.mark((function t(){var a,r;return z.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(!(e&&l&&d)){t.next=15;break}return"/tdr",t.next=4,fetch("".concat("/tdr","/").concat(l,"-").concat(d,".json"));case 4:if(!(a=t.sent).body){t.next=11;break}return t.next=8,a.json();case 8:t.t0=t.sent,t.next=12;break;case 11:t.t0={};case 12:return r=t.t0,v(r),t.abrupt("return",r);case 15:case"end":return t.stop()}}),t)}))),[l,d]),p=m.value,g=m.loading,f=m.error,N=function(e){e.language&&e.language!==d&&b(e.language),e.resourceName&&e.resourceName!==l&&i(e.resourceName)};return{resourceName:l,setResourceName:i,language:d,setLanguage:b,response:x,loading:g,error:f,hasResponseData:Boolean(p),updateResource:N}}function G(e){var t=e.data,a=Object(r.useMemo)((function(){return Object.values(t).reduce((function(e,t){return e["level".concat(t.level)]+=1,e.total+=1,e}),{level0:0,level1:0,level2:0,level3:0,level4:0,total:0})}),[t]),c=a.level0,n=a.level1,s=a.level2,l=a.level3,i=a.level4,o=a.total;return Object(b.jsxs)("div",{className:"",children:[Object(b.jsxs)(v.a.Title,{level:3,children:["Levels (",o,")"]}),Object(b.jsxs)("div",{children:["Level 0: ",c]}),Object(b.jsxs)("div",{children:["Level 1: ",n]}),Object(b.jsxs)("div",{children:["Level 2: ",s]}),Object(b.jsxs)("div",{children:["Level 3: ",l]}),Object(b.jsxs)("div",{children:["Level 4: ",i]})]})}function M(e){var t=e.response,a=e.property,c=Object(r.useState)({}),n=Object(o.a)(c,2),s=n[0],l=n[1];return Object(b.jsxs)("div",{className:"parser-flex-column",children:[Object(b.jsx)(v.a.Title,{level:2,children:"Search Similar"}),Object(b.jsx)(p.a,{type:"text",onChange:function(e){var r=e.target.value,c=w((void 0===r?"":r).trim().toLowerCase());c&&c.length>=2?l(function(e,t){var a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"text",r={},c=w(e.trim().toLowerCase());return!c||c.length<2?{}:(Object.values(t).forEach((function(e){w(e[a].toLowerCase()).includes(c)&&(r[e.id]=e[a])})),r)}(c,t,a)):l({})},placeholder:"Type here"}),Object(b.jsx)(p.a.TextArea,{name:"search-results",id:"",cols:"10",rows:"10",readOnly:!0,value:JSON.stringify(s,null,4)})]})}var Q=v.a.Text,W=v.a.Title;var H=function(){Object(f.a)("Arte Ruim - Parser");var e=["arte-ruim"],t={language:"en",resourceName:e[0]},a=Object(r.useState)({}),c=Object(o.a)(a,2),n=c[0],s=c[1],l=Object(r.useState)({}),i=Object(o.a)(l,2),j=i[0],u=i[1],d="text",O=V(e,t),h=O.resourceName,v=O.language,N=O.loading,y=O.error,S=O.updateResource,T=O.hasResponseData,L=O.response;return Object(r.useEffect)((function(){L&&(u(function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"text",a={},r={};return Object.values(e).forEach((function(e){e[t]||console.error("Property ".concat(t," does not exist in ").concat(e));var c=w(e[t].toLowerCase());a[c]?(void 0===r[c]&&(r[c]=[a[c].id]),r[c].push(e.id)):a[c]=e})),r}(L,d)),s(L))}),[L]),Object(b.jsxs)(m.a,{children:[Object(b.jsx)(I,{title:"Arte Ruim Parser",resourceNames:["arte-ruim"],initialValues:t,updateState:S,hasResponseData:T,loading:N,error:y}),Object(b.jsx)(m.a.Content,{className:"content",children:Object(b.jsx)(R,{loading:N,error:y,hasResponseData:T,children:Object(b.jsxs)("div",{className:"parser-container",children:[Object(b.jsxs)("div",{className:"parser-main",children:[Object(b.jsx)(W,{level:2,children:"Adding Data"}),Object(b.jsx)(Q,{children:"Input"}),Object(b.jsx)(p.a.TextArea,{name:"input",id:"",cols:"15",rows:"5",onChange:function(e){var t=e.target.value.split("\n"),a=Object.values(null!==L&&void 0!==L?L:{}),r=Number(a[a.length-1].id.split("-")[1])||1,c=t.reduce((function(e,t,a){if(t){var c="".concat(h[0],"-").concat(r+a+1,"-").concat(v);e[c]={id:c,text:t,level:0}}return e}),Object(x.a)({},L));s(c)}}),Object(b.jsx)(Q,{children:"Output"}),Object(b.jsx)(p.a.TextArea,{name:"output",id:"",cols:"15",rows:"15",readOnly:!0,value:JSON.stringify(n,null,4)}),Object(b.jsx)(Q,{children:"Duplicates"}),Object(b.jsx)(p.a.TextArea,{name:"duplicates",id:"",cols:"15",rows:"3",readOnly:!0,value:JSON.stringify(j)})]}),Object(b.jsxs)("aside",{className:"parser-controls",children:[Object(b.jsx)(G,{data:L}),Object(b.jsx)(g.a,{}),Object(b.jsx)(M,{response:L,property:d})]})]})})})]})},q=a(228),K=v.a.Text,X=v.a.Title;var Y=function(){Object(f.a)("Arte Ruim - Level 4");var e=["arte-ruim"],t={language:"en",resourceName:e[0]},a=Object(r.useState)({}),c=Object(o.a)(a,2),n=c[0],s=c[1],l=Object(r.useState)({}),i=Object(o.a)(l,2),j=i[0],u=i[1],d=Object(r.useState)({}),O=Object(o.a)(d,2),h=O[0],x=O[1],v=Object(r.useState)([]),g=Object(o.a)(v,2),N=g[0],y=g[1],S=V(e,t),T=S.resourceName,L=S.language,w=S.loading,D=S.error,k=S.updateResource,A=S.hasResponseData,C=S.response,E=Object(U.a)(Object(F.a)(z.a.mark((function e(){var t,a;return z.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch("".concat("http://localhost:3000/tdr/resources","/").concat(T,"-extra-").concat(L,".json"));case 2:return t=e.sent,e.next=5,t.json();case 5:return a=e.sent,e.abrupt("return",a);case 7:case"end":return e.stop()}}),e)}))),[L]),P=E.value,J=E.loading,B=E.error;return Object(r.useEffect)((function(){if(!w&&!J&&C&&P){var e=function(e,t){var a=Object.values(t).map((function(e){return e.theme})).sort(),r={},c={},n={};return Object.values(t).forEach((function(t){Object.keys(t.cards).forEach((function(t){r[t]?n[t]=e[t].text:r[t]=e[t].text}))})),Object.values(e).forEach((function(e){void 0===r[e.id]&&(c[e.id]=e.text)})),{themes:a,used:r,unused:c,duplicated:n}}(C,P);y(e.themes),s(e.used),u(e.unused),x(e.duplicated)}}),[C,P,w,J]),Object(b.jsxs)(m.a,{children:[Object(b.jsx)(I,{title:"Arte Ruim Level 4",resourceNames:["arte-ruim"],initialValues:t,updateState:k,hasResponseData:A&&Boolean(P),loading:w||J,error:D||B}),Object(b.jsx)(m.a.Content,{className:"content",children:Object(b.jsx)(R,{loading:w||J,error:D||B,children:Object(b.jsxs)("div",{className:"parser-container",children:[Object(b.jsxs)("div",{className:"parser-main",children:[Object(b.jsxs)(X,{level:2,children:["Used in Groups (",Object.keys(n).length,")"]}),Object(b.jsx)(p.a.TextArea,{name:"output",id:"",cols:"15",rows:"10",readOnly:!0,value:JSON.stringify(n,null,4)}),Object(b.jsxs)(X,{level:2,children:["Unused in Groups (",Object.keys(j).length,")"]}),Object(b.jsx)(p.a.TextArea,{name:"output",id:"",cols:"15",rows:"10",readOnly:!0,value:JSON.stringify(j,null,4)}),Object(b.jsxs)(X,{level:2,children:["In More than One Group (",Object.keys(h).length,")"]}),Object(b.jsx)(p.a.TextArea,{name:"duplicates",id:"",cols:"15",rows:"5",readOnly:!0,value:JSON.stringify(h,null,4)})]}),Object(b.jsx)("aside",{className:"parser-controls",children:Object(b.jsx)(q.b,{header:Object(b.jsx)(X,{level:2,children:"Themes"}),bordered:!0,dataSource:N,size:"small",renderItem:function(e){return Object(b.jsxs)(q.b.Item,{children:[Object(b.jsx)(K,{mark:!0})," ",e]})}})})]})})})]})};a(1),v.a.Text,v.a.Title;var Z=function(){Object(f.a)("Arte Ruim - Other");var e=$.reduce((function(e,t,a){var r="lc-".concat(a+1,"-pt");return e[r]={id:r,text:t.text},e}),{});return Object(b.jsxs)(m.a,{children:[Object(b.jsx)(k.a,{title:"Other",onBack:function(){}}),Object(b.jsx)(g.a,{}),Object(b.jsx)(m.a.Content,{className:"content",children:Object(b.jsx)("div",{className:"a",children:Object(b.jsx)(p.a.TextArea,{name:"search-results",id:"",cols:"10",rows:"10",readOnly:!0,value:JSON.stringify(e,null,4)})})})]})};var $=[],_=v.a.Text,ee=v.a.Title;var te=function(){Object(f.a)("Resource");var e=Object(r.useState)({}),t=Object(o.a)(e,2),a=t[0],c=t[1],n=V(T,{}),s=n.resourceName,l=n.language,i=n.loading,j=n.error,u=n.updateResource,d=n.hasResponseData,O=n.response,h=P({resourceName:s,language:l},u).params;return Object(r.useEffect)((function(){O&&c(O)}),[O]),Object(b.jsxs)(m.a,{children:[Object(b.jsx)(I,{title:"Data for ".concat(s,"-").concat(l),resourceNames:T,values:h,updateState:u,hasResponseData:d,loading:i,error:j}),Object(b.jsx)(m.a.Content,{className:"content",children:Object(b.jsx)(R,{loading:i,error:j,hasResponseData:d,children:Object(b.jsxs)("div",{className:"parser-container",children:[Object(b.jsxs)("div",{className:"parser-main",children:[Object(b.jsx)(ee,{level:2,children:"Data"}),Object(b.jsx)(_,{children:"Output"}),Object(b.jsx)(p.a.TextArea,{name:"output",id:"",cols:"15",rows:"15",readOnly:!0,value:JSON.stringify(a,null,4)})]}),Object(b.jsx)("aside",{className:"parser-controls",children:Object(b.jsx)(M,{response:O,property:"text"})})]})})})]})};var ae=function(){return Object(b.jsx)("div",{className:"App",children:Object(b.jsx)(l.a,{children:Object(b.jsxs)(i.c,{children:[Object(b.jsx)(i.a,{path:"/arte-ruim/parser",element:Object(b.jsx)(H,{})}),Object(b.jsx)(i.a,{path:"/arte-ruim/level4",element:Object(b.jsx)(Y,{})}),Object(b.jsx)(i.a,{path:"/resource",element:Object(b.jsx)(te,{})}),Object(b.jsx)(i.a,{path:"/other",element:Object(b.jsx)(Z,{})}),Object(b.jsx)(i.a,{path:"/",exact:!0,element:Object(b.jsx)(h,{})})]})})})},re=function(e){e&&e instanceof Function&&a.e(3).then(a.bind(null,234)).then((function(t){var a=t.getCLS,r=t.getFID,c=t.getFCP,n=t.getLCP,s=t.getTTFB;a(e),r(e),c(e),n(e),s(e)}))};s.a.render(Object(b.jsx)(c.a.StrictMode,{children:Object(b.jsx)(ae,{})}),document.getElementById("root")),re()}},[[220,1,2]]]);
//# sourceMappingURL=main.342fddb2.chunk.js.map