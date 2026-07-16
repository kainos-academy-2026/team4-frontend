(function () {
	var panel = document.querySelector(".kainos-roles-panel");
	if (!panel) {
		return;
	}

	var observer = new IntersectionObserver(
		function (entries) {
			if (entries[0].isIntersecting) {
				panel.classList.add("is-revealed");
				observer.disconnect();
			}
		},
		{ threshold: 0.08 },
	);

	observer.observe(panel);
})();
