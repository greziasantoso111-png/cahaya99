
// ========================================
// PENGATURAN CAHAYA99
// ========================================

// Pilihan:
// "WIN"    = Selalu menang
// "LOSE"   = Selalu kalah
// "RANDOM" = 2 kali kalah, 1 kali menang

const MODE_FILM = "RANDOM";

// Saldo virtual awal
const SALDO_AWAL = 10000000;


// ========================================
// SIMBOL BUAH
// ========================================

const symbols = [
    "🍒", "🍋", "🍇", "🍉", "🍊",
    "🍓", "🍍", "🥝", "🍎", "🍌"
];


// ========================================
// VARIABEL
// ========================================

let saldo = SALDO_AWAL;
let history = [];
let isSpinning = false;
let spinCount = 0;
let audioContext = null;


// ========================================
// FORMAT RUPIAH
// ========================================

function formatRupiah(angka) {
    return "Rp " + angka.toLocaleString("id-ID");
}


// ========================================
// UPDATE SALDO
// ========================================

function updateBalance() {

    document.getElementById("balance").innerText =
        formatRupiah(saldo);

}


// ========================================
// PENGATURAN NOMINAL
// ========================================

const nominalSelect =
    document.getElementById("nominalSelect");

nominalSelect.addEventListener("change", function() {

    const nominal = Number(this.value);

    document.getElementById("selectedNominal").innerText =
        formatRupiah(nominal);

});


// ========================================
// SOUND SYSTEM
// ========================================

function getAudio() {

    if (!audioContext) {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (AudioContext) {
            audioContext = new AudioContext();
        }

    }

    if (
        audioContext &&
        audioContext.state === "suspended"
    ) {
        audioContext.resume();
    }

    return audioContext;
}


function playTone(
    frequency,
    duration,
    type = "sine",
    volume = 0.08,
    delay = 0
) {

    const audio = getAudio();

    if (!audio) return;

    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(
        0.0001,
        audio.currentTime + delay
    );

    gain.gain.exponentialRampToValueAtTime(
        volume,
        audio.currentTime + delay + 0.02
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audio.currentTime + delay + duration
    );

    oscillator.connect(gain);
    gain.connect(audio.destination);

    oscillator.start(audio.currentTime + delay);

    oscillator.stop(
        audio.currentTime + delay + duration + 0.03
    );

}


// ========================================
// SOUND SPIN
// ========================================

function soundSpin() {

    playTone(300, 0.15, "sawtooth", 0.045);
    playTone(420, 0.15, "sawtooth", 0.035, 0.12);
    playTone(550, 0.2, "sawtooth", 0.025, 0.24);

}


// ========================================
// SOUND WIN
// ========================================

function soundWin() {

    playTone(523.25, 0.3, "sine", 0.09, 0);
    playTone(659.25, 0.3, "sine", 0.09, 0.16);
    playTone(783.99, 0.3, "sine", 0.09, 0.32);
    playTone(1046.5, 0.65, "sine", 0.1, 0.48);

}


// ========================================
// SOUND LOSE
// ========================================

function soundLose() {

    playTone(350, 0.3, "triangle", 0.07, 0);
    playTone(260, 0.4, "triangle", 0.07, 0.2);
    playTone(180, 0.5, "triangle", 0.06, 0.4);

}


// ========================================
// MEMULAI SPIN
// ========================================

