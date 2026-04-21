(() => {
  const DESKTOP_QUERY = "(min-width: 1201px)";
  const NOTE_GAP = 12;
  const MOBILE_SECTION_CLASS = "annotation-notes-mobile-generated";

  function collectAnnotationPairs(postContent, noteRail) {
    const anchors = Array.from(postContent.querySelectorAll(".annotated[data-note-id]"));

    return anchors
      .map((anchor, index) => {
        const noteId = anchor.getAttribute("data-note-id");
        if (!noteId) return null;

        const note = noteRail.querySelector(`#${CSS.escape(noteId)}`);
        if (!note) return null;

        return {
          index: index + 1,
          anchor,
          note,
          noteId
        };
      })
      .filter(Boolean);
  }

  function ensureAnchorId(anchor, fallbackIndex) {
    if (anchor.id) return anchor.id;
    const generatedId = `ann-anchor-${fallbackIndex}`;
    anchor.id = generatedId;
    return generatedId;
  }

  function clearGeneratedMobileNotes(postContent) {
    const existingRefs = postContent.querySelectorAll(".annotation-inline-ref");
    existingRefs.forEach((ref) => ref.remove());

    const existingSection = postContent.querySelector(`.${MOBILE_SECTION_CLASS}`);
    if (existingSection) {
      existingSection.remove();
    }
  }

  function buildMobileNotes(postContent, pairs) {
    clearGeneratedMobileNotes(postContent);
    if (!pairs.length) return;

    const section = document.createElement("section");
    section.className = MOBILE_SECTION_CLASS;
    section.setAttribute("aria-label", "Highlight notes");

    const list = document.createElement("ol");
    list.className = "annotation-notes-mobile-list";

    pairs.forEach((pair) => {
      const noteNumber = pair.index;
      const anchorId = ensureAnchorId(pair.anchor, noteNumber);
      const inlineRefId = `ann-ref-${noteNumber}`;
      const noteItemId = `ann-note-${noteNumber}`;

      const refSup = document.createElement("sup");
      refSup.className = "annotation-inline-ref";
      refSup.id = inlineRefId;

      const refLink = document.createElement("a");
      refLink.href = `#${noteItemId}`;
      refLink.textContent = `${noteNumber}`;
      refLink.setAttribute("aria-label", `Go to highlight note ${noteNumber}`);
      refSup.appendChild(refLink);
      pair.anchor.insertAdjacentElement("beforebegin", refSup);

      const li = document.createElement("li");
      li.id = noteItemId;
      li.className = "annotation-note-item";

      const noteText = document.createElement("span");
      noteText.innerHTML = pair.note.innerHTML;

      const backLink = document.createElement("a");
      backLink.href = `#${anchorId}`;
      backLink.className = "annotation-note-backlink";
      backLink.setAttribute("aria-label", `Back to highlight ${noteNumber}`);
      backLink.textContent = " ↩";

      li.appendChild(noteText);
      li.appendChild(backLink);
      list.appendChild(li);
    });

    section.appendChild(list);

    const canonicalFootnotes = postContent.querySelector("ol:not(.annotation-notes-mobile-list)");
    if (canonicalFootnotes) {
      canonicalFootnotes.insertAdjacentElement("afterend", section);
    } else {
      postContent.appendChild(section);
    }
  }

  function alignMarginNotes() {
    const postContent = document.querySelector(".post-content");
    if (!postContent) return;

    const noteRail = postContent.querySelector(".margin-notes");
    if (!noteRail) return;

    const pairs = collectAnnotationPairs(postContent, noteRail);
    buildMobileNotes(postContent, pairs);

    const desktopMode = window.matchMedia(DESKTOP_QUERY).matches;
    if (!desktopMode) {
      noteRail.style.height = "";
      return;
    }

    const postRect = postContent.getBoundingClientRect();
    const positionedPairs = pairs
      .map((pair) => {
        const anchorRect = pair.anchor.getBoundingClientRect();
        const anchorTop = anchorRect.top - postRect.top + postContent.scrollTop;
        return { anchorTop, note: pair.note };
      })
      .sort((a, b) => a.anchorTop - b.anchorTop);

    const previousBottomBySide = new Map();
    let tallestBottom = 0;

    positionedPairs.forEach(({ anchorTop, note }) => {
      const side = note.dataset.side === "left" ? "left" : "right";
      const previousBottom = previousBottomBySide.get(side) || 0;
      const noteHeight = note.offsetHeight;
      const resolvedTop = Math.max(anchorTop, previousBottom + NOTE_GAP);
      note.style.top = `${Math.round(resolvedTop)}px`;
      const currentBottom = resolvedTop + noteHeight;
      previousBottomBySide.set(side, currentBottom);
      tallestBottom = Math.max(tallestBottom, currentBottom);
    });

    noteRail.style.height = `${Math.ceil(tallestBottom)}px`;
  }

  let rafId = null;
  function scheduleAlign() {
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
    }
    rafId = window.requestAnimationFrame(() => {
      rafId = null;
      alignMarginNotes();
    });
  }

  window.addEventListener("resize", scheduleAlign);
  window.addEventListener("load", scheduleAlign);
  document.addEventListener("DOMContentLoaded", scheduleAlign);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleAlign).catch(() => {});
  }
})();
