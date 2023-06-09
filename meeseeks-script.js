var result, page = 0, serverId, queue, queueLimit, previousQueue = null, update = false, turing = false, topXP;

// cors unblocked api server, please don't abuse (rate limited, can ban my server's ip address), delays 500ms
async function loadJSON(id) {
    if (turing) return;
    result = await fetch(`https://meeseeks-api.gdjkhp.repl.co/${id}?limit=1000&page=${page}`).then(res => res.json());
    // result = await fetch(`https://cors-anywhere.gdjkhp.repl.co/mee6.xyz/api/plugins/levels/leaderboard/${id}?limit=1000&page=${page}`).then(res => res.json());
    // result = await fetch(`https://cors.gdjkhp.repl.co/mee6.xyz/api/plugins/levels/leaderboard/${id}?limit=1000&page=${page}`).then(res => res.json());
    console.log(result);
    if (page == 0) topXP = result.players[0].xp;
    await delay(500);
}

// load custom server id + pre defined servers
function load(sel) {
    if (isFinite(sel)) return serverId = sel;
    // geometrydash: 398627612299362304
    // minecraft: 302094807046684672
    // terraria: 251072485095636994
    // query: ?limit=1000&page=1
    switch(sel) {
        case "gmd":
            return "398627612299362304";
        case "mc":
            return "302094807046684672";
        case "tml":
            return "251072485095636994";
    }
    return "";
}

// server id support
const serverSelect = document.getElementById('serverIdSelect');
const serverBox = document.getElementById('serverId');
serverBox.value = load(serverSelect.value);
serverSelect.addEventListener('change', () => {
    serverSelect.value != 'id' ? serverBox.disabled = true : serverBox.disabled = false;
    serverBox.value = load(serverSelect.value);
});

