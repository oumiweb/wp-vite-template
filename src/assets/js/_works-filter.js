/**
 * 制作実績一覧のフィルター機能
 */

document.addEventListener("DOMContentLoaded", function () {
  const filterButtons = document.querySelectorAll(".js-works-filter-btn");
  const cards = document.querySelectorAll(".js-works-card");

  // フィルターボタンがない場合は処理しない
  if (filterButtons.length === 0) return;

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const filter = this.dataset.filter;

      // アクティブ状態の更新（aria-pressed も同期）
      filterButtons.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      this.classList.add("is-active");
      this.setAttribute("aria-pressed", "true");

      // カードのフィルタリング
      cards.forEach(function (card) {
        if (filter === "all") {
          card.style.display = "";
        } else {
          const categories = card.dataset.categories.split(" ");
          if (categories.includes(filter)) {
            card.style.display = "";
          } else {
            card.style.display = "none";
          }
        }
      });
    });
  });
});
