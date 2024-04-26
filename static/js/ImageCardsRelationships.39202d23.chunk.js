"use strict";(self.webpackChunktdr=self.webpackChunktdr||[]).push([[997],{7416:(e,s,i)=>{i.r(s),i.d(s,{default:()=>T});var r=i(3990),a=i(6709),n=i(2128),l=i(763),t=i(3477),o=i(2241),c=i(952),d=i(7222),h=i(7691),x=i(7106),g=i(7974),j=i(4988),u=i(7360),m=i(4057),p=i(145),v=i(1492),y=i(184);function C(e){let{card:s}=e;const i=s.length>10?"red":s.length>5?"blue":s.length>0?"green":void 0;return(0,y.jsx)("div",{children:(0,y.jsxs)(c.Z,{color:i,icon:(0,y.jsx)(v.Z,{}),children:[" ",s.length]})})}var Z=i(6173),S=i(2791),f=i(7415);function b(){const{query:{isDirty:e,isSaving:s,save:i,stats:r,...d},randomGroups:{cardIds:x,cards:g,onSelect:j,selection:u,relate:m,nextSet:v,deselectAll:b,cycles:k},showIds:w,cardSize:D}=(0,a.l)(),N=(0,S.useRef)(null),[E,{width:I}]=(0,f.Z)(),[P,T]=(0,S.useMemo)((()=>{const e=Math.floor(I/D)+1;return[e,Math.floor(I/e)]}),[D,I]);return(0,y.jsx)(n.T,{isLoading:d.isLoading,error:d.error,hasResponseData:!(0,l.isEmpty)(d.data),children:(0,y.jsx)("div",{ref:E,className:"my-6",children:(0,y.jsxs)(t.Z,{title:"Card Relationship Matching",extra:(0,y.jsxs)("span",{children:[(0,y.jsx)(h.Z,{})," ",k]}),className:"image-card-categorizer-card",ref:N,children:[(0,y.jsx)(o.Z.PreviewGroup,{children:(0,y.jsx)("div",{className:"image-cards-group",style:{gridTemplateColumns:"repeat(".concat(Math.max(P,1),", 1fr)")},children:x.map(((e,s)=>{const i=u.includes(e),r=g[s];return(0,y.jsx)("div",{className:"image-card-card__image",children:(0,y.jsxs)(Z.F6,{onClick:()=>j(e),active:i,className:"image-cards-group__button",activeClass:"image-cards-group__button--active",children:[(0,y.jsx)(p.f,{id:e,width:T-24,preview:!1}),(0,y.jsxs)("div",{children:[w&&(0,y.jsx)(c.Z,{children:e}),(0,y.jsx)(C,{card:r})]})]})},e)}))})}),(0,y.jsx)(z,{isSaving:s,isDirty:e,selection:u,relate:m,deselectAll:b,onNextSet:()=>{var e;v(),null===(e=N.current)||void 0===e||e.scrollIntoView({behavior:"smooth"})}})]})})})}const z=e=>{let{isSaving:s,isDirty:i,selection:r,relate:a,deselectAll:n,onNextSet:l}=e;if(s)return(0,y.jsx)(y.Fragment,{children:(0,y.jsx)(d.Z,{icon:(0,y.jsx)(x.Z,{})})});return(0,y.jsxs)(y.Fragment,{children:[i&&(0,y.jsx)(d.Z,{icon:(0,y.jsx)(g.Z,{}),type:"primary",style:{right:234}}),(0,y.jsx)(d.Z,{icon:(0,y.jsx)(j.Z,{}),style:{right:164},onClick:n}),(0,y.jsx)(d.Z,{icon:(0,y.jsx)(u.Z,{}),style:{right:94},type:r.length<2?"default":"primary",badge:{count:r.length,size:"small"},onClick:()=>{r.length<2||a()}}),(0,y.jsx)(d.Z,{icon:(0,y.jsx)(m.Z,{}),style:{right:24},onClick:l})]})};var k=i(2556),w=i(7018),D=i(1958),N=i(6591),E=i(4483),I=i(9936);function P(){const{query:{isDirty:e,isSaving:s,save:i,data:r,isLoading:n,isError:t},randomGroups:{filters:o},showIds:c,setShowIds:d,tagThreshold:h,setTagThreshold:x,sampleSize:g,setSampleSize:j,cardSize:u,setCardSize:m}=(0,a.l)();return(0,y.jsxs)(D.p3,{children:[(0,y.jsx)(D.Pd,{children:(0,y.jsx)(k.ZP,{type:"primary",size:"large",icon:(0,y.jsx)(E.Z,{}),onClick:()=>i({}),disabled:!e,loading:s,danger:!0,block:!0,children:"Save"})}),(0,y.jsx)(Z.Th,{isLoading:n||s,isDirty:e,isError:t,hasResponseData:!(0,l.isEmpty)(r)}),(0,y.jsxs)(D.Pd,{children:[(0,y.jsx)(Z.Do,{label:"Use Cycles",value:o.useCycles,onChange:()=>o.toggleUseCycles()}),(0,y.jsx)(Z.Do,{label:"Show Ids",value:c,onChange:e=>d(e)}),(0,y.jsx)(Z.zE,{onChange:e=>x(e),value:h,options:N.VC,label:"Tag Count"}),(0,y.jsx)(Z.zE,{onChange:e=>j(e),value:g,options:N.ZI,label:"Sample Size"}),(0,y.jsx)(Z.zE,{onChange:e=>m(e),value:u,options:N.Hn,label:"Card Size"})]}),(0,y.jsx)(D.Pd,{children:(0,y.jsx)(I.A,{})}),(0,y.jsx)(D.Pd,{children:(0,y.jsx)(w.o,{data:r,fileName:"imageCardsRelationships.json",loading:s,disabled:(0,l.isEmpty)(r),block:!0})})]})}const T=function(){return(0,y.jsx)(D.Xg,{title:"Image Cards",subtitle:"Relationships",children:(0,y.jsx)(a.P,{children:(0,y.jsxs)(r.Z,{hasSider:!0,children:[(0,y.jsx)(P,{}),(0,y.jsx)(r.Z.Content,{className:"content",children:(0,y.jsx)(b,{})})]})})})}}}]);
//# sourceMappingURL=ImageCardsRelationships.39202d23.chunk.js.map