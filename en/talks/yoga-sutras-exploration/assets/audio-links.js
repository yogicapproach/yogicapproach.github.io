/* talks#91 -- audio links in the transcript, and a floating player.
 *
 * A link in the transcript that points at an .mp3 the resources panel also carries does
 * not download the file: it starts that card's player where it is, without moving the
 * page, and the floating player appears. Without JS the link still works as a plain link
 * to the file.
 *
 * The floating player appears only while that audio is playing (or was paused from the
 * floating player itself) AND its card's player is off screen. Closing it pauses the
 * audio. One file feeds both the site page and the single-file artifact.
 */
(function(){
  "use strict";
  var T = {
    en: {pause: "Pause", play: "Play", close: "Close player", jump: "Go to the player"},
    es: {pause: "Pausa", play: "Reproducir", close: "Cerrar reproductor", jump: "Ir al reproductor"}
  };
  function t(){ return T[document.documentElement.lang === "es" ? "es" : "en"]; }
  function base(u){ return decodeURIComponent(String(u || "").split(/[?#]/)[0].split("/").pop()); }
  function fmt(s){
    if (!isFinite(s)) return "0:00";
    s = Math.floor(s); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2);
  }
  function playerFor(href){
    var want = base(href), all = document.querySelectorAll("audio.res-player");
    for (var i = 0; i < all.length; i++) if (base(all[i].getAttribute("src")) === want) return all[i];
    return null;
  }

  // ---- 1. a transcript link starts the card's player ---------------------------------
  document.addEventListener("click", function(e){
    var a = e.target.closest && e.target.closest('a[href$=".mp3"]');
    if (!a || a.closest(".res-card") || a.closest("#miniPlayer")) return;   // the card's own Download stays a download
    var p = playerFor(a.getAttribute("href"));
    if (!p) return;                                                        // no matching card: let the link work
    e.preventDefault();
    p.play().catch(function(){});      // no scroll: the reader keeps their place, the floating player takes over
  });

  // ---- 2. the floating player ---------------------------------------------------------
  var bar = document.createElement("div");
  bar.id = "miniPlayer"; bar.hidden = true; bar.setAttribute("role", "region");
  bar.innerHTML =
    '<button type="button" class="mp-toggle"></button>' +
    '<button type="button" class="mp-label"></button>' +
    '<span class="mp-time"></span>' +
    '<button type="button" class="mp-close">&times;</button>';
  document.body.appendChild(bar);
  var btn = bar.querySelector(".mp-toggle"), lbl = bar.querySelector(".mp-label"),
      time = bar.querySelector(".mp-time"), cls = bar.querySelector(".mp-close");

  var current = null, inView = true, heldByBar = false, dismissed = false, io = null;

  function titleOf(p){
    var c = p && p.closest(".res-card"), h = c && c.querySelector(".res-title");
    return h ? h.textContent.trim() : "";
  }
  function paint(){
    var show = !!current && document.contains(current) && !dismissed && !inView
               && (!current.paused || heldByBar);
    bar.hidden = !show;
    if (!show) return;
    var s = t();
    btn.textContent = current.paused ? "▶" : "❚❚";
    btn.setAttribute("aria-label", current.paused ? s.play : s.pause);
    lbl.textContent = titleOf(current); lbl.title = s.jump;
    cls.setAttribute("aria-label", s.close); cls.title = s.close;
    bar.setAttribute("aria-label", titleOf(current));
    time.textContent = fmt(current.currentTime) + " / " + fmt(current.duration);
  }
  function watch(p){
    if (io) io.disconnect();
    inView = true;
    if (!("IntersectionObserver" in window)) { inView = false; return; }
    io = new IntersectionObserver(function(entries){
      inView = entries[entries.length - 1].isIntersecting; paint();
    });
    io.observe(p);
  }

  // media events do not bubble, so listen in the capture phase
  document.addEventListener("play", function(e){
    if (!(e.target instanceof HTMLAudioElement) || !e.target.classList.contains("res-player")) return;
    if (current !== e.target){ current = e.target; watch(current); }
    dismissed = false; heldByBar = false; paint();
  }, true);
  ["pause", "ended", "timeupdate", "loadedmetadata"].forEach(function(ev){
    document.addEventListener(ev, function(e){
      if (e.target !== current) return;
      if (ev === "ended") heldByBar = false;
      paint();
    }, true);
  });

  btn.addEventListener("click", function(){
    if (!current) return;
    if (current.paused){ current.play().catch(function(){}); }
    else { heldByBar = true; current.pause(); }      // keep the bar so it can be resumed
  });
  lbl.addEventListener("click", function(){
    if (current) current.scrollIntoView({behavior: "smooth", block: "center"});
  });
  cls.addEventListener("click", function(){
    if (current) current.pause();
    dismissed = true; heldByBar = false; paint();
  });
})();
