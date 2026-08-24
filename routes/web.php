<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ToolController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (Auth::check()) {
        return to_route('dashboard');
    } else {
        return to_route('login');
    }
});

Route::middleware('auth')->group(function () {
    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // dashboard
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    // locations
    Route::controller(LocationController::class)->group(function () {
        Route::get('locations', 'index')->name('location.index')->middleware('permission:location.index');
        Route::get('locations/{location:slug}', 'show')->name('location.show')->middleware('permission:tools.index');
        Route::get('locations/{location:slug}/tools', 'locationToolsIndex')->name('location.tools.index');
        Route::post('locations/create', 'store')->name('location.store')->middleware('permission:location.create');
        Route::put('locations/edit/{location:slug}', 'update')->name('location.update')->middleware('permission:location.update');
        Route::delete('locations/destroy/{location:slug}', 'destroy')->name('location.destroy')->middleware('permission:location.delete');
    });

    //sub location
    Route::prefix('locations/{location:slug}/sub-locations')
        ->name('location.sub-locations.')
        ->group(function () {
            Route::post('/', [LocationController::class, 'storeSubLocation'])
                ->name('store');
            Route::get('/{subLocation:slug}/tools', [LocationController::class, 'toolsSubLocation'])
                ->name('tools.index');
            Route::get('/', function ($location) {
                return redirect()->route('location.show', $location);
            })->name('index');

            Route::get('/{subLocation:slug}', [LocationController::class, 'showSubLocation'])
                ->name('show');



            Route::put('/{subLocation:slug}', [LocationController::class, 'updateSubLocation'])
                ->name('update');

            Route::delete('/{subLocation:slug}', [LocationController::class, 'destroySubLocation'])
                ->name('destroy');
        });


    // categories
    Route::controller(CategoryController::class)->group(function () {
        Route::get('categories', 'index')->name('category.index')->middleware('permission:category.index');
        Route::get('categories/{category:slug}', 'show')->name('category.show');
        Route::post('categories/create', 'store')->name('category.store')->middleware('permission:category.create');
        Route::put('categories/edit/{category:slug}', 'update')->name('category.update')->middleware('permission:category.update');
        Route::delete('categories/destroy/{category:slug}', 'destroy')->name('category.destroy')->middleware('permission:category.delete');
    });


    // tools
    Route::controller(ToolController::class)->group(function () {
        Route::get('tools', 'index')->name('tools.index')->middleware('permission:tools.index');
        Route::get('tools/{tool:tool_code}', 'show')->name('tools.show');
        Route::post('tools/create', 'store')->name('tools.store')->middleware('permission:tools.create');
        Route::put('tools/edit/{tool:tool_code}', 'update')->name('tools.update')->middleware('permission:tools.update');
        Route::delete('tools/destroy/{tool:tool_code}', 'destroy')->name('tools.destroy')->middleware('permission:tools.delete');
    });


    // tools attribute
    Route::controller(CategoryController::class)->group(function () {
        Route::post(
            'categories/{category:slug}/attributes',
            'storeAttribute'
        )->name('category.attributes.store')
            ->middleware('permission:category.update');

        Route::put(
            'categories/{category:slug}/attributes/{attribute}',
            'updateAttribute'
        )->name('category.attributes.update')
            ->middleware('permission:category.update');

        Route::delete(
            'categories/{category:slug}/attributes/{attribute}',
            'destroyAttribute'
        )->name('category.attributes.destroy')
            ->middleware('permission:category.delete');
    });
});


require __DIR__ . '/auth.php';
