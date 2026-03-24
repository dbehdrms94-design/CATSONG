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
  submitButton.textContent = 'SENDING...';
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
      throw new Error('Server error occurred.');
    }

    const result = await response.json();

    if (result.success) {
      form.style.display = 'none';
      document.getElementById('inquiryResult').style.display = 'block';
    } else {
      alert('Error: ' + result.error);
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }

  } catch (error) {
    console.error('Inquiry Error:', error);
    alert('An error occurred. Please try again later.');
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
  }
}

// Admin APIs
async function adminRegister(event) {
  event.preventDefault();
  const username = document.getElementById('adminRegisterUsername').value.trim();
  const password = document.getElementById('adminRegisterPassword').value;
  const message = document.getElementById('adminRegisterMessage');

  try {
    const response = await fetch('/api/admin/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const result = await response.json();

    if (result.success) {
      message.textContent = '관리자 계정 생성 성공. 로그인하세요.';
      message.style.color = '#00c000';
      event.target.reset();
    } else {
      message.textContent = result.error || '등록 실패';
      message.style.color = '#ff4d4d';
    }
  } catch (err) {
    console.error(err);
    message.textContent = '서버 오류가 발생했습니다.';
    message.style.color = '#ff4d4d';
  }
}

async function adminLogin(event) {
  event.preventDefault();
  const username = document.getElementById('adminLoginUsername').value.trim();
  const password = document.getElementById('adminLoginPassword').value;
  const message = document.getElementById('adminLoginMessage');

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const result = await response.json();

    if (result.success) {
      localStorage.setItem('catsongAdminToken', result.token);
      message.textContent = '로그인 성공!';
      message.style.color = '#00c000';
      event.target.reset();
      loadAdminDashboard();
    } else {
      message.textContent = result.error || '로그인 실패';
      message.style.color = '#ff4d4d';
    }
  } catch (err) {
    console.error(err);
    message.textContent = '서버 오류가 발생했습니다.';
    message.style.color = '#ff4d4d';
  }
}

async function loadAdminDashboard() {
  const token = localStorage.getItem('catsongAdminToken');
  if (!token) {
    document.getElementById('adminDashboard').style.display = 'none';
    return;
  }

  const response = await fetch('/api/admin/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const result = await response.json();
  if (result.success) {
    document.getElementById('adminDashboard').style.display = 'block';
    document.getElementById('adminWelcome').textContent = `환영합니다, ${result.admin}님`;
    document.getElementById('adminStats').textContent = `등록 관리자: ${result.adminsCount} | 문의 건수: ${result.inquiriesCount}`;
  } else {
    document.getElementById('adminDashboard').style.display = 'none';
    localStorage.removeItem('catsongAdminToken');
  }
}

async function loadInquiries() {
  const token = localStorage.getItem('catsongAdminToken');
  if (!token) return;

  const response = await fetch('/api/admin/inquiries', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const result = await response.json();
  if (result.success) {
    document.getElementById('adminInquiries').textContent = JSON.stringify(result.inquiries, null, 2);
  }
}

// Preview Modal Functions
async function openPreview(button) {
  const item = button.closest('.portfolio-item');
  const type = item.getAttribute('data-type');
  const title = item.getAttribute('data-title');
  const desc = item.getAttribute('data-desc');

  const modal = document.getElementById('previewModal');
  const content = document.getElementById('previewContent');
  const titleEl = document.getElementById('previewTitle');
  const descEl = document.getElementById('previewDescription');
  const aiCommentEl = document.getElementById('aiComment');

  titleEl.textContent = title;
  descEl.textContent = desc;
  aiCommentEl.textContent = 'AI is thinking... 🔮';
  content.innerHTML = '<div style="color: #444; font-size: 2rem;">GENERATING PREVIEW...</div>';

  modal.style.display = 'block';
  document.body.style.overflow = 'hidden'; 

  try {
    // Call our new AI content generation API
    const response = await fetch('/api/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType: type,
        prompt: desc
      })
    });

    const result = await response.json();

    if (result.success) {
      aiCommentEl.textContent = `AI Creative Director: "${result.description}"`;
      
      if (type === 'image') {
        content.innerHTML = `<img src="${result.previewUrl}" alt="AI Preview" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
      } else {
        content.innerHTML = `
          <div style="text-align: center; color: var(--accent-color);">
            <div style="font-size: 5rem; margin-bottom: 1rem;">${type === 'video' ? '🎬' : (type === 'art' ? '✨' : '🤖')}</div>
            <p style="font-size: 1.2rem; font-weight: 600;">${type.toUpperCase()} PREVIEW GENERATED</p>
          </div>
        `;
      }
    } else {
      aiCommentEl.textContent = 'AI failed to generate a comment.';
      content.innerHTML = '<div style="color: #f00;">Preview Generation Failed</div>';
    }
  } catch (error) {
    console.error('Preview Error:', error);
    aiCommentEl.textContent = 'Connection error with AI service.';
  }
}

function closePreview() {
  const modal = document.getElementById('previewModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Initialization on DOM Load
document.addEventListener('DOMContentLoaded', function() {
  // Navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      smoothScroll(targetId.substring(1));
    });
  });

  // Inquiry Form
  const inquiryForm = document.getElementById('inquiryForm');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', handleInquirySubmit);
  }

  // Admin Forms
  const adminRegisterForm = document.getElementById('adminRegisterForm');
  if (adminRegisterForm) {
    adminRegisterForm.addEventListener('submit', adminRegister);
  }

  const adminLoginForm = document.getElementById('adminLoginForm');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', adminLogin);
  }

  const loadInquiriesButton = document.getElementById('loadInquiriesButton');
  if (loadInquiriesButton) {
    loadInquiriesButton.addEventListener('click', loadInquiries);
  }

  loadAdminDashboard();

  // Modal click outside to close
  window.onclick = function(event) {
    const modal = document.getElementById('previewModal');
    if (event.target == modal) {
      closePreview();
    }
  };
});
