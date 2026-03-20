document.addEventListener("DOMContentLoaded", () => {
    let habits = JSON.parse(localStorage.getItem("habits")) || [];

    const today = new Date().toLocaleDateString('ru-RU');
    const dayOfWeek = new Date().getDay();
    
    const footerToday = document.querySelector('footer p');
    if (footerToday) {
        footerToday.innerHTML = `Сегодня: <span class="font-medium">${today}</span>`;
    }

    function saveHabits() {
        localStorage.setItem("habits", JSON.stringify(habits));
        updateStats();
        renderHabits();
    }

    function updateStats() {
        const completedToday = habits.filter(habit => habit.completedToday).length;
        const successRate = habits.length > 0 
            ? Math.round((habits.filter(h => h.streak > 0).length / habits.length) * 100)
            : 0;
        
        const streaks = habits.map(h => h.streak);
        const minStreak = streaks.length > 0 ? Math.min(...streaks) : 0;

        const minStreakEl = document.querySelector('.grid > div:nth-child(1) .text-2xl');
        const countHabEl = document.querySelector('#countHab');
        const todayCountEl = document.querySelector('#todayCount');
        const successRateEl = document.querySelector('.grid > div:nth-child(4) .text-2xl');

        if (minStreakEl) minStreakEl.textContent = minStreak;
        if (countHabEl) countHabEl.textContent = habits.length;
        if (todayCountEl) todayCountEl.textContent = completedToday;
        if (successRateEl) successRateEl.textContent = `${successRate}%`;
    }

    function renderHabits() {
        const habitsContainer = document.querySelector('#habitList') || document.querySelector('.space-y-6');
        const beginContainer = document.querySelector('#begin');

        if (!habitsContainer || !beginContainer) return;
        
        habitsContainer.innerHTML = '';
        beginContainer.innerHTML = '';

        if (habits.length === 0) {
            beginContainer.innerHTML = `
                <div class="inline-block p-6 bg-blue-50 rounded-2xl mb-4">
                    <h3 class="text-2xl font-bold text-gray-700 mb-3">Начните прямо сейчас!</h3>
                    <p class="text-gray-500">Добавьте свою первую привычку</p>
                </div>`;
            return;
        }

        habits.forEach(habit => {
            
            const habitElement = document.createElement('div');
            habitElement.className = `bg-white rounded-xl shadow p-6 border-l-4 border-${habit.color}-500`;
            
            const buttonText = habit.completedToday ? "Отменить выполнение" : "Отметить";
            const buttonColor = habit.completedToday ? "red" : habit.color;
            
            habitElement.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-xl font-semibold text-gray-800">${habit.title}</h3>
                        <p class="text-gray-500 text-sm mt-1">${habit.description}</p>
                    </div>
                    <button class="text-gray-400 hover:text-red-500 delete-btn" data-id="${habit.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
                <div class="mt-4">
                    <div class="flex justify-between text-sm mb-2">
                        <span class="text-gray-600">Серия: <span class="font-semibold">${habit.streak} дней</span></span>
                        <button class="text-${buttonColor}-600 font-medium hover:text-${buttonColor}-700 complete-btn" data-id="${habit.id}">
                            ${buttonText}
                        </button>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="h-2 rounded-full bg-${habit.color}-500" style="width: ${habit.progress}%"></div>
                    </div>
                </div>
            `;
            
            habitsContainer.appendChild(habitElement);
        });

        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.complete-btn').dataset.id);

                if(btn.textContent.trim() === 'Отменить выполнение'){
                    toggleUncomplite(id);
                } else{
                    toggleComplete(id);
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.delete-btn').dataset.id);
                deleteHabit(id);
            });
        });
    }

    function toggleComplete(id) {
        const habit = habits.find(h => h.id === id);
        if (!habit) return;

        if (habit.completedToday) return;

        habit.completedToday = true;
        habit.streak += 1;
        
        if (habit.streak <= 30) {
            habit.progress = (habit.streak / 30) * 100;
        } else {
            habit.progress = 100;
        }
        
        const weekIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        habit.weeklyProgress[weekIndex] = true;
        
        saveHabits();
    }

    function toggleUncomplite(id) {
        const habit = habits.find(h => h.id === id);
        if (!habit) return;

        if (!habit.completedToday) return;

        habit.completedToday = false;
        habit.streak -= 1;
        
        if (habit.streak <= 30) {
            habit.progress = (habit.streak / 30) * 100;
        } else {
            habit.progress = 100;
        }
        
        const weekIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        habit.weeklyProgress[weekIndex] = true;
        
        saveHabits();
    }

    function deleteHabit(id) {
        if (confirm('Удалить эту привычку?')) {
            habits = habits.filter(h => h.id !== id);
            saveHabits();
        }
    }

    function addNewHabit() {
        const title = prompt('Название привычки:');
        if (!title || title.trim() === '') return;
        
        const description = prompt('Описание (например, "30 минут в день"):') || '';
        
        const colors = ['blue', 'green', 'purple', 'yellow', 'red', 'indigo'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const newHabit = {
            id: Date.now(), 
            title: title.trim(),
            description: description.trim(),
            streak: 0,
            progress: 0,
            completedToday: false,
            color: randomColor,
            weeklyProgress: new Array(7).fill(false)
        };
        
        habits.push(newHabit);
        saveHabits();
    }

    const newHabBtn = document.querySelector("#newHab");
    if (newHabBtn) {
        newHabBtn.addEventListener('click', addNewHabit);
    }

    function resetDailyCompletion() {
        const lastReset = localStorage.getItem("lastResetDate");
        const todayStr = new Date().toDateString();
        
        if (lastReset !== todayStr) {
            habits.forEach(habit => {
                habit.completedToday = false;
            });
            localStorage.setItem("lastResetDate", todayStr);
            saveHabits();
        }
    }
    console.log(localStorage, habits)



    resetDailyCompletion();
    updateStats();
    renderHabits();
});
