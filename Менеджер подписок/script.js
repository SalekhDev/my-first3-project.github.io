// Данные пользователя
let user = {
    isLoggedIn: false,
    name: "",
    email: "",
    subscriptions: [],
    settings: {
        currency: "RUB",
        notifications: {
            email: true,
            push: false,
            paymentReminders: true,
            priceChangeAlerts: true,
            reminderDays: 3
        }
    }
};

// Пример данных подписок
const sampleSubscriptions = [
    {
        id: 1,
        name: "Netflix",
        cost: 599,
        currency: "RUB",
        category: "streaming",
        frequency: "monthly",
        nextPayment: "2024-07-15",
        notes: "Премиум план"
    },
    {
        id: 2,
        name: "Spotify",
        cost: 299,
        currency: "RUB",
        category: "streaming",
        frequency: "monthly",
        nextPayment: "2024-07-20",
        notes: "Индивидуальная подписка"
    },
    {
        id: 3,
        name: "Yandex Plus",
        cost: 299,
        currency: "RUB",
        category: "streaming",
        frequency: "monthly",
        nextPayment: "2024-07-10",
        notes: ""
    },
    {
        id: 4,
        name: "Microsoft 365",
        cost: 399,
        currency: "RUB",
        category: "software",
        frequency: "monthly",
        nextPayment: "2024-08-01",
        notes: "Для личного использования"
    }
];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация навигации
    initNavigation();
    
    // Инициализация дашборда
    initDashboard();
    
    // Инициализация аутентификации
    initAuth();
    
    // Инициализация графиков
    initCharts();
    
    // Проверка состояния входа
    checkLoginStatus();
});

// Инициализация навигации
function initNavigation() {
    // Обработчики для навигационных ссылок
    const navLinks = document.querySelectorAll('.nav-link, .footer-nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
            
            // Обновление активного состояния в навигации
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Кнопка мобильного меню
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    
    mobileMenuBtn.addEventListener('click', function() {
        mainNav.classList.toggle('active');
    });
    
    // Кнопка "Начать управление"
    const startManagingBtn = document.getElementById('startManagingBtn');
    startManagingBtn.addEventListener('click', function() {
        if (user.isLoggedIn) {
            showSection('dashboard');
        } else {
            showSection('auth');
            document.querySelector('.auth-tab[data-tab="register"]').click();
        }
    });
    
    // Кнопка "Узнать больше"
    const learnMoreBtn = document.getElementById('learnMoreBtn');
    learnMoreBtn.addEventListener('click', function() {
        document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Кнопка добавления подписки
    const addSubscriptionBtn = document.getElementById('addSubscriptionBtn');
    addSubscriptionBtn.addEventListener('click', function() {
        showSection('add-subscription');
    });
    
    // Кнопка отмены добавления подписки
    const cancelSubscriptionBtn = document.getElementById('cancelSubscriptionBtn');
    cancelSubscriptionBtn.addEventListener('click', function() {
        showSection('dashboard');
    });
    
    // Сохранение подписки
    const saveSubscriptionBtn = document.getElementById('saveSubscriptionBtn');
    saveSubscriptionBtn.addEventListener('click', function() {
        saveSubscription();
    });
    
    // Обработчики для вкладок настроек
    const settingsTabs = document.querySelectorAll('.settings-tab');
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Удаляем активный класс у всех вкладок
            settingsTabs.forEach(t => t.classList.remove('active'));
            // Добавляем активный класс к текущей вкладке
            this.classList.add('active');
            
            // Скрываем все вкладки
            const tabContents = document.querySelectorAll('.settings-tab-content');
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Показываем выбранную вкладку
            const targetTab = document.getElementById(tabId + 'Tab');
            if (targetTab) {
                targetTab.classList.add('active');
            }
        });
    });
}

// Показать определенный раздел
function showSection(sectionId) {
    // Скрыть все разделы
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Показать выбранный раздел
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Прокрутка к началу раздела
        window.scrollTo({
            top: targetSection.offsetTop - 80,
            behavior: 'smooth'
        });
    }
}

// Инициализация дашборда
function initDashboard() {
    // Загрузка данных подписок
    loadSubscriptions();
    
    // Обновление статистики
    updateDashboardStats();
}

