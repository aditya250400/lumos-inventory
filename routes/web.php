<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\StockOpnameController;
use App\Http\Controllers\ToolController;
use App\Http\Controllers\UserController;
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
    Route::get('/profile/{user}/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile/{user}', [ProfileController::class, 'update'])->name('profile.update');
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
        Route::get('/tools/{tool:tool_code}/detail', [ToolController::class, 'detail'])
            ->name('tools.detail');
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

    // Role
    Route::controller(RoleController::class)->group(function () {
        Route::get('roles', 'index')->name('roles.index')->middleware('permission:roles.index');
        Route::get('roles/create', 'create')->name('roles.create')->middleware('permission:roles.create');
        Route::post('roles/create', 'store')->name('roles.store')->middleware('permission:roles.create');
        Route::get('roles/edit/{role}', 'edit')->name('roles.edit')->middleware('permission:roles.update');
        Route::put('roles/edit/{role}', 'update')->name('roles.update')->middleware('permission:roles.update');
        Route::delete('roles/destroy/{role}', 'destroy')->name('roles.destroy')->middleware('permission:roles.delete');
    });

    // users
    Route::controller(UserController::class)->group(function () {
        Route::get('users', 'index')->name('users.index')->middleware('permission:users.index');
        Route::get('users/create', 'create')->name('users.create')->middleware('permission:users.index');
        Route::post('users/create', 'store')->name('users.store')->middleware('permission:users.index');
        Route::get('users/edit/{user}', 'edit')->name('users.edit')->middleware('permission:users.index');
        Route::put('users/edit/{user}', 'update')->name('users.update')->middleware('permission:users.index');
        Route::delete('users/destroy/{user}', 'destroy')->name('users.destroy')->middleware('permission:users.index');
    });

    // users
    Route::controller(StockOpnameController::class)->group(function () {
        Route::get('stock-opnames', 'index')->name('stock-opnames.index')->middleware('permission:stock-opnames.index');
        Route::get('stock-opnames/create', 'create')->name('stock-opnames.create')->middleware('permission:stock-opnames.index');
        Route::get('stock-opnames/{location:slug}', 'show')->name('stock-opnames.show')->middleware('permission:stock-opnames.index');
        Route::post('stock-opnames/create', 'store')->name('stock-opnames.store')->middleware('permission:stock-opnames.index');
        Route::delete('stock-opnames/destroy/{stockOpname}', 'destroy')->name('stock-opnames.destroy')->middleware('permission:stock-opnames.index');
    });
});


require __DIR__ . '/auth.php';
