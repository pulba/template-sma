// Native Intersection Observer untuk animasi scroll (tanpa GSAP)
export function initScrollAnimations() {
  console.log("Initializing CSS Scroll Animations with Intersection Observer")

  // Cek apakah browser support Intersection Observer
  if (!('IntersectionObserver' in window)) {
    console.warn('Intersection Observer not supported, animations disabled')
    return
  }

  // Konfigurasi observer
  const observerOptions = {
    root: null, // viewport
    rootMargin: '0px',
    threshold: 0.1 // trigger ketika 10% elemen terlihat
  }

  // Callback ketika elemen masuk/keluar viewport
  const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Elemen masuk viewport - tambah class 'is-visible'
        entry.target.classList.add('is-visible')
      } else {
        // Elemen keluar viewport - hapus class (untuk reverse animation)
        entry.target.classList.remove('is-visible')
      }
    })
  }

  // Buat observer
  const observer = new IntersectionObserver(observerCallback, observerOptions)

  // Observe semua elemen dengan data-animate="fade"
  const animatedElements = document.querySelectorAll("[data-animate='fade']")
  animatedElements.forEach(el => {
    // Set initial state
    el.classList.add('animate-fade')
    observer.observe(el)
  })

  console.log(`Observing ${animatedElements.length} animated elements`)
}
