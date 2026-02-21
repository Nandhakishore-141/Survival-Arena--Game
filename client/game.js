const arena = document.getElementById("arena");
const overlay = document.getElementById("overlay");
const scoreEl = document.getElementById("score");
const hpBar = document.getElementById("hpBar");
const storeBtn = document.getElementById("storeBtn");

let player;
let skulls=[];
let bullets=[];
let bosses=[];
let bossCount=0;
let powers=[];
let score=0;
let totalScore=0;
let hp=100;
let maxHp=100;
let speed=4;
let bossKills=0;
let gamePaused = false;
let gameRunning=false;
let keys={};
let freeze=false;
let rapidFireActive = false;
let rapidInterval = null;

const skins=[
{color:"white",hp:100,price:0},
{color:"cyan",hp:110,price:50},
{color:"lime",hp:130,price:100},
{color:"orange",hp:160,price:200},
{color:"purple",hp:200,price:300},
{color:"gold",hp:250,price:500},
{color:"rainbow",hp:300,price:800}
];

let owned=[true,false,false,false,false,false,false];
let equipped=0;

document.addEventListener("keydown",e=>keys[e.key.toLowerCase()]=true);
document.addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);

function startGame(){
overlay.style.display="none";
resetGame();
gameRunning=true;
loop();
}

function resetGame(){
arena.innerHTML="";
skulls=[]; bullets=[]; boss=null; powers=[];
score=0;
hp=skins[equipped].hp;
maxHp=hp;
speed=4+bossKills*0.5;

player=document.createElement("div");
player.className="player";
player.style.background=
skins[equipped].color==="rainbow"
?"linear-gradient(45deg,red,orange,yellow,green,blue,indigo,violet)"
:skins[equipped].color;
player.style.left="50%";
player.style.top="50%";
arena.appendChild(player);
}

setInterval(()=>{if(gameRunning && !gamePaused){spawnSkull();}},1000);
setInterval(()=>{if(gameRunning && !gamePaused){spawnPower();}},10000);
setInterval(()=>{if(gameRunning && !gamePaused){spawnBoss();}},60000);
setInterval(()=>{
if(gameRunning && !gamePaused){
score++;
scoreEl.textContent=score;
}
},1000);
setInterval(()=>{
    if(gameRunning && !gamePaused && !rapidFireActive){
        shootMultipleTargets(1);
    }
},3000);

function spawnSkull(){
let s=document.createElement("div");
s.className="skull";
s.textContent="💀";
s.x=Math.random()*window.innerWidth;
s.y=Math.random()*window.innerHeight;
s.speed=Math.random()*1.5+1+bossKills*0.2;
s.style.left=s.x+"px";
s.style.top=s.y+"px";
arena.appendChild(s);
skulls.push(s);
}

function spawnBoss(){
    bossCount++;

    let numberToSpawn = 1;

    if(bossCount >= 3 && bossCount % 3 === 0){
        numberToSpawn = 3; // every 3rd round after 2 bosses
    }

    for(let i=0;i<numberToSpawn;i++){
        let boss=document.createElement("div");
        boss.className="boss";
        boss.textContent="🧟";
        boss.x=Math.random()*window.innerWidth;
        boss.y=Math.random()*window.innerHeight;
        boss.speed=speed*0.9;
        boss.hitCooldown=false;

        arena.appendChild(boss);
        bosses.push(boss);

        setTimeout(()=>{
            if(arena.contains(boss)){
                arena.removeChild(boss);
                bosses = bosses.filter(b=>b!==boss);
            }
        },25000);
    }
}

function spawnPower(){
let types=["❤️","❄️","⚡","🔥"];
let p=document.createElement("div");
p.className="power";
p.textContent = types[Math.floor(Math.random() * types.length)];
p.x=Math.random()*window.innerWidth;
p.y=Math.random()*window.innerHeight;
p.style.left=p.x+"px";
p.style.top=p.y+"px";
arena.appendChild(p);
powers.push(p);

setTimeout(()=>{
if(arena.contains(p)){
arena.removeChild(p);
powers=powers.filter(x=>x!==p);
}
},15000);
}

function shootMultipleTargets(count = 1){

    if(skulls.length === 0) return;

    let px = player.offsetLeft;
    let py = player.offsetTop;

    // sort skulls by distance
    let sorted = [...skulls].sort((a,b)=>{
        let da = Math.hypot(px-a.x, py-a.y);
        let db = Math.hypot(px-b.x, py-b.y);
        return da - db;
    });

    // shoot at closest "count" skulls
    for(let i = 0; i < Math.min(count, sorted.length); i++){

        let target = sorted[i];

        let bullet = document.createElement("div");
        bullet.className="bullet";
        bullet.x = px;
        bullet.y = py;

        arena.appendChild(bullet);
        bullets.push({el:bullet,target:target});
    }
}

function loop(){
if(!gameRunning) return;
update();
requestAnimationFrame(loop);
}

