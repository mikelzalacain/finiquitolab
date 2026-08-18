(function () {
  "use strict";
  var C = window.MiFiniquito;

  window.renderError = function (el, msg) {
    el.classList.remove("hidden");
    el.innerHTML = '<p class="error">' + msg + "</p>";
  };

  window.bindForm = function (form, run) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      run();
    });
    form.querySelectorAll("input, select").forEach(function (node) {
      node.addEventListener("change", run);
    });
  };

  window.C = C;
})();
