// Effet "TrueFocus" (react-bits) porté en JS vanilla + GSAP pour le sous-titre du hero :
// mise au point mot par mot avec cadre lumineux, cycle automatique.
(function () {
  const container = document.getElementById('heroTrueFocus');
  if (!container) return;

  const words = Array.from(container.querySelectorAll('.tf-word'));
  const frame = container.querySelector('.tf-frame');
  if (!words.length || !frame) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return; // reste net et statique, cf. .tf-frame{display:none} en CSS

  const blurAmount = 6;
  const animationDuration = 0.5;
  const pauseBetween = 1.4;

  let currentIndex = 0;
  let intervalId = null;

  function focusWord(index) {
    words.forEach((w, i) => {
      gsap.to(w, {
        filter: i === index ? 'blur(0px)' : `blur(${blurAmount}px)`,
        duration: animationDuration,
        ease: 'power2.out'
      });
    });

    const containerRect = container.getBoundingClientRect();
    const activeRect = words[index].getBoundingClientRect();

    gsap.to(frame, {
      x: activeRect.left - containerRect.left,
      y: activeRect.top - containerRect.top,
      width: activeRect.width,
      height: activeRect.height,
      opacity: 1,
      duration: animationDuration,
      ease: 'power2.out'
    });
  }

  function start() {
    focusWord(currentIndex);
    intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % words.length;
      focusWord(currentIndex);
    }, (animationDuration + pauseBetween) * 1000);
  }

  // On attend que les web fonts/mise en page soient stabilisées pour un premier cadrage correct.
  window.addEventListener('load', start, { once: true });
  window.addEventListener('resize', () => focusWord(currentIndex));
})();
