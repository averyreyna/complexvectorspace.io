(() => {
  const DESKTOP_QUERY = "(min-width: 1201px)";
  const NOTE_GAP = 12;
  const MOBILE_SECTION_CLASS = "annotation-notes-mobile-generated";
  const GENERATED_FOOTNOTE_RAIL_CLASS = "margin-notes-generated";
  const ANNOTATION_VARIANT = "annotation";
  const FOOTNOTE_VARIANT = "footnote";

  function collectAnnotationPairs(postContent, noteRail) {
    if (!noteRail) return [];
    const anchors = Array.from(postContent.querySelectorAll(".annotated[data-note-id]"));

    return anchors
      .map((anchor, index) => {
        const noteId = anchor.getAttribute("data-note-id");
        if (!noteId) return null;

        const note = noteRail.querySelector(`#${CSS.escape(noteId)}`);
        if (!note) return null;

        return {
          variant: ANNOTATION_VARIANT,
          sortAnchor: anchor,
          anchor,
          anchorId: ensureAnchorId(anchor, `ann-anchor-${index + 1}`),
          inlineRef: true,
          note,
          noteId,
          backlinkLabel: "highlight"
        };
      })
      .filter(Boolean);
  }

  function ensureAnchorId(anchor, fallbackId) {
    if (anchor.id) return anchor.id;
    anchor.id = fallbackId;
    return fallbackId;
  }

  function stripFootnoteBacklink(footnoteItem) {
    const clone = footnoteItem.cloneNode(true);
    const backlinks = clone.querySelectorAll('a[href^="#ref"], a[href^="#fnref"]');
    backlinks.forEach((link) => {
      const text = (link.textContent || "").trim();
      if (text === "↩") {
        link.remove();
      }
    });
    return clone.innerHTML.trim();
  }

  function resolveFootnoteAnchor(anchor, fallbackIndex) {
    const anchorId = ensureAnchorId(anchor, anchor.id || `fnref-${fallbackIndex}`);
    return { anchor, anchorId };
  }

  function ensureFootnoteNoteRail(postContent, currentRail) {
    if (currentRail) return currentRail;
    const createdRail = document.createElement("aside");
    createdRail.className = `margin-notes ${GENERATED_FOOTNOTE_RAIL_CLASS}`;
    createdRail.setAttribute("aria-label", "Margin notes");
    postContent.appendChild(createdRail);
    return createdRail;
  }

  function collectFootnotePairs(postContent, existingRail) {
    const textAnchors = Array.from(postContent.querySelectorAll(".footnoted[data-footnote-id]"));
    const legacyRefs = Array.from(postContent.querySelectorAll('sup a[href^="#fn"]'));
    const footnoteAnchors = textAnchors.length ? textAnchors : legacyRefs;
    if (!footnoteAnchors.length) {
      return { pairs: [], rail: existingRail };
    }

    let noteRail = existingRail;

    const pairs = footnoteAnchors
      .map((footnoteAnchor, index) => {
        const footnoteId = textAnchors.length
          ? footnoteAnchor.getAttribute("data-footnote-id")
          : decodeURIComponent((footnoteAnchor.getAttribute("href") || "").slice(1));
        if (!footnoteId) return null;

        const footnoteItem = postContent.querySelector(`#${CSS.escape(footnoteId)}`);
        if (!footnoteItem) return null;

        noteRail = ensureFootnoteNoteRail(postContent, noteRail);

        const { anchor, anchorId } = resolveFootnoteAnchor(footnoteAnchor, index + 1);
        const noteElementId = `footnote-margin-${footnoteId}`;
        let note = noteRail.querySelector(`#${CSS.escape(noteElementId)}`);
        if (!note) {
          note = document.createElement("div");
          note.id = noteElementId;
          note.className = "margin-note footnote-margin-note";
          note.dataset.side = "right";
          noteRail.appendChild(note);
        }

        note.innerHTML = stripFootnoteBacklink(footnoteItem);

        return {
          variant: FOOTNOTE_VARIANT,
          sortAnchor: anchor,
          anchor,
          anchorId,
          inlineRef: false,
          note,
          noteId: footnoteId,
          backlinkLabel: "footnote"
        };
      })
      .filter(Boolean);

    return { pairs, rail: noteRail };
  }

  function compareNodeOrder(nodeA, nodeB) {
    if (nodeA === nodeB) return 0;
    const position = nodeA.compareDocumentPosition(nodeB);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  }

  function withDisplayOrder(pairs) {
    const sorted = [...pairs].sort((a, b) => compareNodeOrder(a.sortAnchor, b.sortAnchor));
    return sorted.map((pair, index) => ({
      ...pair,
      displayIndex: index + 1
    }));
  }

  function clearGeneratedMobileNotes(postContent) {
    const existingRefs = postContent.querySelectorAll(".annotation-inline-ref, .footnote-inline-ref");
    existingRefs.forEach((ref) => ref.remove());

    const existingSection = postContent.querySelector(`.${MOBILE_SECTION_CLASS}`);
    if (existingSection) {
      existingSection.remove();
    }
  }

  function buildMobileNotes(postContent, pairs) {
    clearGeneratedMobileNotes(postContent);
    const mobilePairs = pairs.filter((pair) => pair.variant === ANNOTATION_VARIANT);
    if (!mobilePairs.length) return;

    const section = document.createElement("section");
    section.className = MOBILE_SECTION_CLASS;
    section.setAttribute("aria-label", "Highlight notes");

    const list = document.createElement("ol");
    list.className = "annotation-notes-mobile-list";

    mobilePairs.forEach((pair, mobileIndex) => {
      const noteNumber = mobileIndex + 1;
      const noteItemId = `${pair.variant}-note-${noteNumber}`;
      const inlineRefClass = pair.variant === FOOTNOTE_VARIANT ? "footnote-inline-ref" : "annotation-inline-ref";

      if (pair.inlineRef) {
        const inlineRefId = `${pair.variant}-ref-${noteNumber}`;
        const refSup = document.createElement("sup");
        refSup.className = inlineRefClass;
        refSup.id = inlineRefId;

        const refLink = document.createElement("a");
        refLink.href = `#${noteItemId}`;
        refLink.textContent = `${noteNumber}`;
        refLink.setAttribute("aria-label", `Go to ${pair.backlinkLabel} note ${noteNumber}`);
        refSup.appendChild(refLink);
        pair.anchor.insertAdjacentElement("beforebegin", refSup);
      }

      const li = document.createElement("li");
      li.id = noteItemId;
      li.className = `annotation-note-item ${pair.variant}-note-item`;

      const noteText = document.createElement("span");
      noteText.innerHTML = pair.note.innerHTML;

      const backLink = document.createElement("a");
      backLink.href = `#${pair.anchorId}`;
      backLink.className = "annotation-note-backlink";
      backLink.setAttribute("aria-label", `Back to ${pair.backlinkLabel} ${noteNumber}`);
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

    const existingRail = postContent.querySelector(".margin-notes");
    const annotationPairs = collectAnnotationPairs(postContent, existingRail);
    const footnoteResult = collectFootnotePairs(postContent, existingRail);
    const noteRail = footnoteResult.rail;
    const pairs = withDisplayOrder([...annotationPairs, ...footnoteResult.pairs]);
    buildMobileNotes(postContent, pairs);
    if (!noteRail) return;

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
        if (pair.variant === FOOTNOTE_VARIANT) {
          const anchorMidpoint = anchorRect.left + anchorRect.width / 2;
          const postMidpoint = postRect.left + postRect.width / 2;
          pair.note.dataset.side = anchorMidpoint >= postMidpoint ? "right" : "left";
        }
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
