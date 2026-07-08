// Mengambil elemen HTML berdasarkan ID
const portal = document.getElementById('portal');
const text = document.getElementById('text');

// Logika pemicu klik transisi
portal.addEventListener('click', () => {
    // Menambahkan kelas CSS untuk memicu animasi zoom-in
    portal.classList.add('zoom-in');
    text.style.opacity = '0';

    // Eksekusi aksi perpindahan setelah animasi selesai (2000 milidetik = 2 detik)
    setTimeout(() => {
        document.body.style.backgroundColor = "#f5f5f5";
        alert("Anda telah menembus logo S! Selamat datang di halaman utama.");
        
        // Catatan: Jika ingin otomatis pindah ke halaman galeri portfolio nanti, 
        // hapus tanda komentar (//) pada baris di bawah ini:
        // window.location.href = "portfolio.html";
    }, 2000);
});
