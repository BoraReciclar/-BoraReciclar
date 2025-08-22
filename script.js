// Envolve todo o código em uma função para proteger o escopo e evitar conflitos.
(function() {
  'use strict'; // Ativa um modo mais seguro do JavaScript.

  // Executa o script somente quando o HTML da página estiver completamente carregado.
  document.addEventListener('DOMContentLoaded', () => {

    // --- ESTADO DA APLICAÇÃO (a "memória" do site) ---
    // Verifica no localStorage se o usuário já estava logado
    let isLoggedIn = localStorage.getItem('userIsLoggedIn') === 'true';
    let currentSection = 'home-section'; // Guarda a seção visível atualmente
    let userName = localStorage.getItem('userName') || 'Usuário'; // Simula o nome do usuário

    // --- MAPEAMENTO DE ELEMENTOS (para não repetir document.getElementById) ---
    const elements = {
      userMenu: document.getElementById('user-menu'),
      perfilSection: document.getElementById('perfil-section'),
      homeSection: document.getElementById('home-section'),
      logo: document.getElementById('logo'),
      notification: document.getElementById('toast-notification'),
      sections: document.querySelectorAll('.content-section')
    };

    // --- TEMPLATES HTML (para conteúdo dinâmico) ---
    const templates = {
      menuLoggedOut: `
        <a href="#" data-section="usuario-cadastro-section" class="menu-link block px-4 py-2 hover:bg-gray-100"><i class="fas fa-user-plus w-6 mr-2"></i>Cadastrar-se</a>
        <a href="#" data-section="coletor-cadastro-section" class="menu-link block px-4 py-2 hover:bg-gray-100"><i class="fas fa-truck w-6 mr-2"></i>Tornar-se Coletor</a>`,
      
      menuLoggedIn: `
        <a href="#" data-section="perfil-section" class="menu-link block px-4 py-2 hover:bg-gray-100"><i class="fas fa-user-circle w-6 mr-2"></i>Meu Perfil</a>
        <a href="#" data-action="logout" class="menu-link block px-4 py-2 hover:bg-gray-100 text-red-600"><i class="fas fa-sign-out-alt w-6 mr-2"></i>Sair (Logout)</a>`,
      
      profileLoggedOut: `
        <h2 class="text-3xl font-bold text-center mb-6">Acesse seu Perfil</h2>
        <div class="max-w-md mx-auto text-center"><i class="fas fa-users text-8xl text-gray-400 mb-4"></i><p class="text-lg text-gray-600 mb-6">Crie uma conta para ver suas informações!</p><button data-section="usuario-cadastro-section" class="nav-button bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition">Quero me cadastrar!</button></div>`,
      
      profileLoggedIn: `
        <h2 class="text-3xl font-bold text-center mb-6">Bem-vindo(a) de volta, <span class="font-semibold">${userName}</span>!</h2>
        <div class="max-w-md mx-auto text-center"><i class="fas fa-check-circle text-8xl text-green-500 mb-4"></i><h3 class="text-2xl font-semibold mt-4">Seu Cadastro foi Enviado!</h3><p class="text-gray-600 mt-2">Assim que seus dados forem processados, eles aparecerão aqui.</p><p class="mt-6 text-xl">Pontos Atuais: <span class="font-bold text-green-600">1250</span></p></div>`,

      homeLoggedOut: `
        <div class="bg-white p-6 rounded-xl shadow-lg text-center">
            <h2 class="text-3xl md:text-4xl font-extrabold mb-4">Bem-vindo ao #BoraReciclar!</h2>
            <p class="text-lg text-gray-600 mb-6">Junte-se à nossa missão. Escolha como você quer começar:</p>
            <div class="flex flex-col md:flex-row justify-center gap-4">
                <button data-section="usuario-cadastro-section" class="nav-button bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition flex items-center justify-center">
                    <i class="fas fa-user-plus mr-2"></i>
                    Cadastrar-se (Usuário)
                </button>
                <button data-section="coletor-cadastro-section" class="nav-button bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-yellow-600 transition flex items-center justify-center">
                    <i class="fas fa-truck mr-2"></i>
                    Quero ser um Coletor
                </button>
            </div>
        </div>`,

      homeLoggedIn: `
        <div class="bg-white p-6 rounded-xl shadow-lg text-center">
            <h2 class="text-3xl md:text-4xl font-extrabold mb-4">Bem-vindo de volta, <span class="font-semibold">${userName}</span>!</h2>
            <p class="text-lg text-gray-600 mb-6">Obrigado por fazer parte do #BoraReciclar!</p>
            <p class="text-center text-gray-700">Explore os <button data-section="pontos-de-coleta-section" class="text-blue-600 hover:underline">pontos de coleta</button> ou veja <button data-section="perfil-section" class="text-green-600 hover:underline">seu perfil</button>.</p>
        </div>`
    };

    // --- FUNÇÕES PRINCIPAIS ---
    
    // Mostra uma notificação personalizada (toast)
    const showNotification = (message, type = 'success') => {
        const toast = elements.notification;
        toast.querySelector('p').textContent = message;

        // Remove classes de cor antigas
        toast.classList.remove('bg-green-500', 'bg-red-500', 'bg-blue-500');

        // Adiciona a classe de cor com base no tipo
        if (type === 'success') {
            toast.classList.add('bg-green-500');
        } else if (type === 'error') {
            toast.classList.add('bg-red-500');
        } else { // info
            toast.classList.add('bg-blue-500');
        }

        // Mostra o toast
        toast.classList.remove('hidden');
        toast.classList.add('show');

        // Esconde o toast após 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 500); // Espera a animação de saída
        }, 3000);
    };


    // Atualiza o menu e o perfil com base no estado de login.
    const updateUserUI = () => {
      elements.userMenu.innerHTML = isLoggedIn ? templates.menuLoggedIn : templates.menuLoggedOut;
      elements.perfilSection.innerHTML = isLoggedIn ? templates.profileLoggedIn : templates.profileLoggedOut;
      elements.homeSection.innerHTML = isLoggedIn ? templates.homeLoggedIn : templates.homeLoggedOut;
    };

    // Mostra uma seção e esconde todas as outras com transição suave.
    const showSection = (sectionId) => {
        if (sectionId === currentSection) return;

        const currentEl = document.getElementById(currentSection);
        const nextEl = document.getElementById(sectionId);

        if (currentEl) {
            currentEl.classList.add('section-hidden');
            // Espera a animação de saída terminar para esconder o elemento
            setTimeout(() => {
                currentEl.classList.add('hidden');
            }, 300); // Deve ser igual à duração da transição no CSS
        }
        
        if (nextEl) {
            // Remove a classe hidden, mas mantém invisível para animar a entrada
            nextEl.classList.remove('hidden');
            nextEl.classList.add('section-hidden');
            
            // Força o navegador a recalcular o layout antes de animar a entrada
            setTimeout(() => {
                nextEl.classList.remove('section-hidden');
                currentSection = sectionId;
            }, 50); // Pequeno delay
        }
        window.scrollTo(0, 0); // Rola para o topo
    };


    // Simula o login do usuário.
    const handleLogin = () => {
      isLoggedIn = true;
      localStorage.setItem('userIsLoggedIn', 'true'); // Salva o estado no localStorage
      localStorage.setItem('userName', 'Novo Usuário'); // Simula salvar o nome
      updateUserUI();
      showSection('perfil-section');
      showNotification("Cadastro enviado! Login efetuado com sucesso.");
    };

    // Simula o logout do usuário.
    const handleLogout = () => {
      isLoggedIn = false;
      localStorage.removeItem('userIsLoggedIn'); // Remove o estado do localStorage
      localStorage.removeItem('userName');
      updateUserUI();
      showSection('home-section');
      showNotification("Você foi desconectado.", "info");
    };

    // --- GERENCIADOR DE EVENTOS CENTRALIZADO ---
    document.body.addEventListener('click', (event) => {
      const target = event.target.closest('[data-section], [data-action], #logo, .nav-button');
      if (!target) return;

      event.preventDefault();

      // Fecha o menu do Alpine.js se estiver aberto
      const userMenuContainer = target.closest('[x-data]');
      if (userMenuContainer && userMenuContainer.__x) {
        userMenuContainer.__x.data.open = false;
      }
      
      const { section, action } = target.dataset;

      if (target.id === 'logo' || section === 'home-section') {
        showSection('home-section');
      } else if (section) {
        showSection(section);
      } else if (action === 'submit-form') {
        handleLogin();
      } else if (action === 'logout') {
        handleLogout();
      }
    });

    // --- INICIALIZAÇÃO ---
    updateUserUI();
    // Garante que a seção inicial seja exibida corretamente sem animação de entrada
    const homeSection = document.getElementById('home-section');
    homeSection.classList.remove('hidden', 'section-hidden');

    // --- CÓDIGO PARA A MÚSICA ---
    const music = document.getElementById('background-music');
    const musicToggleBtn = document.getElementById('music-toggle');
    const musicIcon = musicToggleBtn.querySelector('i');

    musicToggleBtn.addEventListener('click', () => {
        if (music.paused) {
            music.play()
                .then(() => {
                    musicIcon.classList.remove('fa-play');
                    musicIcon.classList.add('fa-pause');
                    showNotification("Música ativada!", "info");
                })
                .catch(error => {
                    console.error("Erro ao tentar tocar a música:", error);
                    showNotification("Ops, não foi possível tocar a música.", "error");
                });
        } else {
            music.pause();
            musicIcon.classList.remove('fa-pause');
            musicIcon.classList.add('fa-play');
            showNotification("Música desativada.", "info");
        }
    });

  });
})();

// --- REGISTRO DO SERVICE WORKER ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registrado com sucesso:', registration);
      })
      .catch(error => {
        console.log('Falha ao registrar o Service Worker:', error);
      });
  });
}