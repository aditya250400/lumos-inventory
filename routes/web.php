<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\ProfileController;
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

    // location
    Route::controller(LocationController::class)->group(function () {
        Route::get('locations', 'index')->name('location.index')->middleware('permission:location.index');
        Route::get('locations/{location:slug}', 'show')->name('location.show');
        Route::post('locations/create', 'store')->name('location.store')->middleware('permission:location.create');
        Route::put('locations/edit/{location:slug}', 'update')->name('location.update')->middleware('permission:location.update');
        Route::delete('locations/destroy/{location:slug}', 'destroy')->name('location.destroy')->middleware('permission:location.delete');
    });

    //sub location
    Route::prefix('locations/{location:slug}/sub-locations')
        ->name('location.sub-locations.')
        ->group(function () {
            Route::post('/', [LocationController::class, 'storeSubLocation'])->name('store');
            Route::get('/{subLocation:slug}', [LocationController::class, 'updateSubLocation'])->name('show');
            Route::put('/{subLocation:slug}', [LocationController::class, 'updateSubLocation'])->name('update');
            Route::delete('/{subLocation:slug}', [LocationController::class, 'destroySubLocation'])->name('destroy');
        });
});


require __DIR__ . '/auth.php';
