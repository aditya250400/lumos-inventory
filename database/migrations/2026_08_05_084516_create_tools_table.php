<?php

use App\Enums\InventoryTypeEnum;
use App\Enums\ToolEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tools', function (Blueprint $table) {
            $table->id();
            $table->string('tool_code');
            $table->string('name');
            $table->integer('stock');
            $table->text('note')->nullable();
            $table->string('status')->default(ToolEnum::AVAILABLE->value);
            $table->string('inventory_type')->default(InventoryTypeEnum::INTERNAL->value);
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();
            $table->foreignId('used_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tools');
    }
};
