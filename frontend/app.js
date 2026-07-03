document.addEventListener('DOMContentLoaded', () => {
    const contextInput = document.getElementById('context');
    const questionInput = document.getElementById('question');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.querySelector('.btn-text');
    const spinner = document.querySelector('.spinner');
    const errorBanner = document.getElementById('errorBanner');
    const resultContainer = document.getElementById('resultContainer');
    const answerText = document.getElementById('answerText');
    const scoreProgress = document.getElementById('scoreProgress');
    const scoreText = document.getElementById('scoreText');

    // Default mock context if empty
    const defaultContext = "Budi adalah seorang Software Engineer dengan pengalaman 5 tahun di bidang web development menggunakan React dan Node.js. Ia lulus dari Universitas Indonesia jurusan Ilmu Komputer pada tahun 2018. Budi pernah bekerja di Tokopedia sebagai Frontend Developer selama 3 tahun, sebelum akhirnya pindah ke Gojek sebagai Fullstack Engineer.";

    submitBtn.addEventListener('click', async () => {
        const context = contextInput.value.trim() || defaultContext;
        const question = questionInput.value.trim();

        if (!question) {
            showError("Silakan masukkan pertanyaan interview.");
            return;
        }

        // Set Loading State
        setLoadingState(true);
        hideError();
        hideResult();

        try {
            const response = await fetch('http://127.0.0.1:8000/api/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    context: context,
                    question: question
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Terjadi kesalahan pada server.");
            }

            const data = await response.json();
            showResult(data);
        } catch (error) {
            console.error("Error fetching answer:", error);
            showError(error.message || "Gagal terhubung ke server. Pastikan backend sudah berjalan.");
        } finally {
            setLoadingState(false);
        }
    });

    function setLoadingState(isLoading) {
        submitBtn.disabled = isLoading;
        if (isLoading) {
            btnText.textContent = "Memproses...";
            spinner.classList.remove('hidden');
        } else {
            btnText.textContent = "Cari Jawaban";
            spinner.classList.add('hidden');
        }
    }

    function showError(message) {
        errorBanner.textContent = message;
        errorBanner.classList.remove('hidden');
    }

    function hideError() {
        errorBanner.classList.add('hidden');
    }

    function showResult(data) {
        // Display Answer
        answerText.textContent = data.answer;

        // Calculate and display Score (convert float to percentage)
        const scorePercentage = (data.score * 100).toFixed(1);
        
        // Dynamic color based on confidence score
        let scoreColor = 'var(--success-color)';
        if (data.score < 0.5) scoreColor = 'var(--error-text)';
        else if (data.score < 0.8) scoreColor = '#f59e0b'; // warning/orange

        scoreProgress.style.backgroundColor = scoreColor;
        scoreText.style.color = scoreColor;
        
        // Animate progress bar
        setTimeout(() => {
            scoreProgress.style.width = `${scorePercentage}%`;
            scoreText.textContent = `${scorePercentage}%`;
        }, 50);

        resultContainer.classList.remove('hidden');
    }

    function hideResult() {
        resultContainer.classList.add('hidden');
        scoreProgress.style.width = '0%';
        scoreText.textContent = '0%';
    }
});
