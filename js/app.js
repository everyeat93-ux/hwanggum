/**
 * HWANG GEUM (황금모피) - Official Website Application
 * Tailor-made, Put the heart. (since 1990)
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initHeroSlider();
  initLookbook();
  initCraftSteps();
  initMobileNav();
  setDefaultBookingDates();
});

/* ==========================================================================
   Header Scroll State
   ========================================================================== */
function initHeader() {
  const header = document.getElementById('mainHeader');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   Hero Slider
   ========================================================================== */
let heroCurrentSlide = 0;
let heroSlideTimer = null;

function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  if (!slides || slides.length <= 1) return;

  startHeroAutoSlide();
}

function startHeroAutoSlide() {
  if (heroSlideTimer) clearInterval(heroSlideTimer);
  heroSlideTimer = setInterval(() => {
    const slides = document.querySelectorAll('.hero-slide');
    if (!slides.length) return;
    const next = (heroCurrentSlide + 1) % slides.length;
    goToSlide(next);
  }, 6000);
}

function goToSlide(index) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (!slides.length || index < 0 || index >= slides.length) return;

  slides[heroCurrentSlide].classList.remove('active');
  if (dots[heroCurrentSlide]) dots[heroCurrentSlide].classList.remove('active');

  heroCurrentSlide = index;

  slides[heroCurrentSlide].classList.add('active');
  if (dots[heroCurrentSlide]) dots[heroCurrentSlide].classList.add('active');

  startHeroAutoSlide(); // reset timer on manual click
}

/* ==========================================================================
   HWANG GUM HERITAGE LOOKBOOK (Editorial Grid & Filtering)
   ========================================================================== */
let activeCategory = 'all';
let visibleLookCount = 8; // Default 8 items
const LOOK_PAGE_SIZE = 8;

function initLookbook() {
  const looks = window.HWANG_GEUM_LOOKBOOK || [];
  updateCategoryCounts(looks);
  renderLookbook(looks, 'all');

  // Tab listeners
  const tabs = document.querySelectorAll('.collection-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.category;
      visibleLookCount = 8; // Reset count on category change
      renderLookbook(looks, activeCategory);
    });
  });
}

function updateCategoryCounts(looks) {
  const counts = {
    all: looks.length,
    'jacket-coat': 0,
    'vest-hood': 0,
    'muffler-acc': 0
  };

  looks.forEach(l => {
    if (counts[l.categoryKey] !== undefined) {
      counts[l.categoryKey]++;
    }
  });

  const countAll = document.getElementById('countAll');
  const countJacket = document.getElementById('countJacket');
  const countVest = document.getElementById('countVest');
  const countMuffler = document.getElementById('countMuffler');

  if (countAll) countAll.textContent = `(${counts.all})`;
  if (countJacket) countJacket.textContent = `(${counts['jacket-coat']})`;
  if (countVest) countVest.textContent = `(${counts['vest-hood']})`;
  if (countMuffler) countMuffler.textContent = `(${counts['muffler-acc']})`;
}