// returns a neat rank card
async function parseProfile(player, target) {
    if (player == null) return;
    const rankcard = document.getElementsByClassName('rank-card')[target];
    if (!update || rankcard == null) addCard();
    else rankcard.style = "opacity: 1;";
    var color = getRoleColor(player.level);

    const user = document.getElementsByClassName('realusername')[target];
    user.innerHTML = player.username;
    user.style = `font-size: 24px; font-weight: bold; color: ${color};`;

    const discordtag = document.getElementsByClassName('discriminator')[target];
    discordtag.innerHTML = `#${player.discriminator}`;

    const rank = document.getElementsByClassName('rank-number')[target];
    rank.innerHTML = `#${getRank(player)}`;

    const level = document.getElementsByClassName('level-number')[target];
    level.innerHTML = player.level;
    level.style = `font-size: 32px; font-weight: bold; color: ${color};`;

    const level1 = document.getElementsByClassName('level')[target];
    level1.style = `font-size: 16px; color: ${color};`;

    const xp = document.getElementsByClassName('progress-label-current')[target];
    xp.innerHTML = player.detailed_xp[0];

    const xp2 = document.getElementsByClassName('progress-label-limit')[target];
    xp2.innerHTML = ` / ${player.detailed_xp[1]} XP`;

    const bar = document.getElementsByClassName('progress-bar')[target];
    bar.style = `width: ${((player.detailed_xp[0]/player.detailed_xp[1])*100)}%; background-color: ${color};`;

    const avatar = document.getElementsByClassName('avatar')[target];
    const url = `https://cdn.discordapp.com/avatars/${player.id}/${player.avatar}`;
    const isActive = UrlExists(url);
    avatar.src = player.avatar != "" && isActive ? url : "https://gdjkhp.github.io/img/dc.png";

    if (player.avatar != "" && !isActive) {
        const strike = document.createElement('s');
        user.parentNode.insertBefore(strike, user);
        strike.appendChild(user);
    }
    
    const servericon = document.getElementsByClassName('serverpng')[target];
    const url2 = `https://cdn.discordapp.com/icons/${result.guild.id}/${result.guild.icon}`;
    servericon.src = UrlExists(url2) ? url2 : "https://gdjkhp.github.io/img/dc.png";

    const servername = document.getElementsByClassName('servername')[target];
    servername.innerHTML = result.guild.name;

    const percent = document.getElementsByClassName('progress-percent')[target];
    percent.innerHTML = `${round(player.detailed_xp[0] / player.detailed_xp[1] * 100, 2)}%`;

    const percent2 = document.getElementsByClassName('progress-percent2')[target];
    percent2.innerHTML = `${round(player.xp / topXP * 100, 2)}%`;

    const bar2 = document.getElementsByClassName('progress-bar2')[target];
    bar2.style = `width: ${player.xp / topXP * 100}%;`;

    const a = document.createElement("a");
    a.href = `https://discord.com/users/${player.id}`;
    a.target = "discord";
    avatar.parentNode.insertBefore(a, avatar);
    a.appendChild(avatar);

    const a2 = document.createElement("a");
    a2.href = `https://discord.com/users/${player.id}`;
    a2.target = "discord";
    const usernamegroup = document.getElementsByClassName('username')[target];
    usernamegroup.parentNode.insertBefore(a2, usernamegroup);
    a2.appendChild(usernamegroup);

    var luckColor = "white";
    const arrow = document.getElementsByClassName('progress-label-luck')[target];
    // blazing fast previous player locator
    var rankMinus1 = getRank(player);
    var pageT = rankMinus1 / 1000 >> 0;
    var storePage = 0, prevPlayer;
    if (page != pageT) {
        storePage = page;
        page = pageT;
        await loadJSON(serverId);
        prevPlayer = result.players[rankMinus1 - (page*1000)];
        page = storePage;
        await loadJSON(serverId);
    }
    else prevPlayer = result.players[rankMinus1 - (page*1000)];
    if (prevPlayer.xp != player.xp || player.message_count != prevPlayer.message_count) {
        boolean = player.message_count - prevPlayer.message_count > 0;
        luckColor = boolean ? "red" : "lime";
        arrow.style.color = luckColor;
        arrow.innerHTML = boolean ? "&darr;" : "&uarr;";
    }

    const msg = document.getElementsByClassName('progress-label-msg')[target];
    msg.style.color = luckColor;
    msg.innerHTML = `${Math.ceil((5*Math.pow(player.level,2)+50*player.level+100-(player.detailed_xp[0]))/20)}`;

    const others = document.getElementsByClassName('otherstats')[target];
    others.innerHTML = `Total XP: ${player.xp}, Total msg: ${player.message_count}, Time spent: ${getTime(player.message_count)}`;
    // banned members support
    if (serverId == "398627612299362304") {
        if (player.id == "729554186777133088") {
            let timerIdGDjkhp;
            clearInterval(timerIdGDjkhp);
            timerIdGDjkhp = setInterval(() => countdown0(others, timerIdGDjkhp, player, "2023-10-26"), 1);
        }
        if (player.id == "1003633156408229959") {
            let timerIdVania;
            clearInterval(timerIdVania);
            timerIdVania = setInterval(() => countdown0(others, timerIdVania, player, "2024-12-23"), 1);
        }
    }
}

