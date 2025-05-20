document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

const terminalOutputAbout = document.getElementById('terminal-output');
const commandSets = [
    [
        { input: 'cd Documents', output: '' },
        { input: 'ls', output: 'Alternance' },
        { input: 'cd Alternance', output: '' },
        { input: 'ls', output: 'recherche_alternance.txt' },
        { input: 'cat recherche_alternance.txt', output: 'Etudiant en BUT Informatique,\nRecherche une alternance en Administration Système Réseau pour Septembre 2025' }
    ],
    [
        { input: 'cd Documents', output: '' },
        { input: 'ls', output: 'Mes_Passions' },
        { input: 'cd Mes_Passions', output: '' },
        { input: 'ls', output: 'presentationPassions.txt' },
        { input: 'cat presentationPassions.txt', output: 'Cinema, Musique, Sport de combat, Course a pied, Randonnée, Informatique, Nouvelles technologies, Linux' }
    ],
    [
        { input: 'cd Documents', output: '' },
        { input: 'ls', output: 'EasterEgg' },
        { input: 'cd EasterEgg', output: '' },
        { input: 'ls', output: 'surprise.txt' },
        { input: 'cat surprise.txt', output: 'Tapez cette commande dans le terminal interactif : sudo apt install easteregg' }
    ]
];

let commands = [];
let currentCommandIndex = 0;
let currentCharIndex = 0;
let isTyping = true;

function selectCommandSet() {
    if (Math.random() < 1/5) {
        return commandSets[2]; 
    } else {
        return commandSets[Math.floor(Math.random() * 2)];
    }
}

function createLine(content) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.textContent = content;
    terminalOutputAbout.appendChild(line);
}

function typeCommand() {
    if (currentCommandIndex >= commands.length) {
        setTimeout(restartTerminal, 5000);
        return;
    }

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
        setTimeout(typeCommand, 500);
    }
}

function restartTerminal() {
    terminalOutputAbout.innerHTML = ''; 
    currentCommandIndex = 0;
    currentCharIndex = 0;
    isTyping = true;
    commands = [...selectCommandSet()];
    createLine('$ ');
    setTimeout(typeCommand, 1000); 
}

commands = [...selectCommandSet()];
createLine('$ ');
setTimeout(typeCommand, 1000);

