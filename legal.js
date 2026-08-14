/* Hành vi dùng chung cho 4 trang điều khoản.
   Dùng đúng cách đổi ngôn ngữ của homepage: duyệt text node rồi tra từ điển EN -> VI,
   nên chữ nghĩa ở nav/footer khớp tuyệt đối với trang chủ.
   Từ điển riêng của từng trang nằm ở window.LEGAL_I18N (nhúng sẵn trong file HTML). */
(function () {
  'use strict';

  var dict = window.LEGAL_I18N || {};
  var originals = new WeakMap();

  function translate(language) {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var tag = node.parentElement && node.parentElement.tagName;
        return tag && ['SCRIPT', 'STYLE', 'NOSCRIPT'].indexOf(tag) === -1 && node.nodeValue.trim()
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });
    var node;
    while ((node = walker.nextNode())) {
      if (!originals.has(node)) originals.set(node, node.nodeValue);
      var original = originals.get(node);
      var trimmed = original.trim();
      var replacement = language === 'vi' ? (dict[trimmed] || trimmed) : trimmed;
      var start = original.indexOf(trimmed);
      node.nodeValue = original.slice(0, start) + replacement + original.slice(start + trimmed.length);
    }
  }

  var toggle = document.getElementById('languageToggle');

  function apply(language) {
    translate(language);
    document.documentElement.lang = language === 'vi' ? 'vi' : 'en';
    var input = document.querySelector('#footerSearch input');
    if (input) input.placeholder = language === 'vi' ? 'Bạn muốn tự động hóa công việc nào?' : 'What work do you want to automate?';
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(language === 'vi'));
      toggle.setAttribute('aria-label', language === 'vi' ? 'Chuyển website sang tiếng Anh' : 'Switch website language to Vietnamese');
      Array.prototype.forEach.call(toggle.querySelectorAll('[data-language]'), function (item) {
        item.classList.toggle('active', item.dataset.language === language);
      });
    }
    var titleTag = document.querySelector('meta[name="title-' + (language === 'vi' ? 'vi' : 'en') + '"]');
    if (titleTag) document.title = titleTag.getAttribute('content') || document.title;
  }

  function stored() {
    try { return localStorage.getItem('ce-lang'); } catch (error) { return null; }
  }

  var requested = new URLSearchParams(window.location.search).get('lang');
  apply(requested === 'vi' || requested === 'en' ? requested : (stored() === 'vi' ? 'vi' : 'en'));

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = toggle.getAttribute('aria-pressed') === 'true' ? 'en' : 'vi';
      apply(next);
      try { localStorage.setItem('ce-lang', next); } catch (error) { /* chế độ riêng tư */ }
    });
  }

  /* Menu mobile — cùng class với homepage nên dùng lại nguyên CSS */
  var menuToggle = document.getElementById('menuToggle');
  var navPill = document.getElementById('navPill');
  if (menuToggle && navPill) {
    menuToggle.addEventListener('click', function () {
      var open = navPill.classList.toggle('mobile-open');
      menuToggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    });
  }

  /* Dropdown Resources */
  var resources = document.getElementById('resources');
  var resourceButton = document.getElementById('resourceButton');
  if (resources && resourceButton) {
    resourceButton.addEventListener('click', function (event) {
      event.stopPropagation();
      var open = resources.classList.toggle('open');
      resourceButton.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (event) {
      if (!resources.contains(event.target)) {
        resources.classList.remove('open');
        resourceButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Nút Start free ở nav và cuối trang -> về khu vực agent trên trang chủ */
  Array.prototype.forEach.call(document.querySelectorAll('[data-action="start"]'), function (button) {
    button.addEventListener('click', function () {
      window.location.href = 'ClawExperts-show-dont-tell-prototype.html#agents';
    });
  });

  /* Ô tìm kiếm ở footer chỉ là trang trí trên các trang này */
  var search = document.getElementById('footerSearch');
  if (search) search.addEventListener('submit', function (event) { event.preventDefault(); });
})();
