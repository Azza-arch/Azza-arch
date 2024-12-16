@extends('_layouts.main')

@section('body')
    <div class="flex flex-col gap-9">
        <div id="about">@include('_layouts.partials.about')</div>
        <div id="project"> @include('_layouts.partials.project')</div>
        <div id="service">@include('_layouts.partials.service')</div>
        <div id="skill" class="bg-white">@include('_layouts.partials.skill')</div>
        <div
            class="fixed flex z-40 text-gray-900 lg:bottom-5 text-base font-bold lg:inset-[500px] top-5 items-center justify-center gap-4">
            <div class="rounded-full shadow-md bg-white border-4 border-gray-900 px-4 py-2">
                <button class="px-2">
                    <a href="#about">about</a>
                </button>
                <button class="px-2">
                    <a href="#project">project</a>
                </button>
                <button class="px-2">
                    <a href="#skill">skill</a>
                </button>
                <button class="px-2"><a href="#service">service</a></button>
            </div>
        </div>
    </div>
@endsection
