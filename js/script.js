const logo = document.getElementById("logo");

const cursor = document.querySelector(".cursor");

document.addEventListener("mousemove",(e)=>{

cursor.style.left=e.clientX+"px";
cursor.style.top=e.clientY+"px";

let x=(window.innerWidth/2-e.clientX)/30;

let y=(window.innerHeight/2-e.clientY)/30;

logo.style.transform=`
rotateY(${-x}deg)
rotateX(${y}deg)
`;

});

logo.addEventListener("click",()=>{

logo.style.transition="1.5s";

logo.style.transform="scale(18) rotate(720deg)";

setTimeout(()=>{

location.reload();

},1600);

});
