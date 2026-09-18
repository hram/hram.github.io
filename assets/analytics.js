/* Яндекс.Метрика — один файл на весь сайт.
   Смена провайдера или настроек правится здесь, а не в двенадцати страницах. */
(function () {
  var ID = 111870889; // номер счётчика Яндекс.Метрики

  if (!ID) return;
  // свои прогоны в счёт не идут
  var h = location.hostname;
  if (h === "localhost" || h === "127.0.0.1" || h === "") return;

  (function (m, e, t, r, i, k, a) {
    m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
    m[i].l = 1 * new Date();
    for (var j = 0; j < e.scripts.length; j++) { if (e.scripts[j].src === r) return; }
    k = e.createElement(t); a = e.getElementsByTagName(t)[0];
    k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
  })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

  ym(ID, "init", {
    webvisor: true,        // форм на сайте нет — записывать нечего, кроме скролла и мыши
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true
  });

  // цель: открытие полной страницы проекта из панели созвездия
  document.addEventListener("click", function (ev) {
    var a = ev.target && ev.target.closest && ev.target.closest("a.p-link");
    if (!a) return;
    var id = (a.getAttribute("href") || "").replace(/^projects\//, "").replace(/\.html$/, "");
    ym(ID, "reachGoal", "open_project", { project: id });
  });
})();
