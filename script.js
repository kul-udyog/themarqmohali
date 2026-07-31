(function () {
  "use strict";

  var LEAD_ENDPOINT = "https://script.google.com/macros/s/AKfycbzNC3OJcfzy2rOKHTqT0m3OGmWZ_R_OlMIv0X-ImnHhgk_4OnMsJ3Fzv6cnblgMjrM2-g/exec";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  navToggle.addEventListener("click", function () {
    var isOpen = mobileNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  mobileNav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      mobileNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Modal (with back-button-closes-modal-only pattern) ---------- */
  var overlay = document.getElementById("modalOverlay");
  var modalClose = document.getElementById("modalClose");
  var modalOpenTriggers = document.querySelectorAll("[data-open-modal]");
  var modalOpenViaHistory = false;

  function openModal() {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    if (!modalOpenViaHistory) {
      history.pushState({ marqModal: true }, "");
      modalOpenViaHistory = true;
    }
  }
  function closeModal(fromPopState) {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    if (modalOpenViaHistory && !fromPopState) {
      history.back();
    }
    modalOpenViaHistory = false;
  }
  modalOpenTriggers.forEach(function (btn) {
    btn.addEventListener("click", openModal);
  });
  modalClose.addEventListener("click", function () { closeModal(false); });
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal(false);
  });
  window.addEventListener("popstate", function () {
    if (overlay.classList.contains("open")) closeModal(true);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeModal(false);
  });

  /* ---------- Lead form submission (fire-and-forget) ---------- */
  function sanitizeMobile(v) {
    return (v || "").replace(/[^\d]/g, "").replace(/^91/, "").slice(-10);
  }

  function wireForm(form, successEl, isModal) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var mobile = sanitizeMobile(data.get("mobile"));
      if (!data.get("name") || mobile.length !== 10) {
        form.reportValidity && form.reportValidity();
        return;
      }
      var payload = {
        name: data.get("name"),
        mobile: mobile,
        email: data.get("email") || "",
        project: data.get("project"),
        source: data.get("source"),
        page: window.location.href,
        timestamp: new Date().toISOString()
      };

      // fire-and-forget so the thank-you shows instantly
      fetch(LEAD_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      }).catch(function () {});

      form.hidden = true;
      successEl.hidden = false;

      if (isModal) {
        setTimeout(function () { closeModal(false); }, 2200);
      }
    });
  }

  wireForm(document.getElementById("mainForm"), document.getElementById("mainSuccess"), false);
  wireForm(document.getElementById("modalForm"), document.getElementById("modalSuccess"), true);

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      var answer = btn.nextElementSibling;
      document.querySelectorAll(".faq-q").forEach(function (other) {
        if (other !== btn) {
          other.setAttribute("aria-expanded", "false");
          other.nextElementSibling.style.maxHeight = null;
        }
      });
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      answer.style.maxHeight = expanded ? null : answer.scrollHeight + "px";
    });
  });

  /* ---------- Showcase video play button ---------- */
  var showcaseVideo = document.getElementById("showcaseVideo");
  var playButton = document.getElementById("playButton");
  playButton.addEventListener("click", function () {
    showcaseVideo.play();
    playButton.classList.add("hidden");
  });
  showcaseVideo.addEventListener("pause", function () {
    playButton.classList.remove("hidden");
  });
  showcaseVideo.addEventListener("ended", function () {
    playButton.classList.remove("hidden");
  });

  /* ---------- Sticky mobile CTA ---------- */
  var stickyCta = document.getElementById("stickyCta");
  var enquireSection = document.getElementById("enquire");
  if (stickyCta) {
    stickyCta.classList.add("show");
    if ("IntersectionObserver" in window) {
      var stickyIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.target === enquireSection) {
            stickyCta.classList.toggle("show", !entry.isIntersecting);
          }
        });
      }, { threshold: 0.15 });
      stickyIo.observe(enquireSection);
    }
  }

  /* ---------- Scroll reveal ---------- */
  var revealTargets = document.querySelectorAll(".section, .highlight-card");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(function (el) { io.observe(el); });
  }
})();
