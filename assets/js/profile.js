/* Profile page: reads members/<id>.json and renders into #profile-root.
   URL: profile.html?member=vu-van-khu   (or ?file=members/other.json) */
(function () {
  "use strict";

  const root = document.getElementById("profile-root");
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const memberId = params.get("member") || params.get("id") || params.get("m") || "vu-van-khu";
  const dataUrl = params.get("file") || "members/" + encodeURIComponent(memberId) + ".json";

  const AUTHOR_PATTERN = /V\. K\. Vu/; // bolded in author lists
  const COLLAPSE_AFTER = 6;
  const TONES = ["teal", "violet", "amber", "blue"];
  const afterMount = [];

  /* ---------- helpers ---------- */
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function link(href, text, cls) {
    const a = el("a", cls || "", text);
    a.href = href;
    return a;
  }

  function button(text, label, cls) {
    const b = el("button", cls || "", text);
    b.type = "button";
    if (label) b.setAttribute("aria-label", label);
    return b;
  }

  function groupByYear(items) {
    const map = new Map();
    items.forEach(function (it) {
      const y = String(it.year);
      if (!map.has(y)) map.set(y, []);
      map.get(y).push(it);
    });
    return Array.from(map);
  }

  function initials(name) {
    const w = String(name || "?").trim().split(/\s+/);
    return (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase();
  }

  function heading(text, aside) {
    const wrap = el("div", "section-heading");
    const h2 = el("h2");
    const words = text.split(" ");
    if (words.length > 1) {
      h2.append(words.slice(0, -1).join(" ") + " ", el("span", "", words[words.length - 1]));
    } else {
      h2.textContent = text;
    }
    wrap.append(h2);
    if (aside) wrap.append(el("p", "", aside));
    return wrap;
  }

  function section(id, title, aside) {
    const s = el("section", "section-pad profile-section");
    s.id = id;
    s.append(heading(title, aside));
    return s;
  }

  /* ---------- hero ---------- */
  function renderHero(p) {
    const band = el("section", "profile-hero-band");
    const wrap = el("div", "section-pad profile-hero");

    const identity = el("div", "profile-identity");
    let avatar;
    if (p.avatar_url) {
      avatar = el("div", "large-avatar");
      const img = el("img");
      img.src = p.avatar_url;
      img.alt = p.name || "";
      avatar.append(img);
    } else {
      avatar = el("div", "large-avatar avatar-teal", initials(p.name));
      avatar.setAttribute("aria-hidden", "true");
    }
    const text = el("div");
    text.append(
      el("p", "section-kicker", p.title || ""),
      el("h1", "", p.name || ""),
      el("p", "profile-affiliation", p.affiliation || "")
    );
    identity.append(avatar, text);

    const note = el("aside", "profile-note");
    note.append(el("span", "", "Contact"));
    const c = el("p");
    if (p.email) c.append(link("mailto:" + p.email, p.email));
    if (p.phone) c.append(link("tel:" + p.phone.replace(/\s+/g, ""), p.phone));
    note.append(c);

    wrap.append(identity, note);
    band.append(wrap);
    return band;
  }

  /* ---------- index (hover: description below, preview on the right) ---------- */
  function renderIndex(items) {
    const sec = el("section", "section-pad index");
    sec.setAttribute("aria-label", "Profile sections");

    const main = el("div", "index-main");
    const label = el("p", "eyebrow index-label");
    label.append(el("span", "eyebrow-dot"), document.createTextNode("Browse this profile"));
    const list = el("div", "index-list");
    const figure = el("figure", "index-figure");

    const rows = [];
    const panels = [];

    items.forEach(function (it, n) {
      const a = link("#" + it.id, "", "index-item");
      a.append(el("span", "index-num", "(" + String(n + 1).padStart(2, "0") + ")"));
      a.append(el("h2", "", it.title));
      const d = el("p", "index-desc");
      d.append(el("span", "", it.desc));
      a.append(d);
      list.append(a);
      rows.push(a);

      const panel = el("div", "preview tone-" + it.tone);
      panel.append(el("span", "preview-label", it.title));
      const ul = el("ul");
      it.lines.forEach(function (l) { ul.append(el("li", "", l)); });
      panel.append(ul);
      figure.append(panel);
      panels.push(panel);
    });

    function activate(i) {
      rows.forEach(function (r, k) { r.classList.toggle("is-active", k === i); });
      panels.forEach(function (p, k) { p.classList.toggle("is-active", k === i); });
    }
    rows.forEach(function (r, i) {
      r.addEventListener("mouseenter", function () { activate(i); });
      r.addEventListener("focus", function () { activate(i); });
    });
    activate(0);

    main.append(label, list);
    sec.append(main, figure);
    return sec;
  }

  /* ---------- brief information: horizontal tracks, one column per year ---------- */
  function buildTrack(title, entries, tone) {
    const block = el("div", "track-block tone-" + tone);
    const head = el("div", "track-head");
    head.append(el("h3", "", title));
    const nav = el("div", "track-nav");
    const prev = button("←", "Scroll left");
    const next = button("→", "Scroll right");
    nav.append(prev, next);
    head.append(nav);

    const track = el("ul", "track");
    track.tabIndex = 0;
    track.setAttribute("aria-label", title);

    groupByYear(entries).forEach(function (g) {
      const col = el("li", "year-col");
      col.append(el("span", "year-col-year", g[0]));
      g[1].forEach(function (e) {
        const box = el("div", "entry");
        box.append(el("h4", "", e.title));
        if (e.place) box.append(el("p", "place", e.place));
        if (e.note) box.append(el("p", "note", e.note));
        col.append(box);
      });
      track.append(col);
    });

    function sync() {
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    }
    prev.addEventListener("click", function () {
      track.scrollBy({ left: -track.clientWidth * 0.8, behavior: "smooth" });
    });
    next.addEventListener("click", function () {
      track.scrollBy({ left: track.clientWidth * 0.8, behavior: "smooth" });
    });
    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    afterMount.push(sync);

    // mouse drag (touch and trackpad already scroll natively)
    let drag = null;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: track.scrollLeft };
      track.setPointerCapture(e.pointerId);
      track.classList.add("is-dragging");
    });
    track.addEventListener("pointermove", function (e) {
      if (drag) track.scrollLeft = drag.left - (e.clientX - drag.x);
    });
    function endDrag() { drag = null; track.classList.remove("is-dragging"); }
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);

    block.append(head, track);
    return block;
  }

  function renderBrief(d) {
    const s = section("brief", "Brief Information", "Drag sideways, or use the arrows, to move through the years.");
    const groups = [];

    if (d.education && d.education.items) {
      groups.push([d.education.title || "Education", d.education.items.map(function (i) {
        return { year: i.year, title: i.degree, place: i.institution, note: i.honors };
      })]);
    }
    if (d.employment && d.employment.items) {
      groups.push([d.employment.title || "Employment", d.employment.items.map(function (i) {
        return { year: i.year, title: i.position, place: i.institution, note: i.start_date ? "Since " + i.start_date : "" };
      })]);
    }
    if (d.honors_awards_scholarships && d.honors_awards_scholarships.items) {
      groups.push([d.honors_awards_scholarships.title || "Honors - Awards - Scholarships", d.honors_awards_scholarships.items.map(function (i) {
        return { year: i.year, title: i.award, place: i.awarded_by, note: i.description };
      })]);
    }
    groups.forEach(function (g, i) { s.append(buildTrack(g[0], g[1], TONES[i % TONES.length])); });
    return s;
  }

  /* ---------- research ---------- */
  function buildTopic(t) {
    const topic = el("div", "topic");
    const head = button("", null, "topic-head");
    head.setAttribute("aria-expanded", "false");
    const arrow = el("span", "card-arrow", "+");
    arrow.setAttribute("aria-hidden", "true");
    head.append(el("span", "topic-year", t.year || ""), el("h4", "", t.topic_name), arrow);

    const body = el("div", "topic-body");
    const ul = el("ul");
    (t.bullet_points || []).forEach(function (bp) {
      const li = el("li");
      li.append(el("span", "", bp.description));
      if (bp.selected_paper) li.append(el("span", "paper", bp.selected_paper));
      ul.append(li);
    });
    body.append(ul);

    // open = hovered (mouse only) or pinned (click / keyboard / touch)
    let hovered = false, pinned = false, timer = 0;
    function render() {
      const open = hovered || pinned;
      topic.classList.toggle("is-open", open);
      head.setAttribute("aria-expanded", String(open));
      arrow.textContent = open ? "−" : "+";
    }
    topic.addEventListener("pointerenter", function (e) {
      if (e.pointerType !== "mouse") return;
      clearTimeout(timer);
      timer = setTimeout(function () { hovered = true; render(); }, 90);
    });
    topic.addEventListener("pointerleave", function (e) {
      if (e.pointerType !== "mouse") return;
      clearTimeout(timer);
      timer = setTimeout(function () { hovered = false; render(); }, 140);
    });
    head.addEventListener("click", function () { pinned = !pinned; render(); });

    topic.append(head, body);
    return topic;
  }

  function renderResearch(d) {
    const s = section("research", "Research");

    if (d.research_interests) {
      const ri = d.research_interests;
      s.append(el("h3", "subhead", ri.title || "Research Interests"));
      if (ri.description) s.append(el("p", "lead", ri.description));
      if (ri.keywords && ri.keywords.length) {
        const ul = el("ul", "keywords");
        ri.keywords.forEach(function (k) { ul.append(el("li", "", k)); });
        s.append(ul);
      }
    }

    if (d.research_experience && d.research_experience.sections) {
      s.append(el("h3", "subhead", d.research_experience.title || "Research Experience"));
      d.research_experience.sections.forEach(function (sec) {
        const group = el("div", "split");
        group.append(el("h4", "split-title", sec.subtitle));
        const list = el("div", "topic-list");
        sec.topics.forEach(function (t) { list.append(buildTopic(t)); });
        group.append(list);
        s.append(group);
      });
    }
    return s;
  }

  /* ---------- generic rows (activities, teaching) ---------- */
  function buildRows(rows) {
    const wrap = el("div");
    const ul = el("ul", "rows");
    rows.forEach(function (r, i) {
      const li = el("li", "row");
      if (i >= COLLAPSE_AFTER) li.hidden = true;
      li.append(el("span", "row-year", r.year || ""));
      const c = el("div");
      c.append(el("h4", "", r.title));
      if (r.sub) c.append(el("p", "", r.sub));
      if (r.note) c.append(el("p", "", r.note));
      if (r.badge) c.append(el("span", "badge", r.badge));
      li.append(c);
      ul.append(li);
    });
    wrap.append(ul);

    if (rows.length > COLLAPSE_AFTER) {
      const more = button("Show all " + rows.length, null, "more");
      let expanded = false;
      more.addEventListener("click", function () {
        expanded = !expanded;
        ul.querySelectorAll(".row").forEach(function (li, i) {
          if (i >= COLLAPSE_AFTER) li.hidden = !expanded;
        });
        more.textContent = expanded ? "Show fewer" : "Show all " + rows.length;
      });
      wrap.append(more);
    }
    return wrap;
  }

  function splitGroup(title, rows) {
    const g = el("div", "split");
    g.append(el("h3", "split-title", title), buildRows(rows));
    return g;
  }

  function renderActivities(d) {
    const a = d.academic_activities;
    const s = section("activities", a.title || "Academic Activities");
    if (a.selected_presentations) {
      s.append(splitGroup(a.selected_presentations.subtitle, a.selected_presentations.items.map(function (i) {
        return { year: i.year, title: i.title, sub: i.event };
      })));
    }
    if (a.conference_presentations) {
      s.append(splitGroup(a.conference_presentations.subtitle, a.conference_presentations.items.map(function (i) {
        return { year: i.year, title: i.title, sub: i.conference, badge: i.honors };
      })));
    }
    if (a.reviewer) {
      s.append(splitGroup(a.reviewer.subtitle, a.reviewer.items.map(function (i) {
        return { year: i.year, title: i.venue, sub: i.role };
      })));
    }
    if (a.organizing_committee) {
      s.append(splitGroup(a.organizing_committee.subtitle, a.organizing_committee.items.map(function (i) {
        return { year: i.year, title: i.event };
      })));
    }
    return s;
  }

  function renderTeaching(d) {
    const t = d.teaching_experience;
    const s = section("teaching", t.title || "Teaching Experience");
    (t.institutions || []).forEach(function (inst) {
      s.append(splitGroup(inst.subtitle, inst.courses.map(function (c) {
        return {
          year: c.year,
          title: c.course,
          sub: [c.role, c.semester].filter(Boolean).join(", "),
          note: c.students
        };
      })));
    });
    return s;
  }

  /* ---------- publications ---------- */
  function renderPublications(pub) {
    const items = pub.items || [];
    const s = section("publications", pub.title || "Publications", (pub.total_count || items.length) + " papers, newest first.");

    const tools = el("div", "pub-tools");
    const input = el("input", "pub-search");
    input.type = "search";
    input.placeholder = "Search by title, author or venue";
    input.setAttribute("aria-label", "Search publications");
    tools.append(input);
    s.append(tools);

    const groups = [];
    groupByYear(items).forEach(function (g) {
      const box = el("div", "split");
      box.append(el("h3", "split-title pub-year", g[0]));
      const col = el("div");
      g[1].forEach(function (p) {
        const art = el("article", "pub");
        art.dataset.search = [p.title, (p.authors || []).join(" "), p.venue, p.year].join(" ").toLowerCase();
        art.append(el("h4", "", p.title));
        const au = el("p", "pub-authors");
        (p.authors || []).forEach(function (a, i) {
          if (i) au.append(", ");
          au.append(AUTHOR_PATTERN.test(a) ? el("strong", "", a) : document.createTextNode(a));
        });
        art.append(au);
        const venue = el("p", "pub-venue", p.venue || "");
        if (p.status === "accepted") venue.append(el("span", "tag", "Accepted"));
        art.append(venue);
        col.append(art);
      });
      box.append(col);
      s.append(box);
      groups.push(box);
    });

    const empty = el("div", "empty-state", "No publications match your search.");
    empty.hidden = true;
    s.append(empty);

    input.addEventListener("input", function () {
      const q = input.value.trim().toLowerCase();
      let any = false;
      groups.forEach(function (g) {
        let visible = 0;
        g.querySelectorAll(".pub").forEach(function (a) {
          const hit = !q || a.dataset.search.indexOf(q) !== -1;
          a.hidden = !hit;
          if (hit) visible++;
        });
        g.hidden = visible === 0;
        if (visible) any = true;
      });
      empty.hidden = any;
    });
    return s;
  }

  /* ---------- index content derived from the data ---------- */
  function buildIndexItems(d) {
    const out = [];

    if (d.education || d.employment || d.honors_awards_scholarships) {
      const lines = [];
      ((d.education && d.education.items) || []).forEach(function (i) { lines.push(i.degree + ", " + i.year); });
      const job = d.employment && d.employment.items && d.employment.items[0];
      if (job) lines.push(job.position + ", " + job.institution);
      const hn = d.honors_awards_scholarships && d.honors_awards_scholarships.items;
      if (hn) lines.push(hn.length + " honors, awards and scholarships");
      out.push({
        id: "brief", title: "Brief Information", tone: "teal", lines: lines,
        desc: "Education, employment, honors and scholarships, year by year."
      });
    }

    if (d.research_interests || d.research_experience) {
      const lines = ((d.research_interests && d.research_interests.keywords) || []).slice(0, 4);
      const secs = (d.research_experience && d.research_experience.sections) || [];
      const topics = secs.reduce(function (n, x) { return n + x.topics.length; }, 0);
      if (topics) lines.push(topics + " topics in " + secs.length + " areas");
      out.push({
        id: "research", title: "Research", tone: "violet", lines: lines,
        desc: "Research interests, and each topic with the papers behind it."
      });
    }

    if (d.academic_activities) {
      const a = d.academic_activities;
      const lines = [];
      if (a.selected_presentations) lines.push(a.selected_presentations.items.length + " invited talks");
      if (a.conference_presentations) lines.push(a.conference_presentations.items.length + " conference presentations");
      if (a.reviewer) lines.push(a.reviewer.items.length + " reviewing roles");
      if (a.organizing_committee) lines.push(a.organizing_committee.items.length + " organizing committees");
      out.push({
        id: "activities", title: "Academic Activities", tone: "amber", lines: lines,
        desc: "Invited talks, conference presentations, reviewing and organizing."
      });
    }

    if (d.teaching_experience) {
      const lines = (d.teaching_experience.institutions || []).map(function (i) {
        return i.courses.length + " courses at " + i.subtitle;
      });
      out.push({
        id: "teaching", title: "Teaching Experience", tone: "blue", lines: lines,
        desc: "Courses taught or assisted, grouped by institution."
      });
    }

    if (d.publications) {
      const items = d.publications.items || [];
      const lines = [(d.publications.total_count || items.length) + " papers"].concat(
        items.slice(0, 3).map(function (p) { return p.title; })
      );
      out.push({
        id: "publications", title: "Publications", tone: "teal", lines: lines,
        desc: "Every paper by year. Search by title, author or venue."
      });
    }
    return out;
  }

  /* ---------- states ---------- */
  function renderError(message) {
    const s = el("section", "profile-missing");
    s.append(el("p", "section-kicker", "Profile unavailable"), el("h1", "", "This profile didn’t load"));
    s.append(el("p", "", message));
    const back = link("index.html#people", "All people ", "button button-dark");
    back.append(el("span", "", "←"));
    s.append(back);
    root.replaceChildren(s);
  }

  function render(d) {
    const p = d.personal_info || {};
    document.title = (p.name ? p.name + " · " : "") + "CO VinU";

    const nodes = [renderHero(p)];
    const idx = buildIndexItems(d);
    if (idx.length) nodes.push(renderIndex(idx));
    if (d.education || d.employment || d.honors_awards_scholarships) nodes.push(renderBrief(d));
    if (d.research_interests || d.research_experience) nodes.push(renderResearch(d));
    if (d.academic_activities) nodes.push(renderActivities(d));
    if (d.teaching_experience) nodes.push(renderTeaching(d));
    if (d.publications) nodes.push(renderPublications(d.publications));

    root.replaceChildren.apply(root, nodes);
    afterMount.forEach(function (fn) { fn(); });
  }

  fetch(dataUrl)
    .then(function (res) {
      if (!res.ok) throw new Error("Could not load " + dataUrl + " (HTTP " + res.status + ").");
      return res.json();
    })
    .then(render)
    .catch(function (err) {
      console.error(err);
      renderError(
        err instanceof SyntaxError
          ? "The JSON file has a syntax error."
          : err.message + " If you opened this page straight from disk, serve the folder with a local web server instead."
      );
    });
})();
