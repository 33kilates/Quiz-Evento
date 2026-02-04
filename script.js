document.addEventListener('DOMContentLoaded', () => {

    // --- State Management ---
    const state = {
        answers: {},
        currentStepIndex: 0,
        screens: []
    };

    // --- Init ---
    function init() {
        // Collect Screens
        const screenNodes = document.querySelectorAll('.quiz-screen');
        state.screens = Array.from(screenNodes);

        // Start View
        updateView();
    }

    // --- Core Navigation ---
    window.nextScreen = function () {
        if (state.currentStepIndex < state.screens.length - 1) {
            state.currentStepIndex++;
            updateView();
        }
    };

    window.selectOption = function (questionId, value) {
        // 1. Save Answer
        state.answers[questionId] = value;

        // 2. Visual Feedback
        const btn = event.target;
        if (btn) btn.classList.add('selected');

        // 3. Move Next
        // Check if we need to go to calculating screen specifically or just next
        // In this linear flow, it's just next.
        setTimeout(nextScreen, 300);
    };

    // --- View Update Engine ---
    function updateView() {
        // UI Reset
        state.screens.forEach(el => el.classList.remove('is-active'));
        const currentScreen = state.screens[state.currentStepIndex];
        currentScreen.classList.add('is-active');
        window.scrollTo(0, 0);

        const screenId = currentScreen.id;

        // Update Progress Bar
        updateProgress(currentScreen.dataset.step);

        // Special Logic
        if (screenId === 'screen_calculating') {
            runCalculationAnimation();
        }
    }

    function updateProgress(step) {
        const progressBar = document.getElementById('progress_bar');
        const progressText = document.getElementById('progress_text');

        if (!progressBar || !progressText) return;

        let percent = 0;
        let text = "DIAGNÓSTICO";

        if (!step) { text = ""; progressBar.style.width = "0%"; return; }

        if (step === '0' || step === '0.1') {
            percent = 5;
        } else if (step === 'insight') {
            // Keep progress appearing to move forward
            percent = Math.min(((state.currentStepIndex + 1) / state.screens.length) * 100, 95);
        } else if (step === 'result') {
            percent = 100;
            text = "CONCLUSÃO";
        } else {
            // Questions 1, 2, 3 maps roughly to 33%, 66%, 90%
            const num = parseFloat(step);
            if (!isNaN(num)) {
                percent = (num / 3) * 100; // 3 questions
                if (percent > 90) percent = 90;
                text = `${num}/3`;
            }
        }
        progressBar.style.width = `${percent}%`;
        progressText.innerText = text;
    }

    // --- Calculation Animation ---
    function runCalculationAnimation() {
        const fill = document.getElementById('calc_fill');
        const text = document.getElementById('calc_text_step');

        if (fill && text) {
            const duration = 2500; // 2.5s total calculation

            // CSS Transition for bar
            fill.style.transition = `width ${duration}ms ease-out`;
            // Trigger reflow or small timeout
            setTimeout(() => { fill.style.width = '100%'; }, 50);

            // Text Steps
            const steps = [
                "medindo vazamento invisível...",
                "calculando recomeços silenciosos...",
                "identificando risco antes da venda..."
            ];

            let counter = 0;
            const stepTime = duration / steps.length;

            // Show first immediately
            text.innerText = steps[0];
            counter++;

            const stepInterval = setInterval(() => {
                if (counter < steps.length) {
                    text.innerText = steps[counter];
                    counter++;
                }
            }, stepTime);

            // Finish
            setTimeout(() => {
                clearInterval(stepInterval);
                nextScreen(); // Go to result
            }, duration);
        } else {
            // If elements missing, just skip
            nextScreen();
        }
    }

    // Start
    init();
});
