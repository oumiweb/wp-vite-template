import "@splidejs/splide/css";
import Splide from "@splidejs/splide";

// スライダー要素が存在する場合のみ初期化
const sliderElement = document.querySelector(".js-mv-splide");

if (sliderElement) {
  new Splide(".js-mv-splide", {
    type: "loop",
    perMove: 1,
    pagination: false,
    arrows: false,
    drag: false,
    autoplay: true,
    interval: 3000,
    speed: 800,
  }).mount();
}
