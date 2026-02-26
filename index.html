document.addEventListener("DOMContentLoaded", function(){
 
  let GLOBAL_SPEED = 1.4;
  let hits=0, miss=0, idCounter=1;
 
  const cpuUsageDisplay=document.getElementById("cpuUsage");
  const hitsDisplay=document.getElementById("hits");
  const missDisplay=document.getElementById("miss");
  const infoPanel=document.getElementById("infoPanel");
 
  function wait(ms){ return new Promise(r=>setTimeout(r, ms*GLOBAL_SPEED)); }
 
  window.changeSpeed = function(){
    GLOBAL_SPEED=parseFloat(document.getElementById("speedControl").value);
  }
 
  window.addBlock = function(){
    const block=document.createElement("div");
    block.className="dataBlock";
    block.innerText=idCounter++;
    block.style.top="100px";
    block.style.left="100px";
    document.querySelector(".container").appendChild(block);
 
    block.addEventListener("click", async ()=>{
      await runBlock(block);
    });
  }
 
  async function runBlock(block){
    const diskType=document.getElementById("diskType").value;
    const diskSpeed= diskType==="SSD"?700:1500;
 
    // FETCH
    block.style.top="380px"; block.style.left="80px";
    infoPanel.innerHTML=`<b>Block ${block.innerText}</b><br>Stage: FETCH<br>From Disk → RAM<br>Speed: ${diskType}`;
    await wait(diskSpeed);
 
    // DECODE
    block.style.top="90px"; block.style.left="80px";
    infoPanel.innerHTML=`<b>Block ${block.innerText}</b><br>Stage: DECODE<br>Processing in RAM`;
    await wait(1200);
 
    // CACHE
    let hit=false;
    if(Math.random()<0.65){
      hit=true; hits++; hitsDisplay.innerText=hits;
    } else{ miss++; missDisplay.innerText=miss; }
    block.style.top="220px"; block.style.left="360px";
    infoPanel.innerHTML=`<b>Block ${block.innerText}</b><br>Stage: CACHE ${hit?'HIT ✅':'MISS ❌'}`;
    await wait(800);
 
    // EXECUTE
    block.style.top="180px"; block.style.left="750px";
    const cpuLoad=Math.floor(Math.random()*35+65);
    cpuUsageDisplay.innerText=cpuLoad+"%";
    infoPanel.innerHTML=`<b>Block ${block.innerText}</b><br>Stage: EXECUTE<br>CPU Load: ${cpuLoad}%`;
    await wait(1500);
 
    // STORE
    infoPanel.innerHTML=`<b>Block ${block.innerText}</b><br>Stage: STORE<br>Done ✅`;
    await wait(900);
 
    block.remove();
    infoPanel.innerHTML=`<i>Click a block to start its process</i>`;
  }
 
});
 