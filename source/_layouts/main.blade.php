<!DOCTYPE html>
<html class="scroll-smooth" lang="{{ $page->language ?? 'en' }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta http-equiv="x-ua-compatible" content="ie=edge">

    <!-- Open Graph Meta -->
    <meta property="og:site_name" content="ZiqFolio" />
    <meta property="og:title" content="ZiqFolio" />
    <meta property="og:description" content="My own portfolio by Haziq" />
    <meta property="og:url" content="/" />
    <meta property="og:image" content="source/assets/img/logo.png" />
    <meta property="og:type" content="website" />

    <!-- Favicon -->
    <link rel="icon" href="assets/images/myfave.jpeg">
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:300,300i,400,400i,700,700i,800,800i"
        rel="stylesheet">

    <!-- Tailwind CSS -->
         <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <!-- <link rel="stylesheet" href="{{ mix('css/main.css', 'assets/build') }}"> -->

    <link rel="stylesheet" href="https://unpkg.com/aos@2.3.4/dist/aos.css">
    <script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script>
    <script>
        document.documentElement.classList.add('js');
    </script>

    <!-- Title and Meta Description -->
    <title>{{ $page->title }}</title>
    <meta name="description" content="{{ $page->description }}">
    <style>
        .section {
            position: relative;
        }

        /* Sticky content behavior */
        .content-to-stick {
            position: sticky;
            top: 0;
            opacity: 1;
        }

        #about.is-scrolled-past {
            opacity: 0;
        }
    </style>
    <script>
        window.addEventListener('scroll', function() {
            const aboutSection = document.getElementById('about');
            const projectSection = document.getElementById('project');

            // Check if the About section has been scrolled past the Project section
            if (window.scrollY >= projectSection.offsetTop) {
                aboutSection.classList.add('is-scrolled-past');
            } else {
                aboutSection.classList.remove('is-scrolled-past');
            }
        });
    </script>
</head>

<body class="text-gray-900 relative font-sans antialiased">
   
    @yield('body')

    <!-- Footer -->
    <footer class="bg-slate-900 text-white py-4 text-center">
        <p>&copy; 2025 Syhaziqdev. All rights reserved.</p>
    </footer>

    <!-- TAOS JS -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            AOS.init({
                duration: 650, // Animation duration in milliseconds
                once: true, // Only trigger animations once
            });
        });
    </script>

    <!-- Custom JS -->
    <script defer src="{{ mix('js/main.js', 'assets/build') }}"></script>
</body>

</html>
