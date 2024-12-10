@extends('_layouts.main')

@section('body')
    <div class="flex flex-col gap-9">
        <div id="about">@include('_layouts.partials.about')</div>
        <div id="project"> @include('_layouts.partials.project')</div>
        <div id="service">@include('_layouts.partials.service')</div>
        <div id="skill" class="bg-white">@include('_layouts.partials.skill')</div>
    </div>
@endsection
