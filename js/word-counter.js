document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('text-input');
  const btnCalculate = document.getElementById('btn-calculate');

  // Top Stats
  const statWords = document.getElementById('stat-words');
  const statChars = document.getElementById('stat-characters');
  const statSentences = document.getElementById('stat-sentences');
  const statParagraphs = document.getElementById('stat-paragraphs');

  // Detailed Stats
  const detCharsNoSpace = document.getElementById('detail-chars-no-space');
  const detLetters = document.getElementById('detail-letters');
  const detNumbers = document.getElementById('detail-numbers');
  const detSpecial = document.getElementById('detail-special');
  const detSpaces = document.getElementById('detail-spaces');
  const detLines = document.getElementById('detail-lines');
  const detAvgWord = document.getElementById('detail-avg-word');
  const detLongestWord = document.getElementById('detail-longest-word');

  // The Main Calculation Engine
  function analyzeText() {
    const text = input.value;

    if (!text || text.trim().length === 0) {
      statWords.textContent = '0'; statChars.textContent = '0';
      statSentences.textContent = '0'; statParagraphs.textContent = '0';
      detCharsNoSpace.textContent = '0'; detLetters.textContent = '0';
      detNumbers.textContent = '0'; detSpecial.textContent = '0';
      detSpaces.textContent = '0'; detLines.textContent = '0';
      detAvgWord.textContent = '0'; detLongestWord.textContent = '—';
      return;
    }

    // 1. CHARACTER COUNT (Emoji safe)
    const charArray = Array.from(text);
    const totalChars = charArray.length;

    // 2. SPACES & LINES
    const totalSpaces = (text.match(/[ \t]/g) || []).length;
    const totalLines = (text.match(/\n/g) || []).length + 1;
    const charsNoSpace = totalChars - (text.match(/\s/g) || []).length;

    // 3. LETTERS & NUMBERS (Unicode aware)
    const totalLetters = (text.match(/\p{L}/gu) || []).length;
    const totalNumbers = (text.match(/\p{N}/gu) || []).length;
    const totalSpecial = Math.max(0, totalChars - totalLetters - totalNumbers - (text.match(/\s/g) || []).length);

    // 4. WORDS
    let wordArray = [];
    if (window.Intl && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
      const segments = segmenter.segment(text);
      for (let seg of segments) {
        if (seg.isWordLike) wordArray.push(seg.segment);
      }
    } else {
      wordArray = text.match(/[\p{L}\p{N}_-]+/gu) || []; 
    }
    const totalWords = wordArray.length;

    // 5. SENTENCES
    let sanitizedText = text.replace(/\b(Mr|Mrs|Ms|Dr|Prof|Rev|Capt|Sgt|St|Inc|Ltd|Jr|Sr|vs|etc|U\.S|D\.C)\./gi, "$1_DOT_");
    sanitizedText = sanitizedText.replace(/\.{2,}/g, "_ELLIPSIS_"); 
    const sentenceArray = sanitizedText.split(/[.!?]+(?=\s+|$)/).filter(s => s.trim().length > 0);
    const totalSentences = sentenceArray.length;

    // 6. PARAGRAPHS
    const paragraphArray = text.split(/\n+/).filter(p => p.trim().length > 0);
    const totalParagraphs = paragraphArray.length;

    // 7. LONGEST WORD & AVG LENGTH
    let longestWord = "";
    let totalWordLength = 0;
    
    wordArray.forEach(w => {
      let wLen = Array.from(w).length; 
      totalWordLength += wLen;
      if (wLen > Array.from(longestWord).length) longestWord = w;
    });
    
    const avgWordLength = totalWords > 0 ? (totalWordLength / totalWords).toFixed(1) : 0;
    let displayLongest = Array.from(longestWord).length > 20 
                         ? Array.from(longestWord).slice(0, 20).join('') + "..." 
                         : (longestWord || '—');

    // --- UPDATE DOM UI ---
    statWords.textContent = totalWords.toLocaleString();
    statChars.textContent = totalChars.toLocaleString();
    statSentences.textContent = totalSentences.toLocaleString();
    statParagraphs.textContent = totalParagraphs.toLocaleString();

    detCharsNoSpace.textContent = charsNoSpace.toLocaleString();
    detLetters.textContent = totalLetters.toLocaleString();
    detNumbers.textContent = totalNumbers.toLocaleString();
    detSpecial.textContent = totalSpecial.toLocaleString();
    detSpaces.textContent = totalSpaces.toLocaleString();
    detLines.textContent = totalLines.toLocaleString();
    
    detAvgWord.textContent = avgWordLength;
    detLongestWord.textContent = displayLongest;
  }

  // --- STRICT MANUAL TRIGGERS ---
  
  btnCalculate.addEventListener('click', () => {
    if (!input.value.trim()) { paToast('Please enter some text to analyze.', { icon: '✏️' }); return; }
    const originalText = btnCalculate.textContent;
    analyzeText();
    btnCalculate.textContent = '✓ Done';
    setTimeout(() => { btnCalculate.textContent = originalText; }, 1500);
  });

  // Programs modifying .value destroy the browser's undo stack. This preserves it.
  function updateWithUndo(el, text, append=false) {
    el.focus();
    if(append) {
      el.selectionStart = el.value.length;
      el.selectionEnd = el.value.length;
    } else {
      el.select();
    }
    
    if (text === '' && !append) {
      document.execCommand('delete');
    } else {
      if (!document.execCommand('insertText', false, text)) { 
        if(append) el.value += text; else el.value = text; 
      }
    }
  }

  document.getElementById('btn-clear').addEventListener('click', () => {
    updateWithUndo(input, '');
    analyzeText(); 
  });

  document.getElementById('btn-copy').addEventListener('click', function() {
    if (input.value) {
      navigator.clipboard.writeText(input.value);
      this.textContent = '✓ Copied';
      setTimeout(() => { this.textContent = '⧉ Copy'; }, 1500);
    }
  });

  document.getElementById('btn-paste').addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      updateWithUndo(input, text, true);
      btnCalculate.click();
    } catch (err) {
      paToast('Unable to paste automatically. Use Ctrl+V / Cmd+V instead.', { icon: '📋' });
    }
  });

  analyzeText(); 
});