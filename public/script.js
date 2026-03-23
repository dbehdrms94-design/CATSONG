// Smooth scroll function
function smoothScroll(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// Handle Inquiry Form Submission
async function handleInquirySubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Show loading state on button
  const submitButton = form.querySelector('.submit-button');
  const originalButtonText = submitButton.textContent;
  submitButton.textContent = '전송 중... ⏳';
  submitButton.disabled = true;

  try {
    const response = await fetch('/api/inquiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('서버 오류가 발생했습니다.');
    }

    const result = await response.json();

    if (result.success) {
      // Hide form and show success message
      form.style.display = 'none';
      document.getElementById('inquiryResult').style.display = 'block';
      
      // Optional: Scroll to success message
      document.getElementById('inquiry').scrollIntoView({ behavior: 'smooth' });
    } else {
      alert('오류: ' + result.error);
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }

  } catch (error) {
    console.error('Inquiry Error:', error);
    alert('문의 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
  }
}

// AI Generator Logic
let selectedType = 'image';

function setupGenerator() {
  const optionBtns = document.querySelectorAll('.option-btn');
  const generateBtn = document.getElementById('generateBtn');
  const promptInput = document.getElementById('previewPrompt');

  if (!optionBtns.length) return;

  optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      optionBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedType = btn.getAttribute('data-type');
    });
  });

  if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
      const prompt = promptInput.value.trim();
      if (!prompt) {
        alert('프롬프트를 입력해주세요!');
        return;
      }

      const loader = document.getElementById('previewLoader');
      const previewArea = document.getElementById('aiPreviewArea');
      
      loader.style.display = 'flex';
      
      try {
        const response = await fetch('/api/generate-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentType: selectedType, prompt })
        });

        const data = await response.json();
        
        if (data.success) {
          displayAIResult(data);
        } else {
          alert('생성 실패: ' + data.error);
        }
      } catch (error) {
        console.error('Generation failed:', error);
        alert('생성 중 오류가 발생했습니다.');
      } finally {
        loader.style.display = 'none';
      }
    });
  }
}

function displayAIResult(data) {
  const previewArea = document.getElementById('aiPreviewArea');
  previewArea.innerHTML = '';

  if (data.contentType === 'image') {
    const img = document.createElement('img');
    img.src = data.previewUrl;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';
    img.alt = data.prompt;
    previewArea.appendChild(img);
  } else {
    const icon = data.contentType === 'video' ? '🎬' : '🤖';
    const typeLabel = data.contentType === 'video' ? '고급 AI 영상' : '3D 모델링';
    previewArea.innerHTML = `
      <div style="text-align: center; color: #2d3436; padding: 2rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">${icon}</div>
        <h3>${typeLabel} 생성 완료</h3>
        <p style="margin-top: 0.5rem; color: #666;">"${data.prompt}"</p>
        <p style="margin-top: 1rem; font-size: 0.8rem; color: #888;">실제 프로젝트에서는 고품질 결과물이 다운로드 가능하게 제공됩니다.</p>
      </div>
    `;
  }
}

// Initialization on DOM Load
document.addEventListener('DOMContentLoaded', function() {
  // Add smooth scroll behavior to navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Inquiry Form Listener
  const inquiryForm = document.getElementById('inquiryForm');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', handleInquirySubmit);
  }

  // Setup AI Generator
  setupGenerator();

  // Check server health on load
  checkServerHealth();
});

// Check server health
async function checkServerHealth() {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    console.log('Server status:', data.status);
  } catch (error) {
    console.error('Server connection error:', error);
  }
}

// Preview Modal Functions
function openPreview(button) {
  const item = button.closest('.portfolio-item');
  const type = item.getAttribute('data-type');
  const title = item.getAttribute('data-title');
  const desc = item.getAttribute('data-desc');

  const modal = document.getElementById('previewModal');
  const content = document.getElementById('previewContent');
  const titleEl = document.getElementById('previewTitle');
  const descEl = document.getElementById('previewDescription');

  titleEl.textContent = title;
  descEl.textContent = desc;
  content.innerHTML = '';

  if (type === 'video') {
    content.innerHTML = `
      <div class="preview-video-mock">
        <span class="play-icon">▶️</span>
        <span>브랜드 홍보 영상 프리뷰 (준비 중)</span>
        <p style="font-size: 0.9rem; opacity: 0.7;">실제 고품질 AI 영상 샘플이 재생될 영역입니다.</p>
      </div>
    `;
  } else if (type === 'image' || type === 'art' || type === 'design') {
    // Using icons as placeholders
    const icon = type === 'image' ? '🖼️' : (type === 'art' ? '✨' : '🤖');
    content.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 5rem; margin-bottom: 1rem;">${icon}</div>
        <p>${title} 프리뷰</p>
        <p style="font-size: 0.9rem; color: #888;">AI가 생성한 원본 품질의 이미지가 표시됩니다.</p>
      </div>
    `;
  }

  modal.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closePreview() {
  const modal = document.getElementById('previewModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto'; // Re-enable scrolling
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('previewModal');
  if (event.target == modal) {
    closePreview();
  }
}
