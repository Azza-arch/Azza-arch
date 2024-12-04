@extends('_layouts.main')

@section('body')
    <div class="flex flex-col gap-5">
        <div><img src="assets/images/oc.png" class="object-cover w-44 h-44 absolute rotate-180 right-0" style="mix-blend-mode: multiply;" alt=""></div>
        <div>@include('_layouts.partials.about')</div>
        <div>@include('_layouts.partials.skill')</div>
        <div> @include('_layouts.partials.project')</div>
        <div>@include('_layouts.partials.service')</div>
    </div>
@endsection
