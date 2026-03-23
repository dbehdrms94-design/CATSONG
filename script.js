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
});

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

  const icon = type === 'video' ? '🎬' : (type === 'image' ? '🖼️' : (type === 'art' ? '✨' : '🤖'));
  content.innerHTML = `
    <div style="text-align: center; color: #64748b;">
      <div style="font-size: 5rem; margin-bottom: 1rem;">${icon}</div>
      <p style="font-size: 1.2rem; font-weight: 600; color: #0f172a;">${title} 작업물 미리보기</p>
      <p style="margin-top: 1rem; max-width: 400px; margin-left: auto; margin-right: auto;">
        실제 포트폴리오 사이트에서는 AI로 생성된 고해상도 결과물(이미지, 영상 등)이 이곳에 표시됩니다.
      </p>
    </div>
  `;

  modal.style.display = 'block';
  document.body.style.overflow = 'hidden'; 
}

function closePreview() {
  const modal = document.getElementById('previewModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

window.onclick = function(event) {
  const modal = document.getElementById('previewModal');
  if (event.target == modal) {
    closePreview();
  }
}
