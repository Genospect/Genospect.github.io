(() => {
	"use strict";

	const body = document.body;
	const nav = document.querySelector("#primary-nav");
	const toggle = document.querySelector(".mobile-nav-toggle");
	const menuLabel = toggle?.querySelector(".menu-label");
	const navLinks = Array.from(document.querySelectorAll('#primary-nav a[href^="#"]'));
	const year = document.querySelector("#current-year");

	body.classList.add("js-ready");
	window.addEventListener("load", () => body.classList.remove("is-preload"), { once: true });

	if (year) year.textContent = String(new Date().getFullYear());

	const closeNavigation = ({ restoreFocus = false } = {}) => {
		const wasOpen = body.classList.contains("nav-open");
		body.classList.remove("nav-open");
		if (toggle) toggle.setAttribute("aria-expanded", "false");
		if (menuLabel) menuLabel.textContent = "Menu";
		if (restoreFocus && wasOpen && toggle) toggle.focus();
	};

	if (toggle && nav) {
		toggle.addEventListener("click", () => {
			const isOpen = body.classList.toggle("nav-open");
			toggle.setAttribute("aria-expanded", String(isOpen));
			if (menuLabel) menuLabel.textContent = isOpen ? "Close" : "Menu";
			if (isOpen) navLinks[0]?.focus();
		});

		nav.addEventListener("click", (event) => {
			if (event.target.closest("a")) closeNavigation();
		});

		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && body.classList.contains("nav-open")) {
				closeNavigation({ restoreFocus: true });
			}

			if (event.key === "Tab" && body.classList.contains("nav-open")) {
				const focusable = [toggle, ...navLinks];
				const first = focusable[0];
				const last = focusable[focusable.length - 1];
				if (event.shiftKey && document.activeElement === first) {
					event.preventDefault();
					last.focus();
				} else if (!event.shiftKey && document.activeElement === last) {
					event.preventDefault();
					first.focus();
				}
			}
		});

		window.addEventListener("resize", () => {
			if (window.innerWidth > 736) closeNavigation();
		});
	}

	const revealItems = document.querySelectorAll(".reveal");
	if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		const revealObserver = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible");
					observer.unobserve(entry.target);
				}
			});
		}, { rootMargin: "0px 0px -8%", threshold: 0.08 });

		revealItems.forEach((item) => revealObserver.observe(item));
	} else {
		revealItems.forEach((item) => item.classList.add("is-visible"));
	}

	const sectionIds = navLinks.map((link) => link.getAttribute("href").slice(1));
	const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

	if ("IntersectionObserver" in window && sections.length) {
		const sectionObserver = new IntersectionObserver((entries) => {
			const visible = entries
				.filter((entry) => entry.isIntersecting)
				.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

			if (!visible) return;
			navLinks.forEach((link) => {
				const isActive = link.getAttribute("href") === `#${visible.target.id}`;
				link.classList.toggle("active", isActive);
				if (isActive) link.setAttribute("aria-current", "location");
				else link.removeAttribute("aria-current");
			});
		}, { rootMargin: "-25% 0px -60%", threshold: [0, 0.15, 0.45] });

		sections.forEach((section) => sectionObserver.observe(section));
	}
})();