function update(){
    if(gamePaused) return;

let x=player.offsetLeft;
let y=player.offsetTop;

if(keys["w"]||keys["arrowup"]) y-=speed;
if(keys["s"]||keys["arrowdown"]) y+=speed;
if(keys["a"]||keys["arrowleft"]) x-=speed;
if(keys["d"]||keys["arrowright"]) x+=speed;

x=Math.max(0,Math.min(window.innerWidth-40,x));
y=Math.max(0,Math.min(window.innerHeight-40,y));

player.style.left=x+"px";
player.style.top=y+"px";

skulls.forEach(s=>{
    if(!arena.contains(s)) return;
if(freeze) return;
let dx=x-s.x;
let dy=y-s.y;
let dist = Math.hypot(dx,dy);

if(dist > 0){
    s.x += (dx/dist) * s.speed;
    s.y += (dy/dist) * s.speed;
}
s.style.left=s.x+"px";
s.style.top=s.y+"px";
if (dist < 30 && !s.hitCooldown) {
    hp -= 5;
    s.hitCooldown = true;

    setTimeout(() => {
        s.hitCooldown = false;
    }, 600); // can only damage every 0.6s
};
});

bosses.forEach((boss,index)=>{
    let dx=x-boss.x;
    let dy=y-boss.y;
    let dist=Math.hypot(dx,dy);

    if(dist > 0){
    boss.x += (dx/dist) * boss.speed;
    boss.y += (dy/dist) * boss.speed;
}
    boss.style.left=boss.x+"px";
    boss.style.top=boss.y+"px";

    if(dist<60 && !boss.hitCooldown){
        hp-=20;
        boss.hitCooldown=true;
        setTimeout(()=>boss.hitCooldown=false,1000);
    }
});

for(let i = bullets.length - 1; i >= 0; i--){
    let b = bullets[i];
let dx=b.target.x-b.el.x;
let dy=b.target.y-b.el.y;
let dist=Math.hypot(dx,dy);
b.el.x+=dx/dist*6;
b.el.y+=dy/dist*6;
b.el.style.left=b.el.x+"px";
b.el.style.top=b.el.y+"px";
if(dist<20){

    if(arena.contains(b.target)){
        arena.removeChild(b.target);
    }

    skulls = skulls.filter(x=>x !== b.target);

    if(arena.contains(b.el)){
        arena.removeChild(b.el);
    }

    bullets.splice(i,1);
}
};

powers.forEach((p,i)=>{
let dx=x-p.x;
let dy=y-p.y;
if(Math.hypot(dx,dy)<30){
if(p.textContent==="❤️") hp=Math.min(maxHp,hp+50);
if(p.textContent==="❄️"){
freeze=true;
setTimeout(()=>freeze=false,4000);
}
if(p.textContent==="⚡"){
speed*=2;
setTimeout(()=>speed/=2,3000);
}
if(p.textContent==="🔥"){
    activateRapidFire();
}
arena.removeChild(p);
powers.splice(i,1);
}
});

hpBar.style.width=(hp/maxHp*100)+"%";

if(hp<=0){
gameRunning=false;
totalScore+=score;
overlay.innerHTML=`
<h1>Game Over</h1>
<p>Score: ${score}</p>
<button class="btn" onclick="startGame()">Respawn</button>`;
overlay.style.display="flex";
}
}

function openStore(){
    if(!gameRunning) return;

    gamePaused = true;
    document.getElementById("storePopup").style.display="flex";
    document.getElementById("totalScore").textContent=totalScore;
    renderStore();
}

function closeStore(){
    document.getElementById("storePopup").style.display="none";
    gamePaused = false;
}

function activateRapidFire(){

    if(rapidFireActive) return;

    rapidFireActive = true;

    // 2 bullets per second
    rapidInterval = setInterval(()=>{
        if(gameRunning && !gamePaused){
            shootMultipleTargets(2);
        }
    },1000);

    // lasts 10 seconds
    setTimeout(()=>{
        clearInterval(rapidInterval);
        rapidFireActive = false;
    },10000);
}

function renderStore(){
let container=document.getElementById("storeItems");
container.innerHTML="";
skins.forEach((s,i)=>{
let div=document.createElement("div");
div.className="colorItem";

let box=document.createElement("div");
box.className="colorBox";
box.style.background=s.color==="rainbow"
?"linear-gradient(45deg,red,orange,yellow,green,blue,indigo,violet)"
:s.color;
div.appendChild(box);

let text=document.createElement("div");
text.textContent="HP: "+s.hp+" | Price: "+s.price;
div.appendChild(text);

let btn=document.createElement("button");
btn.className="btn";

if(!owned[i]){
btn.textContent="BUY";
btn.onclick=()=>{
if(totalScore>=s.price){
totalScore-=s.price;
owned[i]=true;
renderStore();
}
};
}else{
btn.textContent=i===equipped?"EQUIPPED":"EQUIP";
btn.onclick=()=>{
equipped=i;
renderStore();
};
}
div.appendChild(btn);
container.appendChild(div);
});
}

document.getElementById("playBtn").onclick=startGame;
storeBtn.onclick=openStore;