// APPEAL COOLDOWN
function countdown0(timerElBan, timerId, player0, date) {
    // Calculate time difference between now and end time
    const timeDiff = new Date(date) - new Date();
    // Calculate days, hours, minutes, seconds, and milliseconds
    const days = String(Math.floor(timeDiff / (1000 * 60 * 60 * 24))).padStart(2, '0');
    const hours = String(Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
    const minutes = String(Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    const seconds = String(Math.floor((timeDiff % (1000 * 60)) / 1000)).padStart(2, '0');
    const milliseconds = String(Math.floor((timeDiff % 1000) / 10)).padStart(2, '0');
    const displayTime = `${days}:${hours}:${minutes}:${seconds}.${milliseconds}`;
    // Update timer display
    timerElBan.innerText = `Total XP: ${player0.xp}, Total msg: ${player0.message_count}, Time spent: ${displayTime}`;
    // Stop the countdown when timeLeft reaches 0
    if (timeDiff <= 0) {
        clearInterval(timerId);
        timerElBan.innerText = `Total XP: ${player0.xp}, Total msg: ${player0.message_count}, Time spent: ${getTime(player0.message_count)}`;
    }
}

// returns player rank
function getRank(player) {
    for(var i = 0; i < result.players.length; i++) {
        if (player.username == result.players[i].username) return page * 1000 + i + 1;
    }
    return null;
}

// parse nth ranked player
async function parseByRank(number) {
    queueLimit = number;
    for(var index = 0; index < number && !turing; index++) {
        if (index != 0 && index % 1000 == 0) if (!await nextPage()) break;
        await parseProfile(result.players[index - (page * 1000)], index);
        await addQueue();
    }
}

// returns player by searching username
async function getPlayerByName(name, discriminator) {
    queueLimit += result.players.length;
    for(var i = 0; i < result.players.length && !turing; i++) {
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
    queueLimit += result.players.length;
    for(var i = 0; i < result.players.length && !turing; i++) {
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
        var pageT = rankMinus1 / 1000 >> 0;
        if (page != pageT) {
            page = pageT;
            await loadJSON(serverId);
        }
        await parseProfile(result.players[(rankMinus1%1000)], 0);
    } else {
        await parseProfile(await getPlayerByName(text.split("#")[0], text.split("#")[1]), 0); // very accurate input cuz yes
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
        if (page != 0) await loadJSON(serverId);
        for (var index = min, target = 0; index < max && !turing; index++, target++) {
            if (index != 0 && index % 1000 == 0) if (!await nextPage()) break;
            await parseProfile(result.players[index - (page * 1000)], target);
            await addQueue();
        }
    }
}

// split the search using commas
async function multipleSearch(text) {
    var query = text.split(/\s*,\s*/);
    console.log(query);
    var index1 = 0;

    // rank
    lengthMinus1 = query.length - 1;
    while(lengthMinus1 >= 0) {
        if (isFinite(query[lengthMinus1]) && !(query[lengthMinus1].toString().length >= 18)) {
            queue = 0; page = 0;
            await loadJSON(serverId);
            queueLimit = query[lengthMinus1];
            for(var index = 0; index < query[lengthMinus1] && !turing; index++) {
                if (index != 0 && index % 1000 == 0) if (!await nextPage()) break;
                await parseProfile(result.players[index - (page * 1000)], index1);
                index1++;
                await addQueue();
            }
            console.log(query.splice(lengthMinus1, 1));
        }
        lengthMinus1--;
    }
    console.log("rank done");

    // rank range
    lengthMinus1 = query.length - 1;
    while(lengthMinus1 >= 0) {
        if (query[lengthMinus1].search("-") != -1 && isFinite(query[lengthMinus1].split("-")[0])) {
            var left = query[lengthMinus1].split("-")[0];
            var right = query[lengthMinus1].split("-")[1];
    
            var min = Math.min(left, right)-1;
            var max = Math.max(left, right);
    
            queueLimit = max; queue = min;
            page = min / 1000 >> 0;
            await loadJSON(serverId);
            for (var index = min; index < max && !turing; index++) {
                if (index != 0 && index % 1000 == 0) if (!await nextPage()) break;
                await parseProfile(result.players[index - (page * 1000)], index1);
                index1++;
                await addQueue();
            }
            console.log(query.splice(lengthMinus1, 1));
        }
        lengthMinus1--;
    }
    console.log("rank range done");

    // blazingly fast algorithm
    lengthMinus1 = query.length - 1;
    while(lengthMinus1 >= 0) {
        if (query[lengthMinus1].search("#") != -1 && query[lengthMinus1].split("#")[0] == "") {
            var rankMinus1 = query[lengthMinus1].split("#")[1]-1;
            var pageT = rankMinus1 / 1000 >> 0;
            if (page != pageT) {
                page = pageT;
                await loadJSON(serverId);
            }
            await parseProfile(result.players[(rankMinus1%1000)], index1);
            index1++;
            console.log(query.splice(lengthMinus1, 1));
        }
        lengthMinus1--;
    }
    console.log("blazingly fast algorithm done");

    // search by id or name
    for (const element of query) {
        queue = 0; queueLimit = 0;
        if (element.toString().length >= 18) {
            page = 0;
            await loadJSON(serverId);
            await parseProfile(await getPlayerById(element), index1);
            index1++;
        }
        else if (element.search("#") != -1) {
            page = 0;
            await loadJSON(serverId);
            await parseProfile(await getPlayerByName(element.split("#")[0], element.split("#")[1]), index1);
            index1++;
        }
        else {
            page = 0;
            await loadJSON(serverId);
            await parseProfile(await getPlayerByName(element, null), index1);
            index1++;
        }
        console.log(element);
    }
    console.log("string done");
}

// loose code to fetch nth page and status
async function nextPage() {
    if (turing) return false;
    if (result.players.length != 0) {
        page++;
        await loadJSON(serverId);
        return true;
    } else return false;
}

// queue info, delays 1ms
async function addQueue() {
    queue++;
    parseButton.value = `Parsing... ${queue}/${queueLimit}`;
    await delay(1);
}

// FIXME: only accepts 0-1000
function randomPlayer() {
    return result.players[Math.floor(Math.random() * result.players.length)];
}

// if input is a string/number
async function theNeighborsKid(bruh) {
    if (bruh.search(",") != -1) await multipleSearch(bruh);
    else if (bruh.search("#") != -1) await getUsingRank(bruh);
    else if (bruh.search("-") == -1 || isNaN(bruh.split("-")[0])) // fc-clint bug
        await parseProfile(await getPlayerByName(bruh, null), 0);
    else await rankRange(bruh);
}

// if input is a number
async function yourMom(pussy) {
    if (pussy.toString().length >= 18) // Shobii bug
        await parseProfile(await getPlayerById(pussy), 0);
    else await parseByRank(pussy);
}

// main function (fetch button)
var parseButton = document.getElementById('text');
var node = document.getElementById('name');
async function parse() {
    reset();
    await parseReal(serverBox.value, node.value);
}

function reset() {
    parseButton.value = "Parsing...";
    parseButton.disabled = true; turing = false;
    page = 0; queue = 0; queueLimit = 0;
    if (previousQueue != node.value) destroyCards();
    else {
        update = true;
        const card = document.getElementsByClassName('rank-card');
        Array.from(card).forEach(element => {
            element.style = "opacity: 0.5;";
        });
    }
    previousQueue = node.value;

    endTime = new Date(Date.now() + 60 * 1000);
    clearInterval(timerId);
    timerId = setInterval(countdown, 1);
}

// real main
async function parseReal(server, input) {
    try {
        await parseServer(server);
        stop1.disabled = false;
        await parseInput(input);
        parseButton.value = "Parse";
    } catch (error) {
        console.log(error);
        parseButton.value = "Retry";
    }
    parseButton.disabled = false; stop1.disabled = true;
}

// parsing server and player
async function parseServer(id) {
    serverId = load(id);
    if (serverId != "") await loadJSON(serverId);
}

async function parseInput(buffer) {
    if (isFinite(buffer)) await yourMom(buffer);
    else await theNeighborsKid(buffer);
}

// 60 second countdown
const timerEl = document.getElementById('timer');
let endTime, timerId;
function countdown() {
    // Calculate time difference between now and end time
    const timeDiff = endTime - new Date();
    // Format time display as "MM:SS:MS"
    const minutes = String(Math.floor(timeDiff / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((timeDiff % 60000) / 1000)).padStart(2, '0');
    const milliseconds = String(Math.floor((timeDiff % 1000) / 10)).padStart(2, '0');
    const displayTime = `${minutes}:${seconds}.${milliseconds}`;
    // Update timer display
    timerEl.innerText = displayTime;
    // Stop the countdown when timeLeft reaches 0
    if (timeDiff <= 0) {
        clearInterval(timerId);
        timerEl.innerText = "00:00.00";
    }
}

// embed stuff
async function embed() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    // Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
    //let value = params.some_key; // "some_value"

    let player = params.player; let server = params.server;
    console.log(server); console.log(player);

    //?server=gmd&player=GDjkhp
    if (server != null && player != null) {
        node.value = player;
        reset();
        await parseReal(server, player);
    }
    // TODO: send PNG to client
}
embed();

// FIXME: server status
const ping = document.getElementById('status');
function pingpong() {
    if (UrlExists(`https://meeseeks-api.gdjkhp.repl.co/398627612299362304`)) {
        ping.innerHTML = "online";
        ping.style = "font-weight: bold; color: lime;";
    } else {
        ping.innerHTML = "offline";
        ping.style = "font-weight: bold; color: red;";
    }
}
pingpong();

// halt
var stop1 = document.getElementById('stop');
stop1.disabled = true;
function halt() {
    parseButton.disabled = false; turing = true; stop1.disabled = true;
}

// details
const group = document.getElementById('foot');
function details() {
    group.style.display = group.style.display != "none" ? "none" : "block";
}

// enter for pc peeps
document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        if (!parseButton.disabled) parse();
    }
});

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
    fuck.href = fuck.innerHTML = currentlink = shit;
}
setInterval(randomLink, 500);