// Загрузка подписок
function loadSubscriptions() {
    const subscriptionsContainer = document.getElementById('subscriptionsContainer');
    const upcomingPaymentsContainer = document.getElementById('upcomingPaymentsContainer');
    
    subscriptionsContainer.innerHTML = '';
    upcomingPaymentsContainer.innerHTML = '';
    
    // Сортируем подписки по дате следующего платежа
    const sortedSubscriptions = [...user.subscriptions].sort((a, b) => 
        new Date(a.nextPayment) - new Date(b.nextPayment)
    );
    
    // Отображаем подписки
    sortedSubscriptions.forEach(subscription => {
        const subscriptionElement = document.createElement('div');
        subscriptionElement.className = 'subscription-item';
        subscriptionElement.innerHTML = `
            <div class="subscription-info">
                <h3>${subscription.name}</h3>
                <div class="subscription-meta">
                    <span>${getCategoryName(subscription.category)}</span>
                    <span>${getFrequencyName(subscription.frequency)}</span>
                    <span>Следующий платеж: ${formatDate(subscription.nextPayment)}</span>
                </div>
            </div>
            <div class="subscription-amount">
                ${subscription.cost} ${subscription.currency}
            </div>
            <div class="subscription-actions">
                <button class="btn btn-secondary btn-small edit-subscription" data-id="${subscription.id}">Редактировать</button>
                <button class="btn btn-danger btn-small delete-subscription" data-id="${subscription.id}">Удалить</button>
            </div>
        `;
        subscriptionsContainer.appendChild(subscriptionElement);
        
        // Добавляем в ближайшие платежи (только если платеж в ближайшие 30 дней)
        const paymentDate = new Date(subscription.nextPayment);
        const today = new Date();
        const diffTime = paymentDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 30 && diffDays >= 0) {
            const paymentElement = document.createElement('div');
            paymentElement.className = 'payment-item';
            paymentElement.innerHTML = `
                <div>${subscription.name}</div>
                <div>${formatDate(subscription.nextPayment)}</div>
                <div>${subscription.cost} ${subscription.currency}</div>
            `;
            upcomingPaymentsContainer.appendChild(paymentElement);
        }
    });
    
    // Добавляем обработчики для кнопок редактирования и удаления
    document.querySelectorAll('.edit-subscription').forEach(button => {
        button.addEventListener('click', function() {
            const subscriptionId = parseInt(this.getAttribute('data-id'));
            editSubscription(subscriptionId);
        });
    });
    
    document.querySelectorAll('.delete-subscription').forEach(button => {
        button.addEventListener('click', function() {
            const subscriptionId = parseInt(this.getAttribute('data-id'));
            deleteSubscription(subscriptionId);
        });
    });
}

// Обновление статистики дашборда
function updateDashboardStats() {
    const totalSubscriptions = user.subscriptions.length;
    const monthlyCost = calculateMonthlyCost();
    const yearlyCost = monthlyCost * 12;
    const nextPayment = getNextPaymentDate();
    
    document.getElementById('totalSubscriptions').textContent = totalSubscriptions;
    document.getElementById('monthlyCost').textContent = `${monthlyCost} ₽`;
    document.getElementById('yearlyCost').textContent = `${yearlyCost} ₽`;
    document.getElementById('nextPayment').textContent = nextPayment ? formatDate(nextPayment) : '-';
}

// Расчет месячных затрат
function calculateMonthlyCost() {
    return user.subscriptions.reduce((total, subscription) => {
        let monthlyCost = subscription.cost;
        
        // Конвертируем в рубли для упрощения
        if (subscription.currency === 'USD') {
            monthlyCost *= 90; // Примерный курс
        } else if (subscription.currency === 'EUR') {
            monthlyCost *= 100; // Примерный курс
        }
        
        // Учитываем периодичность
        if (subscription.frequency === 'quarterly') {
            monthlyCost /= 3;
        } else if (subscription.frequency === 'yearly') {
            monthlyCost /= 12;
        }
        
        return total + monthlyCost;
    }, 0);
}

// Получение даты следующего платежа
function getNextPaymentDate() {
    if (user.subscriptions.length === 0) return null;
    
    const nextPayments = user.subscriptions.map(s => new Date(s.nextPayment));
    return new Date(Math.min(...nextPayments));
}

