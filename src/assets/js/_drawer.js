// === 定数定義 ===
const BREAKPOINTS = {
  TABLET: 768,
};

const ANIMATION = {
  DURATION: 500,
};

const activeAnimations = new WeakMap();

// === ユーティリティ関数 ===

function animate(element, updateFn, completeFn = () => {}, duration = ANIMATION.DURATION) {
  const prevState = activeAnimations.get(element);
  if (prevState) {
    prevState.cancelled = true;
    cancelAnimationFrame(prevState.rafId);
  }

  let start = null;
  const state = {
    cancelled: false,
    rafId: 0,
  };

  function frame(timestamp) {
    if (state.cancelled) return;
    if (!start) start = timestamp;
    const progress = timestamp - start;
    const ratio = duration === 0 ? 1 : Math.min(progress / duration, 1);

    updateFn(ratio);

    if (ratio < 1) {
      state.rafId = requestAnimationFrame(frame);
    } else {
      activeAnimations.delete(element);
      completeFn();
    }
  }

  state.rafId = requestAnimationFrame(frame);
  activeAnimations.set(element, state);
}

function throttle(callback, delay = 100) {
  let timeoutId;
  return function () {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      callback();
    }, delay);
  };
}

function rememberDisplay(element) {
  if (!element.dataset.originalDisplay) {
    const computedDisplay = window.getComputedStyle(element).display;
    if (computedDisplay && computedDisplay !== "none") {
      element.dataset.originalDisplay = computedDisplay;
    }
  }
}

function showElement(element) {
  rememberDisplay(element);
  element.style.display = element.dataset.originalDisplay || "block";
}

/**
 * ドロワーが開いている時に背景のスクロールを無効化する
 * スクロール位置を保持するため、bodyをfixedで固定し、現在のスクロール位置を保存する
 */
function disableBodyScroll() {
  const scrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";
  document.body.dataset.scrollY = String(scrollY);
}

/**
 * ドロワーが閉じた時に背景のスクロールを有効化する
 * 保存していたスクロール位置に復元する
 */
function enableBodyScroll() {
  const scrollY = document.body.dataset.scrollY || "0";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  window.scrollTo(0, parseInt(scrollY, 10));
  delete document.body.dataset.scrollY;
}

// === アニメーション関数 ===

function fadeIn(element, duration = ANIMATION.DURATION) {
  showElement(element);
  const startOpacity = parseFloat(window.getComputedStyle(element).opacity) || 0;
  element.style.opacity = String(startOpacity);

  animate(
    element,
    ratio => {
      element.style.opacity = String(startOpacity + (1 - startOpacity) * ratio);
    },
    () => {
      element.style.opacity = "1";
    },
    duration,
  );
}

function fadeOut(element, duration = ANIMATION.DURATION) {
  rememberDisplay(element);
  const startOpacity = parseFloat(window.getComputedStyle(element).opacity) || 1;

  animate(
    element,
    ratio => {
      element.style.opacity = String(startOpacity * (1 - ratio));
    },
    () => {
      element.style.display = "none";
      element.style.opacity = "0";
    },
    duration,
  );
}

// === 初期化 ===

document.addEventListener("DOMContentLoaded", function () {
  // ハンバーガーメニュー
  const hamburger = document.querySelector(".js-hamburger");
  const drawer = document.querySelector(".js-drawer");

  if (hamburger && drawer) {
    // ハンバーガーメニューのクリックでドロワーを開閉
    hamburger.addEventListener("click", () => {
      const isOpening = !hamburger.classList.contains("is-open");
      hamburger.classList.toggle("is-open");

      if (isOpening) {
        // ドロワーを開く時：背景のスクロールを無効化してからフェードイン
        hamburger.setAttribute("aria-expanded", "true");
        hamburger.setAttribute("aria-label", "メニューを閉じる");
        drawer.setAttribute("aria-hidden", "false");
        disableBodyScroll();
        fadeIn(drawer);
      } else {
        // ドロワーを閉じる時：フェードアウトしてから背景のスクロールを有効化
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.setAttribute("aria-label", "メニューを開く");
        drawer.setAttribute("aria-hidden", "true");
        fadeOut(drawer);
        enableBodyScroll();
      }
    });

    // ドロワー内のリンクをクリックした時にドロワーを閉じる
    drawer.querySelectorAll("a[href]").forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("is-open");
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.setAttribute("aria-label", "メニューを開く");
        drawer.setAttribute("aria-hidden", "true");
        fadeOut(drawer);
        enableBodyScroll();
      });
    });

    // タブレットサイズ以上にリサイズした時にドロワーを閉じる
    window.addEventListener(
      "resize",
      throttle(() => {
        if (window.matchMedia(`(min-width: ${BREAKPOINTS.TABLET}px)`).matches) {
          if (hamburger.classList.contains("is-open")) {
            hamburger.classList.remove("is-open");
            hamburger.setAttribute("aria-expanded", "false");
            hamburger.setAttribute("aria-label", "メニューを開く");
            drawer.setAttribute("aria-hidden", "true");
            fadeOut(drawer);
            enableBodyScroll();
          }
        }
      }),
    );
  }
});
