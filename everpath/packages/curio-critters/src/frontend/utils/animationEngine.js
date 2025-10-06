


import { gsap } from 'gsap';

const animationEngine = {
  // Create floating hearts animation
  createFloatingHearts(containerId, count = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear any existing hearts
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Create floating hearts animation
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('div');
      heart.className = 'heart';
      heart.textContent = '💕';
      heart.style.left = (Math.random() * 60 - 30) + 'px';
      heart.style.animationDelay = (i * 0.2) + 's';

      container.appendChild(heart);

      // Animate with GSAP
      gsap.fromTo(heart, {
        y: 0,
        opacity: 1,
        scale: 1
      }, {
        y: -100,
        opacity: 0,
        scale: 1.5,
        duration: 2,
        ease: "power1.out",
        onComplete: () => {
          if (container && heart.parentNode === container) {
            container.removeChild(heart);
          }
        }
      });
    }
  },

  // Create sparkle animation for correct answers
  createSparkles(containerId, count = 5) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear any existing sparkles
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Create sparkle animation
    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.textContent = '✨';
      sparkle.style.left = (Math.random() * 80 - 40) + 'px';
      sparkle.style.top = (Math.random() * 60 - 30) + 'px';

      container.appendChild(sparkle);

      // Animate with GSAP
      gsap.fromTo(sparkle, {
        y: 0,
        opacity: 1,
        scale: 0.5
      }, {
        y: -50,
        opacity: 0,
        scale: 1,
        duration: 1.5,
        ease: "power2.out",
        onComplete: () => {
          if (container && sparkle.parentNode === container) {
            container.removeChild(sparkle);
          }
        }
      });
    }
  },

  // Create shake animation for wrong answers
  shakeElement(elementId, intensity = 10) {
    const element = document.getElementById(elementId);
    if (!element) return;

    gsap.fromTo(element, {
      x: 0,
      rotation: 0
    }, {
      x: (Math.random() - 0.5) * intensity,
      rotation: (Math.random() - 0.5) * 10,
      duration: 0.1,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.fromTo(element, {
          x: element.offsetLeft,
          rotation: element.style.rotation || 0
        }, {
          x: (Math.random() - 0.5) * intensity,
          rotation: (Math.random() - 0.5) * 10,
          duration: 0.1,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.to(element, {
              x: 0,
              rotation: 0,
              duration: 0.2
            });
          }
        });
      }
    });
  },

  // Create pulse animation for buttons
  pulseElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    gsap.fromTo(element, {
      scale: 1,
      boxShadow: '0px 0px 5px rgba(255, 255, 255, 0.8)'
    }, {
      scale: 1.1,
      boxShadow: '0px 0px 15px rgba(255, 255, 255, 1)',
      duration: 0.3,
      ease: "power1.inOut",
      yoyo: true,
      repeat: 1
    });
  }
};

export default animationEngine;


