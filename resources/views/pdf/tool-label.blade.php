@php
$accessories = $tool->accessories ?? collect();
$total = $accessories->count() + 1;

$locationName = $tool->location
? ($tool->location->parent
? $tool->location->name . ' (' . $tool->location->parent->name . ')'
: $tool->location->name)
: '-';
@endphp
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Label-{{ $tool->tool_code }}</title>
    <style>
        @page {
            margin: 0;
        }

        html,
        body {
            margin: 0;
            padding: 0;
            font-family: Helvetica, Arial, sans-serif;
            font-size: 8pt;
            color: #000;
        }

        .label {
            padding: 3mm;
            border-bottom: 0.3mm dashed #000;
            page-break-inside: avoid;
        }

        .label.last {
            border-bottom: none;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        .header {
            background: #000;
            color: #fff;
        }

        .header td {
            padding: 1.5mm 2mm;
            font-size: 10pt;
            font-weight: bold;
        }

        .header .page {
            text-align: right;
            font-size: 8pt;
            font-weight: normal;
        }

        .name {
            margin: 2.5mm 0 0.5mm;
            font-size: 11pt;
            font-weight: bold;
            line-height: 1.2;
        }

        .name.small {
            font-size: 10pt;
        }

        .info {
            margin-top: 1mm;
            border-top: 0.3mm solid #000;
        }

        .info td {
            padding: 0.2mm 0;
            font-size: 8pt;
            line-height: 1.1;
            vertical-align: top;
        }

        .info .key {
            width: 16mm;
            color: #333;
            white-space: nowrap;
        }

        .acc-title {
            margin-top: 1.5mm;
            font-size: 8pt;
            font-weight: bold;
        }

        .acc-list {
            font-size: 8pt;
            line-height: 1.3;
        }

        .sub {
            font-size: 7pt;
            color: #444;
        }
    </style>
</head>

<body>

    {{-- LABEL TOOL UTAMA --}}
    <div class="label {{ $accessories->isEmpty() ? 'last' : '' }}">
        <table class="header">
            <tr>
                <td>{{ $tool->tool_code }}</td>
                <td class="page">1/{{ $total }}</td>
            </tr>
        </table>

        <div class="name">{{ $tool->name }}</div>

        <table class="info">
            <tr>
                <td class="key">Tipe</td>
                <td>: {{ $tool->inventory_type }}</td>
            </tr>
            <tr>
                <td class="key">Lokasi</td>
                <td>: {{ $locationName }}</td>
            </tr>
            <tr>
                <td class="key">Digunakan</td>
                <td>: {{ $tool->usedBy?->name ?? 'Semua Staff' }}</td>
            </tr>
            @if ($tool->status === 'Rusak')
            <tr>
                <td class="key">Status</td>
                <td>: {{ $tool->status }}</td>
            </tr>
            @endif
        </table>

        <div class="acc-title">Kelengkapan Semua ({{ $total }})</div>
        <div class="acc-list">
            <div>- {{ $tool->name }}</div>
            @foreach ($accessories as $item)
            <div>- {{ $item->name }}</div>
            @endforeach
        </div>
    </div>

    {{-- LABEL SETIAP KELENGKAPAN --}}
    @foreach ($accessories as $index => $accessory)
    <div class="label {{ $loop->last ? 'last' : '' }}">
        <table class="header">
            <tr>
                <td>{{ $tool->tool_code }}</td>
                <td class="page">{{ $index + 2 }}/{{ $total }}</td>
            </tr>
        </table>

        <div class="name small">{{ $accessory->name }}</div>
        <div class="sub">Kelengkapan dari {{ $tool->name }}</div>
    </div>
    @endforeach

</body>

</html>