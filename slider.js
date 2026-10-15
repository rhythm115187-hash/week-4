class ImageSlider {
  constructor(element) {
    this.slider = element;
    this.track = element.querySelector('.slider-track');
    this.prevButton = element.querySelector('.slider-arrow--prev');
    this.nextButton = element.querySelector('.slider-arrow--next');
    this.dotsContainer = element.querySelector('.slider-dots');
    this.currentCounter = element.querySelector('.counter-current');
    this.totalCounter = element.querySelector('.counter-total');

    if (!this.currentCounter || !this.totalCounter) {
      this.currentCounter = null;
      this.totalCounter = null;
    }

    this.originalSlides = Array.from(this.track.children);
    this.totalSlides = this.originalSlides.length;

    if (!this.totalSlides) return;

    this.activeIndex = 0;
    this.currentIndex = 0;
    this.cloneCount = 0;
    this.isAnimating = false;
    this.originalTransition = getComputedStyle(this.track).transition;

    this.createDots();
    this.buildTrack();

    this.nextButton.addEventListener('click', () => this.next());
    this.prevButton.addEventListener('click', () => this.previous());

    this.track.addEventListener('transitionend', (event) => {
      if (event.target === this.track &&
          event.propertyName === 'transform') {
        this.handleTransitionEnd();
      }
    });

    this.resizeObserver = new ResizeObserver(() => {
      this.moveTo(this.currentIndex, false);
    });

    this.resizeObserver.observe(this.slider.querySelector('.slider-viewport'));

    this.slider.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        this.next();
      } else if (event.key === 'ArrowLeft') {
        this.previous();
      }
    });
  }

  formatNumber(number) {
    return String(number).padStart(2, '0');
  }

  createDots() {
    this.dotsContainer.innerHTML = '';

    this.originalSlides.forEach((_, index) => {
      const dot = document.createElement('button');

      dot.type = 'button';
      dot.className = 'slider-dot';
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);

      dot.addEventListener('click', () => this.goTo(index));

      this.dotsContainer.appendChild(dot);
    });

    this.dots = Array.from(this.dotsContainer.children);
    if (this.totalCounter) {
      this.totalCounter.textContent = this.formatNumber(this.totalSlides);
    }
  }

  buildTrack() {
    this.track.innerHTML = '';

    // One clone on each side is sufficient because one image
    // occupies the entire slider viewport.
    this.cloneCount = 1;

    const lastClone = this.originalSlides[this.totalSlides - 1].cloneNode(true);
    const firstClone = this.originalSlides[0].cloneNode(true);

    lastClone.setAttribute('aria-hidden', 'true');
    firstClone.setAttribute('aria-hidden', 'true');

    this.track.appendChild(lastClone);

    this.originalSlides.forEach((slide) => {
      this.track.appendChild(slide);
    });

    this.track.appendChild(firstClone);

    this.currentIndex = this.activeIndex + this.cloneCount;
    this.moveTo(this.currentIndex, false);
  }

  getStepSize() {
    const viewport = this.slider.querySelector('.slider-viewport');
    return viewport.getBoundingClientRect().width;
  }

  moveTo(index, animate = true) {
    this.currentIndex = index;

    this.activeIndex =
      ((index - this.cloneCount) % this.totalSlides + this.totalSlides) %
      this.totalSlides;

    this.track.style.transition = animate
      ? this.originalTransition
      : 'none';

    this.track.style.transform =
      `translate3d(${-index * this.getStepSize()}px, 0, 0)`;

    this.updateUI();
  }

  next() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.moveTo(this.currentIndex + 1);
  }

  previous() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.moveTo(this.currentIndex - 1);
  }

  goTo(index) {
    if (this.isAnimating || index === this.activeIndex) return;

    this.isAnimating = true;
    this.moveTo(index + this.cloneCount);
  }

  handleTransitionEnd() {
    if (this.currentIndex === this.totalSlides + this.cloneCount) {
      this.moveTo(this.cloneCount, false);
    } else if (this.currentIndex === 0) {
      this.moveTo(this.totalSlides, false);
    }

    this.isAnimating = false;
  }

  updateUI() {
    if (this.currentCounter) {
      this.currentCounter.textContent = this.formatNumber(this.activeIndex + 1);
    }

    this.dots.forEach((dot, index) => {
      const active = index === this.activeIndex;

      dot.classList.toggle('is-active', active);

      if (active) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });
  }

  destroy() {
    this.resizeObserver.disconnect();

    this.track.innerHTML = '';

    this.originalSlides.forEach((slide) => {
      this.track.appendChild(slide);
    });

    this.track.style.transform = '';
    this.track.style.transition = '';
    this.dotsContainer.innerHTML = '';
  }
}

document.querySelectorAll('.slider').forEach((element) => {
  new ImageSlider(element);
});
