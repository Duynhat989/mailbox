<template>
    <div class="error-page">
      <div class="error-container">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="url(#gradient)" />
            <defs>
              <linearGradient id="gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stop-color="#4f46e5" />
                <stop offset="1" stop-color="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1>404</h1>
        <p>Trang không tìm thấy</p>
        <router-link to="/" class="home-button">Trang chủ</router-link>
      </div>
    </div>
  </template>
  
  <style scoped>
  .error-page {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', -apple-system, sans-serif;
    background: linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 100%);
  }
  
  .error-container {
    text-align: center;
    max-width: 400px;
    padding: 40px;
    animation: fadeIn 0.8s ease-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .error-icon {
    width: 120px;
    height: 120px;
    margin: 0 auto 30px;
    color: #4f46e5;
    animation: pulse 2s infinite ease-in-out;
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }
  
  h1 {
    font-size: 8rem;
    font-weight: 800;
    line-height: 1;
    margin: 0 0 20px;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.05em;
  }
  
  p {
    font-size: 1.5rem;
    color: #4b5563;
    margin-bottom: 30px;
  }
  
  .home-button {
    display: inline-block;
    padding: 14px 45px;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    text-decoration: none;
    border-radius: 30px;
    font-weight: 600;
    font-size: 1.1rem;
    box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .home-button::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%);
    transform-origin: 50% 50%;
  }
  
  .home-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(79, 70, 229, 0.4);
  }
  
  .home-button:hover::after {
    animation: ripple 1s ease-out;
  }
  
  @keyframes ripple {
    0% {
      transform: scale(0, 0);
      opacity: 0.5;
    }
    100% {
      transform: scale(100, 100);
      opacity: 0;
    }
  }
  
  @media (max-width: 480px) {
    h1 {
      font-size: 6rem;
    }
    
    p {
      font-size: 1.2rem;
    }
    
    .error-icon {
      width: 100px;
      height: 100px;
    }
  }
  </style>