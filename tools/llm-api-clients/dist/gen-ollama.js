#!/usr/bin/env node

(n=>{var r={};function s(e){var t;return(r[e]||(t=r[e]={i:e,l:!1,exports:{}},n[e].call(t.exports,t,t.exports,s),t.l=!0,t)).exports}s.m=n,s.c=r,s.d=function(e,t,n){s.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},s.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(t,e){if(1&e&&(t=s(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(s.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)s.d(n,r,function(e){return t[e]}.bind(null,r));return n},s.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return s.d(t,"a",t),t},s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},s.p="",s(s.s=12)})([function(e,t,n){var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),t.print=t.msg=void 0;let s=r(n(1));t.msg=e=>s.default.stderr.write(e);t.print=e=>s.default.stdout.write(e)},function(e,t){e.exports=require("process")},function(e,t){e.exports=require("fs/promises")},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.PostHook=void 0;class r{constructor(){this.tasks=[]}register(e){this.tasks.push(e)}execute(){return Promise.all(this.tasks.map(e=>e()))}}t.PostHook=r,t.default=new r},function(e,t,n){var r=this&&this.__awaiter||function(e,o,l,u){return new(l=l||Promise)(function(n,t){function r(e){try{i(u.next(e))}catch(e){t(e)}}function s(e){try{i(u.throw(e))}catch(e){t(e)}}function i(e){var t;e.done?n(e.value):((t=e.value)instanceof l?t:new l(function(e){e(t)})).then(r,s)}i((u=u.apply(e,o||[])).next())})},s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});let a=n(0),i=s(n(2)),f=s(n(5)),d=s(n(6)),c=s(n(7)),p=s(n(3)),o=s(n(1)),m=s(n(8));t.default=class h{constructor(e){this.args=o.default.argv,this.config={},this.profile=e}getConfig(e){return this.config[e]}printHelpAndExit(e){(0,a.msg)(this.profile.helpMessage),o.default.exit(e)}processArgs(e){var t=this.args;if(!t||t.length<=2)return this.printHelpAndExit(1);var r=this.config,n=t[t.length-1];if("--"==n.substring(0,2))return this.printHelpAndExit(2);"--"!=n&&(r.prompt=n);let s=t.slice(2,t.length-1);if(!(s.length<=0)){let t,n=0;var i=function(e){if((n+=e)<s.length)return s[n];(0,a.msg)("Require value for option: "+t+"\n\n\n"),this.printHelpAndExit(n)}.bind(this);for(n=0;n<s.length;n++){if("-"===(t=s[n]))return void(r.prompt=null);var o=e[t];o||this.printHelpAndExit(4),o.bind(this)(r,i)}}}prepareSystemRole(t){return r(this,void 0,void 0,function*(){var e=this.getConfig("systemPrompt");e&&(t.systemPrompt=yield i.default.readFile(e,{encoding:"utf8"}),(0,a.msg)(`<< System Role >>
`),(0,a.msg)(t.systemPrompt),(0,a.msg)("\n=================\n\n"))})}prepareMemoryIfExists(n){return r(this,void 0,void 0,function*(){var e,t=n.chatMemory;if(t&&t.isNotEmpty){for(e of t=t.memory)n.messages.push(e);(0,a.msg)(`[[ Restored ${t.length} chat histories. ]]
`)}})}getPromptOrReadFromStdIn(e){return r(this,void 0,void 0,function*(){let t=this.config.prompt;null!==t&&""!=t.trim()?e.prompt=t:(o.default.stdin.on("data",e=>t+=e),yield new Promise(e=>o.default.stdin.on("end",e)))})}static launch(u){return r(this,void 0,void 0,function*(){let t=new h(u);u.envProcessor.bind(t)(t.config),t.processArgs(u.argTable);(l=t.getConfig("model"))||((0,a.msg)("Please specify LLM model.\n\n"),t.printHelpAndExit(10));var e=t.getConfig("serverUrl");e||((0,a.msg)("Please specify server url.\n\n"),t.printHelpAndExit(11));let n={dataWriter:yield(0,f.default)(t.config.out),chatMemory:t.config.memoryFile?yield d.default.create(t.config.memoryFile):null,timer:new c.default,postHook:p.default,systemPrompt:null,messages:[],prompt:null,model:l,serverUrl:e},{prompt:r,chatMemory:s,timer:i,dataWriter:o}=((0,a.msg)(`Server : ${n.serverUrl}
`),(0,a.msg)(`Model  : ${n.model}
`),(0,a.msg)(`
`),yield t.prepareSystemRole(n),yield t.prepareMemoryIfExists(n),yield t.getPromptOrReadFromStdIn(n),n);(0,a.msg)("<< Question : "),(0,a.msg)(r+`
`),(0,a.msg)(">> Answer   : ");var l=yield u.requestBuilder.bind(t)(n);return yield o(JSON.stringify(l)+"\n"),i.start(),yield m.default.streamContent(l,e=>u.onResponseIncome.bind(t)(e,n)),i.stop(),s&&p.default.register(()=>s.saveAsync()),{avg:e,elapsed:l}=i.sum(),(0,a.msg)(`[[ Time elapsed: ${l}s, Avg: ${e} t/s ]]
`),yield p.default.execute()})}}},function(e,t,n){var r=this&&this.__awaiter||function(e,o,l,u){return new(l=l||Promise)(function(n,t){function r(e){try{i(u.next(e))}catch(e){t(e)}}function s(e){try{i(u.throw(e))}catch(e){t(e)}}function i(e){var t;e.done?n(e.value):((t=e.value)instanceof l?t:new l(function(e){e(t)})).then(r,s)}i((u=u.apply(e,o||[])).next())})},s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){return r(this,void 0,void 0,function*(){if(!e)return e=>Promise.resolve();let t=yield i.default.open(e,"w");return o.default.register(()=>r(this,void 0,void 0,function*(){yield t.sync(),yield t.close(),(0,l.msg)(`[[ LLM Response saved to file '${e}' ]]
`)})),e=>t.write(e+`
`)})};let i=s(n(2)),o=s(n(3)),l=n(0)},function(e,t,n){var s=this&&this.__awaiter||function(e,o,l,u){return new(l=l||Promise)(function(n,t){function r(e){try{i(u.next(e))}catch(e){t(e)}}function s(e){try{i(u.throw(e))}catch(e){t(e)}}function i(e){var t;e.done?n(e.value):((t=e.value)instanceof l?t:new l(function(e){e(t)})).then(r,s)}i((u=u.apply(e,o||[])).next())})},r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});let i=r(n(2)),o=n(0);t.default=class l{constructor(e,t){this.responseBuffer=null,this.messages=t,this.memFile=e}get isNotEmpty(){return 0<this.messages.length}get memory(){return[...this.messages]}static create(r){return s(this,void 0,void 0,function*(){let e;try{(0,o.msg)(`[[ Chat memory: '${r}' ]]
`),yield i.default.access(r);var t=yield i.default.readFile(r,"utf8"),n=JSON.parse(t);"object"==typeof n&&null!==n&&(e=n)}catch(e){}return new l(r,e.message||[])})}saveAsync(){return s(this,void 0,void 0,function*(){this.responseBuffer&&this.messages.push({role:"assistant",content:this.responseBuffer});var e={messages:this.messages};yield i.default.writeFile(this.memFile,JSON.stringify(e)),(0,o.msg)(`[[ Chat history saved: '${this.memFile}' ]]
`)})}appendAssistantOut(e){this.responseBuffer||(this.responseBuffer=""),this.responseBuffer+=e}userResponse(e){this.messages.push({role:"user",content:e})}}},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0});t.default=class{constructor(){this.startTime=0,this.endTime=0,this.responseStartTime=0,this.tps=[]}start(){this.startTime=Date.now()}stop(){this.endTime=Date.now()}tick(){var e=Date.now();return this.tps.push(e),this.responseStartTime<=0&&(this.responseStartTime=e,!0)}sum(){var{tps:t,startTime:e,endTime:n}=this,r=[];for(let e=0;e<t.length-1;e++)r.push(t[e+1]-t[e]);return r.length<=0?{avg:0,elapsed:0}:{avg:Math.ceil(1e6/(r.reduce((e,t)=>e+t)/r.length))/1e3,elapsed:Math.ceil(n-e)/1e3}}ctxInitTime(){var{startTime:e,responseStartTime:t}=this;return Math.ceil(t-e)/1e3}}},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.StreamCollector=void 0;let r=n(9);class a{constructor(e){this.buffer="",this.callback=e}isClean(){return""==this.buffer}getBuffer(){return this.buffer}feed(e){for(this.buffer+=e;;){var t=this.buffer.indexOf("\n");if(t<0)break;var n=this.buffer.slice(0,t);this.buffer=this.buffer.slice(t+1),n.trim()&&this.callback(n)}}}t.StreamCollector=a;class s{get http(){return null==this._http&&(this._http=n(10)),this._http}get https(){return null==this._https&&(this._https=n(11)),this._https}getConnector(e){let t=null;switch(e){case"https:":t=this.https;break;case"http:":t=this.http;break;default:throw Error("Invalid protocol: "+e)}return t}static streamContent(e,s){let{method:n,url:t,requestBody:i,headers:o}=e,l=(e=>{var t=r.URL.parse(e);if(null==t)throw Error("Invalid URL: "+e);return t})(t),u=this.instance.getConnector(l.protocol);return new Promise((t,r)=>{var e=u.request(l,{method:n,headers:Object.assign({"Content-Type":"application/json"},o||{})},n=>{if(200!==n.statusCode){let t=`[[ HTTP STATUS ${n.statusCode}, RESPONSE: 
`;void new Promise(e=>{n.on("data",e=>t+=e),n.on("end",e)}).then(()=>r(t+`
]]`))}else{let e=new a(s);n.on("data",e.feed.bind(e)),n.on("end",()=>{e.isClean()?t():r(new Error("Incomplete line receive: "+e.getBuffer()))})}});e.on("error",r),i&&e.write(i,e=>e?r(e):null),e.end()})}}s.instance=new s,t.default=s},function(e,t){e.exports=require("url")},function(e,t){e.exports=require("http")},function(e,t){e.exports=require("https")},function(e,t,n){var s=this&&this.__awaiter||function(e,o,l,u){return new(l=l||Promise)(function(n,t){function r(e){try{i(u.next(e))}catch(e){t(e)}}function s(e){try{i(u.throw(e))}catch(e){t(e)}}function i(e){var t;e.done?n(e.value):((t=e.value)instanceof l?t:new l(function(e){e(t)})).then(r,s)}i((u=u.apply(e,o||[])).next())})},r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}},t=(Object.defineProperty(t,"__esModule",{value:!0}),r(n(4)));let i=r(n(1)),o=n(0);t.default.launch({helpMessage:"Usage: gen-ollama [options] PROMPT\n\nOptions: \n    --out    FILE          Output LLM response lines to FILE (env: OUT_FILE)\n    --model  MODEL_NAME    Use model MODEL_NAME (env: LLM_MODEL)\n    --server SERVER_URL    Use SERVER_URL as endpoint base name (env: SERVER_URL)\n    --memory MEMORY_FILE   Use the given file to save the chat for continue (env: LLM_MEMORY_FILE)\n\nNote: '-' in arg list will stop param reading and take prompt from STDIN\n\nEnv:\n    LLM_SYSTEM_PROMPT_FILE    Provide a text file as system prompt.\n    LLM_KEEP_ALIVE            How long for keep LLM model in memory, default is '5m'.\n    LLM_SYSTEM_PROMPT_ROLE    Role name of system prompt, default is 'system'.\n    LLM_CTX_WINDOW_SIZE       Context window size, default is 2048.\n\n",envProcessor:e=>{e.serverUrl=i.default.env.SERVER_URL||"http://127.0.0.1:11434",e.model=i.default.env.LLM_MODEL,e.out=i.default.env.OUT_FILE,e.systemPrompt=i.default.env.LLM_SYSTEM_PROMPT_FILE,e.modelKeepAlive=i.default.env.LLM_KEEP_ALIVE,e.memoryFile=i.default.env.LLM_CHAT_MEMORY,e.systemRole=i.default.env.LLM_SYSTEM_PROMPT_ROLE||"system",e.llmCtxSize=i.default.env.LLM_CTX_WINDOW_SIZE},argTable:{"--out":function(e,t){e.out=t(1)},"--model":function(e,t){e.model=t(1)},"--server":function(e,t){e.serverUrl=t(1)},"--memory":function(e,t){e.memoryFile=t(1)},"--help":function(){this.printHelpAndExit(0)}},requestBuilder(r){return s(this,void 0,void 0,function*(){var e={model:r.model},t=[],n=this.getConfig("systemRole")||"system",n=(r.systemPrompt&&t.push({role:n,content:r.systemPrompt}),t.push(...r.messages),t.push({role:"user",content:r.prompt}),e.messages=t,this.getConfig("modelKeepAlive")),t=(n&&(e.keep_alive=parseInt(n)),this.getConfig("llmCtxSize"));return t&&(e.num_ctx=parseInt(t)),{url:r.serverUrl+"/api/chat",method:"POST",requestBody:JSON.stringify(e)}})},onResponseIncome(t,{dataWriter:n,chatMemory:r,timer:s}){if(t){let e;try{if(null===(e=JSON.parse(t)))return}catch(e){throw new Error("Invalid JSON in line: "+t)}n(JSON.stringify(e)).then(()=>[]),s.tick()&&(0,o.msg)(`(Context initialize took ${s.ctxInitTime()}s)
`);var{message:t,done:n}=e;if(n)return(0,o.msg)("\n\n");s=t.content;(0,o.print)(s),r&&r.appendAssistantOut(s)}}}).then().catch(console.error)}]);