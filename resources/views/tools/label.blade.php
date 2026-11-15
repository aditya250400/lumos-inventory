<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">

    <style>
        @page {
            size: 58mm 200mm;
            margin: 0;
        }

        * {
            box-sizing: border-box;
        }

        html,
        body {
            margin: 0;
            padding: 0;
            width: 58mm;
            font-family: Arial, Helvetica, DejaVu Sans, sans-serif;
            color: #000;
            font-size: 7.5pt;
            line-height: 1.2;
        }

        body {
            overflow: visible;
        }

        /* CONTAINER UTAMA */
        .label-container {
            width: 58mm;
            padding: 0;
            margin: 0;
        }

        /* HEADER HITAM FULL WIDTH */
        .head-black {
            display: block;
            width: 58mm;
            margin: 0;
            padding: 2mm 3mm;
            background: #000 !important;
            color: #fff !important;
            font-size: 8pt;
            font-weight: bold;
            line-height: 1.2;
            overflow-wrap: anywhere;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        /* HEADER KELENGKAPAN */
        .head-plain {
            font-size: 8pt;
            font-weight: bold;
            margin-bottom: 1mm;
            overflow-wrap: anywhere;
        }

        /* ITEM */
        .item {
            width: 100%;
            padding: 2mm 3mm;
            margin: 0;
            border-bottom: 0.3mm dashed #888;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .item:last-child {
            border-bottom: none;
        }

        .item-title {
            font-size: 8pt;
            font-weight: bold;
            margin-bottom: 1mm;
            overflow-wrap: anywhere;
        }

        .row-info {
            margin-bottom: 0.8mm;
            overflow-wrap: anywhere;
        }

        /* PRINT */
        @media print {

            html,
            body {
                width: 58mm;
                margin: 0;
                padding: 0;
            }

            .label-container {
                width: 58mm;
                margin: 0;
                padding: 0;
            }

            .head-black {
                width: 58mm;
                background: #000 !important;
                color: #fff !important;
            }

            .item {
                page-break-inside: avoid;
                break-inside: avoid;
            }
        }
    </style>
</head>

<body>

    @php
    $totalItems = 1 + $tool->accessories->count();

    $allItemNames = collect([$tool->name])
    ->merge($tool->accessories->pluck('name'))
    ->implode(', ');

    $owner = $tool->used_by->name ?? $tool->tool_code;
    @endphp

    <div class="label-container">

        {{-- BARANG UTAMA --}}
        <div class="head-black">
            {{ $owner }}
        </div>

        <div class="item">

            <div class="item-title">
                - {{ $tool->name }} (1/{{ $totalItems }})
            </div>

            <div class="row-info">
                Semua : {{ $allItemNames }}
            </div>

            <div class="row-info">
                Tipe : {{ $tool->inventory_type === 'internal' ? 'Internal' : 'Eksternal' }}
            </div>

            <div class="row-info">
                Lokasi :
                {{ $tool->location
                    ? $tool->location->name .
                        ($tool->location->parent
                            ? ' (' . $tool->location->parent->name . ')'
                            : '')
                    : '-' }}
            </div>

            <div class="row-info">
                Digunakan Oleh : {{ $tool->used_by->name ?? 'Semua Staff' }}
            </div>

        </div>

        {{-- KELENGKAPAN --}}
        @foreach($tool->accessories as $index => $accessory)

        <div class="item">

            <div class="head-plain">
                {{ $owner }}
            </div>

            <div class="item-title">
                - {{ $accessory->name }} ({{ $index + 2 }}/{{ $totalItems }})
            </div>

        </div>

        @endforeach

    </div>

</body>

</html>