// Сохранение подписки
function saveSubscription() {
    const name = document.getElementById('subscriptionName').value;
    const cost = parseFloat(document.getElementById('subscriptionCost').value);
    const currency = document.getElementById('subscriptionCurrency').value;
    const category = document.getElementById('subscriptionCategory').value;
    const frequency = document.getElementById('subscriptionFrequency').value;
    const nextPayment = document.getElementById('subscriptionNextPayment').value;
    const notes = document.getElementById('subscriptionNotes').value;
    
    if (!name || !cost || !nextPayment) {
        alert('Пожалуйста, заполните обязательные поля');
        return;
    }
    
    const newSubscription = {
        id: user.subscriptions.length > 0 ? Math.max(...user.subscriptions.map(s => s.id)) + 1 : 1,
        name,
        cost,
        currency,
        category,
        frequency,
        nextPayment,
        notes
    };
    
    user.subscriptions.push(newSubscription);
    loadSubscriptions();
    updateDashboardStats();
    updateCharts();
    
    // Очистка формы
    document.getElementById('subscriptionName').value = '';
    document.getElementById('subscriptionCost').value = '';
    document.getElementById('subscriptionNextPayment').value = '';
    document.getElementById('subscriptionNotes').value = '';
    
    showSection('dashboard');
    alert('Подписка успешно добавлена!');
}

// Редактирование подписки
function editSubscription(id) {
    // В реальном приложении здесь была бы форма редактирования
    alert('Редактирование подписки с ID: ' + id);
}

// Удаление подписки
function deleteSubscription(id) {
    if (confirm('Вы уверены, что хотите удалить эту подписку?')) {
        user.subscriptions = user.subscriptions.filter(s => s.id !== id);
        loadSubscriptions();
        updateDashboardStats();
        updateCharts();
        alert('Подписка удалена!');
    }
}