// utils
const tx = document.getElementsByTagName("textarea");
for (let i = 0; i < tx.length; i++) {
    tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
    tx[i].addEventListener("input", OnInput, false);
}

function OnInput() {
    this.style.height = 0;
    this.style.height = (this.scrollHeight) + "px";
}

function getRoleColor(level) {
    const roles_rewards = result.role_rewards;
    for (let i = roles_rewards.length - 1; i >= 0; i--) {
        const element = roles_rewards[i];
        if (element.rank <= level) return base16(element.role.color);
    }
    return "white";
}
function base16(num) {
    let hex = num.toString(16);
    while (hex.length < 6) {
        hex = "0" + hex;
    }
    return hex;
}

function round(num, places) {
    var multiplier = Math.pow(10, places);
    return Math.round(num * multiplier) / multiplier;
}

function getTime(time) {
    // pink floyd - time
    return `${checkZero((time/1440 >> 0))}:${checkZero((time/60) % 24 >> 0)}:${checkZero(time%60)}:00`;
}
function checkZero(time) {
    if (time < 10) {time = "0" + time};  // add zero in front of numbers < 10
    return time;
}

function delay(ms) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, ms);
	});
}

function UrlExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    try {
        http.send();
    } catch (error) {
        console.log(error);
        return false;
    }
    if (http.status != 404)
        return true;
    return false;
}

