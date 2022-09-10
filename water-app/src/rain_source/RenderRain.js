import "./rain_style.css"

const RenderRain = () => {
    let hrElement;
    let counter = 30;
    for (let i = 0; i < counter; i++) {
        hrElement = document.createElement("HR");

        hrElement.style.left = Math.floor(Math.random() * window.innerWidth) + "px";
        hrElement.style.animationDuration = 0.2 + Math.random() * 0.3 + "s";
        hrElement.style.animationDelay = Math.random() * 5 + "s";

        document.body.appendChild(hrElement);
    }
}

export default RenderRain
