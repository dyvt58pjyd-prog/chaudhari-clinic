export class WhatsAppWidget {
  constructor() {
    this.isOpen = false;
    this.phone = '919049883983';
    this.createDom();
  }

  createDom() {
    const wrap = document.createElement('div');
    wrap.id = 'whatsapp-floating-root';
    wrap.className = 'whatsapp-widget-container';
    wrap.innerHTML = `
      <!-- WhatsApp Floating Trigger Button -->
      <button type="button" class="whatsapp-trigger-btn" id="whatsapp-trigger" aria-label="Chat with Chaudhari Clinic on WhatsApp">
        <span class="wa-unread-pulse">1</span>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.678.15-.201.3-.778.978-.954 1.178-.176.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.895-.799-1.5-1.787-1.676-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.201-.3.301-.502.101-.201.05-.377-.025-.527-.075-.15-.678-1.633-.929-2.235-.245-.587-.493-.507-.678-.517l-.578-.01c-.201 0-.527.075-.803.377s-1.055 1.03-1.055 2.511c0 1.481 1.08 2.911 1.231 3.112.151.201 2.125 3.245 5.148 4.552.719.311 1.281.497 1.719.636.723.23 1.381.197 1.901.12.579-.087 1.78-.727 2.031-1.43.251-.703.251-1.306.176-1.431-.076-.126-.277-.201-.578-.351zM12.004 2C6.484 2 2.01 6.474 2.01 12c0 1.91.537 3.696 1.468 5.222L2 22l4.945-1.435C8.414 21.433 10.154 22 12.004 22c5.521 0 9.996-4.475 9.996-10 0-5.526-4.475-10-9.996-10z"/>
        </svg>
      </button>

      <!-- WhatsApp Quick Popup Card -->
      <div class="whatsapp-popup-card hidden" id="whatsapp-popup">
        <div class="wa-popup-header">
          <div class="wa-header-avatar">
            <span class="avatar-crest">CSD</span>
            <span class="wa-online-dot"></span>
          </div>
          <div class="wa-header-meta">
            <h4>Chaudhari Clinic Desk</h4>
            <p>Khamgaon • Replies in &lt; 5 mins</p>
          </div>
          <button type="button" class="wa-close-btn" id="wa-btn-close">✕</button>
        </div>

        <div class="wa-popup-body">
          <div class="wa-message-bubble">
            <p>Namaste! 🙏 Welcome to <strong>Chaudhari Skin & Dental Care Multispeciality Clinic</strong>, Khamgaon.</p>
            <p class="text-xs text-muted" style="margin-top: 4px;">Choose a topic below or chat directly with our official reception & pharmacy desk (+91 90498 83983):</p>
          </div>

          <div class="wa-quick-options">
            <button type="button" class="wa-opt-btn" data-msg="Hi Chaudhari Clinic Khamgaon, I would like to book a Skin/Hair/Laser consultation with Dr. Rajnikant Arvind Chaudhari.">
              🌸 Book Dermatology / Skin (Dr. Rajnikant)
            </button>
            <button type="button" class="wa-opt-btn" data-msg="Hi Chaudhari Clinic Khamgaon, I would like to book a Dental / Painless RCT / Implant consultation with Dr. Priyanka Chaudhari (Anekar).">
              🦷 Book Dental Surgery & RCT (Dr. Priyanka)
            </button>
            <button type="button" class="wa-opt-btn" data-msg="Hi Chaudhari Clinic Khamgaon, I would like to book Pediatric Dental Care / Smile Design with Dr. Rutika Tulaskar (Chaudhari).">
              🧸 Book Pediatric & Smile Design (Dr. Rutika)
            </button>
            <button type="button" class="wa-opt-btn alert-opt" data-msg="URGENT: I am experiencing severe toothache / emergency dental pain and need a same-day priority slot in Khamgaon.">
              🚨 Emergency Acute Dental Pain Slot
            </button>
            <button type="button" class="wa-opt-btn" data-msg="Hi Medicare Pharmacy at Chaudhari Clinic, I would like to inquire about prescription medicines or availability.">
              💊 Medicare Pharmacy Prescription Inquiry
            </button>
          </div>
        </div>

        <form class="wa-popup-footer" id="wa-custom-form">
          <input type="text" id="wa-custom-input" placeholder="Type your query here..." class="wa-input" />
          <button type="submit" class="wa-send-btn" aria-label="Send WhatsApp message">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(wrap);
    this.el = wrap;
    this.popup = wrap.querySelector('#whatsapp-popup');

    this.bindEvents();
  }

  bindEvents() {
    const trigger = this.el.querySelector('#whatsapp-trigger');
    const closeBtn = this.el.querySelector('#wa-btn-close');

    trigger.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.popup.classList.remove('hidden');
        this.el.querySelector('.wa-unread-pulse').style.display = 'none';
      } else {
        this.popup.classList.add('hidden');
      }
    });

    closeBtn.addEventListener('click', () => {
      this.isOpen = false;
      this.popup.classList.add('hidden');
    });

    // Quick option clicks
    this.el.querySelectorAll('.wa-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-msg');
        this.openWhatsApp(text);
      });
    });

    // Custom form submit
    const form = this.el.querySelector('#wa-custom-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = this.el.querySelector('#wa-custom-input');
      const val = input.value.trim() || 'Hi Chaudhari Clinic, I would like to inquire about appointments.';
      this.openWhatsApp(val);
      input.value = '';
    });
  }

  openWhatsApp(text) {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${this.phone}?text=${encoded}`, '_blank');
  }
}