// card utils
function addCard() {
    const rankCardHtml = `
        <div class="rank-card">
            <div class="rank-card-avatar">
                <img class="avatar">
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
                        <span class="progress-label-luck">&uarr;&darr;</span>
                        <span class="progress-label-msg">?</span>
                    </span>
                </div>
                <div class="progress">
                    <div class="progress-bar"></div>
                    <span class="progress-percent"></span>
                </div>
                <div class="progress2">
                    <div class="progress-bar2"></div>
                    <span class="progress-percent2"></span>
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
    
}
//tests();

// work in progress
function convertDivToImage() {
    const divElement = document.getElementsByClassName('rank-card')[0];
    if (divElement == null) return;
    // Set the scale factor to increase the resolution (e.g., 2 for doubling the resolution)
    const scale = 8;
    // Calculate the scaled dimensions of the div
    const scaledWidth = divElement.offsetWidth * scale;
    const scaledHeight = divElement.offsetHeight * scale;
    // Use html2canvas to capture the div element
    html2canvas(divElement, { 
        scale: scale, proxy: 'https://html2canvas-proxy-nodejs.gdjkhp.repl.co/', backgroundColor: null
    }).then((canvas) => {
        // Create a scaled canvas element to preserve the higher resolution
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = scaledWidth;
        scaledCanvas.height = scaledHeight;
        const scaledContext = scaledCanvas.getContext('2d');
        // Scale the captured canvas onto the scaled canvas
        scaledContext.drawImage(canvas, 0, 0, scaledWidth, scaledHeight);
        // Convert the canvas to a data URL representing a PNG image
        const dataUrl = canvas.toDataURL('image/png');
        // Create a link element and set its href attribute to the data URL
        const link = document.createElement('a');
        link.href = dataUrl;
        // Set the download attribute and the desired filename for the link
        link.download = 'div_image.png';
        // Programmatically trigger a click event on the link element to start the download
        link.click();
    });
}