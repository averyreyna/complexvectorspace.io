(() => {
  const navSocial = document.querySelector(".social-icons.nav-social");
  if (!navSocial) return;

  const links = [
    {
      label: "Are.na",
      icon: "star",
      url: "https://www.are.na/avery-reyna",
    },
    {
      label: "GitHub",
      icon: "code",
      url: "https://github.com/averyreyna",
    },
    {
      label: "Google Scholar",
      icon: "school",
      url: "https://scholar.google.com/citations?user=WecCIHwAAAAJ&hl=en",
    },
    {
      label: "Instagram",
      icon: "photo_camera",
      url: "https://instagram.com/selfadjointoperator",
    },
    {
      label: "LinkedIn",
      icon: "work",
      url: "https://linkedin.com/in/avery-reyna",
    },
  ];

  navSocial.replaceChildren(
    ...links.map((link) => {
      const anchor = document.createElement("a");
      anchor.href = link.url;
      anchor.title = link.label;
      anchor.setAttribute("aria-label", `${link.label} profile`);
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer me";

      const icon = document.createElement("span");
      icon.className = "material-symbols-outlined";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = link.icon;

      anchor.append(icon);
      return anchor;
    }),
  );
})();
