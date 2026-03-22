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
