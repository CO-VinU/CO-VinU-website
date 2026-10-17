(function () {
  const byId = (id) => document.getElementById(id);
  const initials = (member) => member.initials || member.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  function loadProfileFiles() {
    window.GROUP_MEMBERS = [];
    const files = window.MEMBER_PROFILE_FILES || [];
    return Promise.all(files.map((file) => new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = file;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load member profile: ${file}`));
      document.head.appendChild(script);
    })));
  }

  function renderDirectory(members) {
    const grid = byId("member-grid");
    if (!grid) return;
    if (!members.length) {
      grid.innerHTML = '<p class="empty-state">Member profiles will appear here soon.</p>';
      return;
    }
    grid.innerHTML = members.map((member) => `
      <a class="member-card" href="profile.html?id=${encodeURIComponent(member.slug)}">
        <div class="member-avatar avatar-${member.accent || "teal"}">${initials(member)}</div>
        <div class="member-info"><p class="member-role">${member.role || "Research member"}</p><h3>${member.displayName || member.name}</h3><p>${member.affiliation || "Combinatorial Optimization Research Group"}</p></div><span class="card-arrow">↗</span>
      </a>`).join("");
  }

  function defaultProfile(member) {
    return `
      <section class="profile-hero section-pad"><div class="profile-identity"><div class="large-avatar avatar-${member.accent || "teal"}">${initials(member)}</div><div><p class="eyebrow"><span class="eyebrow-dot"></span> ${member.role || "Research member"}</p><h1>${member.displayName || member.name}</h1><p class="profile-affiliation">${member.affiliation || "Combinatorial Optimization Research Group"}</p></div></div><div class="profile-note"><span>CO / ${String(member.slug).toUpperCase()}</span><p>Research is a way of making better questions precise.</p></div></section>
      <section class="profile-body section-pad"><div class="profile-main"><div class="section-kicker">Profile</div><h2>Working with<br /><span>structure and choice.</span></h2><p>${member.bio || "This member has not added a biography yet."}</p>${member.custom ? `<div class="custom-note"><p class="section-kicker">${member.custom.label || "In focus"}</p><p>${member.custom.text || ""}</p></div>` : ""}</div><aside class="profile-aside"><div><p class="section-kicker">Research interests</p><ul>${(member.interests || []).map((interest) => `<li>${interest}</li>`).join("")}</ul></div><div class="profile-contact"><p class="section-kicker">Contact</p>${member.email ? `<a href="mailto:${member.email}">${member.email}</a>` : ""}${(member.links || []).map((link) => `<a href="${link.url}" target="_blank" rel="noreferrer">${link.label} ↗</a>`).join("")}</div></aside></section>`;
  }

  function renderProfile(members) {
    const root = byId("profile-root");
    if (!root) return;
    const slug = new URLSearchParams(window.location.search).get("id");
    const member = members.find((item) => item.slug === slug) || members[0];
    if (!member) { root.innerHTML = '<div class="profile-missing"><p class="eyebrow">No profile found</p><h1>We could not find that member.</h1><a class="text-link" href="index.html#people">Return to the group <span>→</span></a></div>'; return; }
    document.title = `${member.displayName || member.name} · CO VinU`;
    if (!member.customPage) { root.innerHTML = defaultProfile(member); return; }
    fetch(member.customPage).then((response) => {
      if (!response.ok) throw new Error("Custom profile page could not be loaded.");
      return response.text();
    }).then((html) => { root.innerHTML = html; }).catch(() => { root.innerHTML = defaultProfile(member); });
  }

  function setupMenu() {
    const button = document.querySelector(".menu-toggle"); const nav = byId("site-nav");
    if (!button || !nav) return;
    button.addEventListener("click", () => { const open = button.getAttribute("aria-expanded") === "true"; button.setAttribute("aria-expanded", String(!open)); nav.classList.toggle("is-open", !open); });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => { button.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); }));
  }

  loadProfileFiles().then(() => {
    const members = window.GROUP_MEMBERS || [];
    renderDirectory(members);
    renderProfile(members);
    setupMenu();
  }).catch((error) => { console.error(error); });
})();