document.addEventListener('DOMContentLoaded', () => {
    // Terminal interactif
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
        const pre = document.createElement('pre');
        pre.textContent = content;
        pre.style.margin = '0';
        pre.style.whiteSpace = 'pre';
        line.appendChild(pre);
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    function createTerminalElement(content) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.appendChild(content);
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    function showEasterEggAnimation(callback) {
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            const progressBar = `[${'='.repeat(progress / 10)}${' '.repeat(10 - progress / 10)}] ${progress}%`;
            terminalOutput.lastChild.querySelector('pre').textContent = `Téléchargement de l'easter egg... ${progressBar}`;
            if (progress >= 100) {
                clearInterval(progressInterval);
                callback();
            }
        }, 200);
    }

    function showEggHatchingAnimation() {
        const eggFrames = [
            `
   ___
  /   \\
 /     \\
/_______\\
  [Egg]
      `,
            `
   ___
  / * * \\
 /  *  * \\
/_______\\
[Hatching]
      `,
            `
   ***
  *   * 
 *  :) * 
  *   *  
   ***
[Cracked!]
      `
        ];

        let frameIndex = 0;
        const eggInterval = setInterval(() => {
            if (frameIndex === 0) {
                terminalOutput.lastChild.querySelector('pre').textContent = '';
            } else {
                terminalOutput.removeChild(terminalOutput.lastChild);
            }
            createTerminalLine(eggFrames[frameIndex]);
            frameIndex++;
            if (frameIndex >= eggFrames.length) {
                clearInterval(eggInterval);
                createTerminalLine('Félicitations ! Tu as trouvé l\'easter egg secret ! ');
                const replayButton = document.createElement('button');
                replayButton.textContent = 'Rejouer l\'animation';
                replayButton.style.marginTop = '10px';
                replayButton.style.padding = '5px 10px';
                replayButton.style.backgroundColor = '#4CAF50';
                replayButton.style.color = 'white';
                replayButton.style.border = 'none';
                replayButton.style.borderRadius = '5px';
                replayButton.style.cursor = 'pointer';
                replayButton.addEventListener('click', () => {
                    const lastLines = terminalOutput.querySelectorAll('.terminal-line');
                    for (let i = lastLines.length - 1; i >= 0 && lastLines[i].textContent !== '$ sudo apt install easteregg'; i--) {
                        terminalOutput.removeChild(lastLines[i]);
                    }
                    createTerminalLine('Téléchargement de l\'easter egg...');
                    showEasterEggAnimation(showEggHatchingAnimation);
                });
                createTerminalElement(replayButton);
            }
        }, 1000);
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
        } else if (command === 'pwd') {
            createTerminalLine('User/lukaSalvo/Portfolio');
        } else if (command === 'sudo') {
            createTerminalLine('Vous n\'avez pas encore les droits d\'administration pour cette commande, \ncontactez moi pour les obtenir !');
        } else if (command === 'help') {
            createTerminalLine('Commandes disponibles : ls, cd <section>, clear, whoami, sudo, help, pwd');
        } else if (command.startsWith('sudo apt install')) {
            if (command === 'sudo apt install easteregg') {
                createTerminalLine('Téléchargement de l\'easter egg...');
                showEasterEggAnimation(showEggHatchingAnimation);
            } else {
                createTerminalLine('Erreur : Paquet non reconnu.');
            }
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
    createTerminalLine('Commandes disponibles : ls, cd, clear, whoami, sudo, help, pwd');

    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    } else {
        console.error("Erreur : Les éléments du menu hamburger n'ont pas été trouvés.");
    }

    // Gestion du mode clair/sombre
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const themeIcon = themeToggle.querySelector('i');
        const body = document.body;

        // Vérifier l'accès à localStorage avec une gestion d'erreur
        let savedTheme = 'light'; // Valeur par défaut si localStorage échoue
        try {
            savedTheme = localStorage.getItem('theme') || 'light';
        } catch (e) {
            console.warn('Erreur d\'accès à localStorage, utilisation du mode clair par défaut :', e);
            localStorage.clear(); // Tente de vider localStorage en cas de corruption
        }

        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Appliquer le thème
        body.classList.toggle('dark', savedTheme === 'dark' || (!savedTheme && prefersDarkScheme));

        // Mettre à jour l'icône
        if (themeIcon) {
            themeIcon.classList.toggle('fa-moon', !body.classList.contains('dark'));
            themeIcon.classList.toggle('fa-sun', body.classList.contains('dark'));
        }

        // Gestion du basculement
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark');
            const isDark = body.classList.contains('dark');
            try {
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            } catch (e) {
                console.warn('Impossible de sauvegarder dans localStorage :', e);
            }
            if (themeIcon) {
                themeIcon.classList.toggle('fa-moon', !isDark);
                themeIcon.classList.toggle('fa-sun', isDark);
            }
            console.log(`Mode basculé : ${isDark ? 'sombre' : 'clair'}`);
        });

        console.log("Écouteur d'événements pour le basculement du thème attaché avec succès.");
    } else {
        console.error("Erreur : Le bouton de basculement du thème n'a pas été trouvé.");
    }
});


// Interactivité pour les cartes de compétences et d'auto-évaluation
document.addEventListener('DOMContentLoaded', () => {
    const skillCards = document.querySelectorAll('.skill-card');
    const competenceCards = document.querySelectorAll('.competence-card');
  
    // Interactivité pour les cartes de compétences
    skillCards.forEach(card => {
      card.addEventListener('mouseover', () => {
        card.style.background = document.body.classList.contains('dark')
          ? 'linear-gradient(145deg, #3b3b3b, #4b4b4b)'
          : 'linear-gradient(145deg, #e6e6e6, #f5f5f5)';
      });
  
      card.addEventListener('mouseout', () => {
        card.style.background = document.body.classList.contains('dark')
          ? 'linear-gradient(145deg, #2d2d2d, #3b3b3b)'
          : 'linear-gradient(145deg, #ffffff, #e6e6e6)';
      });
  
      card.addEventListener('click', () => {
        skillCards.forEach(c => c.classList.remove('flipped'));
        card.classList.add('flipped');
      });
    });
  
    // Interactivité pour les cartes d'auto-évaluation
    competenceCards.forEach(card => {
      card.addEventListener('mouseover', () => {
        card.style.background = document.body.classList.contains('dark')
          ? 'linear-gradient(145deg, #3b3b3b, #4b4b4b)'
          : 'linear-gradient(145deg, #e6e6e6, #f5f5f5)';
      });
  
      card.addEventListener('mouseout', () => {
        card.style.background = document.body.classList.contains('dark')
          ? 'linear-gradient(145deg, #2d2d2d, #3b3b3b)'
          : 'linear-gradient(145deg, #ffffff, #e6e6e6)';
      });
  
      card.addEventListener('click', () => {
        competenceCards.forEach(c => c.classList.remove('flipped'));
        card.classList.add('flipped');
      });
    });
  });