document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
  
  const terminalOutputAbout = document.getElementById('terminal-output');
  const commands = [
    { input: 'cd Documents', output: '' },
    { input: 'ls', output: 'Alternance' },
    { input: 'cd Alternance', output: '' },
    { input: 'ls', output: 'recherche_alternance.txt' },
    { input: 'cat recherche_alternance.txt', output: 'Etudiant en BUT Informatique,\nRecherche une alternance en Administration Système Réseau pour Septembre 2025' }
  ];
  
  let currentCommandIndex = 0;
  let currentCharIndex = 0;
  let isTyping = true;
  
  function createLine(content) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.textContent = content;
    terminalOutputAbout.appendChild(line);
  }
  
  function typeCommand() {
    if (currentCommandIndex >= commands.length) return;
  
    const currentCommand = commands[currentCommandIndex];
    const prompt = '$ ';
  
    if (isTyping) {
      if (currentCharIndex === 0) {
        createLine(prompt + currentCommand.input);
      }
      const lastLine = terminalOutputAbout.lastChild;
      if (currentCharIndex < currentCommand.input.length) {
        lastLine.textContent = prompt + currentCommand.input.slice(0, currentCharIndex + 1);
        currentCharIndex++;
        setTimeout(typeCommand, 100);
      } else {
        if (currentCommand.output) {
          createLine(currentCommand.output.split('\n').map(line => line.trim()).join('\n'));
        }
        createLine('');
        isTyping = false;
        currentCharIndex = 0;
        setTimeout(typeCommand, 500);
      }
    } else {
      isTyping = true;
      currentCommandIndex++;
      if (currentCommandIndex < commands.length) {
        setTimeout(typeCommand, 500);
      }
    }
  }
  
  createLine('$ ');
  setTimeout(typeCommand, 1000);
  
  document.addEventListener('DOMContentLoaded', () => {
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-interactive-output');
  
    if (!terminalInput || !terminalOutput) {
      console.error("Erreur : Les éléments du terminal interactif n'ont pas été trouvés.");
      return;
    }
  
    const sections = [
      { name: 'A propos', id: 'about' },
      { name: 'Competences', id: 'skills' },
      { name: 'Parcours', id: 'journey' },
      { name: 'Experiences', id: 'experiences' },
      { name: 'Projets', id: 'work' },
      { name: 'Contact', id: 'contact' },
      { name: 'Terminal', id: 'terminal' }
    ];
  
    function createTerminalLine(content) {
      const line = document.createElement('div');
      line.className = 'terminal-line';
      line.textContent = content;
      terminalOutput.appendChild(line);
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
  
    function processCommand(command) {
      command = command.trim().toLowerCase();
      createTerminalLine(`$ ${command}`);
  
      if (command === 'ls') {
        createTerminalLine(sections.map(s => s.name).join(' '));
      } else if (command === 'clear') {
        terminalOutput.innerHTML = '';
      } else if (command === 'whoami') {
        createTerminalLine('Luka Salvo');
      } else if (command === 'sudo') {
        createTerminalLine('Vous n\'avez pas encore les droits d\'administration pour cette commande, contactez moi pour les obtenir !');
      } else if (command === 'help') {
        createTerminalLine('Commandes disponibles : ls, cd <section>, clear, whoami, sudo, help');
      } else if (command.startsWith('cd ')) {
        const sectionName = command.slice(3).trim();
        const section = sections.find(s => s.name.toLowerCase() === sectionName.toLowerCase());
        if (section) {
          const element = document.getElementById(section.id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            createTerminalLine(`Navigué vers ${section.name}`);
          } else {
            createTerminalLine(`Erreur : Section ${sectionName} non trouvée`);
          }
        } else {
          createTerminalLine(`Erreur : Répertoire ${sectionName} non trouvé`);
        }
      } else {
        createTerminalLine(`Commande non reconnue : ${command}`);
      }
    }
  
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const command = terminalInput.value;
        processCommand(command);
        terminalInput.value = '';
      }
    });
  
    createTerminalLine('Bienvenue dans le terminal interactif !');
    createTerminalLine('Commandes disponibles : ls, cd, clear, whoami, sudo, help');
  
    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
  
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  });