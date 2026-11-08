const score = document.querySelector("#score");
const musicControl = document.querySelector(".music-control");
const musicStatus = document.querySelector("#music-status");

function updateMusicControl() {
  musicControl.querySelector("span").textContent = score.paused ? "Play music" : "Pause music";
}

function playScore() {
  musicStatus.textContent = "";
  score.play().catch(() => {
    updateMusicControl();
    musicStatus.textContent = "Music could not start. You can try again.";
  });
}

musicControl.hidden = false;
musicControl.addEventListener("click", () => {
  if (score.paused) playScore();
  else score.pause();
});
score.addEventListener("play", updateMusicControl);
score.addEventListener("pause", updateMusicControl);

const gate = document.querySelector(".gate");
const coverHeading = document.querySelector("#cover-title");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const gateKey = "reenaxi-yash-royal-opened";

function gateHasOpened() {
  try {
    return sessionStorage.getItem(gateKey) === "yes";
  } catch {
    return false;
  }
}

function openGate(withMusic) {
  if (gate.classList.contains("opening")) return;
  if (withMusic) playScore();
  try {
    sessionStorage.setItem(gateKey, "yes");
  } catch {
    // The invitation still works when storage is unavailable.
  }

  gate.classList.add("opening");
  window.setTimeout(() => {
    gate.close();
    coverHeading.setAttribute("tabindex", "-1");
    coverHeading.focus({ preventScroll: true });
  }, motionPreference.matches ? 0 : 980);
}

const supportsDialogs = typeof gate.showModal === "function";
if (supportsDialogs && !location.hash && !gateHasOpened()) {
  gate.querySelector(".enter").addEventListener("click", () => openGate(true));
  gate.querySelector(".quiet").addEventListener("click", () => openGate(false));
  gate.addEventListener("cancel", (event) => {
    event.preventDefault();
    openGate(false);
  });
  gate.showModal();
}

const chapters = Array.from(document.querySelectorAll(".chapter"));
const dock = document.querySelector(".chapter-dock");
const previous = dock.querySelector(".chapter-prev");
const next = dock.querySelector(".chapter-next");
const indexButton = dock.querySelector(".chapter-index");
const chapterNumber = dock.querySelector(".chapter-number");
const chapterCurrent = dock.querySelector(".chapter-current");
const chapterMenu = document.querySelector(".chapter-menu");
const chapterLinks = Array.from(chapterMenu.querySelectorAll("a"));
let currentChapter = 0;
let scrollPending = false;

function showChapterIndicator() {
  const readingLine = Math.min(window.innerHeight * .41, 340);
  const index = chapters.findIndex((chapter) => chapter.getBoundingClientRect().bottom > readingLine);
  currentChapter = index < 0 ? chapters.length - 1 : index;
  chapterNumber.textContent = `${String(currentChapter + 1).padStart(2, "0")} / ${String(chapters.length).padStart(2, "0")}`;
  chapterCurrent.textContent = chapters[currentChapter].dataset.label;
  previous.disabled = currentChapter === 0;
  next.disabled = currentChapter === chapters.length - 1;
  chapterLinks.forEach((link, linkIndex) => {
    if (linkIndex === currentChapter) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}

function queueChapterIndicator() {
  if (scrollPending) return;
  scrollPending = true;
  requestAnimationFrame(() => {
    showChapterIndicator();
    scrollPending = false;
  });
}

function goToChapter(index) {
  const chapter = chapters[index];
  if (!chapter) return;
  chapter.scrollIntoView({ block: "start" });
  const heading = chapter.querySelector("h1, h2");
  heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
}

function swipe(target, handle, allow = () => true) {
  let start;
  target.addEventListener("touchstart", (event) => {
    const point = event.touches[0];
    start = event.touches.length === 1 && allow(event, point) ? [point.clientX, point.clientY] : null;
  }, { passive: true });
  target.addEventListener("touchcancel", () => { start = null; }, { passive: true });
  target.addEventListener("touchend", (event) => {
    if (!start || event.touches.length) {
      start = null;
      return;
    }
    const point = event.changedTouches[0];
    const dx = point.clientX - start[0];
    const dy = point.clientY - start[1];
    start = null;
    if (Math.abs(dx) >= 72 && Math.abs(dy) < Math.abs(dx) * .48) handle(dx < 0 ? 1 : -1);
  }, { passive: true });
}

if (supportsDialogs) {
  dock.hidden = false;
  showChapterIndicator();
  window.addEventListener("scroll", queueChapterIndicator, { passive: true });
  window.addEventListener("resize", queueChapterIndicator, { passive: true });
  window.addEventListener("pageshow", queueChapterIndicator);
  previous.addEventListener("click", () => goToChapter(currentChapter - 1));
  next.addEventListener("click", () => goToChapter(currentChapter + 1));
  indexButton.addEventListener("click", () => chapterMenu.showModal());
  chapterMenu.querySelector(".close-menu").addEventListener("click", () => chapterMenu.close());
  chapterLinks.forEach((link) => link.addEventListener("click", () => chapterMenu.close()));
  swipe(document.querySelector("main"), (direction) => goToChapter(currentChapter + direction),
    (event, point) => !event.target.closest("a, button") && point.clientX > 26 && point.clientX < window.innerWidth - 26);
}

if ("IntersectionObserver" in window && !motionPreference.matches) {
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.add("has-reveal");
      reveal.unobserve(target);
    });
  }, { rootMargin: "0px 0px -13% 0px" });
  document.querySelectorAll(".couple, .ceremony, .venue").forEach((chapter) => reveal.observe(chapter));
}

const album = document.querySelector(".lightbox");
const thumbnails = Array.from(document.querySelectorAll(".photo"));
const albumImage = album.querySelector("img");
const photoPosition = album.querySelector(".photo-position");
let currentPhoto = 0;

function showPhoto(index) {
  currentPhoto = (index + thumbnails.length) % thumbnails.length;
  const link = thumbnails[currentPhoto];
  albumImage.src = link.href;
  albumImage.alt = link.querySelector("img").alt;
  photoPosition.textContent = `Photograph ${currentPhoto + 1} of ${thumbnails.length}`;
}

if (supportsDialogs) {
  thumbnails.forEach((link, index) => link.addEventListener("click", (event) => {
    if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) return;
    event.preventDefault();
    showPhoto(index);
    album.showModal();
  }));
  album.querySelector(".close-photo").addEventListener("click", () => album.close());
  album.querySelector(".photo-prev").addEventListener("click", () => showPhoto(currentPhoto - 1));
  album.querySelector(".photo-next").addEventListener("click", () => showPhoto(currentPhoto + 1));
  album.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showPhoto(currentPhoto - 1);
    if (event.key === "ArrowRight") showPhoto(currentPhoto + 1);
  });
  swipe(album, (direction) => showPhoto(currentPhoto + direction));
}
