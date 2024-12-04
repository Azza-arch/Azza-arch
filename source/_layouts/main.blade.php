<!DOCTYPE html>
<html lang="{{ $page->language ?? 'en' }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta property="og:site_name" content="ZiqFolio" />
    <meta property="og:title" content="ZiqFolio" />
    <meta property="og:description" content="My own portfolio by Haziq" />
    <meta property="og:url" content="/" />
    <meta property="og:image" content="source/assets/img/logo.png" />
    <meta property="og:type" content="website" />

    <meta name="twitter:image:alt" content="ZiqFolio">
    <meta name="twitter:card" content="summary_large_image">

    <link rel="home" href="">
    <link rel="icon" href="assets/images/myfave.jpeg">



    <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:300,300i,400,400i,700,700i,800,800i"
        rel="stylesheet">
    <link rel="stylesheet" href="source/assets/build/css/main.css?id=80092d2155c653965ce761ea3e4865b6">

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="canonical" href="{{ $page->getUrl() }}">
    <meta name="description" content="{{ $page->description }}">
    <title>{{ $page->title }}</title>
    <link rel="stylesheet" href="{{ mix('css/main.css', 'assets/build') }}">
    <script defer src="{{ mix('js/main.js', 'assets/build') }}"></script>
</head>

<body class="text-gray-900 font-sans antialiased">

    <script src="https://static.elfsight.com/platform/platform.js" async></script>
    <div class="elfsight-app-0df03723-92dd-464c-98f9-bca966e9f39b" data-elfsight-app-lazy></div>
    @yield('body')
</body>

</html>
