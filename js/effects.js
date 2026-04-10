/**
 * PrimeArtifact — Interactive 3D Artifact & Effects
 * 
 * 1. 3D Wireframe Icosahedron (The "PrimeArtifact" Artifact) — highly optimized 3D-to-2D projection.
 * 2. 3D Card Perspective Tilt
 */

(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  /* =============================================
     1. 3D ARTIFACT: INTERACTIVE WIREFRAME
     ============================================= */
  function init3DArtifact() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    // Create canvas
    var canvas = document.createElement('canvas');
    canvas.className = 'hero-artifact';
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    hero.style.position = 'relative';
    hero.insertBefore(canvas, hero.firstChild);

    // Keep hero text above canvas
    var children = hero.children;
    for (var i = 1; i < children.length; i++) {
      if (children[i].style) {
        children[i].style.position = 'relative';
        children[i].style.zIndex = '1';
      }
    }

    var ctx = canvas.getContext('2d');
    var w, h;

    function resize() {
      var rect = hero.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    // Icosahedron Vertices (Golden Ratio)
    var phi = (1 + Math.sqrt(5)) / 2;
    var vertices = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ];

    // Edges (connecting indices of vertices)
    var edges = [
      [0, 11], [0, 5], [0, 1], [0, 7], [0, 10],
      [1, 5], [1, 9], [1, 8], [1, 7],
      [11, 5], [5, 9], [9, 8], [8, 7], [7, 10], [10, 11],
      [11, 2], [5, 4], [9, 3], [8, 6], [10, 2],
      [2, 4], [4, 3], [3, 6], [6, 2],
      [2, 10], [2, 11], [4, 5], [4, 9], [3, 9], [3, 8], [6, 8], [6, 7] // Some internal connections for a complex mesh look
    ];

    // Rotation angles
    var angleX = 0;
    var angleY = 0;

    // Target rotation based on mouse
    var targetRotX = 0.002;
    var targetRotY = 0.003;

    var mouseX = 0;
    var mouseY = 0;

    window.addEventListener('mousemove', function (e) {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;

      // Mouse drives rotation speed and direction
      targetRotY = mouseX * 0.02;
      targetRotX = mouseY * 0.02;
    });

    function getThemeColor() {
      var theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'dark') {
        return 'rgba(107, 143, 196, 0.15)'; // Soft blue for dark mode
      }
      return 'rgba(74, 111, 165, 0.15)';     // Sharper blue for light mode
    }

    // 3D Matrix Rotation
    function rotate3D(v, rx, ry) {
      // Rotate Y
      var x1 = v[0] * Math.cos(ry) - v[2] * Math.sin(ry);
      var z1 = v[0] * Math.sin(ry) + v[2] * Math.cos(ry);
      // Rotate X
      var y2 = v[1] * Math.cos(rx) - z1 * Math.sin(rx);
      var z2 = v[1] * Math.sin(rx) + z1 * Math.cos(rx);
      return [x1, y2, z2];
    }

    var animId;

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // Smoothly interpolate current rotation towards target
      angleX += targetRotX;
      angleY += targetRotY;

      // Slowly drift if mouse is still
      if (Math.abs(targetRotX) < 0.001) angleX += 0.001;
      if (Math.abs(targetRotY) < 0.001) angleY += 0.0015;

      var color = getThemeColor();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;

      // We want the artifact to be massive and sit behind the text
      var scale = Math.min(w, h) * 0.45;
      var cx = w / 2;
      var cy = h / 2;

      // Draw all edges
      ctx.beginPath();
      for (var i = 0; i < edges.length; i++) {
        var v1 = vertices[edges[i][0]];
        var v2 = vertices[edges[i][1]];

        var r1 = rotate3D(v1, angleX, angleY);
        var r2 = rotate3D(v2, angleX, angleY);

        // Simple perspective projection
        var zDist = 4; // Perspective depth
        var p1Scale = scale / (zDist - r1[2]);
        var p2Scale = scale / (zDist - r2[2]);

        var px1 = cx + r1[0] * p1Scale;
        var py1 = cy + r1[1] * p1Scale;
        var px2 = cx + r2[0] * p2Scale;
        var py2 = cy + r2[1] * p2Scale;

        ctx.moveTo(px1, py1);
        ctx.lineTo(px2, py2);
      }
      ctx.stroke();

      // Draw connecting nodes (vertices)
      ctx.fillStyle = color.replace('0.15', '0.4'); // Brighter for the dots
      for (var j = 0; j < vertices.length; j++) {
        var rV = rotate3D(vertices[j], angleX, angleY);
        var pScale = scale / (4 - rV[2]);
        var vx = cx + rV[0] * pScale;
        var vy = cy + rV[1] * pScale;

        ctx.beginPath();
        // Make nodes closer to camera slightly larger
        ctx.arc(vx, vy, rV[2] > 0 ? 3 : 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        resize();
        if (!animId) draw();
      } else {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }, { threshold: 0.1 });

    observer.observe(hero);
    window.addEventListener('resize', resize);
  }

  /* =============================================
     2. MAGNETIC CARD TILT
     ============================================= */
  function initCardTilt() {
    var cards = document.querySelectorAll('.tool-card');
    if (!cards.length) return;

    var MAX_TILT = 10;
    cards.forEach(function (card) {
      var glare = document.createElement('div');
      glare.className = 'card-tilt-glare';
      glare.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;opacity:0;transition:opacity 0.3s ease;z-index:1;mix-blend-mode:overlay; border-radius:inherit;';
      card.style.position = 'relative';
      card.appendChild(glare);

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;

        var rotateY = ((x - centerX) / centerX) * MAX_TILT;
        var rotateX = ((centerY - y) / centerY) * MAX_TILT;

        card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.02, 1.02, 1.02)';

        var glareX = (x / rect.width) * 100;
        var glareY = (y / rect.height) * 100;
        glare.style.background = 'radial-gradient(circle at ' + glareX + '% ' + glareY + '%, rgba(255,255,255,0.15) 0%, transparent 50%)';
        glare.style.opacity = '1';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
        glare.style.opacity = '0';
      });

      card.addEventListener('mouseenter', function () {
        card.style.transition = 'transform 0.1s ease-out';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      init3DArtifact();
      initCardTilt();
    });
  } else {
    init3DArtifact();
    initCardTilt();
  }

})();