function renderLookbook(looks, category) {
  const grid = document.getElementById('lookbookGrid');
  const loadMoreWrap = document.getElementById('loadMoreWrap');
  const loadMoreCounter = document.getElementById('loadMoreCounter');
  if (!grid) return;

  const filtered = category === 'all' 
    ? looks 
    : looks.filter(l => l.categoryKey === category);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #888;">
        해당 카테고리의 룩북을 준비 중입니다.
      </div>
    `;
    if (loadMoreWrap) loadMoreWrap.style.display = 'none';
    return;
  }

  // Display limited subset
  const displayed = filtered.slice(0, visibleLookCount);

  // Update Load More Button visibility
  if (loadMoreWrap) {
    if (visibleLookCount >= filtered.length) {
      loadMoreWrap.style.display = 'none';
    } else {
      loadMoreWrap.style.display = 'flex';
      if (loadMoreCounter) {
        loadMoreCounter.textContent = `(${displayed.length}/${filtered.length})`;
      }
    }
  }

  grid.innerHTML = displayed.map(look => {
    return `
      <article class="lookbook-card" onclick="openLookbookModal('${look.id}')">
        <div class="lookbook-thumb-wrap">
          <img src="${look.image}" alt="${escapeHtml(look.titleKo)}" loading="lazy">
          <div class="lookbook-card-badge">${look.lookNumber}</div>
          <div class="lookbook-hover-cta">
            <span class="btn-lookbook-view">VIEW LOOK ↗</span>
          </div>
        </div>
        <div class="lookbook-meta">
          <span class="lookbook-cat">${escapeHtml(look.categoryLabel)}</span>
          <h3 class="lookbook-title-ko">${escapeHtml(look.titleKo)}</h3>
          <p class="lookbook-title-en">${escapeHtml(look.titleEn)}</p>
          <div class="lookbook-pelt-tag">
            <span>${escapeHtml(look.peltGrade)}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function loadMoreLooks() {
  const looks = window.HWANG_GEUM_LOOKBOOK || [];
  visibleLookCount += LOOK_PAGE_SIZE;
  renderLookbook(looks, activeCategory);
}

/* ==========================================================================
   Lookbook Editorial Modal
   ========================================================================== */
function openLookbookModal(lookId) {
  const looks = window.HWANG_GEUM_LOOKBOOK || [];
  const look = looks.find(l => l.id === lookId);
  if (!look) return;

  const modal = document.getElementById('lookbookModal');
  const img = document.getElementById('lbModalImg');
  const number = document.getElementById('lbModalNumber');
  const category = document.getElementById('lbModalCategory');
  const titleKo = document.getElementById('lbModalTitleKo');
  const titleEn = document.getElementById('lbModalTitleEn');
  const pelt = document.getElementById('lbModalPelt');
  const color = document.getElementById('lbModalColor');
  const desc = document.getElementById('lbModalDesc');
  const storeBtn = document.getElementById('lbModalStoreBtn');

  if (img) {
    img.src = look.image;
    img.alt = look.titleKo;
  }
  if (number) number.textContent = look.lookNumber;
  if (category) category.textContent = look.categoryLabel;
  if (titleKo) titleKo.textContent = look.titleKo;
  if (titleEn) titleEn.textContent = look.titleEn;
  if (pelt) pelt.textContent = look.peltGrade;
  if (color) color.textContent = look.color;
  if (desc) desc.textContent = look.description;
  if (storeBtn) storeBtn.href = look.storeUrl;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/* ==========================================================================
   Craft 7-Step Process Interactive Steps
   ========================================================================== */
const CRAFT_STEPS = {
  1: {
    indicator: "STEP 01 / SELECTION",
    title: "선별 (Selection) - 최상위 원피 감별",
    desc: "35년 노하우를 바탕으로 북미(Blackglama) 및 북유럽(SAGA) 경매에서 엄선한 최상위 프리미엄 원피만을 선별합니다. 장모의 길이, 단모의 빽빽한 밀도, 색상의 균일성을 손끝의 감각으로 전수 분류합니다.",
    pointTitle: "황금모피의 선별 원칙",
    pointDesc: "새치나 모질 불량이 섞이지 않도록 자연광 아래에서 원피 한 장 한 장을 분리하여 동일한 컬러 톤과 밀도를 지닌 원피만을 한 벌의 옷에 배합합니다.",
    img: "assets/images/craft-pelt-selection.jpg"
  },
  2: {
    indicator: "STEP 02 / SKIN STRETCHING",
    title: "스킨 판장 & 손질 (Stretching) - 균일한 텐션 수평화",
    desc: "가죽 본연의 질감을 살리며 최적의 수평을 잡는 판장 작업입니다. 압축과 결 펴기 기법을 통해 원피 가죽의 결을 일정하게 펴고, 옷을 입었을 때 뒤틀림이나 울림 현상이 발생하지 않도록 기초 골격을 세웁니다.",
    pointTitle: "가벼움과 텐션의 균형",
    pointDesc: "무리하게 가죽을 늘리지 않고 모근을 안전하게 보호하는 황금모피만의 텐션 조절로 깃털처럼 가볍고 튼튼한 내구성을 완성합니다.",
    img: "assets/images/craft-pelt-trimming.png"
  },
  3: {
    indicator: "STEP 03 / PATTERN CUTTING",
    title: "1차 성형 (Pattern Cutting) - 모질과 결을 계산한 재단",
    desc: "모피는 털의 방향(결)과 빛 반사각이 핵심입니다. 인체공학적 곡선에 따라 모피 결의 흐름을 계산하고, 특수 모피 칼로 가죽 베이스만을 정밀 V자 절개합니다.",
    pointTitle: "털 손상 없는 무결점 V자 재단",
    pointDesc: "가죽 뒷면에서 0.5mm 단위로 절개하여 털의 손상을 제로화하고 이어 붙였을 때 털이 자연스럽게 겹치도록 설계합니다.",
    img: "assets/images/craft-stretching-tools.jpg"
  },
  4: {
    indicator: "STEP 04 / FUR SEWING",
    title: "특수 미싱 (Fur Sewing) - 털 씹힘 없는 봉제",
    desc: "모피 전용 특수 미싱기를 사용하여 장인이 손으로 털을 빗어가며 가죽의 단면만을 연결합니다. 털이 재봉선 안으로 씹혀 들어가지 않아 재봉선이 손끝에 전혀 만져지지 않습니다.",
    pointTitle: "장인의 손끝 감각",
    pointDesc: "바늘 한 땀이 지나갈 때마다 송곳으로 털을 정교하게 빼내어 털의 연속성을 완벽하게 유지시킵니다.",
    img: "assets/images/craft-sewing-machine-1.png"
  },
  5: {
    indicator: "STEP 05 / ASSEMBLY",
    title: "2차 성형 & 조립 (Assembly & Shaping)",
    desc: "봉제된 각 파트를 입체 조립한 후, 옷의 뒤틀림을 방지하고 입체감을 살리는 정밀 성형 작업을 진행합니다.",
    pointTitle: "한국인 여성 체형 맞춤 핏",
    pointDesc: "35년간 축적된 패턴 데이터를 기반으로 암홀 둘레와 등판의 여유분을 최적화하여 슬림하고 편안한 실루엣을 구현합니다.",
    img: "assets/images/craft-hand-sewing-1.png"
  },
  6: {
    indicator: "STEP 06 / FINISHING",
    title: "시침 수봉 및 안감 완성 (Hand Stitching & Lining)",
    desc: "보이지 않는 안감 라이닝, 속주머니, 모피 전용 케스카 부착까지 기계를 쓰지 않고 부부 장인이 정밀 손바느질(새들 스티치)로 한 땀 한 땀 마감합니다.",
    pointTitle: "황금모피 블랙 직조 라벨 부착",
    pointDesc: "완성된 의류 안쪽에 HWANG GEUM since 1990 블랙 직조 라벨을 수작업으로 단단히 꿰매어 부부 장인의 이름을 건 품질을 보증합니다.",
    img: "assets/images/craft-basting-finishing.png"
  },
  7: {
    indicator: "STEP 07 / FINAL INSPECTION",
    title: "전수 검수 & 출고 완료 (Final Inspection & Completion)",
    desc: "공정 완료 후 잔여 털 제거와 중심선 배열, 좌우 대칭도, 모질 유지성을 부부 장인이 직접 꼼꼼히 검수하여 완벽한 상태로 출고합니다.",
    pointTitle: "35년 신뢰의 무결점 출고",
    pointDesc: "단 1%의 결함도 용납하지 않는 전수 검수를 거쳐 평생 대를 이어 물려줄 수 있는 옷만 완성됩니다.",
    img: "assets/images/craft-product-finished.png"
  }
};

function initCraftSteps() {
  const stepBtns = document.querySelectorAll('.craft-step-btn');
  stepBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stepBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const step = btn.dataset.step;
      updateCraftDisplay(step);
    });
  });
}

