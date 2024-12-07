@extends('_layouts.main')

@section('body')
    <div class="flex flex-col gap-9">
        <div>@include('_layouts.partials.about')</div>
        <div>@include('_layouts.partials.skill')</div>
        <div> @include('_layouts.partials.project')</div>
        <div>@include('_layouts.partials.service')</div>
    </div>
@endsection
