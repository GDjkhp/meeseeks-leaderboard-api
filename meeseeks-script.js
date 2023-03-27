var result, page = 0, serverId, queue, queueLimit, previousQueue = null, update = false;

// cors unblocked api server, please don't abuse (rate limited, ip banned), delays 500ms
async function loadJSON(id) {
    result = await fetch(`https://meeseeks-api.gdjkhp.repl.co/${id}?limit=1000&page=${page}`).then(res => res.json());
    console.log(result);
    await delay(500);
}

// TODO: load using server id
async function loadId(id) {
    serverId = id;
    await loadJSON(id);
}

// load pre defined servers
async function load(sel) {
    // geometrydash: 398627612299362304
    // minecraft: 302094807046684672
    // terraria: 251072485095636994
    // query: ?limit=1000&page=1
    switch(sel) {
        case "gmd":
            serverId = "398627612299362304";
            await loadJSON(serverId);
            break;
        case "mc":
            serverId = "302094807046684672";
            await loadJSON(serverId);
            break;
        case "tml":
            serverId = "251072485095636994";
            await loadJSON(serverId);
            break;
    }
}

// returns a neat rank card
async function parseProfile(player, target) {
    if (player == null) return;
    if (!update) addCard();

    const user = document.getElementsByClassName('realusername')[target];
    user.innerHTML = player.username;

    const discordtag = document.getElementsByClassName('discriminator')[target];
    discordtag.innerHTML = "#" + player.discriminator;

    const rank = document.getElementsByClassName('rank-number')[target];
    rank.innerHTML = "#" + await getRank(player);

    const level = document.getElementsByClassName('level-number')[target];
    level.innerHTML = player.level;

    const xp = document.getElementsByClassName('progress-label-current')[target];
    xp.innerHTML = player.detailed_xp[0];

    const xp2= document.getElementsByClassName('progress-label-limit')[target];
    xp2.innerHTML = " / " + player.detailed_xp[1] + " XP";

    const bar = document.getElementsByClassName('progress-bar')[target];
    bar.style = "width: " + ((player.detailed_xp[0]/player.detailed_xp[1])*100) + "%;";

    const avatar = document.getElementsByClassName('avatar')[target];
    avatar.src = UrlExists("https://cdn.discordapp.com/avatars/" + player.id + "/" + player.avatar);

    const others = document.getElementsByClassName('otherstats')[target];
    others.innerHTML = "Total XP: " + player.xp + 
        ", Total msg: " + player.message_count + 
        ", Time spent: " + getTime(player.message_count);
    
    const servericon = document.getElementsByClassName('serverpng')[target];
    servericon.src = "https://cdn.discordapp.com/icons/" + result.guild.id + "/" + result.guild.icon;

    const servername = document.getElementsByClassName('servername')[target];
    servername.innerHTML = result.guild.name;
}

// pink floyd - time
function getTime(time) {
    return checkZero((time/1440 >> 0)) + ":" + checkZero((time/60) % 24 >> 0) + ":" + checkZero(time%60) + ":00";
}
function checkZero(time) {
    if (time < 10) {time = "0" + time};  // add zero in front of numbers < 10
    return time;
}

// returns player rank
async function getRank(player) {
    for(var i = 0; i < result.players.length; i++) {
        if (player.username == result.players[i].username) return page * 1000 + i + 1;
    }
    if (await nextPage()) return await getRank(player); 
    else return null;
}

// parse nth ranked player
async function parseByRank(number) {
    queueLimit = number;
    for(var index = 0; index < number; index++) {
        if (index != 0 && index % 1000 == 0) if (!await nextPage()) break;
        parseProfile(result.players[index - (page * 1000)], index);
        await addQueue();
    }
}

// returns player by searching username
async function getPlayerByName(name, discriminator) {
    queueLimit += 1000;
    for(var i = 0; i < result.players.length; i++) {
        await addQueue();
        if (name == result.players[i].username) {
            if (discriminator == null) return result.players[i];
            else if (discriminator == result.players[i].discriminator) return result.players[i];
        }
    }
    if (await nextPage()) return await getPlayerByName(name, discriminator);
    else return null;
}

// returns player by searching user id
async function getPlayerById(id) {
    queueLimit += 1000;
    for(var i = 0; i < result.players.length; i++) {
        await addQueue();
        if (id == result.players[i].id) return result.players[i];
    }
    if (await nextPage()) return await getPlayerById(id);
    else return null;
}

// blazingly fast player locator
async function getUsingRank(text) {
    if (text.split("#")[0] == "") { 
        var rankMinus1 = text.split("#")[1]-1;
        page = rankMinus1 / 1000 >> 0;
        await loadJSON(serverId);
        parseProfile(result.players[(rankMinus1%1000)], 0);
    } else {
        parseProfile(await getPlayerByName(text.split("#")[0], text.split("#")[1]), 0); // very accurate input cuz yes
    }
}

