#!/usr/bin/env node

(s=>{var r={};function n(e){var t;return(r[e]||(t=r[e]={i:e,l:!1,exports:{}},s[e].call(t.exports,t,t.exports,n),t.l=!0,t)).exports}n.m=s,n.c=r,n.d=function(e,t,s){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:s})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var s=Object.create(null);if(n.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)n.d(s,r,function(e){return t[e]}.bind(null,r));return s},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=15)})([function(e,t,s){var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),t.print=t.msg=void 0;let n=r(s(1));t.msg=e=>n.default.stderr.write(e);t.print=e=>n.default.stdout.write(e)},function(e,t){e.exports=require("process")},function(e,t){e.exports=require("fs/promises")},function(e,t,s){var c,r=this&&this.__awaiter||function(e,o,a,u){return new(a=a||Promise)(function(s,t){function r(e){try{i(u.next(e))}catch(e){t(e)}}function n(e){try{i(u.throw(e))}catch(e){t(e)}}function i(e){var t;e.done?s(e.value):((t=e.value)instanceof a?t:new a(function(e){e(t)})).then(r,n)}i((u=u.apply(e,o||[])).next())})},n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),t.AppExecutePhase=void 0;let m=s(0),i=n(s(2)),h=n(s(7)),d=n(s(8)),p=n(s(5)),g=n(s(4)),o=n(s(1)),v=n(s(6));(n=c||(t.AppExecutePhase=c={}))[n.Pre=0]="Pre",n[n.Post=1]="Post",n[n.Finish=2]="Finish";class y{constructor(e){this.args=o.default.argv,this.config={},this.profile=e}getConfig(e){return this.config[e]}printHelpAndExit(e){(0,m.msg)(this.profile.helpMessage);var t=this.profile.plugins;t&&t.forEach(({appendHelpMessage:e})=>{void 0!==e&&(0,m.msg)(e)}),o.default.exit(e)}processArgs(e){var t=this.args;if(!t||t.length<=2)return this.printHelpAndExit(1);var r=this.config,s=t[t.length-1];if("--"==s.substring(0,2))return this.printHelpAndExit(2);"--"!=s&&(r.prompt=s);let n=t.slice(2,t.length-1);if(!(n.length<=0)){let t,s=0;var i=e=>{if((s+=e)<n.length)return n[s];(0,m.msg)("Require value for option: "+t+"\n\n\n"),this.printHelpAndExit(s)};for(s=0;s<n.length;s++){if("-"===(t=n[s]))return void(r.prompt=null);var o=e[t];o||this.printHelpAndExit(4),o.bind(this)(r,i)}}}prepareSystemRole(t){return r(this,void 0,void 0,function*(){var e=this.getConfig("systemPrompt");e&&(t.systemPrompt=yield i.default.readFile(e,{encoding:"utf8"}),(0,m.msg)(`<< System Role (name: ${this.getConfig("systemRole")}) >>
`),(0,m.msg)(t.systemPrompt),(0,m.msg)("\n================\n\n"))})}prepareMemory(s){return r(this,void 0,void 0,function*(){var e=s.chatMemory;if(e&&e.isNotEmpty){var t,e=e.memory;for(t of e)s.historyMessages.push(t);(0,m.msg)(`[[ Restored ${e.length} chat histories. ]]
`)}})}getPromptOrReadFromStdIn(e){return r(this,void 0,void 0,function*(){let t=this.config.prompt;null!==t&&""!=t.trim()?e.userPrompt=t:(o.default.stdin.on("data",e=>t+=e),yield new Promise(e=>o.default.stdin.on("end",e)))})}handleParameters(){var e=this.profile.plugins;let s=[this.profile.envProcessor],r=this.profile.argTable;e&&e.forEach(({chainEvnProcessor:e,mergeArgProcessors:t})=>{void 0!==e&&s.push(e),void 0!==t&&(r=Object.assign(Object.assign({},r),t))}),s.forEach(e=>e.bind(this)(this.config)),this.processArgs(r)}static launch(f){return r(this,void 0,void 0,function*(){let t=new y(f);t.handleParameters();var e=f.plugins,s=t.getConfig("model"),r=(s||((0,m.msg)("Please specify LLM model.\n\n"),t.printHelpAndExit(10)),t.getConfig("serverUrl"));r||((0,m.msg)("Please specify server url.\n\n"),t.printHelpAndExit(11)),(0,m.msg)(`Server : ${r}
`),(0,m.msg)(`Model  : ${s}
`),(0,m.msg)(`
`);let n={dataWriter:yield(0,h.default)(t.config.out),chatMemory:t.getConfig("memoryFile")?yield d.default.create(t.config.memoryFile):null,timer:new p.default,systemPrompt:null,historyMessages:[],userPrompt:null,model:s,serverUrl:r,phase:c.Pre},{userPrompt:i,chatMemory:o,timer:a,dataWriter:u}=(yield t.prepareSystemRole(n),yield t.prepareMemory(n),yield t.getPromptOrReadFromStdIn(n),e&&(yield Promise.all(e.map(e=>e.execute(t,n)))),n);(0,m.msg)(`<<Q | ${i}
| A>> `),o&&o.appendUserPrompt(i);var s=yield f.requestBuilder.bind(t)(n);let l=(f.onResponseIncome||function(e,{dataWriter:t,timer:s,chatMemory:r}){var n;e&&(n=this.profile.responseLineTransformer,t(e).then(),s.tick()&&(0,m.msg)(`(Summarization context took ${s.ctxInitTime()}s)
`),null!=(t=n(e)))&&({info:s,content:n}=t,null!=s&&"string"==typeof s&&(0,m.msg)(s),null!=n)&&((0,m.print)(n),r)&&r.appendAssistantOut(n)}).bind(t);yield u(JSON.stringify(s)),a.start(),yield v.default.streamContent(s,e=>l(e,n)),a.stop(),o&&g.default.register(()=>o.saveAsync()),{avg:r,elapsed:s}=a.sum(),(0,m.msg)(`[[ Time elapsed: ${s}s, Avg: ${r} t/s ]]
`),n.phase=c.Post,e&&(yield Promise.all(e.map(e=>e.execute(t,n)))),n.phase=c.Finish,e&&(yield Promise.all(e.map(e=>e.execute(t,n)))),yield g.default.execute()})}}t.default=y},function(e,t,s){Object.defineProperty(t,"__esModule",{value:!0}),t.PostHook=void 0;class r{constructor(){this.tasks=[]}register(e){this.tasks.push(e)}execute(){return Promise.all(this.tasks.map(e=>e()))}}t.PostHook=r,t.default=new r},function(e,t,s){Object.defineProperty(t,"__esModule",{value:!0});t.default=class{constructor(){this.startTime=0,this.endTime=0,this.responseStartTime=0,this.tps=[]}start(){this.startTime=Date.now()}stop(){this.endTime=Date.now()}tick(){var e=Date.now();return this.tps.push(e),this.responseStartTime<=0&&(this.responseStartTime=e,!0)}sum(){var{tps:t,startTime:e,endTime:s}=this,r=[];for(let e=0;e<t.length-1;e++)r.push(t[e+1]-t[e]);return r.length<=0?{avg:0,elapsed:0}:{avg:Math.ceil(1e6/(r.reduce((e,t)=>e+t)/r.length))/1e3,elapsed:Math.ceil(s-e)/1e3}}ctxInitTime(){var{startTime:e,responseStartTime:t}=this;return Math.ceil(t-e)/1e3}}},function(e,t,s){Object.defineProperty(t,"__esModule",{value:!0});let r=s(9);class l{constructor(e){this.buffer="",this.callback=e}isClean(){return""==this.buffer}getBuffer(){return this.buffer}feed(e){for(this.buffer+=e;;){var t=this.buffer.indexOf("\n");if(t<0)break;var s=this.buffer.slice(0,t);this.buffer=this.buffer.slice(t+1),s.trim()&&this.callback(s)}}}class n{get http(){return null==this._http&&(this._http=s(10)),this._http}get https(){return null==this._https&&(this._https=s(11)),this._https}getConnector(e){let t=null;switch(e){case"https:":t=this.https;break;case"http:":t=this.http;break;default:throw Error("Invalid protocol: "+e)}return t}static streamContent(e,n){let{method:s,url:t,requestBody:i,headers:o}=e,a=(e=>{var t=r.URL.parse(e);if(null==t)throw Error("Invalid URL: "+e);return t})(t),u=this.instance.getConnector(a.protocol);return new Promise((t,r)=>{var e=u.request(a,{method:s,headers:Object.assign({"Content-Type":"application/json"},o||{})},s=>{if(200!==s.statusCode){let t=`[[ HTTP STATUS ${s.statusCode}, RESPONSE: 
`;void new Promise(e=>{s.on("data",e=>t+=e),s.on("end",e)}).then(()=>r(t+`
]]`))}else{let e=new l(n);s.on("data",e.feed.bind(e)),s.on("end",()=>{e.isClean()?t():r(new Error("Incomplete line receive: "+e.getBuffer()))})}});e.on("error",r),i&&e.write(i,e=>e?r(e):null),e.end()})}}n.instance=new n,t.default=n},function(e,t,s){var r=this&&this.__awaiter||function(e,o,a,u){return new(a=a||Promise)(function(s,t){function r(e){try{i(u.next(e))}catch(e){t(e)}}function n(e){try{i(u.throw(e))}catch(e){t(e)}}function i(e){var t;e.done?s(e.value):((t=e.value)instanceof a?t:new a(function(e){e(t)})).then(r,n)}i((u=u.apply(e,o||[])).next())})},n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){return r(this,void 0,void 0,function*(){if(!e)return e=>Promise.resolve();let t=yield i.default.open(e,"w");return o.default.register(()=>r(this,void 0,void 0,function*(){yield t.sync(),yield t.close(),(0,a.msg)(`[[ LLM Response saved to file '${e}' ]]
`)})),e=>t.write(("string"==typeof e?e:JSON.stringify(e))+`
`)})};let i=n(s(2)),o=n(s(4)),a=s(0)},function(e,t,s){var n=this&&this.__awaiter||function(e,o,a,u){return new(a=a||Promise)(function(s,t){function r(e){try{i(u.next(e))}catch(e){t(e)}}function n(e){try{i(u.throw(e))}catch(e){t(e)}}function i(e){var t;e.done?s(e.value):((t=e.value)instanceof a?t:new a(function(e){e(t)})).then(r,n)}i((u=u.apply(e,o||[])).next())})},r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});let i=r(s(2)),o=s(0);t.default=class a{constructor(e,t){this.responseBuffer=null,this.messages=t,this.memFile=e}get isNotEmpty(){return 0<this.messages.length}get memory(){return[...this.messages]}get count(){return this.messages.length}clear(){return this.messages.splice(0,this.messages.length)}flush(){return!(!this.responseBuffer||(this.messages.push({role:"assistant",content:this.responseBuffer}),this.responseBuffer=""))}static create(r){return n(this,void 0,void 0,function*(){let e={messages:[]};try{(0,o.msg)(`[[ Chat memory: '${r}' ]]
`),yield i.default.access(r);var t=yield i.default.readFile(r,"utf8"),s=JSON.parse(t);"object"==typeof s&&null!==s&&(e=s)}catch(e){}return new a(r,e.messages||[])})}saveAsync(){return n(this,void 0,void 0,function*(){this.flush();var e={messages:this.messages};yield i.default.writeFile(this.memFile,JSON.stringify(e)),(0,o.msg)(`[[ Chat history saved: '${this.memFile}' ]]
`)})}appendAssistantOut(e){this.responseBuffer||(this.responseBuffer=""),this.responseBuffer+=e}appendUserPrompt(e){this.messages.push({role:"user",content:e})}}},function(e,t){e.exports=require("url")},function(e,t){e.exports=require("http")},function(e,t){e.exports=require("https")},function(e,t,s){var r=this&&this.__awaiter||function(e,o,a,u){return new(a=a||Promise)(function(s,t){function r(e){try{i(u.next(e))}catch(e){t(e)}}function n(e){try{i(u.throw(e))}catch(e){t(e)}}function i(e){var t;e.done?s(e.value):((t=e.value)instanceof a?t:new a(function(e){e(t)})).then(r,n)}i((u=u.apply(e,o||[])).next())})},n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});let i=s(3),a=s(0),u=n(s(5)),l=n(s(6)),o=n(s(1)),f=`
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
`.trim();function c(e){let s="";return e.forEach(({role:e,content:t})=>{e="user"==e?"user":"assistant";s+=`<${e}>${t}</${e}>
`}),`
<chat_history>
${s}
</chat_history>

Please summarize the above conversation and retain key information.
`.trim()}t.default=class{chainEvnProcessor(e){e.summarizeHistory=parseInt(""+o.default.env.LLM_CHAT_SUMMARIZE_AFTER)}constructor(e){this.appendHelpMessage="Summarization Options (Require --memory) :\n    --summarize-after    INTEGER   Auto summarize after certain history (Env: LLM_CHAT_SUMMARIZE_AFTER).\n\n",this.mergeArgProcessors={"--summarize-after":function(e,t){e.summarizeHistory=parseInt(""+t(1))}},e?(this.systemPrompt=e.systemPrompt||f,this.userPromptProvider=e.userPromptProvider||c):(this.systemPrompt=f,this.userPromptProvider=c)}execute(e,t){return r(this,void 0,void 0,function*(){t.phase===i.AppExecutePhase.Finish&&(yield this.onSummarize(e,t))})}onSummarize(i,o){return r(this,void 0,void 0,function*(){var e=parseInt(""+i.getConfig("summarizeHistory"));if(!(!e||isNaN(e)||e<=1)){let r=o.chatMemory;if(r){if(!(r.count<e)){r.flush();let t=o.dataWriter;o.systemPrompt=this.systemPrompt,o.historyMessages=[],o.userPrompt=this.userPromptProvider(r.clear());e=yield i.profile.requestBuilder.bind(i)(o);yield t(e),(0,a.msg)("$$ Summarization: ");let s=new u.default;s.start(),yield l.default.streamContent(e,e=>{e&&(t(e).then(),s.tick()&&(0,a.msg)(`(Summarization context took ${s.ctxInitTime()}s)
`),null!=(e=i.profile.responseLineTransformer(e)))&&(e=e.content,null!=e)&&((0,a.msg)(e),r.appendAssistantOut(e))}),s.stop(),(0,a.msg)("\n\n");var{avg:e,elapsed:n}=s.sum();(0,a.msg)(`[[ Summarization took ${n}s, Avg: ${e} t/s ]]
`)}}else(0,a.msg)("[[ Chat Memory not enabled, summarization will be SKIPPED ]]\n")}})}}},,,function(e,t,s){var r=this&&this.__awaiter||function(e,o,a,u){return new(a=a||Promise)(function(s,t){function r(e){try{i(u.next(e))}catch(e){t(e)}}function n(e){try{i(u.throw(e))}catch(e){t(e)}}function i(e){var t;e.done?s(e.value):((t=e.value)instanceof a?t:new a(function(e){e(t)})).then(r,n)}i((u=u.apply(e,o||[])).next())})},n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}},t=(Object.defineProperty(t,"__esModule",{value:!0}),n(s(3)));let a=n(s(1)),u=s(0);n={helpMessage:"Usage: gen-openai [options] prompt.\n\nOptions: \n    --out    FILE          Output LLM response lines to FILE (env: OUT_FILE)\n    --model  MODEL_NAME    Use model MODEL_NAME (env: LLM_MODEL)\n    --server SERVER_URL    Use SERVER_URL as endpoint base name (env: SERVER_URL)\n    --memory MEMORY_FILE   Use the given file to save the chat for continue (env: LLM_MEMORY_FILE)\n\nNote: '-' in arg list will stop param reading and take prompt from STDIN\n\nEnv:\n    OPENAI_API_KEY            OpenAI API Key, required.\n    LLM_SYSTEM_PROMPT_FILE    Provide a text file as system prompt.\n    LLM_SYSTEM_PROMPT_ROLE    Role name of system prompt, default is 'developer' (for old models please use 'system').\n\n",envProcessor:e=>{e.serverUrl=a.default.env.SERVER_URL||"https://api.openai.com/v1",e.model=a.default.env.LLM_MODEL||"gpt-4o-mini",e.out=a.default.env.OUT_FILE,e.systemPrompt=a.default.env.LLM_SYSTEM_PROMPT_FILE,e.apiKey=a.default.env.OPENAI_API_KEY,e.systemRole=a.default.env.LLM_SYSTEM_PROMPT_ROLE||"developer",e.memoryFile=a.default.env.LLM_CHAT_MEMORY},argTable:{"--out":function(e,t){e.out=t(1)},"--model":function(e,t){e.model=t(1)},"--server":function(e,t){e.serverUrl=t(1)},"--memory":function(e,t){e.memoryFile=t(1)},"--help":function(){this.printHelpAndExit(0)}},requestBuilder(o){return r(this,void 0,void 0,function*(){var e=this.getConfig("apiKey"),{model:t,serverUrl:s}=(e||((0,u.msg)("Please specify OpenAI API Key"),a.default.exit(1)),o),t={model:t,stream:!0,stream_options:{include_usage:!0}},r=[],n=o.systemPrompt,i=this.getConfig("systemRole")||"developer";return n&&r.push({role:i,content:n}),r.push(...o.historyMessages),r.push({role:"user",content:o.userPrompt}),t.messages=r,{url:s+"/chat/completions",method:"POST",headers:{Authorization:"Bearer "+e},requestBody:JSON.stringify(t)}})},responseLineTransformer:e=>{e=e.match(/^data:\s+?(.+)/);if(e){var[,e]=e;if("[DONE]"===e)return{info:"\n\n"};e=JSON.parse(e).choices;if(!(e.length<=0)){e=e[0].delta;if(e.content)return e=e.content,{content:e}}}},plugins:[new(n(s(12)).default)]};t.default.launch(n).then().catch(console.error)}]);