// Инициализация графиков
function initCharts() {
    // График расходов по категориям
    const expensesCtx = document.getElementById('expensesChart').getContext('2d');
    window.expensesChart = new Chart(expensesCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#4361ee',
                    '#7209b7',
                    '#f72585',
                    '#4cc9f0',
                    '#f8961e'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // График распределения по категориям
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    window.categoryChart = new Chart(categoryCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#4361ee',
                    '#7209b7',
                    '#f72585',
                    '#4cc9f0',
                    '#f8961e'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // График тренда расходов
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    window.trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
            datasets: [{
                label: 'Расходы на подписки',
                data: [0, 0, 0, 0, 0, 0],
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // График сравнения
    const comparisonCtx = document.getElementById('comparisonChart').getContext('2d');
    window.comparisonChart = new Chart(comparisonCtx, {
        type: 'bar',
        data: {
            labels: ['Стриминг', 'ПО', 'Облако', 'Образование', 'Другое'],
            datasets: [
                {
                    label: 'Текущий месяц',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: '#4361ee'
                },
                {
                    label: 'Прошлый месяц',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: '#7209b7'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // Первоначальное обновление графиков
    updateCharts();
}

// Обновление графиков
function updateCharts() {
    // Обновляем график расходов по категориям
    const categoryData = calculateCategoryData();
    window.expensesChart.data.labels = categoryData.labels;
    window.expensesChart.data.datasets[0].data = categoryData.data;
    window.expensesChart.update();
    
    // Обновляем график распределения по категориям
    window.categoryChart.data.labels = categoryData.labels;
    window.categoryChart.data.datasets[0].data = categoryData.data;
    window.categoryChart.update();
    
    // Обновляем график тренда (заглушка)
    const monthlyCost = calculateMonthlyCost();
    window.trendChart.data.datasets[0].data = [
        monthlyCost * 0.8,
        monthlyCost * 0.9,
        monthlyCost * 0.95,
        monthlyCost,
        monthlyCost * 1.1,
        monthlyCost * 1.2
    ];
    window.trendChart.update();
    
    // Обновляем график сравнения (заглушка)
    window.comparisonChart.data.datasets[0].data = categoryData.data;
    window.comparisonChart.data.datasets[1].data = categoryData.data.map(val => val * 0.8);
    window.comparisonChart.update();
}

// Расчет данных по категориям
function calculateCategoryData() {
    const categories = {
        streaming: 0,
        software: 0,
        cloud: 0,
        education: 0,
        other: 0
    };
    
    user.subscriptions.forEach(subscription => {
        let cost = subscription.cost;
        
        // Конвертируем в рубли для упрощения
        if (subscription.currency === 'USD') {
            cost *= 90;
        } else if (subscription.currency === 'EUR') {
            cost *= 100;
        }
        
        // Учитываем периодичность
        if (subscription.frequency === 'quarterly') {
            cost /= 3;
        } else if (subscription.frequency === 'yearly') {
            cost /= 12;
        }
        
        categories[subscription.category] += cost;
    });
    
    return {
        labels: ['Стриминг', 'ПО', 'Облако', 'Образование', 'Другое'],
        data: [
            categories.streaming,
            categories.software,
            categories.cloud,
            categories.education,
            categories.other
        ]
    };
}

// Инициализация аутентификации
function initAuth() {
    // Обработчики для вкладок аутентификации
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Удаляем активный класс у всех вкладок
            authTabs.forEach(t => t.classList.remove('active'));
            // Добавляем активный класс к текущей вкладке
            this.classList.add('active');
            
            // Скрываем все формы
            const authForms = document.querySelectorAll('.auth-form');
            authForms.forEach(form => form.classList.remove('active'));
            
            // Показываем выбранную форму
            const targetForm = document.getElementById(tabId + 'Form');
            if (targetForm) {
                targetForm.classList.add('active');
            }
        });
    });
    
    // Обработчики для кнопок входа/регистрации в шапке
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    loginBtn.addEventListener('click', function() {
        showSection('auth');
        document.querySelector('.auth-tab[data-tab="login"]').click();
    });
    
    registerBtn.addEventListener('click', function() {
        showSection('auth');
        document.querySelector('.auth-tab[data-tab="register"]').click();
    });
    
    logoutBtn.addEventListener('click', function() {
        user.isLoggedIn = false;
        user.name = "";
        user.email = "";
        user.subscriptions = [];
        checkLoginStatus();
        showSection('home');
    });
    
    // Обработчики для форм
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // В реальном приложении здесь был бы запрос к серверу
        if (email && password) {
            user.isLoggedIn = true;
            user.email = email;
            user.name = email.split('@')[0];
            user.subscriptions = sampleSubscriptions; // Загружаем пример данных
            checkLoginStatus();
            showSection('dashboard');
            
            // Обновляем данные
            loadSubscriptions();
            updateDashboardStats();
            updateCharts();
            
            // Очистка формы
            loginForm.reset();
        } else {
            alert('Пожалуйста, заполните все поля');
        }
    });
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        if (!name || !email || !password || !confirmPassword) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }
        
        // В реальном приложении здесь был бы запрос к серверу
        user.isLoggedIn = true;
        user.email = email;
        user.name = name;
        user.subscriptions = [];
        checkLoginStatus();
        showSection('dashboard');
        
        // Очистка формы
        registerForm.reset();
    });
}

// Проверка статуса входа
function checkLoginStatus() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const dashboardNavLink = document.getElementById('dashboardNavLink');
    const analyticsNavLink = document.getElementById('analyticsNavLink');
    const settingsNavLink = document.getElementById('settingsNavLink');
    
    if (user.isLoggedIn) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        dashboardNavLink.style.display = 'block';
        analyticsNavLink.style.display = 'block';
        settingsNavLink.style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        dashboardNavLink.style.display = 'none';
        analyticsNavLink.style.display = 'none';
        settingsNavLink.style.display = 'none';
    }
}

// Вспомогательные функции
function getCategoryName(category) {
    const categories = {
        streaming: 'Стриминг',
        software: 'Программное обеспечение',
        cloud: 'Облачные сервисы',
        education: 'Образование',
        other: 'Другое'
    };
    return categories[category] || 'Неизвестно';
}

function getFrequencyName(frequency) {
    const frequencies = {
        monthly: 'Ежемесячно',
        quarterly: 'Ежеквартально',
        yearly: 'Ежегодно'
    };
    return frequencies[frequency] || 'Неизвестно';
}

function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}