// top rank range
async function rankRange(text) {
    if (text.search("-") != -1) { 
        var left = text.split("-")[0];
        var right = text.split("-")[1];

        var min = Math.min(left, right)-1;
        var max = Math.max(left, right);

        queueLimit = max; queue = min;
        page = min / 1000 >> 0;
        await loadJSON(serverId);
        for (var index = min, target = 0; index < max; index++, target++) {
            if (index != 0 && index % 1000 == 0) if (!await nextPage()) break;
            parseProfile(result.players[index - (page * 1000)], target);
            await addQueue();
        }
    }
}

// loose code to fetch nth page and status
async function nextPage() {
    if (result.players.length != 0) {
        page++;
        await loadJSON(serverId);
        return true;
    } else return false;
}

// queue info, delays 1ms
async function addQueue() {
    queue++;
    var text = document.getElementById('text');
    text.value = "Parsing... " + queue + "/" + queueLimit;
    await delay(1);
}

// FIXME: only accepts 0-1000
function randomPlayer() {
    return result.players[Math.floor(Math.random() * result.players.length)];
}

async function theNeighborsKid(bruh) {
    if (bruh.search("-") == -1 || isNaN(bruh.split("-")[0]))
        parseProfile(await getPlayerByName(bruh, null), 0);
    else await rankRange(bruh);
}

async function yourMom(pussy) {
    if (pussy.toString().length == 18) 
        parseProfile(await getPlayerById(pussy), 0);
    else await parseByRank(pussy);
}

// main function (fetch button)
async function parseServer() {
    //var id = document.getElementById('serverId');
    var sel = document.getElementById('serverIdSelect');
    var name = document.getElementById('name');
    var parse = document.getElementById('text');

    parse.value = "Parsing...";
    page = 0; queue = 0; queueLimit = 0;
    if (previousQueue != name.value) destroyCards();
    else update = true;
    previousQueue = name.value;

    //await loadId(id);
    await load(sel.value);

    if (!isNaN(name.value)) await yourMom(name.value);
    else if (name.value.search("#") != -1) await getUsingRank(name.value);
    else await theNeighborsKid(name.value);

    parse.value = "Parse";
    parse.disabled = false;
}

// credits link
currentlink = "";
function randomLink() {
    var gmd = "https://mee6.xyz/api/plugins/levels/leaderboard/398627612299362304";
    var mc = "https://mee6.xyz/api/plugins/levels/leaderboard/302094807046684672";
    var tml = "https://mee6.xyz/api/plugins/levels/leaderboard/251072485095636994";

    switch (currentlink) {
        case gmd:
            setLink(document.getElementById('link'), mc);
            break;
        case mc:
            setLink(document.getElementById('link'), tml);
            break;
        default:
        case tml:
            setLink(document.getElementById('link'), gmd);
            break;
    }
}

function setLink(fuck, shit) {
    fuck.href = shit;
    fuck.innerHTML = shit;
    currentlink = shit;
}

setInterval(randomLink, 500);

// utils
function delay(ms) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, ms);
	});
}

function UrlExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    if (http.status != 404) 
        return url;
    else
        return "https://gdjkhp.github.io/img/dc.png";
}

// card utils
function addCard() {
    const rankCardHtml = `
        <div class="rank-card">
            <div class="rank-card-avatar">
                <img class="avatar" src="https://gdjkhp.github.io/img/dc.png">
            </div>

            <div class="info">
                <div class="rankgroup">
                    <span class="rank">RANK</span>
                    <span class="rank-number"></span>
                    <span class="level">LEVEL</span>
                    <span class="level-number"></span>
                </div>
                <div class="usernamegroup">
                    <span class="username">
                        <span class="realusername"></span>
                        <span class="discriminator"></span>
                    </span>
                    
                    <span class="progress-label">
                        <span class="progress-label-current"></span>
                        <span class="progress-label-limit"></span>
                    </span>
                </div>

                <div class="progress">
                    <div class="progress-bar" style="width: 50%;"></div>
                </div>

                <div class="footergroup">
                    <span class="otherstats"></span>
                    <span class="server">
                        <img class="serverpng"></img>
                        <span class="servername"></span>
                    </span>
                </div>
                
            </div>
        </div>
    `;

    const body = document.querySelector('body');
    body.insertAdjacentHTML('beforeend', rankCardHtml);
}

function destroyCards() {
    update = false;
    const elements = document.getElementsByClassName('rank-card');
    while(elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
}

async function tests() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    // Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
    //let value = params.some_key; // "some_value"
    // let player = params.player; let server = params.server;
    // console.log(server); console.log(player);
}
//tests();