!function(e){function t(s){if(i[s])return i[s].exports;var r=i[s]={i:s,l:!1,exports:{}};return e[s].call(r.exports,r,r.exports,t),r.l=!0,r.exports}var i={};t.m=e,t.c=i,t.d=function(e,i,s){t.o(e,i)||Object.defineProperty(e,i,{configurable:!1,enumerable:!0,get:s})},t.n=function(e){var i=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(i,"a",i),i},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=2)}([function(e,t){var i;i=function(){return this}();try{i=i||Function("return this")()||(0,eval)("this")}catch(e){"object"==typeof window&&(i=window)}e.exports=i},function(e,t){e.exports=XP},function(e,t,i){e.exports=i(3)},function(e,t,i){(function(t){const s="undefined"!=typeof window?window:t,r=s.XP||i(1),n=s.XPEmitter||i(4),a=i(5),l=i(6),o=i(7),u=i(8),c=i(9);e.exports=new r.Class("XPSchema",{extends:n,initialize(e){n.call(this),this.fields=e,this.mapped=r.findDeep(this.fields,e=>e&&r.isString(e.alias,!0))},getField(e){if(r.assertArgument(r.isVoid(e)||r.isString(e,!0),1,"string"),!e)return null;let t=this,i=this.fields,s=e.split(".");return s=s.map(e=>(i=t&&t.fields,e=Object.keys(i||{}).find(t=>e===i[t].alias)||e,t=i&&i[e],e)),r.get(this.fields,s.join("."))||null},filter:{callback:!0,value(e,t,i){r.waterfall([t=>this._assert({item:e},t),i=>i(null,a(this,e,t))],i)}},map:{callback:!0,value(e,t,i){r.waterfall([i=>this._assert({item:e,options:t},i),i=>i(null,this.mapped?l(this,e,t):e)],i)}},restrict:{callback:!0,value(e,t,i){r.waterfall([i=>this._assert({item:e,options:t},i),i=>i(null,o(this,e,t))],i)}},sanitize:{callback:!0,value(e,t,i){r.waterfall([i=>this._assert({item:e,options:t},i),i=>r.attempt(i=>i(null,u(this,e,t)),i)],i)}},validate:{callback:!0,value(e,t,i){r.waterfall([i=>this._assert({item:e,options:t},i),i=>r.attempt(i=>i(null,c(this,e,t)),i)],i)}},_assert:{callback:!0,enumerable:!1,value(e,t){r.iterate(e,(e,t,i)=>e(this["_assert"+r.capitalize(i)](t)),t)}},fields:{set(e){return this.fields||e},validate:e=>!r.isObject(e)&&"Object"},mapped:{set(e){return r.isDefined(this.mapped)?this.mapped:Boolean(e)}},sanitizers:{static:!0,writable:!1,value:Object.freeze(Object.keys(u.sanitizers))},types:{static:!0,writable:!1,value:Object.freeze(Object.keys(c.types))},validators:{static:!0,writable:!1,value:Object.freeze(Object.keys(c.validators))},_assertItem:{enumerable:!1,value:e=>!r.isObject(e)&&r.ValidationError("item","Object")},_assertOptions:{enumerable:!1,value:e=>!r.isVoid(e)&&!r.isObject(e)&&r.ValidationError("options","Object")}}),"undefined"!=typeof window&&(window.XPSchema=e.exports)}).call(t,i(0))},function(e,t){e.exports=XPEmitter},function(e,t,i){(function(t){const s=("undefined"!=typeof window?window:t).XP||i(1);e.exports=function(t,i,r){return Object.keys(i).forEach(n=>{let a=Object.keys(t.fields||{}).find(e=>t.fields[e].alias===n)||n,l=t.fields[a],o=i[n];if(l&&"reserved"!==l.access&&("readonly"!==l.access||r.reading)){if(l.fields||l.recursive)return l.list?void Array.from(s.isArray(o)?o:[]).forEach(i=>s.isObject(i)&&e.exports(l.recursive?t:l,i,r)):s.isObject(o)&&e.exports(l.recursive?t:l,o,r)}else delete i[n]}),i}}).call(t,i(0))},function(e,t,i){(function(t){const s=("undefined"!=typeof window?window:t).XP||i(1);e.exports=function(t,i,r){return Object.keys(i).forEach(n=>{let a=r.reading&&n||Object.keys(t.fields||{}).find(e=>t.fields[e].alias===n)||n,l=t.fields[a]&&t.fields[a].alias||a,o=t.fields[a],u=i[n];if(o&&l!==a&&(i[r.reading?l:a]=u),o&&l!==a&&delete i[r.reading?a:l],o&&(o.fields||o.recursive))return o.list?void Array.from(s.isArray(u)?u:[]).forEach(i=>s.isObject(i)&&e.exports(o.recursive?t:o,i,r)):s.isObject(u)&&e.exports(o.recursive?t:o,u,r)}),i}}).call(t,i(0))},function(e,t,i){(function(t){const s=("undefined"!=typeof window?window:t).XP||i(1);e.exports=function(t,i,r){return Object.keys(i).forEach(r=>{let n=Object.keys(t.fields||{}).find(e=>t.fields[e].alias===r)||r,a=t.fields[n],l=i[r];if(a){if(a.fields||a.recursive)return a.list?void Array.from(s.isArray(l)?l:[]).forEach(i=>s.isObject(i)&&e.exports(a.recursive?t:a,i)):s.isObject(l)&&e.exports(a.recursive?t:a,l)}else delete i[r]}),i}}).call(t,i(0))},function(e,t,i){(function(t){function s(t,i,s){let n=r.isVoid(s.index)&&t.list?"list":"type",a=e.exports.sanitizers[n](r.toUseful(i,!0),t[n]),l=e.exports.validators[n](a,t[n],s.path);if(l)throw l;return a}const r=("undefined"!=typeof window?window:t).XP||i(1);e.exports=function(t,i,n){return Object.keys(t.fields||{}).forEach(a=>{let l=t.fields[a].alias||a,o=t.fields[a],u=n.path?`${n.path}.${l}`:l,c=n.current&&n.current[l];if(i[l]=s(o,n.current||r.isUseful(i[l])||!r.isUseful(o.value)?i[l]:r.isFunction(o.value)?o.value():o.value,{path:u}),!o.list)return r.isObject(i[l])&&(i[l]=e.exports(o.recursive?t:o,i[l],{current:c,path:u}));r.isArray(i[l])&&i[l].forEach((n,a)=>(i[l][a]=n=s(o,n,{path:`${u}.${a}`,index:a}),r.isObject(n)&&(i[l][a]=e.exports(o.recursive?t:o,n,{current:c&&c[a],path:`${u}.${a}`}))))}),i},e.exports.types={boolean:r.isBoolean,date:r.isDate,number:r.isFinite,object:r.isObject,string:r.isString,uuid:r.isUUID},e.exports.sanitizers={list:(e,t)=>t&&r.isVoid(e)?[]:t&&r.isString(e)?e.split(/\s*,\s*/):t&&!r.isArray(e)?[e]:e,type:(e,t)=>(["boolean","date","number","string"].includes(t)&&(e=r.toPrimitive(e,t,!0)),["boolean"].includes(t)?e||!1:r.toDefined(e))},e.exports.validators={list:(e,t,i)=>t&&!r.isArray(e)?r.error(400,`${i?`"${i}"`:"item"} must be a list`):null,type:(t,i,s)=>!e.exports.types[i]||e.exports.types[i](t)||r.isVoid(t)?null:r.error(400,`${s?`"${s}"`:"item"} must be ${i}`)}}).call(t,i(0))},function(e,t,i){(function(t){function s(t,i,s){let n=r.isVoid(s.index)&&t.list?"list":"type",a=e.exports.validators[n](i,t[n],s.path);if(a)throw a;return Object.keys(t).forEach(n=>{if(e.exports.validators[n]&&!["list","type"].includes(n)&&("statement"!==n||s.current)&&r.isTruthy(a=e.exports.validators[n](i,t[n],s.path,s.memento)))throw a}),i}const r=("undefined"!=typeof window?window:t).XP||i(1);e.exports=function(t,i,n){return Object.keys(t.fields||{}).forEach(a=>{let l=t.fields[a].alias||a,o=t.fields[a],u=n.path?`${n.path}.${l}`:l,c=n.current&&n.current[l];if(s(o,i[l],{current:n.current,memento:c,path:u}),!o.list)return r.isObject(i[l])&&e.exports(o.recursive?t:o,i[l],{current:c,path:u});r.isArray(i[l])&&i[l].forEach((i,a)=>(s(o,i,{current:n.current,memento:c&&c[a],path:`${u}.${a}`,index:a}),r.isObject(i)&&e.exports(o.recursive?t:o,i,{current:c&&c[a],path:`${u}.${a}`})))}),i},e.exports.types={boolean:r.isBoolean,date:r.isDate,number:r.isFinite,object:r.isObject,string:r.isString,uuid:r.isUUID},e.exports.validators={list:(e,t,i)=>t&&!r.isArray(e)?r.error(400,`${i?`"${i}"`:"item"} must be a list.`):null,max:(e,t,i)=>!(!r.isFinite(e)||!r.isFinite(t))&&(e>t?r.error(400,`${i?`"${i}"`:"item"} must be up to ${t}.`):null),maxDate:(e,t,i)=>!(!r.isDefined(e=r.toDate(e))||!r.isDefined(t=r.toDate(t)))&&(e>t?r.error(400,`${i?`"${i}"`:"item"} must be up to ${r.toDate(t).toISOString()}.`):null),maxExclusive:(e,t,i)=>!(!r.isFinite(e)||!r.isFinite(t))&&(e>=t?r.error(400,`${i?`"${i}"`:"item"} must be lower than ${t}.`):null),maxExclusiveDate:(e,t,i)=>!(!r.isDefined(e=r.toDate(e))||!r.isDefined(t=r.toDate(t)))&&(e>=t?r.error(400,`${i?`"${i}"`:"item"} must be lower than ${r.toDate(t).toISOString()}.`):null),maxItems:(e,t,i)=>!(!r.isArray(e,!0)||!r.isFinite(t)||t<1)&&(e.length>t?r.error(400,`${i?`"${i}"`:"item"} must be up to ${t} items.`):null),maxLength:(e,t,i)=>!(!r.isString(e)||!r.isFinite(t)||t<1)&&(e.length>t?r.error(400,`${i?`"${i}"`:"item"} must be up to ${t} chars.`):null),min:(e,t,i)=>!(!r.isFinite(e)||!r.isFinite(t))&&(e<t?r.error(400,`${i?`"${i}"`:"item"} must be at least ${t}.`):null),minDate:(e,t,i)=>!(!r.isDefined(e=r.toDate(e))||!r.isDefined(t=r.toDate(t)))&&(e<t?r.error(400,`${i?`"${i}"`:"item"} must be at least ${r.toDate(t).toISOString()}.`):null),minExclusive:(e,t,i)=>!(!r.isFinite(e)||!r.isFinite(t))&&(e<=t?r.error(400,`${i?`"${i}"`:"item"} must be greater than ${t}.`):null),minExclusiveDate:(e,t,i)=>!(!r.isDefined(e=r.toDate(e))||!r.isDefined(t=r.toDate(t)))&&(e<=t?r.error(400,`${i?`"${i}"`:"item"} must be greater than ${r.toDate(t).toISOString()}.`):null),minItems:(e,t,i)=>!(!r.isArray(e,!0)||!r.isFinite(t)||t<1)&&(e.length<t?r.error(400,`${i?`"${i}"`:"item"} must be at least ${t} items.`):null),minLength:(e,t,i)=>!(!r.isString(e)||!r.isFinite(t))&&(e.length<t?r.error(400,`${i?`"${i}"`:"item"} must be at least ${t} chars.`):null),options:(e,t,i)=>!!(r.isUseful(e)&&r.isPrimitive(e)&&r.isArray(t,!0))&&(t.includes(e)?null:r.error(400,`${i?`"${i}"`:"item"} can't be "${e}".`)),pattern:(e,t,i)=>!(!r.isString(e)||!r.isString(t,!0)&&!r.isRegExp(t))&&(r.isVoid(t=r.toRegExp(t))||t.test(e)?null:r.error(400,`${i?`"${i}"`:"item"} can't be "${e}".`)),required:(e,t,i)=>t&&(!r.isUseful(e)||r.isFalse(e)||r.isArray(e,!1))?r.error(400,`${i?`"${i}"`:"item"} must be set.`):null,statement:(e,t,i,s)=>"const"!==t||r.isEquivalent(e,s)?"final"!==t||r.isVoid(s)||r.isEquivalent(e,s)?null:r.error(409,`${i?`"${i}"`:"item"} isn't rewritable.`):r.error(409,`${i?`"${i}"`:"item"} is immutable.`),step:(e,t,i)=>!(!r.isFinite(e)||!r.isFinite(t))&&(e%t!=0?r.error(400,`${i?`"${i}"`:"item"} must be divisible by ${t}.`):null),type:(t,i,s)=>!e.exports.types[i]||e.exports.types[i](t)||r.isVoid(t)?null:r.error(400,`${s?`"${s}"`:"item"} must be ${i}.`),unique:(e,t,i)=>!!r.isArray(e)&&(t&&!r.isUniq(e)?r.error(400,`${i?`"${i}"`:"item"} must be duplicates free.`):null)}}).call(t,i(0))}]);