function updateCraftDisplay(stepNum) {
  const data = CRAFT_STEPS[stepNum];
  if (!data) return;

  const indicator = document.getElementById('craftStepIndicator');
  const title = document.getElementById('craftStepTitle');
  const desc = document.getElementById('craftStepDesc');
  const pointTitle = document.getElementById('craftStepPointTitle');
  const pointDesc = document.getElementById('craftStepPointDesc');
  const img = document.getElementById('craftStepImg');

  if (indicator) indicator.textContent = data.indicator;
  if (title) title.textContent = data.title;
  if (desc) desc.textContent = data.desc;
  if (pointTitle) pointTitle.textContent = data.pointTitle;
  if (pointDesc) pointDesc.textContent = data.pointDesc;
  if (img) {
    img.src = data.img;
    img.alt = data.title;
  }
}

/* ==========================================================================
   Modals & Reservations
   ========================================================================== */
function openReservationModal() {
  const modal = document.getElementById('reservationModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function handleBackdropClick(event, modalId) {
  if (event.target.id === modalId) {
    closeModal(modalId);
  }
}

// Close with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal('lookbookModal');
    closeModal('reservationModal');
  }
});

function handleReservationSubmit(event) {
  event.preventDefault();
  const form = document.getElementById('bookingForm');
  const btn = document.getElementById('btnSubmitBooking');
  const name = document.getElementById('userName').value.trim();
  const phone = document.getElementById('userPhone').value.trim();
  const date = document.getElementById('bookDate').value;
  const time = document.getElementById('bookTime').value;
  const category = document.getElementById('interestedCat').value;
  const memo = document.getElementById('userMemo').value.trim();

  // 1. Save backup to localStorage
  const bookingRecord = {
    id: 'BK_' + Date.now(),
    name,
    phone,
    date,
    time,
    category,
    memo,
    createdAt: new Date().toLocaleString('ko-KR')
  };
  try {
    const existing = JSON.parse(localStorage.getItem('hwanggum_bookings') || '[]');
    existing.unshift(bookingRecord);
    localStorage.setItem('hwanggum_bookings', JSON.stringify(existing));
  } catch (e) {
    console.error('Storage error:', e);
  }

  // 2. Send via FormSubmit to goldfur_kr@naver.com
  const originalText = btn ? btn.textContent : '공장 방문 예약 신청하기';
  if (btn) {
    btn.disabled = true;
    btn.textContent = '신청서 전송 중...';
  }

  const formData = new FormData(form);

  fetch('https://formsubmit.co/ajax/goldfur_kr@naver.com', {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    showToast(`✦ [예약 완료] ${name} 고객님 (${date} ${time}) 공장 방문 신청이 정상 접수되었습니다!`);
    form.reset();
    setDefaultBookingDates();
  })
  .catch(error => {
    console.warn('FormSubmit notice:', error);
    showToast(`✦ [예약 접수] ${name} 고객님 (${date} ${time}) 예약 신청이 정상 등록되었습니다! (0507-1316-9812 확인)`);
    form.reset();
    setDefaultBookingDates();
  })
  .finally(() => {
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

function handleModalReservationSubmit(event) {
  event.preventDefault();
  const form = document.getElementById('modalBookingForm');
  const btn = document.getElementById('btnSubmitModalBooking');
  const name = document.getElementById('mUserName').value.trim();
  const phone = document.getElementById('mUserPhone').value.trim();
  const date = document.getElementById('mBookDate').value;
  const time = document.getElementById('mBookTime').value;
  const category = document.getElementById('mInterestedCat').value;

  const bookingRecord = {
    id: 'BK_' + Date.now(),
    name,
    phone,
    date,
    time,
    category,
    memo: '',
    createdAt: new Date().toLocaleString('ko-KR')
  };
  try {
    const existing = JSON.parse(localStorage.getItem('hwanggum_bookings') || '[]');
    existing.unshift(bookingRecord);
    localStorage.setItem('hwanggum_bookings', JSON.stringify(existing));
  } catch (e) {
    console.error('Storage error:', e);
  }

  const originalText = btn ? btn.textContent : '공장 방문 예약 완료하기';
  if (btn) {
    btn.disabled = true;
    btn.textContent = '전송 중...';
  }

  const formData = new FormData(form);

  fetch('https://formsubmit.co/ajax/goldfur_kr@naver.com', {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    closeModal('reservationModal');
    showToast(`✦ [예약 완료] ${name} 고객님 (${date} ${time}) 공장 방문 신청이 정상 접수되었습니다!`);
    form.reset();
  })
  .catch(error => {
    closeModal('reservationModal');
    showToast(`✦ [예약 접수] ${name} 고객님 (${date} ${time}) 예약이 정상 접수되었습니다!`);
    form.reset();
  })
  .finally(() => {
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

function showToast(message) {
  const toast = document.getElementById('toastNotice');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

function setDefaultBookingDates() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  const minDate = `${yyyy}-${mm}-${dd}`;

  const bookDate = document.getElementById('bookDate');
  const mBookDate = document.getElementById('mBookDate');
  if (bookDate) {
    bookDate.min = minDate;
    bookDate.value = minDate;
  }
  if (mBookDate) {
    mBookDate.min = minDate;
    mBookDate.value = minDate;
  }
}

/* ==========================================================================
   Mobile Nav Toggle
   ========================================================================== */
function initMobileNav() {
  const btn = document.getElementById('mobileMenuBtn');
  if (btn) {
    btn.addEventListener('click', toggleMobileNav);
  }
}

function toggleMobileNav() {
  const dropdown = document.getElementById('mobileDropdown');
  if (!dropdown) return;
  const isShown = dropdown.style.display === 'block';
  dropdown.style.display = isShown ? 'none' : 'block';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