function spin() {

    if (isSpinning) return;

    const button =
        document.getElementById("spinButton");

    const result =
        document.getElementById("result");

    const reels =
        document.querySelectorAll(".reel");

    const nominal =
        Number(nominalSelect.value);

    const winEffect =
        document.getElementById("winEffect");


    // Periksa nominal
    if (
        !Number.isFinite(nominal) ||
        nominal <= 0
    ) {

        result.className = "result lose";
        result.innerText = "NOMINAL TIDAK VALID";

        return;
    }


    // Periksa saldo virtual
    if (saldo < nominal) {

        result.className = "result lose";
        result.innerText = "SALDO VIRTUAL TIDAK MENCUKUPI";

        return;
    }


    // Kurangi saldo sesuai nominal pilihan
    saldo -= nominal;

    updateBalance();


    // Tambah hitungan putaran
    spinCount++;

    isSpinning = true;
    button.disabled = true;


    // Hilangkan efek kemenangan sebelumnya
    winEffect.classList.remove("show");

    result.className = "result";
    result.innerText = "MEMPROSES SIMULASI...";


    // Mainkan suara spin
    soundSpin();


    // Mulai animasi buah
    reels.forEach(reel => {

        reel.classList.remove("winner", "stopped");
        reel.classList.add("spinning");

    });


    let counter = 0;

    const animation = setInterval(() => {

        reels.forEach(reel => {

            const randomIndex =
                Math.floor(Math.random() * symbols.length);

            reel.innerText = symbols[randomIndex];

        });

        counter++;

        if (counter >= 15) {

            clearInterval(animation);

            finishSpin(
                reels,
                result,
                button,
                nominal
            );

        }

    }, 100);

}


// ========================================
// MENENTUKAN HASIL
// ========================================

function determineResult() {

    if (MODE_FILM === "WIN") {
        return "WIN";
    }

    if (MODE_FILM === "LOSE") {
        return "LOSE";
    }

    if (MODE_FILM === "RANDOM") {

        // Putaran 1 dan 2 = LOSE
        // Putaran 3 = WIN
        // Putaran 4 dan 5 = LOSE
        // Putaran 6 = WIN
        // Dan seterusnya

        if (spinCount % 3 === 0) {
            return "WIN";
        }

        return "LOSE";
    }

    console.warn("MODE_FILM tidak dikenali.");

    return "LOSE";
}


// ========================================
// MENYELESAIKAN SPIN
// ========================================

function finishSpin(
    reels,
    result,
    button,
    nominal
) {

    const outcome = determineResult();

    reels.forEach((reel, index) => {

        setTimeout(() => {

            reel.classList.remove("spinning");
            reel.classList.add("stopped");

            if (outcome === "WIN") {

                reel.innerText = "🍒";
                reel.classList.add("winner");

            } else {

                const randomIndex =
                    Math.floor(Math.random() * symbols.length);

                reel.innerText = symbols[randomIndex];

            }


            // Jika semua reel sudah berhenti
            if (index === reels.length - 1) {

                setTimeout(() => {

                    if (outcome === "WIN") {

                        result.innerText =
                            "★ SIMULASI MENANG ★";

                        result.classList.add("win");

                        showWinEffect();
                        soundWin();

                    } else {

                        result.innerText =
                            "SIMULASI KALAH";

                        result.classList.add("lose");

                        soundLose();

                    }

                    addHistory(outcome, nominal);

                    button.disabled = false;
                    isSpinning = false;

                }, 500);

            }

        }, index * 350);

    });

}


// ========================================
// ANIMASI KEMENANGAN
// ========================================

function showWinEffect() {

    const winEffect =
        document.getElementById("winEffect");

    winEffect.classList.remove("show");

    // Memulai ulang animasi
    void winEffect.offsetWidth;

    winEffect.classList.add("show");

}


// ========================================
// RIWAYAT SIMULASI
// ========================================

function addHistory(outcome, nominal) {

    const list =
        document.getElementById("historyList");

    const time =
        new Date().toLocaleTimeString("id-ID");

    history.unshift({

        outcome: outcome,
        nominal: nominal,
        time: time,
        number: spinCount

    });

    // Maksimal 10 riwayat
    if (history.length > 10) {
        history.pop();
    }

    list.innerHTML = history.map(item => {

        return `
            <div class="history-item">

                PUTARAN ${item.number} — ${item.outcome}

                <br>

                <small>
                    Nominal tampilan:
                    ${formatRupiah(item.nominal)}

                    <br>

                    Waktu:
                    ${item.time}
                </small>

            </div>
        `;

    }).join("");

}


// ========================================
// INISIALISASI
// ========================================

updateBalance();
