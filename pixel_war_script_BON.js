let userid=null;
let timeoutGlobal=0;
let tempsRestant=0;
const adresse=document.querySelector("#adresse").value;
const carte=document.querySelector("#carte").value;
console.log({adresse,carte,couleur});
const mapElement=document.querySelector("#map-container")

async function preinit(){
    const adresse=document.querySelector("#adresse").value;
    const carte=document.querySelector("#carte").value;
    const res=await fetch(`${adresse}/api/v1/${carte}/preinit`,{credentials:"include"})
    const{key}=await res.json();
    init(key);
}

async function init(key){
    const adresse=document.querySelector("#adresse").value;
    const carte=document.querySelector("#carte").value;
    const res=await fetch(`${adresse}/api/v1/${carte}/init?key=${key}`,{credentials:"include"})
    const{id,nx,ny,timeout,data}=await res.json();
    userid=id;
    timeoutGlobal=timeout;
    tempsRestant=timeoutGlobal/1000000000;

    let contenu=""
    for (let row=0;row<ny;row++){
        for (let col=0;col<nx;col++){
            const [r,g,b]=data[row][col]
            contenu+=`<div class="pixel" id="l${row}_c${col}" style="background-color:rgb(${r},${g},${b})"></div>`
        }
    }
    const mapElement=document.querySelector("#map-container")
    mapElement.innerHTML=contenu;
    mapElement.style.gridTemplateColumns=`repeat(${nx},10px)`
    mapElement.style.gridTemplateRows=`repeat(${ny},10px)`
    console.log(contenu);
    setInterval(()=>deltas(id),250) //update
    setInterval(() => {
        if (tempsRestant > 0) {
            tempsRestant-=0.001;
        }
        else{
            tempsRestant=0;
        }
        document.querySelector(".temps").textContent = `${tempsRestant.toFixed(3)} s`;
    }, 1);

    mapElement.addEventListener('click', async(event) => { //interagir avec les pixels
        
        if (event.target.classList.contains('pixel')) { //si on a cliqué sur un pixel

            if (tempsRestant > 0) {
                console.log(`vous avez déjà changé un pixel, attendez ${tempsRestant} s`);
                const alerte = document.getElementById("alerte");
                alerte.textContent = `Veuillez patienter encore ${tempsRestant.toFixed(2)} s avant de rejouer.`;
                setTimeout(() => {alerte.textContent = "";}, 1500);
                return;
            }
        
        const couleur = document.querySelector("#couleur").value //en hexadécimal
        const r=parseInt(couleur.substring(1,3),16);
        const g=parseInt(couleur.substring(3,5),16);
        const b=parseInt(couleur.substring(5,7),16);

        const pixel=event.target //le pixel choisi (l'endroit où on a cliqué)
        const id = pixel.id.match(/l(\d+)_c(\d+)/)
        const y = id[1];
        const x = id[2];
        const adresse=document.querySelector("#adresse").value;
        const carte=document.querySelector("#carte").value;
        const res= await fetch(`${adresse}/api/v1/${carte}/set/${userid}/${x}/${y}/${r}/${g}/${b}`,{credentials:"include"});
        const response= await res.json();
        if (response!=0){ //dans le sujet de TP, on ne donne pas exactement la réponse
            console.log(`vous avez déjà changé un pixel, attendez ${response} ns`)
        }
        else{
            tempsRestant=timeoutGlobal/1000000000
        }
        }
    });

    mapElement.addEventListener('mouseover',async(event)=>{
        if (event.target.classList.contains('pixel')) {
            const pixel=event.target
            const id = pixel.id.match(/l(\d+)_c(\d+)/)
            const y = id[1];
            const x = id[2];
            document.querySelector(".coordonnees").textContent = `(${x}, ${y})`;
        }
    })
}

async function deltas(id){
    const adresse=document.querySelector("#adresse").value;
    const carte=document.querySelector("#carte").value;
    const res=await fetch(`${adresse}/api/v1/${carte}/deltas?id=${id}`,{credentials:"include"})
    const {deltas}=await res.json();
    for (const [x,y,r,g,b] of deltas){
        const pixel=document.querySelector(`#l${y}_c${x}`)
        pixel.style.backgroundColor=`rgb(${r},${g},${b})`;
    }
}

preinit();