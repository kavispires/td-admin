import{g as ft,m as Ot,p as wt,e as ot,K as z,d as N,r as d,C as X,q as jt,c as R,b as Et,s as pt,R as $,t as et,v as Zt,w as It,x as Nt,y as Xt,z as Bt,A as Ut,f as Yt,E as Jt,F as Kt,G as Qt,a as gt,_ as bt,j as u,I as te,o as ee,J as oe,P as ne,L as yt}from"./index-oik76Yce.js";import{u as Rt,R as re,I as ae}from"./RelationshipsStats-BzKtj0e8.js";import{T as ie}from"./TransparentButton-CsyHwFDG.js";import{I as se}from"./IdTag-BA_hWBS3.js";import{D as le}from"./DataLoadingWrapper-B2D8XxnP.js";import{l as mt}from"./lodash-Vop7Mp14.js";import{I as ce}from"./ImageCard-Cfj0d6gN.js";import{R as de}from"./RelationshipCountTag-0KcmJAfm.js";import{u as ue}from"./useMeasure-Di1fT8h1.js";import{C as me}from"./index-C_m9foa2.js";import{R as fe}from"./VerticalAlignTopOutlined-BfnXB43r.js";import{g as pe,s as ge}from"./scrollTo-DdZFo67F.js";import{t as be}from"./throttleByAnimationFrame-B11r44Lm.js";import{R as Pt}from"./FileTextOutlined-Dt2H3k2a.js";import{R as he}from"./Item-Ba0f751c.js";import{c as $t,a as dt}from"./FilterEntries-2k4jljom.js";import{R as ve}from"./ResponseState-B5_bxiNt.js";import{D as ye}from"./DownloadButton-Dg0aFjjM.js";import{S as $e}from"./SaveButton-By4PzGJ5.js";import{P as Ce}from"./useBaseUrl-8KF9RGGJ.js";import{S as ut}from"./SiderContent-2txor-6k.js";import{T as xe,c as Se,C as Oe}from"./constants-TZCB7cTe.js";import{F as we}from"./index-BPF7_s59.js";import"./hooks-Yn5PEjDs.js";import"./index-C4Fw4qmq.js";import"./useMutation-CthqUVjk.js";import"./useQueryParams-Df1JeVTl.js";import"./index-Bi3uYhXZ.js";import"./useCopyToClipboardFunction-BFhTS2ay.js";import"./index-4_11IMf3.js";import"./util-CeAI_f06.js";import"./index-CBA8eTtm.js";import"./PlusOutlined-CQT3z5rK.js";import"./index-BT_-hxwD.js";import"./index-C8FScIXC.js";import"./index-BPMAy79T.js";import"./moment-C5S46NFB.js";import"./SaveOutlined-DX5pS_DM.js";import"./gapSize-U1swVQyS.js";const je=new z("antStatusProcessing",{"0%":{transform:"scale(0.8)",opacity:.5},"100%":{transform:"scale(2.4)",opacity:0}}),Ee=new z("antZoomBadgeIn",{"0%":{transform:"scale(0) translate(50%, -50%)",opacity:0},"100%":{transform:"scale(1) translate(50%, -50%)"}}),Ie=new z("antZoomBadgeOut",{"0%":{transform:"scale(1) translate(50%, -50%)"},"100%":{transform:"scale(0) translate(50%, -50%)",opacity:0}}),Ne=new z("antNoWrapperZoomBadgeIn",{"0%":{transform:"scale(0)",opacity:0},"100%":{transform:"scale(1)"}}),Be=new z("antNoWrapperZoomBadgeOut",{"0%":{transform:"scale(1)"},"100%":{transform:"scale(0)",opacity:0}}),Re=new z("antBadgeLoadingCircle",{"0%":{transformOrigin:"50%"},"100%":{transform:"translate(50%, -50%) rotate(360deg)",transformOrigin:"50%"}}),Pe=t=>{const{componentCls:n,iconCls:r,antCls:e,badgeShadowSize:o,textFontSize:i,textFontSizeSM:s,statusSize:g,dotSize:m,textFontWeight:f,indicatorHeight:l,indicatorHeightSM:a,marginXS:b,calc:h}=t,c=`${e}-scroll-number`,v=wt(t,(C,x)=>{let{darkColor:y}=x;return{[`&${n} ${n}-color-${C}`]:{background:y,[`&:not(${n}-count)`]:{color:y},"a:hover &":{background:y}}}});return{[n]:Object.assign(Object.assign(Object.assign(Object.assign({},ot(t)),{position:"relative",display:"inline-block",width:"fit-content",lineHeight:1,[`${n}-count`]:{display:"inline-flex",justifyContent:"center",zIndex:t.indicatorZIndex,minWidth:l,height:l,color:t.badgeTextColor,fontWeight:f,fontSize:i,lineHeight:N(l),whiteSpace:"nowrap",textAlign:"center",background:t.badgeColor,borderRadius:h(l).div(2).equal(),boxShadow:`0 0 0 ${N(o)} ${t.badgeShadowColor}`,transition:`background ${t.motionDurationMid}`,a:{color:t.badgeTextColor},"a:hover":{color:t.badgeTextColor},"a:hover &":{background:t.badgeColorHover}},[`${n}-count-sm`]:{minWidth:a,height:a,fontSize:s,lineHeight:N(a),borderRadius:h(a).div(2).equal()},[`${n}-multiple-words`]:{padding:`0 ${N(t.paddingXS)}`,bdi:{unicodeBidi:"plaintext"}},[`${n}-dot`]:{zIndex:t.indicatorZIndex,width:m,minWidth:m,height:m,background:t.badgeColor,borderRadius:"100%",boxShadow:`0 0 0 ${N(o)} ${t.badgeShadowColor}`},[`${n}-count, ${n}-dot, ${c}-custom-component`]:{position:"absolute",top:0,insetInlineEnd:0,transform:"translate(50%, -50%)",transformOrigin:"100% 0%",[`&${r}-spin`]:{animationName:Re,animationDuration:"1s",animationIterationCount:"infinite",animationTimingFunction:"linear"}},[`&${n}-status`]:{lineHeight:"inherit",verticalAlign:"baseline",[`${n}-status-dot`]:{position:"relative",top:-1,display:"inline-block",width:g,height:g,verticalAlign:"middle",borderRadius:"50%"},[`${n}-status-success`]:{backgroundColor:t.colorSuccess},[`${n}-status-processing`]:{overflow:"visible",color:t.colorInfo,backgroundColor:t.colorInfo,borderColor:"currentcolor","&::after":{position:"absolute",top:0,insetInlineStart:0,width:"100%",height:"100%",borderWidth:o,borderStyle:"solid",borderColor:"inherit",borderRadius:"50%",animationName:je,animationDuration:t.badgeProcessingDuration,animationIterationCount:"infinite",animationTimingFunction:"ease-in-out",content:'""'}},[`${n}-status-default`]:{backgroundColor:t.colorTextPlaceholder},[`${n}-status-error`]:{backgroundColor:t.colorError},[`${n}-status-warning`]:{backgroundColor:t.colorWarning},[`${n}-status-text`]:{marginInlineStart:b,color:t.colorText,fontSize:t.fontSize}}}),v),{[`${n}-zoom-appear, ${n}-zoom-enter`]:{animationName:Ee,animationDuration:t.motionDurationSlow,animationTimingFunction:t.motionEaseOutBack,animationFillMode:"both"},[`${n}-zoom-leave`]:{animationName:Ie,animationDuration:t.motionDurationSlow,animationTimingFunction:t.motionEaseOutBack,animationFillMode:"both"},[`&${n}-not-a-wrapper`]:{[`${n}-zoom-appear, ${n}-zoom-enter`]:{animationName:Ne,animationDuration:t.motionDurationSlow,animationTimingFunction:t.motionEaseOutBack},[`${n}-zoom-leave`]:{animationName:Be,animationDuration:t.motionDurationSlow,animationTimingFunction:t.motionEaseOutBack},[`&:not(${n}-status)`]:{verticalAlign:"middle"},[`${c}-custom-component, ${n}-count`]:{transform:"none"},[`${c}-custom-component, ${c}`]:{position:"relative",top:"auto",display:"block",transformOrigin:"50% 50%"}},[c]:{overflow:"hidden",transition:`all ${t.motionDurationMid} ${t.motionEaseOutBack}`,[`${c}-only`]:{position:"relative",display:"inline-block",height:l,transition:`all ${t.motionDurationSlow} ${t.motionEaseOutBack}`,WebkitTransformStyle:"preserve-3d",WebkitBackfaceVisibility:"hidden",[`> p${c}-only-unit`]:{height:l,margin:0,WebkitTransformStyle:"preserve-3d",WebkitBackfaceVisibility:"hidden"}},[`${c}-symbol`]:{verticalAlign:"top"}},"&-rtl":{direction:"rtl",[`${n}-count, ${n}-dot, ${c}-custom-component`]:{transform:"translate(-50%, -50%)"}}})}},zt=t=>{const{fontHeight:n,lineWidth:r,marginXS:e,colorBorderBg:o}=t,i=n,s=r,g=t.colorTextLightSolid,m=t.colorError,f=t.colorErrorHover;return Ot(t,{badgeFontHeight:i,badgeShadowSize:s,badgeTextColor:g,badgeColor:m,badgeColorHover:f,badgeShadowColor:o,badgeProcessingDuration:"1.2s",badgeRibbonOffset:e,badgeRibbonCornerTransform:"scaleY(0.75)",badgeRibbonCornerFilter:"brightness(75%)"})},Tt=t=>{const{fontSize:n,lineHeight:r,fontSizeSM:e,lineWidth:o}=t;return{indicatorZIndex:"auto",indicatorHeight:Math.round(n*r)-2*o,indicatorHeightSM:n,dotSize:e/2,textFontSize:e,textFontSizeSM:e,textFontWeight:"normal",statusSize:e/2}},ze=ft("Badge",t=>{const n=zt(t);return Pe(n)},Tt),Te=t=>{const{antCls:n,badgeFontHeight:r,marginXS:e,badgeRibbonOffset:o,calc:i}=t,s=`${n}-ribbon`,g=`${n}-ribbon-wrapper`,m=wt(t,(f,l)=>{let{darkColor:a}=l;return{[`&${s}-color-${f}`]:{background:a,color:a}}});return{[g]:{position:"relative"},[s]:Object.assign(Object.assign(Object.assign(Object.assign({},ot(t)),{position:"absolute",top:e,padding:`0 ${N(t.paddingXS)}`,color:t.colorPrimary,lineHeight:N(r),whiteSpace:"nowrap",backgroundColor:t.colorPrimary,borderRadius:t.borderRadiusSM,[`${s}-text`]:{color:t.badgeTextColor},[`${s}-corner`]:{position:"absolute",top:"100%",width:o,height:o,color:"currentcolor",border:`${N(i(o).div(2).equal())} solid`,transform:t.badgeRibbonCornerTransform,transformOrigin:"top",filter:t.badgeRibbonCornerFilter}}),m),{[`&${s}-placement-end`]:{insetInlineEnd:i(o).mul(-1).equal(),borderEndEndRadius:0,[`${s}-corner`]:{insetInlineEnd:0,borderInlineEndColor:"transparent",borderBlockEndColor:"transparent"}},[`&${s}-placement-start`]:{insetInlineStart:i(o).mul(-1).equal(),borderEndStartRadius:0,[`${s}-corner`]:{insetInlineStart:0,borderBlockEndColor:"transparent",borderInlineStartColor:"transparent"}},"&-rtl":{direction:"rtl"}})}},Fe=ft(["Badge","Ribbon"],t=>{const n=zt(t);return Te(n)},Tt),Me=t=>{const{className:n,prefixCls:r,style:e,color:o,children:i,text:s,placement:g="end",rootClassName:m}=t,{getPrefixCls:f,direction:l}=d.useContext(X),a=f("ribbon",r),b=`${a}-wrapper`,[h,c,v]=Fe(a,b),C=jt(o,!1),x=R(a,`${a}-placement-${g}`,{[`${a}-rtl`]:l==="rtl",[`${a}-color-${o}`]:C},n),y={},B={};return o&&!C&&(y.background=o,B.color=o),h(d.createElement("div",{className:R(b,m,c,v)},i,d.createElement("div",{className:R(x,c),style:Object.assign(Object.assign({},y),e)},d.createElement("span",{className:`${a}-text`},s),d.createElement("div",{className:`${a}-corner`,style:B}))))},Ct=t=>{const{prefixCls:n,value:r,current:e,offset:o=0}=t;let i;return o&&(i={position:"absolute",top:`${o}00%`,left:0}),d.createElement("span",{style:i,className:R(`${n}-only-unit`,{current:e})},r)};function _e(t,n,r){let e=t,o=0;for(;(e+10)%10!==n;)e+=r,o+=r;return o}const De=t=>{const{prefixCls:n,count:r,value:e}=t,o=Number(e),i=Math.abs(r),[s,g]=d.useState(o),[m,f]=d.useState(i),l=()=>{g(o),f(i)};d.useEffect(()=>{const h=setTimeout(l,1e3);return()=>clearTimeout(h)},[o]);let a,b;if(s===o||Number.isNaN(o)||Number.isNaN(s))a=[d.createElement(Ct,Object.assign({},t,{key:o,current:!0}))],b={transition:"none"};else{a=[];const h=o+10,c=[];for(let y=o;y<=h;y+=1)c.push(y);const v=m<i?1:-1,C=c.findIndex(y=>y%10===s);a=(v<0?c.slice(0,C+1):c.slice(C)).map((y,B)=>{const F=y%10;return d.createElement(Ct,Object.assign({},t,{key:y,value:F,offset:v<0?B-C:B,current:B===C}))}),b={transform:`translateY(${-_e(s,o,v)}00%)`}}return d.createElement("span",{className:`${n}-only`,style:b,onTransitionEnd:l},a)};var Le=function(t,n){var r={};for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&n.indexOf(e)<0&&(r[e]=t[e]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,e=Object.getOwnPropertySymbols(t);o<e.length;o++)n.indexOf(e[o])<0&&Object.prototype.propertyIsEnumerable.call(t,e[o])&&(r[e[o]]=t[e[o]]);return r};const qe=d.forwardRef((t,n)=>{const{prefixCls:r,count:e,className:o,motionClassName:i,style:s,title:g,show:m,component:f="sup",children:l}=t,a=Le(t,["prefixCls","count","className","motionClassName","style","title","show","component","children"]),{getPrefixCls:b}=d.useContext(X),h=b("scroll-number",r),c=Object.assign(Object.assign({},a),{"data-show":m,style:s,className:R(h,o,i),title:g});let v=e;if(e&&Number(e)%1===0){const C=String(e).split("");v=d.createElement("bdi",null,C.map((x,y)=>d.createElement(De,{prefixCls:h,count:Number(e),value:x,key:C.length-y})))}return s!=null&&s.borderColor&&(c.style=Object.assign(Object.assign({},s),{boxShadow:`0 0 0 1px ${s.borderColor} inset`})),l?Et(l,C=>({className:R(`${h}-custom-component`,C==null?void 0:C.className,i)})):d.createElement(f,Object.assign({},c,{ref:n}),v)});var He=function(t,n){var r={};for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&n.indexOf(e)<0&&(r[e]=t[e]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,e=Object.getOwnPropertySymbols(t);o<e.length;o++)n.indexOf(e[o])<0&&Object.prototype.propertyIsEnumerable.call(t,e[o])&&(r[e[o]]=t[e[o]]);return r};const We=d.forwardRef((t,n)=>{var r,e,o,i,s;const{prefixCls:g,scrollNumberPrefixCls:m,children:f,status:l,text:a,color:b,count:h=null,overflowCount:c=99,dot:v=!1,size:C="default",title:x,offset:y,style:B,className:F,rootClassName:w,classNames:j,styles:S,showZero:O=!1}=t,E=He(t,["prefixCls","scrollNumberPrefixCls","children","status","text","color","count","overflowCount","dot","size","title","offset","style","className","rootClassName","classNames","styles","showZero"]),{getPrefixCls:P,direction:L,badge:p}=d.useContext(X),I=P("badge",g),[U,rt,at]=ze(I),H=h>c?`${c}+`:h,A=H==="0"||H===0,Y=h===null||A&&!O,k=(l!=null||b!=null)&&Y,q=v&&!A,M=q?"":H,W=d.useMemo(()=>(M==null||M===""||A&&!O)&&!q,[M,A,O,q]),J=d.useRef(h);W||(J.current=h);const G=J.current,T=d.useRef(M);W||(T.current=M);const V=T.current,Z=d.useRef(q);W||(Z.current=q);const K=d.useMemo(()=>{if(!y)return Object.assign(Object.assign({},p==null?void 0:p.style),B);const D={marginTop:y[1]};return L==="rtl"?D.left=parseInt(y[0],10):D.right=-parseInt(y[0],10),Object.assign(Object.assign(Object.assign({},D),p==null?void 0:p.style),B)},[L,y,B,p==null?void 0:p.style]),qt=x??(typeof G=="string"||typeof G=="number"?G:void 0),Ht=W||!a?null:d.createElement("span",{className:`${I}-status-text`},a),Wt=!G||typeof G!="object"?void 0:Et(G,D=>({style:Object.assign(Object.assign({},K),D.style)})),Q=jt(b,!1),Gt=R(j==null?void 0:j.indicator,(r=p==null?void 0:p.classNames)===null||r===void 0?void 0:r.indicator,{[`${I}-status-dot`]:k,[`${I}-status-${l}`]:!!l,[`${I}-color-${b}`]:Q}),it={};b&&!Q&&(it.color=b,it.background=b);const vt=R(I,{[`${I}-status`]:k,[`${I}-not-a-wrapper`]:!f,[`${I}-rtl`]:L==="rtl"},F,w,p==null?void 0:p.className,(e=p==null?void 0:p.classNames)===null||e===void 0?void 0:e.root,j==null?void 0:j.root,rt,at);if(!f&&k){const D=K.color;return U(d.createElement("span",Object.assign({},E,{className:vt,style:Object.assign(Object.assign(Object.assign({},S==null?void 0:S.root),(o=p==null?void 0:p.styles)===null||o===void 0?void 0:o.root),K)}),d.createElement("span",{className:Gt,style:Object.assign(Object.assign(Object.assign({},S==null?void 0:S.indicator),(i=p==null?void 0:p.styles)===null||i===void 0?void 0:i.indicator),it)}),a&&d.createElement("span",{style:{color:D},className:`${I}-status-text`},a)))}return U(d.createElement("span",Object.assign({ref:n},E,{className:vt,style:Object.assign(Object.assign({},(s=p==null?void 0:p.styles)===null||s===void 0?void 0:s.root),S==null?void 0:S.root)}),f,d.createElement(pt,{visible:!W,motionName:`${I}-zoom`,motionAppear:!1,motionDeadline:1e3},D=>{let{className:Vt}=D;var st,lt;const At=P("scroll-number",m),ct=Z.current,kt=R(j==null?void 0:j.indicator,(st=p==null?void 0:p.classNames)===null||st===void 0?void 0:st.indicator,{[`${I}-dot`]:ct,[`${I}-count`]:!ct,[`${I}-count-sm`]:C==="small",[`${I}-multiple-words`]:!ct&&V&&V.toString().length>1,[`${I}-status-${l}`]:!!l,[`${I}-color-${b}`]:Q});let tt=Object.assign(Object.assign(Object.assign({},S==null?void 0:S.indicator),(lt=p==null?void 0:p.styles)===null||lt===void 0?void 0:lt.indicator),K);return b&&!Q&&(tt=tt||{},tt.background=b),d.createElement(qe,{prefixCls:At,show:!W,motionClassName:Vt,className:kt,count:V,title:qt,style:tt,key:"scrollNumber"},Wt)}),Ht))}),Ft=We;Ft.Ribbon=Me;const ht=$.createContext(void 0),{Provider:Ge}=ht,Ve=t=>{const{icon:n,description:r,prefixCls:e,className:o}=t,i=$.createElement("div",{className:`${e}-icon`},$.createElement(Pt,null));return $.createElement("div",{onClick:t.onClick,onFocus:t.onFocus,onMouseEnter:t.onMouseEnter,onMouseLeave:t.onMouseLeave,className:R(o,`${e}-content`)},n||r?$.createElement($.Fragment,null,n&&$.createElement("div",{className:`${e}-icon`},n),r&&$.createElement("div",{className:`${e}-description`},r)):i)},Ae=d.memo(Ve),xt=t=>t===0?0:t-Math.sqrt(Math.pow(t,2)/2),ke=t=>{const{componentCls:n,floatButtonSize:r,motionDurationSlow:e,motionEaseInOutCirc:o,calc:i}=t,s=new z("antFloatButtonMoveTopIn",{"0%":{transform:`translate3d(0, ${N(r)}, 0)`,transformOrigin:"0 0",opacity:0},"100%":{transform:"translate3d(0, 0, 0)",transformOrigin:"0 0",opacity:1}}),g=new z("antFloatButtonMoveTopOut",{"0%":{transform:"translate3d(0, 0, 0)",transformOrigin:"0 0",opacity:1},"100%":{transform:`translate3d(0, ${N(r)}, 0)`,transformOrigin:"0 0",opacity:0}}),m=new z("antFloatButtonMoveRightIn",{"0%":{transform:`translate3d(${i(r).mul(-1).equal()}, 0, 0)`,transformOrigin:"0 0",opacity:0},"100%":{transform:"translate3d(0, 0, 0)",transformOrigin:"0 0",opacity:1}}),f=new z("antFloatButtonMoveRightOut",{"0%":{transform:"translate3d(0, 0, 0)",transformOrigin:"0 0",opacity:1},"100%":{transform:`translate3d(${i(r).mul(-1).equal()}, 0, 0)`,transformOrigin:"0 0",opacity:0}}),l=new z("antFloatButtonMoveBottomIn",{"0%":{transform:`translate3d(0, ${i(r).mul(-1).equal()}, 0)`,transformOrigin:"0 0",opacity:0},"100%":{transform:"translate3d(0, 0, 0)",transformOrigin:"0 0",opacity:1}}),a=new z("antFloatButtonMoveBottomOut",{"0%":{transform:"translate3d(0, 0, 0)",transformOrigin:"0 0",opacity:1},"100%":{transform:`translate3d(0, ${i(r).mul(-1).equal()}, 0)`,transformOrigin:"0 0",opacity:0}}),b=new z("antFloatButtonMoveLeftIn",{"0%":{transform:`translate3d(${N(r)}, 0, 0)`,transformOrigin:"0 0",opacity:0},"100%":{transform:"translate3d(0, 0, 0)",transformOrigin:"0 0",opacity:1}}),h=new z("antFloatButtonMoveLeftOut",{"0%":{transform:"translate3d(0, 0, 0)",transformOrigin:"0 0",opacity:1},"100%":{transform:`translate3d(${N(r)}, 0, 0)`,transformOrigin:"0 0",opacity:0}}),c=`${n}-group`;return[{[c]:{[`&${c}-top ${c}-wrap`]:et(`${c}-wrap`,s,g,e,!0),[`&${c}-bottom ${c}-wrap`]:et(`${c}-wrap`,l,a,e,!0),[`&${c}-left ${c}-wrap`]:et(`${c}-wrap`,b,h,e,!0),[`&${c}-right ${c}-wrap`]:et(`${c}-wrap`,m,f,e,!0)}},{[`${c}-wrap`]:{[`&${c}-wrap-enter, &${c}-wrap-appear`]:{opacity:0,animationTimingFunction:o},[`&${c}-wrap-leave`]:{opacity:1,animationTimingFunction:o}}}]},Ze=t=>{const{antCls:n,componentCls:r,floatButtonSize:e,margin:o,borderRadiusLG:i,borderRadiusSM:s,badgeOffset:g,floatButtonBodyPadding:m,zIndexPopupBase:f,calc:l}=t,a=`${r}-group`;return{[a]:Object.assign(Object.assign({},ot(t)),{zIndex:f,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",border:"none",position:"fixed",height:"auto",boxShadow:"none",minWidth:e,minHeight:e,insetInlineEnd:t.floatButtonInsetInlineEnd,bottom:t.floatButtonInsetBlockEnd,borderRadius:i,[`${a}-wrap`]:{zIndex:-1,display:"flex",justifyContent:"center",alignItems:"center",position:"absolute"},[`&${a}-rtl`]:{direction:"rtl"},[r]:{position:"static"}}),[`${a}-top > ${a}-wrap`]:{flexDirection:"column",top:"auto",bottom:l(e).add(o).equal(),"&::after":{content:'""',position:"absolute",width:"100%",height:o,bottom:l(o).mul(-1).equal()}},[`${a}-bottom > ${a}-wrap`]:{flexDirection:"column",top:l(e).add(o).equal(),bottom:"auto","&::after":{content:'""',position:"absolute",width:"100%",height:o,top:l(o).mul(-1).equal()}},[`${a}-right > ${a}-wrap`]:{flexDirection:"row",left:{_skip_check_:!0,value:l(e).add(o).equal()},right:{_skip_check_:!0,value:"auto"},"&::after":{content:'""',position:"absolute",width:o,height:"100%",left:{_skip_check_:!0,value:l(o).mul(-1).equal()}}},[`${a}-left > ${a}-wrap`]:{flexDirection:"row",left:{_skip_check_:!0,value:"auto"},right:{_skip_check_:!0,value:l(e).add(o).equal()},"&::after":{content:'""',position:"absolute",width:o,height:"100%",right:{_skip_check_:!0,value:l(o).mul(-1).equal()}}},[`${a}-circle`]:{gap:o,[`${a}-wrap`]:{gap:o}},[`${a}-square`]:{[`${r}-square`]:{padding:0,borderRadius:0,[`&${a}-trigger`]:{borderRadius:i},"&:first-child":{borderStartStartRadius:i,borderStartEndRadius:i},"&:last-child":{borderEndStartRadius:i,borderEndEndRadius:i},"&:not(:last-child)":{borderBottom:`${N(t.lineWidth)} ${t.lineType} ${t.colorSplit}`},[`${n}-badge`]:{[`${n}-badge-count`]:{top:l(l(m).add(g)).mul(-1).equal(),insetInlineEnd:l(l(m).add(g)).mul(-1).equal()}}},[`${a}-wrap`]:{borderRadius:i,boxShadow:t.boxShadowSecondary,[`${r}-square`]:{boxShadow:"none",borderRadius:0,padding:m,[`${r}-body`]:{width:t.floatButtonBodySize,height:t.floatButtonBodySize,borderRadius:s}}}},[`${a}-top > ${a}-wrap, ${a}-bottom > ${a}-wrap`]:{[`> ${r}-square`]:{"&:first-child":{borderStartStartRadius:i,borderStartEndRadius:i},"&:last-child":{borderEndStartRadius:i,borderEndEndRadius:i},"&:not(:last-child)":{borderBottom:`${N(t.lineWidth)} ${t.lineType} ${t.colorSplit}`}}},[`${a}-left > ${a}-wrap, ${a}-right > ${a}-wrap`]:{[`> ${r}-square`]:{"&:first-child":{borderStartStartRadius:i,borderEndStartRadius:i},"&:last-child":{borderStartEndRadius:i,borderEndEndRadius:i},"&:not(:last-child)":{borderInlineEnd:`${N(t.lineWidth)} ${t.lineType} ${t.colorSplit}`}}},[`${a}-circle-shadow`]:{boxShadow:"none"},[`${a}-square-shadow`]:{boxShadow:t.boxShadowSecondary,[`${r}-square`]:{boxShadow:"none",padding:m,[`${r}-body`]:{width:t.floatButtonBodySize,height:t.floatButtonBodySize,borderRadius:s}}}}},Xe=t=>{const{antCls:n,componentCls:r,floatButtonBodyPadding:e,floatButtonIconSize:o,floatButtonSize:i,borderRadiusLG:s,badgeOffset:g,dotOffsetInSquare:m,dotOffsetInCircle:f,zIndexPopupBase:l,calc:a}=t;return{[r]:Object.assign(Object.assign({},ot(t)),{border:"none",position:"fixed",cursor:"pointer",zIndex:l,display:"block",width:i,height:i,insetInlineEnd:t.floatButtonInsetInlineEnd,bottom:t.floatButtonInsetBlockEnd,boxShadow:t.boxShadowSecondary,"&-pure":{position:"relative",inset:"auto"},"&:empty":{display:"none"},[`${n}-badge`]:{width:"100%",height:"100%",[`${n}-badge-count`]:{transform:"translate(0, 0)",transformOrigin:"center",top:a(g).mul(-1).equal(),insetInlineEnd:a(g).mul(-1).equal()}},[`${r}-body`]:{width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center",transition:`all ${t.motionDurationMid}`,[`${r}-content`]:{overflow:"hidden",textAlign:"center",minHeight:i,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:`${N(a(e).div(2).equal())} ${N(e)}`,[`${r}-icon`]:{textAlign:"center",margin:"auto",width:o,fontSize:o,lineHeight:1}}}}),[`${r}-rtl`]:{direction:"rtl"},[`${r}-circle`]:{height:i,borderRadius:"50%",[`${n}-badge`]:{[`${n}-badge-dot`]:{top:f,insetInlineEnd:f}},[`${r}-body`]:{borderRadius:"50%"}},[`${r}-square`]:{height:"auto",minHeight:i,borderRadius:s,[`${n}-badge`]:{[`${n}-badge-dot`]:{top:m,insetInlineEnd:m}},[`${r}-body`]:{height:"auto",borderRadius:s}},[`${r}-default`]:{backgroundColor:t.floatButtonBackgroundColor,transition:`background-color ${t.motionDurationMid}`,[`${r}-body`]:{backgroundColor:t.floatButtonBackgroundColor,transition:`background-color ${t.motionDurationMid}`,"&:hover":{backgroundColor:t.colorFillContent},[`${r}-content`]:{[`${r}-icon`]:{color:t.colorText},[`${r}-description`]:{display:"flex",alignItems:"center",lineHeight:N(t.fontSizeLG),color:t.colorText,fontSize:t.fontSizeSM}}}},[`${r}-primary`]:{backgroundColor:t.colorPrimary,[`${r}-body`]:{backgroundColor:t.colorPrimary,transition:`background-color ${t.motionDurationMid}`,"&:hover":{backgroundColor:t.colorPrimaryHover},[`${r}-content`]:{[`${r}-icon`]:{color:t.colorTextLightSolid},[`${r}-description`]:{display:"flex",alignItems:"center",lineHeight:N(t.fontSizeLG),color:t.colorTextLightSolid,fontSize:t.fontSizeSM}}}}}},Ue=t=>({dotOffsetInCircle:xt(t.controlHeightLG/2),dotOffsetInSquare:xt(t.borderRadiusLG)}),Mt=ft("FloatButton",t=>{const{colorTextLightSolid:n,colorBgElevated:r,controlHeightLG:e,marginXXL:o,marginLG:i,fontSize:s,fontSizeIcon:g,controlItemBgHover:m,paddingXXS:f,calc:l}=t,a=Ot(t,{floatButtonBackgroundColor:r,floatButtonColor:n,floatButtonHoverBackgroundColor:m,floatButtonFontSize:s,floatButtonIconSize:l(g).mul(1.5).equal(),floatButtonSize:e,floatButtonInsetBlockEnd:o,floatButtonInsetInlineEnd:i,floatButtonBodySize:l(e).sub(l(f).mul(2)).equal(),floatButtonBodyPadding:f,badgeOffset:l(f).mul(1.5).equal()});return[Ze(a),Xe(a),Zt(t),ke(a)]},Ue);var Ye=function(t,n){var r={};for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&n.indexOf(e)<0&&(r[e]=t[e]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,e=Object.getOwnPropertySymbols(t);o<e.length;o++)n.indexOf(e[o])<0&&Object.prototype.propertyIsEnumerable.call(t,e[o])&&(r[e[o]]=t[e[o]]);return r};const nt="float-btn",Je=$.forwardRef((t,n)=>{const{prefixCls:r,className:e,rootClassName:o,style:i,type:s="default",shape:g="circle",icon:m,description:f,tooltip:l,htmlType:a="button",badge:b={}}=t,h=Ye(t,["prefixCls","className","rootClassName","style","type","shape","icon","description","tooltip","htmlType","badge"]),{getPrefixCls:c,direction:v}=d.useContext(X),C=d.useContext(ht),x=c(nt,r),y=It(x),[B,F,w]=Mt(x,y),j=C||g,S=R(F,w,y,x,e,o,`${x}-${s}`,`${x}-${j}`,{[`${x}-rtl`]:v==="rtl"}),[O]=Nt("FloatButton",i==null?void 0:i.zIndex),E=Object.assign(Object.assign({},i),{zIndex:O}),P=Xt(b,["title","children","status","text"]),L=d.useMemo(()=>({prefixCls:x,description:f,icon:m,type:s}),[x,f,m,s]);let p=$.createElement("div",{className:`${x}-body`},$.createElement(Ae,Object.assign({},L)));return"badge"in t&&(p=$.createElement(Ft,Object.assign({},P),p)),"tooltip"in t&&(p=$.createElement(Bt,{title:l,placement:v==="rtl"?"right":"left"},p)),B(t.href?$.createElement("a",Object.assign({ref:n},h,{className:S,style:E}),p):$.createElement("button",Object.assign({ref:n},h,{className:S,style:E,type:a}),p))}),_=Je;var Ke=function(t,n){var r={};for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&n.indexOf(e)<0&&(r[e]=t[e]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,e=Object.getOwnPropertySymbols(t);o<e.length;o++)n.indexOf(e[o])<0&&Object.prototype.propertyIsEnumerable.call(t,e[o])&&(r[e[o]]=t[e[o]]);return r};const _t=$.forwardRef((t,n)=>{const{prefixCls:r,className:e,type:o="default",shape:i="circle",visibilityHeight:s=400,icon:g=$.createElement(fe,null),target:m,onClick:f,duration:l=450}=t,a=Ke(t,["prefixCls","className","type","shape","visibilityHeight","icon","target","onClick","duration"]),[b,h]=d.useState(s===0),c=$.useRef(null);$.useImperativeHandle(n,()=>({nativeElement:c.current}));const v=()=>{var O;return((O=c.current)===null||O===void 0?void 0:O.ownerDocument)||window},C=be(O=>{const E=pe(O.target);h(E>=s)});d.useEffect(()=>{const E=(m||v)();return C({target:E}),E==null||E.addEventListener("scroll",C),()=>{C.cancel(),E==null||E.removeEventListener("scroll",C)}},[m]);const x=O=>{ge(0,{getContainer:m||v,duration:l}),f==null||f(O)},{getPrefixCls:y}=d.useContext(X),B=y(nt,r),F=y(),j=d.useContext(ht)||i,S=Object.assign({prefixCls:B,icon:g,type:o,shape:j},a);return $.createElement(pt,{visible:b,motionName:`${F}-fade`},(O,E)=>{let{className:P}=O;return $.createElement(_,Object.assign({ref:Ut(c,E)},S,{onClick:x,className:R(e,P)}))})});var Qe=function(t,n){var r={};for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&n.indexOf(e)<0&&(r[e]=t[e]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,e=Object.getOwnPropertySymbols(t);o<e.length;o++)n.indexOf(e[o])<0&&Object.prototype.propertyIsEnumerable.call(t,e[o])&&(r[e[o]]=t[e[o]]);return r};const Dt=t=>{var n;const{prefixCls:r,className:e,style:o,shape:i="circle",type:s="default",placement:g="top",icon:m=$.createElement(Pt,null),closeIcon:f,description:l,trigger:a,children:b,onOpenChange:h,open:c,onClick:v}=t,C=Qe(t,["prefixCls","className","style","shape","type","placement","icon","closeIcon","description","trigger","children","onOpenChange","open","onClick"]),{direction:x,getPrefixCls:y,closeIcon:B}=Yt("floatButtonGroup"),F=(n=f??B)!==null&&n!==void 0?n:$.createElement(Qt,null),w=y(nt,r),j=It(w),[S,O,E]=Mt(w,j),P=`${w}-group`,L=a&&["click","hover"].includes(a),p=g&&["top","left","right","bottom"].includes(g),I=R(P,O,E,j,e,{[`${P}-rtl`]:x==="rtl",[`${P}-${i}`]:i,[`${P}-${i}-shadow`]:!L,[`${P}-${g}`]:L&&p}),[U]=Nt("FloatButton",o==null?void 0:o.zIndex),rt=Object.assign(Object.assign({},o),{zIndex:U}),at=R(O,`${P}-wrap`),[H,A]=Jt(!1,{value:c}),Y=$.useRef(null),k=a==="hover",q=a==="click",M=Kt(T=>{H!==T&&(A(T),h==null||h(T))}),W=()=>{k&&M(!0)},J=()=>{k&&M(!1)},G=T=>{q&&M(!H),v==null||v(T)};return $.useEffect(()=>{if(q){const T=V=>{var Z;!((Z=Y.current)===null||Z===void 0)&&Z.contains(V.target)||M(!1)};return document.addEventListener("click",T,{capture:!0}),()=>document.removeEventListener("click",T,{capture:!0})}},[q]),S($.createElement(Ge,{value:i},$.createElement("div",{ref:Y,className:I,style:rt,onMouseEnter:W,onMouseLeave:J},L?$.createElement($.Fragment,null,$.createElement(pt,{visible:H,motionName:`${P}-wrap`},T=>{let{className:V}=T;return $.createElement("div",{className:R(V,at)},b)}),$.createElement(_,Object.assign({type:s,icon:H?F:m,description:l,"aria-label":t["aria-label"],className:`${P}-trigger`,onClick:G},C))):b)))};var Lt=function(t,n){var r={};for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&n.indexOf(e)<0&&(r[e]=t[e]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,e=Object.getOwnPropertySymbols(t);o<e.length;o++)n.indexOf(e[o])<0&&Object.prototype.propertyIsEnumerable.call(t,e[o])&&(r[e[o]]=t[e[o]]);return r};const St=t=>{var{backTop:n}=t,r=Lt(t,["backTop"]);return n?d.createElement(_t,Object.assign({},r,{visibilityHeight:0})):d.createElement(_,Object.assign({},r))},to=t=>{var{className:n,items:r}=t,e=Lt(t,["className","items"]);const{prefixCls:o}=e,{getPrefixCls:i}=d.useContext(X),g=`${i(nt,o)}-pure`;return r?d.createElement(Dt,Object.assign({className:R(n,g)},e),r.map((m,f)=>d.createElement(St,Object.assign({key:f},m)))):d.createElement(St,Object.assign({className:R(n,g)},e))};_.BackTop=_t;_.Group=Dt;_._InternalPanelDoNotUseOrYouWillBeFired=to;var eo={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"defs",attrs:{},children:[{tag:"style",attrs:{}}]},{tag:"path",attrs:{d:"M342 88H120c-17.7 0-32 14.3-32 32v224c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16V168h174c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16zm578 576h-48c-8.8 0-16 7.2-16 16v176H682c-8.8 0-16 7.2-16 16v48c0 8.8 7.2 16 16 16h222c17.7 0 32-14.3 32-32V680c0-8.8-7.2-16-16-16zM342 856H168V680c0-8.8-7.2-16-16-16h-48c-8.8 0-16 7.2-16 16v224c0 17.7 14.3 32 32 32h222c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16zM904 88H682c-8.8 0-16 7.2-16 16v48c0 8.8 7.2 16 16 16h174v176c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16V120c0-17.7-14.3-32-32-32z"}}]},name:"expand",theme:"outlined"},oo=function(n,r){return d.createElement(gt,bt({},n,{ref:r,icon:eo}))},no=d.forwardRef(oo),ro={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M752 100c-61.8 0-112 50.2-112 112 0 47.7 29.9 88.5 72 104.6v27.6L512 601.4 312 344.2v-27.6c42.1-16.1 72-56.9 72-104.6 0-61.8-50.2-112-112-112s-112 50.2-112 112c0 50.6 33.8 93.5 80 107.3v34.4c0 9.7 3.3 19.3 9.3 27L476 672.3v33.6c-44.2 15-76 56.9-76 106.1 0 61.8 50.2 112 112 112s112-50.2 112-112c0-49.2-31.8-91-76-106.1v-33.6l226.7-291.6c6-7.7 9.3-17.3 9.3-27v-34.4c46.2-13.8 80-56.7 80-107.3 0-61.8-50.2-112-112-112zM224 212a48.01 48.01 0 0196 0 48.01 48.01 0 01-96 0zm336 600a48.01 48.01 0 01-96 0 48.01 48.01 0 0196 0zm192-552a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"}}]},name:"fork",theme:"outlined"},ao=function(n,r){return d.createElement(gt,bt({},n,{ref:r,icon:ro}))},io=d.forwardRef(ao),so={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M168 504.2c1-43.7 10-86.1 26.9-126 17.3-41 42.1-77.7 73.7-109.4S337 212.3 378 195c42.4-17.9 87.4-27 133.9-27s91.5 9.1 133.8 27A341.5 341.5 0 01755 268.8c9.9 9.9 19.2 20.4 27.8 31.4l-60.2 47a8 8 0 003 14.1l175.7 43c5 1.2 9.9-2.6 9.9-7.7l.8-180.9c0-6.7-7.7-10.5-12.9-6.3l-56.4 44.1C765.8 155.1 646.2 92 511.8 92 282.7 92 96.3 275.6 92 503.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8zm756 7.8h-60c-4.4 0-7.9 3.5-8 7.8-1 43.7-10 86.1-26.9 126-17.3 41-42.1 77.8-73.7 109.4A342.45 342.45 0 01512.1 856a342.24 342.24 0 01-243.2-100.8c-9.9-9.9-19.2-20.4-27.8-31.4l60.2-47a8 8 0 00-3-14.1l-175.7-43c-5-1.2-9.9 2.6-9.9 7.7l-.7 181c0 6.7 7.7 10.5 12.9 6.3l56.4-44.1C258.2 868.9 377.8 932 512.2 932c229.2 0 415.5-183.7 419.8-411.8a8 8 0 00-8-8.2z"}}]},name:"sync",theme:"outlined"},lo=function(n,r){return d.createElement(gt,bt({},n,{ref:r,icon:so}))},co=d.forwardRef(lo);function uo(){const{query:{isDirty:t,isSaving:n,save:r,stats:e,...o},randomGroups:{cardIds:i,cards:s,onSelect:g,selection:m,relate:f,nextSet:l,deselectAll:a,cycles:b},showIds:h,cardSize:c}=Rt(),v=d.useRef(null),[C,{width:x}]=ue(),[y,B]=d.useMemo(()=>{const w=Math.floor(x/c)+1,j=Math.floor(x/w);return[w,j]},[c,x]),F=()=>{var w;l(),(w=v.current)==null||w.scrollIntoView({behavior:"smooth"})};return u.jsx(le,{isLoading:o.isLoading,error:o.error,hasResponseData:!mt.isEmpty(o.data),children:u.jsx("div",{ref:C,className:"my-6",children:u.jsxs(me,{title:"Card Relationship Matching",extra:u.jsxs(Bt,{title:"Total cycles",children:[u.jsx(ee,{})," ",b]}),className:"image-card-categorizer-card",ref:v,children:[u.jsx(te.PreviewGroup,{children:u.jsx("div",{className:"image-cards-group",style:{gridTemplateColumns:`repeat(${Math.max(y,1)}, 1fr)`},children:i.map((w,j)=>{const S=m.includes(w),O=s[j];return u.jsx("div",{className:"image-card-card__image",children:u.jsxs(ie,{onClick:()=>g(w),active:S,className:"image-cards-group__button",activeClass:"image-cards-group__button--active",children:[u.jsx(ce,{id:w,width:B-24,preview:!1}),u.jsxs("div",{children:[h&&u.jsx(se,{children:w}),u.jsx(de,{card:O})]})]})},w)})})}),u.jsx(mo,{isSaving:n,isDirty:t,selection:m,relate:f,deselectAll:a,onNextSet:F})]})})})}const mo=({isSaving:t,isDirty:n,selection:r,relate:e,deselectAll:o,onNextSet:i})=>{if(t)return u.jsx(u.Fragment,{children:u.jsx(_,{icon:u.jsx(oe,{})})});const s=()=>{r.length<2||e()};return u.jsxs(u.Fragment,{children:[n&&u.jsx(_,{icon:u.jsx(he,{}),type:"primary",style:{right:234}}),u.jsx(_,{icon:u.jsx(no,{}),style:{right:164},onClick:o}),u.jsx(_,{icon:u.jsx(io,{}),style:{right:94},type:r.length<2?"default":"primary",badge:{count:r.length,size:"small"},onClick:s}),u.jsx(_,{icon:u.jsx(co,{}),style:{right:24},onClick:i})]})};function fo(){const{query:{isDirty:t,isSaving:n,save:r,data:e,isLoading:o,isError:i},randomGroups:{filters:s},showIds:g,setShowIds:m,tagThreshold:f,setTagThreshold:l,sampleSize:a,setSampleSize:b,cardSize:h,setCardSize:c}=Rt();return u.jsxs(Ce,{children:[u.jsx(ut,{children:u.jsxs(we,{vertical:!0,gap:6,children:[u.jsx($e,{isDirty:t,dirt:JSON.stringify(e),onSave:()=>r({}),isSaving:n}),u.jsx(ye,{data:e,fileName:"imageCardsRelationships.json",loading:n,disabled:mt.isEmpty(e),block:!0})]})}),u.jsx(ve,{isLoading:o||n,isDirty:t,isError:i,hasResponseData:!mt.isEmpty(e)}),u.jsxs(ut,{children:[u.jsx($t,{label:"Use Cycles",value:s.useCycles,onChange:()=>s.toggleUseCycles()}),u.jsx($t,{label:"Show Ids",value:g,onChange:v=>m(v)}),u.jsx(dt,{onChange:v=>l(v),value:f,options:xe,label:"Tag Count"}),u.jsx(dt,{onChange:v=>b(v),value:a,options:Se,label:"Sample Size"}),u.jsx(dt,{onChange:v=>c(v),value:h,options:Oe,label:"Card Size"})]}),u.jsx(ut,{children:u.jsx(re,{})})]})}function Qo(){return u.jsx(ne,{title:"Image Cards",subtitle:"Relationships",children:u.jsx(ae,{children:u.jsxs(yt,{hasSider:!0,children:[u.jsx(fo,{}),u.jsx(yt.Content,{className:"content",children:u.jsx(uo,{})})]})})})}export{Qo as default};
