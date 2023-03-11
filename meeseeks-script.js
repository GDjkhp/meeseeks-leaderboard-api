var result, current;

async function loadJSON(id) {
    result = await fetch(`https://meeseeks-api.gdjkhp.repl.co/${id}`).then(res => res.json());
    console.log(result);
}

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

function parseProfile(player, target) {
    if (player == null) return;

    const user = document.getElementsByClassName('realusername')[target];
    user.innerHTML = player.username;

    const discordtag = document.getElementsByClassName('discriminator')[target];
    discordtag.innerHTML = "#" + player.discriminator;

    const rank = document.getElementsByClassName('rank-number')[target];
    rank.innerHTML = "#" + getRank(player);

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
    others.innerHTML = "Total XP: " + player.xp + ", Total msg: " + player.message_count;

    const servericon = document.getElementsByClassName('serverpng')[target];
    servericon.src = "https://cdn.discordapp.com/icons/" + result.guild.id + "/" + result.guild.icon;

    const servername = document.getElementsByClassName('servername')[target];
    servername.innerHTML = result.guild.name;
}

function getRank(player) {
    for(var i = 0; i < result.players.length; i++) {
        if (player.username == result.players[i].username) return i+1;
    }
    return -1;
}

function getPlayerByName(name) {
    for(var i = 0; i < result.players.length; i++) {
        if (name == result.players[i].username) return result.players[i];
    }
    return null;
}

function randomPlayer() {
    return result.players[Math.floor(Math.random() * result.players.length)];
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

function destroyCards() {
    const elements = document.getElementsByClassName('rank-card');
    while(elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
}

async function loadId(id, page) {
    await loadJSON(id.value + "?limit=1000&page=" + page);
}

async function load(sel, page) {
    switch(sel.value) {
        case "gmd":
            if (current != sel.value) {
                await loadJSON("398627612299362304?limit=1000&page=" + page);
                current = sel.value;
            }
            break;
        case "mc":
            if (current != sel.value) {
                await loadJSON("302094807046684672?limit=1000&page=" + page);
                current = sel.value;
            }
            break;
        case "tml":
            if (current != sel.value) {
                await loadJSON("251072485095636994?limit=1000&page=" + page);
                current = sel.value;
            }
            break;
    }
}

async function parseServer() {
    // geometrydash: 398627612299362304
    // minecraft: 302094807046684672
    // terraria: 251072485095636994
    // query: ?limit=1000&page=1

    //var id = document.getElementById('serverId');
    var sel = document.getElementById('serverIdSelect');
    var name = document.getElementById('name');
    var parse = document.getElementById('text');

    parse.value = "Loading...";
    destroyCards();

    //await loadId(id, 0);
    await load(sel, 0);

    if (isNaN(name.value)) {
        addCard();
        parseProfile(getPlayerByName(name.value), 0);
        parse.value = "Parse";
    } else {
        parseByRank(name.value);
        parse.value = "Parse";
    }
}

function parseByRank(number) {
    for(var index = 0; index < number; index++) {
        addCard();
        parseProfile(result.players[index], index);
    }
}

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