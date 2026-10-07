(function () {
  "use strict";

  var LEAD_ENDPOINT = "https://script.google.com/macros/s/AKfycbzNC3OJcfzy2rOKHTqT0m3OGmWZ_R_OlMIv0X-ImnHhgk_4OnMsJ3Fzv6cnblgMjrM2-g/exec";

  /* Direct-contact numbers are intentionally kept out of visible page text —
     they only ever live inside these two href targets, reached via the
     Call Now / WhatsApp buttons after the lead-capture modal below. */
  var CALL_TEL_HREF = "tel:+917696291827";
  var WHATSAPP_HREF = "https://wa.me/917696291827?text=" +
    encodeURIComponent("Hi, I'm interested in The Marq by Atlantis, Mohali. Could you share more details?");

  /* Modal copy per CTA type — enquire/brochure/pricing are pure lead capture
     the sales team follows up on; call/whatsapp also capture the lead first,
     then hand off to the phone dialer / WhatsApp once the form is submitted. */
  var CTA_COPY = {
    enquire: {
      title: "Register Your Interest",
      submit: "Enquire Now",
      source: "modal",
      success: "Our team will contact you shortly with verified details on The Marq by Atlantis."
    },
    brochure: {
      title: "Get the Brochure",
      submit: "Request Brochure",
      source: "brochure-request",
      success: "Thank you! Our team will share the full brochure with you shortly."
    },
    pricing: {
      title: "Request Pricing",
      submit: "Request Pricing",
      source: "pricing-request",
      success: "Thank you! Our team will get in touch with pricing details for The Marq by Atlantis."
    },
    call: {
      title: "Before You Call",
      submit: "Continue to Call",
      source: "call-now",
      success: "Thanks! Connecting your call now…"
    },
    whatsapp: {
      title: "Before You WhatsApp",
      submit: "Continue to WhatsApp",
      source: "whatsapp",
      success: "Thanks! Opening WhatsApp now…"
    }
  };

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav (with back-button-closes-menu-only pattern) ---------- */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  var mobileNavClose = document.getElementById("mobileNavClose");
  var mobileNavOpenViaHistory = false;
  function openMobileNav() {
    mobileNav.classList.add("open");
    navToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    document.body.classList.add("nav-open");
    if (!mobileNavOpenViaHistory) {
      history.pushState({ marqNav: true }, "");
      mobileNavOpenViaHistory = true;
    }
  }
  function closeMobileNav(fromPopState) {
    mobileNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    document.body.classList.remove("nav-open");
    if (mobileNavOpenViaHistory && !fromPopState) {
      history.back();
    }
    mobileNavOpenViaHistory = false;
  }
  navToggle.addEventListener("click", function () {
    if (mobileNav.classList.contains("open")) closeMobileNav(false);
    else openMobileNav();
  });
  mobileNavClose.addEventListener("click", function () { closeMobileNav(false); });
  mobileNav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      // Close without popping history here — the anchor's own hash
      // navigation already advances history, so calling history.back()
      // in parallel would race against it and cancel the scroll.
      mobileNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      document.body.classList.remove("nav-open");
      mobileNavOpenViaHistory = false;
    });
  });
  window.addEventListener("popstate", function () {
    if (mobileNav.classList.contains("open")) closeMobileNav(true);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileNav.classList.contains("open")) closeMobileNav(false);
  });

  /* ---------- Modal (with back-button-closes-modal-only pattern) ---------- */
  var overlay = document.getElementById("modalOverlay");
  var modalClose = document.getElementById("modalClose");
  var modalOpenTriggers = document.querySelectorAll("[data-open-modal]");
  var modalOpenViaHistory = false;
  var modalTitleEl = document.getElementById("modalTitle");
  var modalSubmitBtn = document.getElementById("modalSubmitBtn");
  var modalSuccessText = document.getElementById("modalSuccessText");
  var modalSourceInput = document.querySelector("#modalForm input[name=source]");
  var modalConfigInput = document.querySelector("#modalForm input[name=configuration]");
  var activeCta = "enquire";

  /* Keep the popup above the phone's on-screen keyboard: size the overlay to
     the *visible* viewport (which shrinks when the keyboard opens), so the
     form is centred in the part of the screen that is still showing and
     nothing is hidden behind the keyboard. */
  var modalBox = overlay.querySelector(".modal");
  function fitModalToVisibleViewport() {
    if (!overlay.classList.contains("open")) return;
    var vv = window.visualViewport;
    var h = vv ? vv.height : window.innerHeight;
    var top = vv ? vv.offsetTop : 0;
    overlay.style.top = top + "px";
    overlay.style.bottom = "auto";
    overlay.style.height = h + "px";
    // Keyboard open (visible area clearly shorter than the page): use a
    // compact layout so the whole form, including the submit button, fits.
    overlay.classList.toggle("kb-open", h < window.innerHeight - 100);
    if (modalBox) modalBox.style.maxHeight = Math.max(220, h - 24) + "px";
    // Make sure the field being typed in stays visible inside the popup.
    var el = document.activeElement;
    if (el && modalBox && modalBox.contains(el) && el.scrollIntoView) {
      el.scrollIntoView({ block: "nearest" });
    }
  }
  function resetModalFit() {
    overlay.style.top = "";
    overlay.style.bottom = "";
    overlay.style.height = "";
    overlay.classList.remove("kb-open");
    if (modalBox) modalBox.style.maxHeight = "";
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", fitModalToVisibleViewport);
    window.visualViewport.addEventListener("scroll", fitModalToVisibleViewport);
  }
  window.addEventListener("resize", fitModalToVisibleViewport);

  function openModal() {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    fitModalToVisibleViewport();
    if (!modalOpenViaHistory) {
      history.pushState({ marqModal: true }, "");
      modalOpenViaHistory = true;
    }
  }
  function closeModal(fromPopState) {
    overlay.classList.remove("open");
    resetModalFit();
    document.body.style.overflow = "";
    if (modalOpenViaHistory && !fromPopState) {
      history.back();
    }
    modalOpenViaHistory = false;
  }
  modalOpenTriggers.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (mobileNav.classList.contains("open")) {
        mobileNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
        mobileNavOpenViaHistory = false;
      }
      activeCta = CTA_COPY[btn.getAttribute("data-cta")] ? btn.getAttribute("data-cta") : "enquire";
      var ctaCopy = CTA_COPY[activeCta];
      // Per-configuration triggers (e.g. "Request Price" on a specific
      // BHK card) carry which unit type the lead is interested in, so
      // the sales team sees it directly in the captured lead.
      var configLabel = btn.getAttribute("data-config") || "";
      if (modalSourceInput) modalSourceInput.value = ctaCopy.source;
      if (modalConfigInput) modalConfigInput.value = configLabel;
      if (modalTitleEl) modalTitleEl.textContent = configLabel ? (ctaCopy.title + " — " + configLabel) : ctaCopy.title;
      if (modalSubmitBtn) modalSubmitBtn.textContent = ctaCopy.submit;
      // Reset in case this modal was already submitted once this page load.
      var modalFormEl = document.getElementById("modalForm");
      var modalSuccessEl = document.getElementById("modalSuccess");
      if (modalFormEl && modalSuccessEl && modalSuccessEl.hidden === false) {
        modalFormEl.reset();
        modalFormEl.hidden = false;
        modalSuccessEl.hidden = true;
      }
      openModal();
      // Focus the first field synchronously inside the click handler so
      // phones open the on-screen keyboard (and offer autofill) right away —
      // mobile browsers only allow this when it happens in the tap itself.
      var firstField = document.getElementById("modalName");
      if (firstField) {
        try { firstField.focus({ preventScroll: true }); } catch (err) { firstField.focus(); }
      }
      setTimeout(fitModalToVisibleViewport, 300);
    });
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

  function wireForm(form, successEl, isModal, onSuccess) {
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
        email: "", // email field removed from the forms; column kept so the lead sheet layout stays the same
        project: data.get("project"),
        source: data.get("source"),
        configuration: data.get("configuration") || "",
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

      // Push a lead-capture event to GTM's dataLayer for every successful
      // form submission (main enquiry form, brochure form, and every
      // modal CTA variant) so Google Ads / GA4 can measure conversions
      // regardless of which button started the flow.
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "generate_lead",
        lead_source: payload.source,
        lead_configuration: payload.configuration
      });

      form.hidden = true;
      successEl.hidden = false;

      if (onSuccess) onSuccess();

      if (isModal) {
        setTimeout(function () { closeModal(false); }, 2200);
      }
    });
  }

  wireForm(document.getElementById("mainForm"), document.getElementById("mainSuccess"), false);
  wireForm(document.getElementById("brochureForm"), document.getElementById("brochureSuccess"), false);
  var callbackFormEl = document.getElementById("callbackForm");
  if (callbackFormEl) {
    wireForm(callbackFormEl, document.getElementById("callbackSuccess"), false);
    // "Next" on the name field jumps straight to the mobile number.
    var cbName = document.getElementById("callbackName");
    var cbMobile = document.getElementById("callbackMobile");
    if (cbName && cbMobile) {
      cbName.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); cbMobile.focus(); }
      });
    }
  }
  wireForm(document.getElementById("modalForm"), document.getElementById("modalSuccess"), true, function () {
    if (modalSuccessText) modalSuccessText.textContent = CTA_COPY[activeCta].success;
    // Call/WhatsApp CTAs capture the lead first, then hand off to the
    // dialer / WhatsApp immediately — no waiting on the modal's auto-close.
    if (activeCta === "call") {
      window.location.href = CALL_TEL_HREF;
    } else if (activeCta === "whatsapp") {
      window.open(WHATSAPP_HREF, "_blank", "noopener");
    }
  });

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

  /* ---------- Lightbox (floor plans, with back-button-closes-lightbox-only pattern) ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxCaption = document.getElementById("lightboxCaption");
  var lightboxClose = document.getElementById("lightboxClose");
  var lightboxOpenViaHistory = false;
  function openLightbox(src, caption) {
    lightboxImg.src = src;
    lightboxImg.alt = caption;
    lightboxCaption.textContent = caption;
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    if (!lightboxOpenViaHistory) {
      history.pushState({ marqLightbox: true }, "");
      lightboxOpenViaHistory = true;
    }
  }
  function closeLightbox(fromPopState) {
    lightbox.classList.remove("open");
    lightboxImg.src = "";
    document.body.style.overflow = "";
    if (lightboxOpenViaHistory && !fromPopState) {
      history.back();
    }
    lightboxOpenViaHistory = false;
  }
  document.querySelectorAll("[data-lightbox]").forEach(function (el) {
    el.addEventListener("click", function () {
      var src = el.getAttribute("data-lightbox");
      var caption = el.getAttribute("data-lightbox-caption") || "";
      openLightbox(src, caption);
    });
  });
  lightboxClose.addEventListener("click", function () { closeLightbox(false); });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox(false);
  });
  window.addEventListener("popstate", function () {
    if (lightbox.classList.contains("open")) closeLightbox(true);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox(false);
  });

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
