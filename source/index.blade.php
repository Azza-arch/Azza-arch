@extends('_layouts.main')

@section('body')
    <div class="flex relative flex-col gap-9">
        <div id="about" class="section content-to-stick">
            @include('_layouts.partials.about')
        </div>
        <div id="project" class="section">
            @include('_layouts.partials.project')
        </div>
        <div id="service" class="section bg-white">
            @include('_layouts.partials.service')
        </div>
        <div id="skill" class="section bg-white">
            @include('_layouts.partials.skill')
        </div>
    </div>
@endsection
