(()=>{"use strict";var e,t={73149:function(e,t,n){var r=this&&this.__createBinding||(Object.create?function(e,t,n,r){void 0===r&&(r=n),Object.defineProperty(e,r,{enumerable:!0,get:function(){return t[n]}})}:function(e,t,n,r){void 0===r&&(r=n),e[r]=t[n]}),i=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),o=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)"default"!==n&&Object.prototype.hasOwnProperty.call(e,n)&&r(t,e,n);return i(t,e),t},a=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(i,o){function a(e){try{l(r.next(e))}catch(e){o(e)}}function s(e){try{l(r.throw(e))}catch(e){o(e)}}function l(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(a,s)}l((r=r.apply(e,t||[])).next())}))},s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const l=n(85893),u=o(n(67294)),c=s(n(73935)),d=s(n(42152)),f=s(n(30973));n(92029);const p=s(n(49429)),v=n(16214);n(4695),n(46068);const h=s(n(21049)),g=s(n(80983)),b=n(25555),y=n(66607),j=n(45358),m=s(n(97636));new d.default(".clipboard-button"),f.default.extend(h.default);const _=["apng","avif","gif","jpg","jpeg","jfif","pjpeg","pjp","png","svg","webp"],O=({pageResult:e})=>{const[t,n]=(0,u.useState)(""),[r,i]=(0,u.useState)(""),[o,s]=(0,u.useState)(""),[c,d]=(0,u.useState)("");return u.default.useEffect((()=>{a(void 0,void 0,void 0,(function*(){if(!e||!e.revisions)return;const t=function(e){const t=Object.keys(e),n=e[t[t.length-1]],r=n.content.content.main,i=(0,f.default)(r).html();let o="";if("file"in n.content){const e=g.default.lookup(n.content.file.filename)||"application/octet-stream",t=g.default.extension(e)||"unknown",r=((e,t="",n=512)=>{const r=atob(e),i=[];for(let e=0;e<r.length;e+=n){const t=r.slice(e,e+n),o=new Array(t.length);for(let e=0;e<t.length;e++)o[e]=t.charCodeAt(e);const a=new Uint8Array(o);i.push(a)}return new Blob(i,{type:t})})(n.content.file.data,e);o=`<a href='${URL.createObjectURL(r)}' target='_blank' download='${n.content.file.filename}'>Access file</a>`,_.includes(t)&&(o+=`<div><img src='data:${e};base64,`+n.content.file.data+"'></div>")}return i+o}(e.revisions),[r,o]=yield(0,y.verifyPage)({offline_data:e},!1,!0,null);var a,l;a=r,l={serverUrl:"http://offline_verify_page",title:e.title,status:r,details:o},n(l.title),function(e){const t='<div style="color: Black; font-size: larger;">Unknown error</div> Unexpected badge status: '+e,n=b.verificationStatusMap[e]||t;i(n)}(a),function(e){const t=(0,y.formatPageInfo2HTML)(e.serverUrl,e.title,e.status,e.details,!1);s(t)}(l),d(t)}))}),[e]),(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)("div",{dangerouslySetInnerHTML:{__html:r}},void 0),(0,l.jsx)("ul",Object.assign({style:{minWidth:"700px"}},{children:(0,l.jsx)("li",{children:t?"Current Page Title: "+t:"Verification in Progress"},void 0)}),void 0),(0,l.jsx)("div",{dangerouslySetInnerHTML:{__html:o}},void 0),(0,l.jsx)("hr",{},void 0),(0,l.jsx)("div",{dangerouslySetInnerHTML:{__html:c}},void 0),(0,l.jsx)("hr",{},void 0)]},void 0)};c.default.render((0,l.jsx)(u.default.StrictMode,{children:(0,l.jsx)((()=>{const[e,t]=(0,u.useState)([]),n=u.default.useMemo((()=>{const e=new p.default({autoProceed:!0,restrictions:{maxNumberOfFiles:1}});return e.on("complete",(e=>{if(!e.successful||!e.successful[0])return;const n=e.successful[0];n.name.endsWith(".json")?function(e){const n=new FileReader;n.onload=e=>a(this,void 0,void 0,(function*(){if(!(e&&e.target&&e.target.result))return;const n=JSON.parse(e.target.result);"pages"in n&&t(n.pages)})),n.readAsText(e)}(n.data):alert("The file must be in JSON format and extension.")})),e}),[]);return u.default.useEffect((()=>()=>n.close()),[]),(0,l.jsxs)(m.default,Object.assign({pageSubtitle:"OFFLINE"},{children:[(0,l.jsx)(j.Center,Object.assign({marginTop:4},{children:(0,l.jsx)(v.Dashboard,Object.assign({uppy:n},{width:550,height:150,proudlyDisplayPoweredByUppy:!1,hideUploadButton:!0}),void 0)}),void 0),e.map(((e,t)=>(0,l.jsx)(O,{pageResult:e},t)))]}),void 0)}),{},void 0)},void 0),document.getElementById("root"))}},n={};function r(e){var i=n[e];if(void 0!==i)return i.exports;var o=n[e]={id:e,loaded:!1,exports:{}};return t[e].call(o.exports,o,o.exports,r),o.loaded=!0,o.exports}r.m=t,r.amdO={},e=[],r.O=(t,n,i,o)=>{if(!n){var a=1/0;for(c=0;c<e.length;c++){for(var[n,i,o]=e[c],s=!0,l=0;l<n.length;l++)(!1&o||a>=o)&&Object.keys(r.O).every((e=>r.O[e](n[l])))?n.splice(l--,1):(s=!1,o<a&&(a=o));if(s){e.splice(c--,1);var u=i();void 0!==u&&(t=u)}}return t}o=o||0;for(var c=e.length;c>0&&e[c-1][2]>o;c--)e[c]=e[c-1];e[c]=[n,i,o]},r.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return r.d(t,{a:t}),t},r.d=(e,t)=>{for(var n in t)r.o(t,n)&&!r.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},r.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.nmd=e=>(e.paths=[],e.children||(e.children=[]),e),r.j=151,(()=>{var e={151:0};r.O.j=t=>0===e[t];var t=(t,n)=>{var i,o,[a,s,l]=n,u=0;if(a.some((t=>0!==e[t]))){for(i in s)r.o(s,i)&&(r.m[i]=s[i]);if(l)var c=l(r)}for(t&&t(n);u<a.length;u++)o=a[u],r.o(e,o)&&e[o]&&e[o][0](),e[a[u]]=0;return r.O(c)},n=self.webpackChunkchrome_extension_typescript_starter=self.webpackChunkchrome_extension_typescript_starter||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))})();var i=r.O(void 0,[736],(()=>r(73149)));i=r.O(i)})();