document.addEventListener('DOMContentLoaded', () => {
  // 1. 3D HOVER TILT EFFECT
  const cards = document.querySelectorAll('.tool-card, .input-panel, .stat-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      // Don't tilt if we are currently dragging the element
      if (card.classList.contains('is-dragging')) return; 

      card.classList.add('is-hovered');
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation (max 6 degrees for a premium subtle effect)
      const rotateX = ((y - centerY) / centerY) * -6; 
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-hovered');
      // Reset rotation, let CSS transition handle the smooth return
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });

  // 2. DRAGGABLE PANELS
  const panels = document.querySelectorAll('.input-panel');
  panels.forEach(panel => {
    const handle = panel.querySelector('.input-panel__header');
    if (!handle) return; // Only make panels with headers draggable

    let isDragging = false, currentX = 0, currentY = 0, initialX, initialY, xOffset = 0, yOffset = 0;

    handle.addEventListener('mousedown', (e) => {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      isDragging = true;
      panel.classList.add('is-dragging');
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      panel.classList.remove('is-dragging');
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;
        
        // Apply translation (movement). Note: we reset rotation to 0 while dragging
        panel.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotateX(0deg) rotateY(0deg) scale3d(1.02, 1.02, 1.02)`;
        panel.style.zIndex = "100";
      }
    });
  });
});