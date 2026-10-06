<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: sans-serif;
            font-size: 11px;
            color: #222;
        }

        h1 {
            font-size: 16px;
            margin-bottom: 4px;
        }

        p.sub {
            color: #777;
            margin-top: 0;
            margin-bottom: 16px;
        }

        .group {
            margin-bottom: 18px;
        }

        .group-header {
            background: #fff3d6;
            color: #a56b00;
            font-weight: bold;
            padding: 6px 10px;
            font-size: 12px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid #ccc;
            padding: 5px 8px;
            text-align: left;
        }

        th {
            background: #f0f0f0;
        }

        .mismatch {
            background: #fdecea;
            color: #c0392b;
        }
    </style>
</head>

<body>
    <h1>Laporan Stock Opname</h1>
    <p class="sub">Dicetak pada {{ now()->translatedFormat('d F Y H:i') }}</p>

    @foreach ($groups as $group)
    <div class="group">
        <div class="group-header">
            {{ $group['location'] }} &mdash; Opname #{{ $group['id'] }} &middot;
            {{ \Carbon\Carbon::parse($group['created_at'])->translatedFormat('d F Y') }}
            ({{ $group['created_by'] }})
        </div>
        <table>
            <thead>
                <tr>
                    <th>Kode</th>
                    <th>Nama</th>
                    <th>Stok Sistem</th>
                    <th>Stok Fisik</th>
                    <th>Status</th>
                    <th>Alasan Selisih</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($group['details'] as $detail)
                <tr class="{{ $detail['status'] === 'Tidak Sesuai' ? 'mismatch' : '' }}">
                    <td>{{ $detail['tool_code'] }}</td>
                    <td>{{ $detail['tool_name'] }}</td>
                    <td>{{ $detail['system_stock'] }}</td>
                    <td>{{ $detail['physical_stock'] }}</td>
                    <td>{{ $detail['status'] }}</td>
                    <td>{{ $detail['discrepancy_reason'] ?? '-' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endforeach
</body>

</html>