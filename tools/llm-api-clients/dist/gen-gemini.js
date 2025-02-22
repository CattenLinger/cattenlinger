#!/usr/bin/env node

(r=>{var s={};function n(e){var t;return(s[e]||(t=s[e]={i:e,l:!1,exports:{}},r[e].call(t.exports,t,t.exports,n),t.l=!0,t)).exports}n.m=r,n.c=s,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var s in t)n.d(r,s,function(e){return t[e]}.bind(null,s));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=14)})([function(e,t,r){var s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),t.print=t.msg=void 0;let n=s(r(1));t.msg=e=>n.default.stderr.write(e);t.print=e=>n.default.stdout.write(e)},function(e,t){e.exports=require("process")},function(e,t){e.exports=require("fs/promises")},function(e,t,r){var c,s=this&&this.__awaiter||function(e,o,a,u){return new(a=a||Promise)(function(r,t){function s(e){try{i(u.next(e))}catch(e){t(e)}}function n(e){try{i(u.throw(e))}catch(e){t(e)}}function i(e){var t;e.done?r(e.value):((t=e.value)instanceof a?t:new a(function(e){e(t)})).then(s,n)}i((u=u.apply(e,o||[])).next())})},n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),t.AppExecutePhase=void 0;let m=r(0),i=n(r(2)),h=n(r(7)),d=n(r(8)),p=n(r(5)),g=n(r(4)),o=n(r(1)),v=n(r(6));(n=c||(t.AppExecutePhase=c={}))[n.Pre=0]="Pre",n[n.Post=1]="Post",n[n.Finish=2]="Finish";class y{constructor(e){this.args=o.default.argv,this.config={},this.profile=e}getConfig(e){return this.config[e]}printHelpAndExit(e){(0,m.msg)(this.profile.helpMessage);var t=this.profile.plugins;t&&t.forEach(({appendHelpMessage:e})=>{void 0!==e&&(0,m.msg)(e)}),o.default.exit(e)}processArgs(e){var t=this.args;if(!t||t.length<=2)return this.printHelpAndExit(1);var s=this.config,r=t[t.length-1];if("--"==r.substring(0,2))return this.printHelpAndExit(2);"--"!=r&&(s.prompt=r);let n=t.slice(2,t.length-1);if(!(n.length<=0)){let t,r=0;var i=e=>{if((r+=e)<n.length)return n[r];(0,m.msg)("Require value for option: "+t+"\n\n\n"),this.printHelpAndExit(r)};for(r=0;r<n.length;r++){if("-"===(t=n[r]))return void(s.prompt=null);var o=e[t];o||this.printHelpAndExit(4),o.bind(this)(s,i)}}}prepareSystemRole(t){return s(this,void 0,void 0,function*(){var e=this.getConfig("systemPrompt");e&&(t.systemPrompt=yield i.default.readFile(e,{encoding:"utf8"}),(0,m.msg)(`<< System Role (name: ${this.getConfig("systemRole")}) >>
`),(0,m.msg)(t.systemPrompt),(0,m.msg)("\n================\n\n"))})}prepareMemory(r){return s(this,void 0,void 0,function*(){var e=r.chatMemory;if(e&&e.isNotEmpty){var t,e=e.memory;for(t of e)r.historyMessages.push(t);(0,m.msg)(`[[ Restored ${e.length} chat histories. ]]
`)}})}getPromptOrReadFromStdIn(e){return s(this,void 0,void 0,function*(){let t=this.config.prompt;null!==t&&""!=t.trim()?e.userPrompt=t:(o.default.stdin.on("data",e=>t+=e),yield new Promise(e=>o.default.stdin.on("end",e)))})}handleParameters(){var e=this.profile.plugins;let r=[this.profile.envProcessor],s=this.profile.argTable;e&&e.forEach(({chainEvnProcessor:e,mergeArgProcessors:t})=>{void 0!==e&&r.push(e),void 0!==t&&(s=Object.assign(Object.assign({},s),t))}),r.forEach(e=>e.bind(this)(this.config)),this.processArgs(s)}static launch(f){return s(this,void 0,void 0,function*(){let t=new y(f);t.handleParameters();var e=f.plugins,r=t.getConfig("model"),s=(r||((0,m.msg)("Please specify LLM model.\n\n"),t.printHelpAndExit(10)),t.getConfig("serverUrl"));s||((0,m.msg)("Please specify server url.\n\n"),t.printHelpAndExit(11)),(0,m.msg)(`Server : ${s}
`),(0,m.msg)(`Model  : ${r}
`),(0,m.msg)(`
`);let n={dataWriter:yield(0,h.default)(t.config.out),chatMemory:t.getConfig("memoryFile")?yield d.default.create(t.config.memoryFile):null,timer:new p.default,systemPrompt:null,historyMessages:[],userPrompt:null,model:r,serverUrl:s,phase:c.Pre},{userPrompt:i,chatMemory:o,timer:a,dataWriter:u}=(yield t.prepareSystemRole(n),yield t.prepareMemory(n),yield t.getPromptOrReadFromStdIn(n),e&&(yield Promise.all(e.map(e=>e.execute(t,n)))),n);(0,m.msg)(`<<Q | ${i}
| A>> `),o&&o.appendUserPrompt(i);var r=yield f.requestBuilder.bind(t)(n);let l=(f.onResponseIncome||function(e,{dataWriter:t,timer:r,chatMemory:s}){var n;e&&(n=this.profile.responseLineTransformer,t(e).then(),r.tick()&&(0,m.msg)(`(Summarization context took ${r.ctxInitTime()}s)
`),null!=(t=n(e)))&&({info:r,content:n}=t,null!=r&&"string"==typeof r&&(0,m.msg)(r),null!=n)&&((0,m.print)(n),s)&&s.appendAssistantOut(n)}).bind(t);yield u(JSON.stringify(r)),a.start(),yield v.default.streamContent(r,e=>l(e,n)),a.stop(),o&&g.default.register(()=>o.saveAsync()),{avg:s,elapsed:r}=a.sum(),(0,m.msg)(`[[ Time elapsed: ${r}s, Avg: ${s} t/s ]]
`),n.phase=c.Post,e&&(yield Promise.all(e.map(e=>e.execute(t,n)))),n.phase=c.Finish,e&&(yield Promise.all(e.map(e=>e.execute(t,n)))),yield g.default.execute()})}}t.default=y},function(e,t,r){Object.defineProperty(t,"__esModule",{value:!0}),t.PostHook=void 0;class s{constructor(){this.tasks=[]}register(e){this.tasks.push(e)}execute(){return Promise.all(this.tasks.map(e=>e()))}}t.PostHook=s,t.default=new s},function(e,t,r){Object.defineProperty(t,"__esModule",{value:!0});t.default=class{constructor(){this.startTime=0,this.endTime=0,this.responseStartTime=0,this.tps=[]}start(){this.startTime=Date.now()}stop(){this.endTime=Date.now()}tick(){var e=Date.now();return this.tps.push(e),this.responseStartTime<=0&&(this.responseStartTime=e,!0)}sum(){var{tps:t,startTime:e,endTime:r}=this,s=[];for(let e=0;e<t.length-1;e++)s.push(t[e+1]-t[e]);return s.length<=0?{avg:0,elapsed:0}:{avg:Math.ceil(1e6/(s.reduce((e,t)=>e+t)/s.length))/1e3,elapsed:Math.ceil(r-e)/1e3}}ctxInitTime(){var{startTime:e,responseStartTime:t}=this;return Math.ceil(t-e)/1e3}}},function(e,t,r){Object.defineProperty(t,"__esModule",{value:!0});let s=r(9);class l{constructor(e){this.buffer="",this.callback=e}isClean(){return""==this.buffer}getBuffer(){return this.buffer}feed(e){for(this.buffer+=e;;){var t=this.buffer.indexOf("\n");if(t<0)break;var r=this.buffer.slice(0,t);this.buffer=this.buffer.slice(t+1),r.trim()&&this.callback(r)}}}class n{get http(){return null==this._http&&(this._http=r(10)),this._http}get https(){return null==this._https&&(this._https=r(11)),this._https}getConnector(e){let t=null;switch(e){case"https:":t=this.https;break;case"http:":t=this.http;break;default:throw Error("Invalid protocol: "+e)}return t}static streamContent(e,n){let{method:r,url:t,requestBody:i,headers:o}=e,a=(e=>{var t=s.URL.parse(e);if(null==t)throw Error("Invalid URL: "+e);return t})(t),u=this.instance.getConnector(a.protocol);return new Promise((t,s)=>{var e=u.request(a,{method:r,headers:Object.assign({"Content-Type":"application/json"},o||{})},r=>{if(200!==r.statusCode){let t=`[[ HTTP STATUS ${r.statusCode}, RESPONSE: 
`;void new Promise(e=>{r.on("data",e=>t+=e),r.on("end",e)}).then(()=>s(t+`
]]`))}else{let e=new l(n);r.on("data",e.feed.bind(e)),r.on("end",()=>{e.isClean()?t():s(new Error("Incomplete line receive: "+e.getBuffer()))})}});e.on("error",s),i&&e.write(i,e=>e?s(e):null),e.end()})}}n.instance=new n,t.default=n},function(e,t,r){var s=this&&this.__awaiter||function(e,o,a,u){return new(a=a||Promise)(function(r,t){function s(e){try{i(u.next(e))}catch(e){t(e)}}function n(e){try{i(u.throw(e))}catch(e){t(e)}}function i(e){var t;e.done?r(e.value):((t=e.value)instanceof a?t:new a(function(e){e(t)})).then(s,n)}i((u=u.apply(e,o||[])).next())})},n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){return s(this,void 0,void 0,function*(){if(!e)return e=>Promise.resolve();let t=yield i.default.open(e,"w");return o.default.register(()=>s(this,void 0,void 0,function*(){yield t.sync(),yield t.close(),(0,a.msg)(`[[ LLM Response saved to file '${e}' ]]
`)})),e=>t.write(("string"==typeof e?e:JSON.stringify(e))+`
`)})};let i=n(r(2)),o=n(r(4)),a=r(0)},function(e,t,r){var n=this&&this.__awaiter||function(e,o,a,u){return new(a=a||Promise)(function(r,t){function s(e){try{i(u.next(e))}catch(e){t(e)}}function n(e){try{i(u.throw(e))}catch(e){t(e)}}function i(e){var t;e.done?r(e.value):((t=e.value)instanceof a?t:new a(function(e){e(t)})).then(s,n)}i((u=u.apply(e,o||[])).next())})},s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});let i=s(r(2)),o=r(0);t.default=class a{constructor(e,t){this.responseBuffer=null,this.messages=t,this.memFile=e}get isNotEmpty(){return 0<this.messages.length}get memory(){return[...this.messages]}get count(){return this.messages.length}clear(){return this.messages.splice(0,this.messages.length)}flush(){return!(!this.responseBuffer||(this.messages.push({role:"assistant",content:this.responseBuffer}),this.responseBuffer=""))}static create(s){return n(this,void 0,void 0,function*(){let e={messages:[]};try{(0,o.msg)(`[[ Chat memory: '${s}' ]]
`),yield i.default.access(s);var t=yield i.default.readFile(s,"utf8"),r=JSON.parse(t);"object"==typeof r&&null!==r&&(e=r)}catch(e){}return new a(s,e.messages||[])})}saveAsync(){return n(this,void 0,void 0,function*(){this.flush();var e={messages:this.messages};yield i.default.writeFile(this.memFile,JSON.stringify(e)),(0,o.msg)(`[[ Chat history saved: '${this.memFile}' ]]
`)})}appendAssistantOut(e){this.responseBuffer||(this.responseBuffer=""),this.responseBuffer+=e}appendUserPrompt(e){this.messages.push({role:"user",content:e})}}},function(e,t){e.exports=require("url")},function(e,t){e.exports=require("http")},function(e,t){e.exports=require("https")},function(e,t,r){var s=this&&this.__awaiter||function(e,o,a,u){return new(a=a||Promise)(function(r,t){function s(e){try{i(u.next(e))}catch(e){t(e)}}function n(e){try{i(u.throw(e))}catch(e){t(e)}}function i(e){var t;e.done?r(e.value):((t=e.value)instanceof a?t:new a(function(e){e(t)})).then(s,n)}i((u=u.apply(e,o||[])).next())})},n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});let i=r(3),a=r(0),u=n(r(5)),l=n(r(6)),o=n(r(1)),f=`
# Role: summarize assistant

## Description
You're an assistant who's good at extracting key takeaways from conversations and summarizing them.

# Rules
1. The summary needs to **maintain the user's language**.
2. Summarization should be limited to 400 tokens.

# Instructions
The content need to be summarize is located in the <chat_history></chat_history> group of xml tags.
User's words are quoted in <user></user>, appointment's words are quoted in <assistant></assistant>.

The summarized content will be used as context for subsequent prompts.
Please summarize according to the user's needs.

As a <Role>, you strictly follow <Rules>, be focused on the summarization.
`.trim();function c(e){let r="";return e.forEach(({role:e,content:t})=>{e="user"==e?"user":"assistant";r+=`<${e}>${t}</${e}>
`}),`
<chat_history>
${r}
</chat_history>

Please summarize the above conversation and retain key information.
`.trim()}t.default=class{chainEvnProcessor(e){e.summarizeHistory=parseInt(""+o.default.env.LLM_CHAT_SUMMARIZE_AFTER)}constructor(e){this.appendHelpMessage="Summarization Options (Require --memory) :\n    --summarize-after    INTEGER   Auto summarize after certain history (Env: LLM_CHAT_SUMMARIZE_AFTER).\n\n",this.mergeArgProcessors={"--summarize-after":function(e,t){e.summarizeHistory=parseInt(""+t(1))}},e?(this.systemPrompt=e.systemPrompt||f,this.userPromptProvider=e.userPromptProvider||c):(this.systemPrompt=f,this.userPromptProvider=c)}execute(e,t){return s(this,void 0,void 0,function*(){t.phase===i.AppExecutePhase.Finish&&(yield this.onSummarize(e,t))})}onSummarize(i,o){return s(this,void 0,void 0,function*(){var e=parseInt(""+i.getConfig("summarizeHistory"));if(!(!e||isNaN(e)||e<=1)){let s=o.chatMemory;if(s){if(!(s.count<e)){s.flush();let t=o.dataWriter;o.systemPrompt=this.systemPrompt,o.historyMessages=[],o.userPrompt=this.userPromptProvider(s.clear());e=yield i.profile.requestBuilder.bind(i)(o);yield t(e),(0,a.msg)("$$ Summarization: ");let r=new u.default;r.start(),yield l.default.streamContent(e,e=>{e&&(t(e).then(),r.tick()&&(0,a.msg)(`(Summarization context took ${r.ctxInitTime()}s)
`),null!=(e=i.profile.responseLineTransformer(e)))&&(e=e.content,null!=e)&&((0,a.msg)(e),s.appendAssistantOut(e))}),r.stop(),(0,a.msg)("\n\n");var{avg:e,elapsed:n}=r.sum();(0,a.msg)(`[[ Summarization took ${n}s, Avg: ${e} t/s ]]
`)}}else(0,a.msg)("[[ Chat Memory not enabled, summarization will be SKIPPED ]]\n")}})}}},,function(e,t,r){var s=this&&this.__awaiter||function(e,o,a,u){return new(a=a||Promise)(function(r,t){function s(e){try{i(u.next(e))}catch(e){t(e)}}function n(e){try{i(u.throw(e))}catch(e){t(e)}}function i(e){var t;e.done?r(e.value):((t=e.value)instanceof a?t:new a(function(e){e(t)})).then(s,n)}i((u=u.apply(e,o||[])).next())})},n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}},t=(Object.defineProperty(t,"__esModule",{value:!0}),n(r(3)));let o=n(r(1)),a=r(0);n={helpMessage:"Usage: gen-gemini [options] prompt.\n\nOptions: \n    --out    FILE          Output LLM response lines to FILE (env: OUT_FILE)\n    --model  MODEL_NAME    Use model MODEL_NAME (env: LLM_MODEL)\n    --server SERVER_URL    Use SERVER_URL as endpoint base name (env: SERVER_URL)\n    --memory MEMORY_FILE   Use the given file to save the chat for continue (env: LLM_MEMORY_FILE)\n\nNote: '-' in arg list will stop param reading and take prompt from STDIN\n\nEnv:\n    GEMINI_API_KEY            Google Gemini API Key, required.\n    LLM_SYSTEM_PROMPT_FILE    Provide a text file as system prompt.\n\n",argTable:{"--out":function(e,t){e.out=t(1)},"--model":function(e,t){e.model=t(1)},"--server":function(e,t){e.serverUrl=t(1)},"--memory":function(e,t){e.memoryFile=t(1)},"--help":function(){this.printHelpAndExit(0)}},envProcessor:e=>{e.serverUrl=o.default.env.SERVER_URL||"https://generativelanguage.googleapis.com",e.model=o.default.env.LLM_MODEL||"gemini-1.5-flash",e.out=o.default.env.OUT_FILE,e.apiKey=o.default.env.GEMINI_API_KEY,e.systemPrompt=o.default.env.LLM_SYSTEM_PROMPT_FILE,e.memoryFile=o.default.env.LLM_CHAT_MEMORY},requestBuilder(i){return s(this,void 0,void 0,function*(){var e=this.getConfig("apiKey"),{model:t,serverUrl:r}=(e||((0,a.msg)("Please specify Gemini API Key.\n\n"),o.default.exit(1)),i),s={},n=i.systemPrompt,n=(i.systemPrompt&&(s.systemInstruction={parts:{text:n}}),i.historyMessages.map(e=>({role:e.role,parts:[{text:e.content}]})));return n.push({role:"user",parts:[{text:i.userPrompt}]}),s.contents=n,{url:r+`/v1beta/models/${t}:streamGenerateContent?alt=sse&key=`+e,method:"POST",requestBody:JSON.stringify(s)}})},responseLineTransformer:e=>{e=e.trim().match(/^data:\s+?(.+)/);if(e){var[,e]=e;if(e.trim()){e=JSON.parse(e).candidates;if(!(e.length<=0)){e=e[0].content;if(e){e=e.parts;if(e&&!(e.length<=0))return e=e[0].text,{content:e}}}}}},plugins:[new(n(r(12)).default)]};t.default.launch(n).then().catch(console.error)}]);