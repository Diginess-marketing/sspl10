/* SSPL Web Application JavaScript */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Switcher
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = themeToggleBtn.querySelector('i');
  
  const savedTheme = localStorage.getItem('sspl_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('sspl_theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    if (theme === 'light') {
      themeIcon.className = 'fas fa-moon';
    } else {
      themeIcon.className = 'fas fa-sun';
    }
  }

  // 2. Statistics Counter Animation
  const statNumbers = document.querySelectorAll('.stat-number');
  let animated = false;

  function animateCounters() {
    statNumbers.forEach(stat => {
      const target = +stat.getAttribute('data-target');
      const count = +stat.innerText.replace(/[^0-9.]/g, '');
      const increment = target / 50;

      if (count < target) {
        stat.innerText = Math.ceil(count + increment) + (stat.getAttribute('data-suffix') || '');
        setTimeout(animateCounters, 30);
      } else {
        stat.innerText = target + (stat.getAttribute('data-suffix') || '');
      }
    });
  }

  // Simple scroll trigger for counter
  window.addEventListener('scroll', () => {
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection && !animated) {
      const rect = statsSection.getBoundingClientRect();
      if (rect.top <= window.innerHeight) {
        animateCounters();
        animated = true;
      }
    }
  });

  // 3. Category Filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const catalogCards = document.querySelectorAll('.catalog-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      catalogCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease-in-out';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 4. Interactive ROI Calculator
  const usersSlider = document.getElementById('userCount');
  const durationSlider = document.getElementById('duration');
  const userVal = document.getElementById('userVal');
  const durationVal = document.getElementById('durationVal');
  const roiOutput = document.getElementById('roiOutput');

  function calculateROI() {
    if (!usersSlider || !durationSlider || !roiOutput) return;
    const users = parseInt(usersSlider.value);
    const months = parseInt(durationSlider.value);

    userVal.innerText = users;
    durationVal.innerText = months + ' M';

    // Calculation logic: Base savings + efficiency factor
    const monthlySavingPerUser = 450;
    const totalSavings = users * months * monthlySavingPerUser * 1.45;

    roiOutput.innerText = '$' + totalSavings.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  if (usersSlider && durationSlider) {
    usersSlider.addEventListener('input', calculateROI);
    durationSlider.addEventListener('input', calculateROI);
    calculateROI();
  }

  // 5. Contact Form Handler
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        
        formFeedback.innerHTML = `
          <div style="padding: 12px; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #10b981; border-radius: 8px; margin-top: 15px;">
            Thank you! Your inquiry has been sent to SSPL Enterprise Team. We will contact you shortly.
          </div>
        `;

        contactForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          submitBtn.style.background = '';
        }, 4000);
      }, 1200);
    });
  }
});
