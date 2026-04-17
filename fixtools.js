const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            filelist = walkSync(filepath, filelist);
        } else if (filepath.endsWith('.html')) {
            filelist.push(filepath);
        }
    }
    return filelist;
};

const htmlFiles = walkSync(path.join(__dirname, 'tools'));

const replacements = {
    'â€º': '/',
    'â€”': '&mdash;',
    'â€“': '&ndash;',
    'â€¦': '...',
    'Â©': '&copy;',
    'âŽ˜ Paste': '<i class="fas fa-paste"></i> Paste',
    'â§‰ Copy': '<i class="fas fa-copy"></i> Copy',
    'âœ• Clear': '<i class="fas fa-times"></i> Clear',
    'âŸ³ Calculate Stats': '<i class="fas fa-calculator"></i> Calculate Stats',
    'âŸ³ Generate': '<i class="fas fa-magic"></i> Generate',
    'âŸ³': '<i class="fas fa-sync-alt"></i>',
    'âœ“ Copied': '<i class="fas fa-check"></i> Copied',
    'ðŸ”—': '<i class="fas fa-link"></i>',
    'â†“': '&darr;',
    'â†’': '&rarr;',
    'â† ': '&larr;',
    'â‡... Swap': '<i class="fas fa-exchange-alt"></i> Swap',
    'â Ž Empty': '<i class="fas fa-trash-alt"></i> Empty',
    'â§‰ Copy Indian': '<i class="fas fa-copy"></i> Copy Indian',
    'â§‰ Copy International': '<i class="fas fa-copy"></i> Copy International'
};

let fixedFiles = 0;

for (const file of htmlFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    for (const [key, value] of Object.entries(replacements)) {
        // Use global regex replace with literal strings escaping special regex chars if needed
        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        content = content.replace(new RegExp(escapeRegExp(key), 'g'), value);
    }
    
    // Also fix any standalone tool card icons
    content = content.replace(/<span class="tool-card__icon">âŽ˜<\/span>/g, '<span class="tool-card__icon"><i class="fas fa-paste"></i></span>');
    content = content.replace(/<span class="tool-card__icon">Aa<\/span>/g, '<span class="tool-card__icon"><i class="fas fa-font"></i></span>');
    content = content.replace(/<span class="tool-card__icon">ðŸ”’<\/span>/g, '<span class="tool-card__icon"><i class="fas fa-lock"></i></span>');
    content = content.replace(/<span class="tool-card__icon">ðŸ”—<\/span>/g, '<span class="tool-card__icon"><i class="fas fa-link"></i></span>');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        fixedFiles++;
        console.log(`Fixed: ${file}`);
    }
}

console.log(`Finished. Fixed ${fixedFiles} files.`);
